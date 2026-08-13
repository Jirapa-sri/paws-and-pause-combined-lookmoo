#!/usr/bin/env python3
"""Local static + AI proxy for Paws & Pause.

Avatar + dog photo match can use a free Gemini key (GEMINI_API_KEY).
Other AI features keep using OpenAI (OPENAI_API_KEY).

Usage:
  source .venv/bin/activate
  python match_server.py

Then open http://127.0.0.1:8765/game_demo.html
"""

from __future__ import annotations

import base64
import json
import math
import os
import re
import ssl
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from dotenv import load_dotenv

try:
    import certifi
except ImportError:  # pragma: no cover
    certifi = None

ROOT = Path(__file__).resolve().parent
load_dotenv(ROOT / ".env", override=True)

HOST = os.getenv("MATCH_HOST", "127.0.0.1")
PORT = int(os.getenv("MATCH_PORT", "8765"))

# Prefer project models first - this OpenAI project only allows gpt-5.6-* (not gpt-4o).
_DEFAULT_MODEL_FALLBACKS = (
    "gpt-5.6-luna",
    "gpt-5.6-terra",
)


def model_candidates() -> list[str]:
    preferred = [
        os.getenv("OPENAI_MATCH_MODEL", "").strip(),
        os.getenv("OPENAI_VISION_MODEL", "").strip(),
        os.getenv("OPENAI_LLM_MODEL", "").strip(),
        *_DEFAULT_MODEL_FALLBACKS,
    ]
    seen: set[str] = set()
    out: list[str] = []
    for name in preferred:
        if not name or name in seen:
            continue
        seen.add(name)
        out.append(name)
    return out


MODEL = model_candidates()[0]
GEMINI_MODEL = os.getenv("GEMINI_MATCH_MODEL", "gemini-flash-latest").strip() or "gemini-flash-latest"


def gemini_model_candidates() -> list[str]:
    preferred = [
        os.getenv("GEMINI_MATCH_MODEL", "").strip(),
        "gemini-flash-latest",
        "gemini-flash-lite-latest",
        "gemini-3.6-flash",
        "gemini-2.5-flash",
        "gemini-2.0-flash",
    ]
    seen: set[str] = set()
    out: list[str] = []
    for name in preferred:
        if not name or name in seen:
            continue
        seen.add(name)
        out.append(name)
    return out


def ssl_context() -> ssl.SSLContext:
    """Use certifi CA bundle so macOS Python can verify HTTPS APIs."""
    if certifi is not None:
        return ssl.create_default_context(cafile=certifi.where())
    return ssl.create_default_context()


def openai_urlopen(req: urllib.request.Request, timeout: int = 90):
    return urllib.request.urlopen(req, timeout=timeout, context=ssl_context())


def friendly_error(err: BaseException) -> str:
    raw = str(err) or err.__class__.__name__
    low = raw.lower()
    if "insufficient permissions" in low or "missing scopes" in low or "model.request" in low:
        return (
            "This OpenAI API key cannot call models (missing model.request). "
            "For avatar/dog match, set GEMINI_API_KEY in .env instead (free Gemini key), "
            "or create an OpenAI key with model access and restart match_server.py."
        )
    if "api key not valid" in low or "api_key_invalid" in low or ("permission denied" in low and "gemini" in low):
        return "Gemini API key is invalid. Check GEMINI_API_KEY in .env, then restart match_server.py."
    if "does not have access to model" in low or "model_not_found" in low or "is not found" in low:
        return (
            "That vision model is unavailable. "
            "Set GEMINI_MATCH_MODEL (e.g. gemini-2.0-flash) or OPENAI_MATCH_MODEL in .env, "
            "then restart match_server.py."
        )
    if "quota" in low or "resource_exhausted" in low or "rate limit" in low:
        return "AI quota/rate limit hit. Wait a minute and try again, or check your free-tier limits."
    if "certificate_verify_failed" in low or ("ssl" in low and "certificate" in low):
        return "Could not securely connect to the AI API. Restart match_server.py and try again."
    if "timed out" in low or "timeout" in low:
        return "AI took too long to reply. Check your internet and try again."
    if "failed to resolve" in low or "nodename nor servname" in low or "name or service not known" in low:
        return "No internet connection to the AI API. Check your network and try again."
    if "tunnel connection failed" in low or "proxy" in low:
        return "Network/proxy blocked the AI request. Try again off VPN or another network."
    # Strip noisy urllib wrappers like <urlopen error ...>
    cleaned = re.sub(r"^<urlopen error\s+(.*)>$", r"\1", raw.strip(), flags=re.I)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    if len(cleaned) > 160:
        cleaned = cleaned[:157] + "..."
    return cleaned or "AI request failed. Please try again."


def is_model_access_error(message: str) -> bool:
    low = (message or "").lower()
    return (
        "does not have access to model" in low
        or "model_not_found" in low
        or "invalid model" in low
        or ("model" in low and "not found" in low)
    )


def openai_chat_json(api_key: str, messages: list, *, max_tokens: int, temperature: float) -> dict:
    """Call chat completions with JSON mode, falling back across allowed models."""
    last_error = "OpenAI request failed"
    global MODEL
    for model in model_candidates():
        # Newer models (gpt-5.x / o-series) reject max_tokens; use max_completion_tokens.
        use_completion_tokens = bool(re.search(r"(gpt-5|o[1-9]|luna|terra)", model, re.I))
        token_key = "max_completion_tokens" if use_completion_tokens else "max_tokens"
        base = {
            "model": model,
            "response_format": {"type": "json_object"},
            "messages": messages,
            token_key: max_tokens,
        }
        # Some gpt-5 / luna models only allow default temperature.
        bodies = [dict(base)]
        if not use_completion_tokens:
            bodies = [dict(base, temperature=temperature)]
        else:
            bodies = [dict(base), dict(base, temperature=temperature)]
        # If we guessed wrong about the token param, retry once with the other key.
        alt_key = "max_tokens" if token_key == "max_completion_tokens" else "max_completion_tokens"
        alt_body = {
            "model": model,
            "response_format": {"type": "json_object"},
            "messages": messages,
            alt_key: max_tokens,
        }
        bodies.append(alt_body)

        for body in bodies:
            req = urllib.request.Request(
                "https://api.openai.com/v1/chat/completions",
                data=json.dumps(body).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}",
                },
                method="POST",
            )
            try:
                with openai_urlopen(req, timeout=90) as resp:
                    payload = json.loads(resp.read().decode("utf-8"))
                MODEL = model
                print(f"OpenAI vision call OK with model={model}")
                return payload
            except urllib.error.HTTPError as err:
                detail = err.read().decode("utf-8", errors="replace")
                try:
                    msg = json.loads(detail).get("error", {}).get("message") or detail
                except Exception:
                    msg = detail or str(err)
                last_error = msg
                low = msg.lower()
                if "temperature" in low and "unsupported" in low:
                    continue
                if "max_tokens" in low and "max_completion_tokens" in low:
                    # Wrong token field for this model - try the alternate body.
                    continue
                if is_model_access_error(msg) or "insufficient permissions" in low or "model.request" in low:
                    print(f"Model unavailable ({model}): {msg}")
                    break
                raise RuntimeError(friendly_error(RuntimeError(msg))) from err
            except Exception as err:
                last_error = str(err)
                raise RuntimeError(friendly_error(err)) from err
    raise RuntimeError(friendly_error(RuntimeError(last_error)))


def parse_data_url(url: str) -> tuple[str, str]:
    """Return (mime_type, raw_base64) from a data: URL or bare base64 string."""
    raw = (url or "").strip()
    if not raw:
        raise ValueError("Empty image")
    if raw.startswith("data:"):
        header, _, data = raw.partition(",")
        if not data:
            raise ValueError("Invalid data URL image")
        mime = "image/jpeg"
        m = re.match(r"data:([^;]+)", header)
        if m:
            mime = m.group(1).strip() or mime
        if ";base64" not in header:
            data = base64.b64encode(urllib.parse.unquote_to_bytes(data)).decode("ascii")
        return mime, data
    return "image/jpeg", raw


def gemini_parts_from_openai_content(content: list) -> list[dict]:
    parts: list[dict] = []
    for item in content:
        if not isinstance(item, dict):
            continue
        if item.get("type") == "text":
            text = str(item.get("text") or "").strip()
            if text:
                parts.append({"text": text})
        elif item.get("type") == "image_url":
            image_url = (item.get("image_url") or {}).get("url") or ""
            mime, data = parse_data_url(image_url)
            parts.append({"inline_data": {"mime_type": mime, "data": data}})
    if not parts:
        raise ValueError("No content for Gemini request")
    return parts


def gemini_chat_json(api_key: str, messages: list, *, max_tokens: int, temperature: float) -> dict:
    """Call Gemini generateContent and return an OpenAI-shaped chat payload."""
    global GEMINI_MODEL
    content = messages[0]["content"] if messages else []
    parts = gemini_parts_from_openai_content(content)
    last_error = "Gemini request failed"

    for model in gemini_model_candidates():
        body = {
            "contents": [{"role": "user", "parts": parts}],
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max(max_tokens, 2048),
                "responseMimeType": "application/json",
            },
        }
        url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"{urllib.parse.quote(model, safe='')}:generateContent"
            f"?key={urllib.parse.quote(api_key)}"
        )
        req = urllib.request.Request(
            url,
            data=json.dumps(body).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with openai_urlopen(req, timeout=90) as resp:
                payload = json.loads(resp.read().decode("utf-8"))
            candidates = payload.get("candidates") or []
            if not candidates:
                feedback = payload.get("promptFeedback") or {}
                raise RuntimeError(str(feedback.get("blockReason") or "Gemini returned no candidates"))
            cand0 = candidates[0] or {}
            parts_out = ((cand0.get("content") or {}).get("parts") or [])
            text = "".join(str(p.get("text") or "") for p in parts_out if isinstance(p, dict)).strip()
            if not text:
                finish = cand0.get("finishReason") or cand0.get("finish_reason") or "unknown"
                preview = json.dumps(cand0)[:240]
                print(f"Gemini empty response model={model} finish={finish} cand={preview}")
                raise RuntimeError(f"Gemini returned an empty response ({finish})")
            GEMINI_MODEL = model
            print(f"Gemini vision call OK with model={model} chars={len(text)}")
            return {"choices": [{"message": {"content": text}}], "model": model}
        except urllib.error.HTTPError as err:
            detail = err.read().decode("utf-8", errors="replace")
            try:
                parsed_err = json.loads(detail)
                msg = (
                    parsed_err.get("error", {}).get("message")
                    or parsed_err.get("error", {}).get("status")
                    or detail
                )
            except Exception:
                msg = detail or str(err)
            last_error = msg
            low = msg.lower()
            if is_model_access_error(msg) or "not found" in low or "no longer available" in low:
                print(f"Gemini model unavailable ({model}): {msg}")
                continue
            raise RuntimeError(friendly_error(RuntimeError(msg))) from err
        except Exception as err:
            last_error = str(err)
            low = last_error.lower()
            if is_model_access_error(last_error) or "no longer available" in low:
                print(f"Gemini model unavailable ({model}): {last_error}")
                continue
            raise RuntimeError(friendly_error(err)) from err
    raise RuntimeError(friendly_error(RuntimeError(last_error)))


def match_vision_chat_json(messages: list, *, max_tokens: int, temperature: float) -> dict:
    """Avatar/dog match: prefer Gemini, fall back to OpenAI."""
    gemini_key = normalize_api_key(os.getenv("GEMINI_API_KEY"))
    if gemini_key:
        return gemini_chat_json(gemini_key, messages, max_tokens=max_tokens, temperature=temperature)
    openai_key = normalize_api_key(os.getenv("OPENAI_API_KEY") or os.getenv("VITE_OPENAI_API_KEY"))
    key_err = api_key_error(openai_key)
    if key_err:
        raise RuntimeError(
            "Add GEMINI_API_KEY (recommended for free avatar/dog match) "
            "or a working OPENAI_API_KEY to .env, then restart match_server.py."
        )
    return openai_chat_json(openai_key, messages, max_tokens=max_tokens, temperature=temperature)


# Trait profiles for the game's adoptable breeds (adapted from my-app matching).
GAME_BREEDS = [
    {"id": "corgi", "name": "Corgi", "energy": 8, "sociability": 9, "playfulness": 9, "calmness": 5, "outdoor": 7, "affection": 9, "patience": 6, "trainability": 8},
    {"id": "golden-retriever", "name": "Golden Retriever", "energy": 8, "sociability": 10, "playfulness": 9, "calmness": 6, "outdoor": 9, "affection": 10, "patience": 8, "trainability": 9},
    {"id": "shiba-inu", "name": "Shiba Inu", "energy": 7, "sociability": 5, "playfulness": 7, "calmness": 7, "outdoor": 7, "affection": 6, "patience": 5, "trainability": 6},
    {"id": "pug", "name": "Pug", "energy": 4, "sociability": 10, "playfulness": 8, "calmness": 7, "outdoor": 4, "affection": 10, "patience": 7, "trainability": 5},
    {"id": "husky", "name": "Husky", "energy": 10, "sociability": 8, "playfulness": 9, "calmness": 3, "outdoor": 10, "affection": 7, "patience": 4, "trainability": 5},
    {"id": "dachshund", "name": "Dachshund", "energy": 6, "sociability": 7, "playfulness": 8, "calmness": 6, "outdoor": 6, "affection": 8, "patience": 5, "trainability": 5},
    {"id": "samoyed", "name": "Samoyed", "energy": 8, "sociability": 10, "playfulness": 9, "calmness": 5, "outdoor": 8, "affection": 10, "patience": 6, "trainability": 7},
    {"id": "beagle", "name": "Beagle", "energy": 8, "sociability": 9, "playfulness": 9, "calmness": 5, "outdoor": 8, "affection": 8, "patience": 6, "trainability": 6},
    {"id": "french-bulldog", "name": "French Bulldog", "energy": 4, "sociability": 9, "playfulness": 7, "calmness": 8, "outdoor": 4, "affection": 9, "patience": 7, "trainability": 6},
    {"id": "pomeranian", "name": "Pomeranian", "energy": 7, "sociability": 7, "playfulness": 8, "calmness": 5, "outdoor": 5, "affection": 8, "patience": 4, "trainability": 6},
    {"id": "mixed-rescue", "name": "Rescue Pup", "energy": 6, "sociability": 8, "playfulness": 8, "calmness": 7, "outdoor": 7, "affection": 10, "patience": 8, "trainability": 7},
]

TRAITS = ["energy", "sociability", "playfulness", "calmness", "outdoor", "affection", "patience", "trainability"]
BREED_NAMES = [b["name"] for b in GAME_BREEDS]
BREED_BY_NAME = {b["name"].lower(): b for b in GAME_BREEDS}


def trait_stats():
    stats = {}
    for trait in TRAITS:
        values = [b[trait] for b in GAME_BREEDS]
        mean = sum(values) / len(values)
        variance = sum((v - mean) ** 2 for v in values) / len(values)
        stats[trait] = {"mean": mean, "std": math.sqrt(variance) or 1.0}
    return stats


TRAIT_STATS = trait_stats()


def normalize_api_key(raw: str | None) -> str:
    if not raw:
        return ""
    key = raw.strip()
    if len(key) >= 2 and key[0] in "\"'`[" and key[-1] in "\"'`]":
        key = key[1:-1].strip()
    return key


def api_key_error(raw: str | None) -> str | None:
    key = normalize_api_key(raw)
    if not key:
        return "Add OPENAI_API_KEY to .env, then restart match_server.py."
    if "paste-your" in key or "your-key-here" in key or "your-openai-api-key-here" in key or len(key) < 50:
        return "Your .env still has placeholder text. Use a full OpenAI API key."
    if not key.startswith("sk-"):
        return "API key should start with sk-."
    return None


def gemini_key_error(raw: str | None) -> str | None:
    key = normalize_api_key(raw)
    if not key:
        return "Add GEMINI_API_KEY to .env for avatar/dog match, then restart match_server.py."
    if "your-gemini" in key or "your-key-here" in key or "paste-your" in key or len(key) < 20:
        return "Your .env still has a Gemini placeholder. Paste a full Gemini API key."
    return None


def match_vision_key_error() -> str | None:
    """Avatar/dog match may use Gemini; OpenAI is optional fallback for those two endpoints."""
    gemini_err = gemini_key_error(os.getenv("GEMINI_API_KEY"))
    if gemini_err is None:
        return None
    openai_err = api_key_error(os.getenv("OPENAI_API_KEY") or os.getenv("VITE_OPENAI_API_KEY"))
    if openai_err is None:
        return None
    return (
        "Avatar/dog match needs GEMINI_API_KEY (free) or a working OPENAI_API_KEY. "
        "Add one to .env, then restart match_server.py."
    )


def get_top_match(personality: dict) -> dict:
    scored = []
    for breed in GAME_BREEDS:
        total = 0.0
        for trait in TRAITS:
            mean = TRAIT_STATS[trait]["mean"]
            std = TRAIT_STATS[trait]["std"]
            person_z = ((personality.get(trait, 5) or 5) - mean) / std
            breed_z = (breed[trait] - mean) / std
            total += abs(person_z - breed_z)
        score = max(0, round((1 - total / (len(TRAITS) * 0.75)) * 100))
        scored.append((score, breed))
    scored.sort(key=lambda x: x[0], reverse=True)
    score, breed = scored[0]
    return {"id": breed["id"], "name": breed["name"], "score": score}


def resolve_breed_name(ai_breed: str | None) -> dict:
    if not ai_breed:
        return BREED_BY_NAME["rescue pup"]
    normalized = ai_breed.strip().lower()
    if normalized in BREED_BY_NAME:
        return BREED_BY_NAME[normalized]
    for name, breed in BREED_BY_NAME.items():
        if name in normalized or normalized in name:
            return breed
    aliases = {
        "corgi": "corgi",
        "golden": "golden-retriever",
        "retriever": "golden-retriever",
        "shiba": "shiba-inu",
        "pug": "pug",
        "husky": "husky",
        "dachshund": "dachshund",
        "sausage": "dachshund",
        "samoyed": "samoyed",
        "beagle": "beagle",
        "french": "french-bulldog",
        "bulldog": "french-bulldog",
        "pomeranian": "pomeranian",
        "pom": "pomeranian",
        "mutt": "mixed-rescue",
        "mixed": "mixed-rescue",
        "rescue": "mixed-rescue",
    }
    for key, breed_id in aliases.items():
        if key in normalized:
            return next(b for b in GAME_BREEDS if b["id"] == breed_id)
    return BREED_BY_NAME["rescue pup"]


def parse_personality_json(text: str) -> dict:
    raw = (text or "").strip()
    if not raw:
        raise ValueError("Could not parse personality from AI response")
    # Strip common markdown fences Gemini sometimes adds.
    raw = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.I)
    raw = re.sub(r"\s*```$", "", raw)
    try:
        return json.loads(raw)
    except Exception:
        pass
    match = re.search(r"\{[\s\S]*\}", raw)
    if not match:
        raise ValueError("Could not parse personality from AI response")
    return json.loads(match.group(0))


def openai_analyze(image: str, frames: list[str], api_key: str) -> dict:
    breed_list = ", ".join(BREED_NAMES)
    prompt = f"""You are matching a player photo to a spirit dog for the cozy game Paws & Pause.

Look at the person in the photo (photobooth strip and/or individual frames).
Infer their vibe/energy and score these traits from 1-10:
energy, sociability, playfulness, calmness, outdoor, affection, patience, trainability.

Also recommend one breed name that MUST be exactly one of:
{breed_list}

If a real dog is visible, identify it using the same breed list.

Return ONLY valid JSON:
{{
  "people": [
    {{
      "label": "short description",
      "appearance": "hair, clothing, vibe",
      "personality_message": "2 warm sentences about why this puppy fits them",
      "personality": {{
        "energy": 1-10, "sociability": 1-10, "playfulness": 1-10, "calmness": 1-10,
        "outdoor": 1-10, "affection": 1-10, "patience": 1-10, "trainability": 1-10
      }},
      "recommended_breed": "exact breed from list"
    }}
  ],
  "dogs": [
    {{
      "label": "short description",
      "breed": "exact breed from list",
      "personality_message": "2 warm sentences"
    }}
  ]
}}

Rules:
- people can be empty only if no human is visible
- dogs can be empty if no canine is visible
- at least one of people/dogs must have entries
- recommended_breed and breed must be exact catalog names
"""

    content = [
        {"type": "text", "text": prompt},
        {"type": "text", "text": "Photo strip / main image:"},
        {"type": "image_url", "image_url": {"url": image, "detail": "high"}},
    ]
    for i, frame in enumerate(frames[:4]):
        if not frame:
            continue
        content.append({"type": "text", "text": f"Individual frame {i + 1}:"})
        content.append({"type": "image_url", "image_url": {"url": frame, "detail": "high"}})

    payload = match_vision_chat_json(
        [{"role": "user", "content": content}],
        max_tokens=1800,
        temperature=0,
    )

    parsed = parse_personality_json(payload["choices"][0]["message"]["content"])
    people = parsed.get("people") or []
    dogs = parsed.get("dogs") or []

    results = []
    for i, entry in enumerate(people, start=1):
        personality = entry.get("personality") or {}
        # Trait z-score match (my-app style); AI recommended_breed is a soft hint only.
        match = get_top_match(personality)
        results.append(
            {
                "id": f"person-{i}",
                "type": "person",
                "label": entry.get("label") or f"Person {i}",
                "appearance": entry.get("appearance") or "",
                "message": entry.get("personality_message") or entry.get("summary") or "",
                "breedId": match["id"],
                "breedName": match["name"],
                "score": match["score"],
                "personality": personality,
            }
        )

    for i, entry in enumerate(dogs, start=1):
        breed = resolve_breed_name(entry.get("breed") or entry.get("identified_breed"))
        results.append(
            {
                "id": f"dog-{i}",
                "type": "dog",
                "label": entry.get("label") or f"Dog {i}",
                "appearance": entry.get("appearance") or "",
                "message": entry.get("personality_message") or entry.get("summary") or "",
                "breedId": breed["id"],
                "breedName": breed["name"],
                "score": 100,
                "personality": {},
            }
        )

    if not results:
        raise RuntimeError("AI found no person or dog in the photo. Try again with your face visible.")

    # Prefer a person spirit-match for adoption; fall back to identified dog.
    primary = next((r for r in results if r["type"] == "person"), results[0])
    return {"match": primary, "results": results, "subjectType": "both" if people and dogs else ("dogs" if dogs else "people")}


# Mii-style catalogs used by game_demo.html (must stay in sync).
CHAR_SKIN = ["#F7D9B6", "#F0C08A", "#D9A066", "#B87A4B", "#8C5A34", "#5C3A22"]
CHAR_HAIR = ["#3A2417", "#6B4423", "#B5651D", "#111111", "#8A5A3B", "#C98A4B"]
CHAR_OUTFIT = ["#3E7C74", "#D9705C", "#D98F2B", "#5A7FB0", "#8A6BAE", "#4A4A4A"]
CHAR_EYE = ["#3A2417", "#4A7DBF", "#6B8E6B", "#8A6BAE", "#111111", "#B5651D"]
CHAR_HAIRSTYLES = ["short", "long", "pigtails", "curly", "cap"]
CHAR_CLOTHING = ["tshirt", "dress", "overalls", "hoodie"]
CHAR_EYE_STYLES = ["round", "sleepy", "sparkle", "wink"]
CHAR_MOUTH = ["smile", "neutral", "open"]


def _hex_to_rgb(value: str) -> tuple[int, int, int] | None:
    raw = (value or "").strip().lstrip("#")
    if len(raw) != 6:
        return None
    try:
        return int(raw[0:2], 16), int(raw[2:4], 16), int(raw[4:6], 16)
    except ValueError:
        return None


def nearest_hex(value: str | None, options: list[str]) -> str:
    rgb = _hex_to_rgb(value or "")
    if not rgb:
        return options[0]
    best = options[0]
    best_d = 1e18
    for opt in options:
        o = _hex_to_rgb(opt)
        if not o:
            continue
        d = (rgb[0] - o[0]) ** 2 + (rgb[1] - o[1]) ** 2 + (rgb[2] - o[2]) ** 2
        if d < best_d:
            best_d = d
            best = opt
    return best


def pick_option(value: str | None, options: list[str], default: str | None = None) -> str:
    if value and value in options:
        return value
    return default or options[0]


def sanitize_child(raw: dict | None) -> dict:
    data = raw or {}
    return {
        "skin": nearest_hex(data.get("skin"), CHAR_SKIN),
        "hair": nearest_hex(data.get("hair"), CHAR_HAIR),
        "outfit": nearest_hex(data.get("outfit"), CHAR_OUTFIT),
        "eyeColor": nearest_hex(data.get("eyeColor") or data.get("eye_color"), CHAR_EYE),
        "hairstyle": pick_option(data.get("hairstyle"), CHAR_HAIRSTYLES, "short"),
        "clothing": pick_option(data.get("clothing"), CHAR_CLOTHING, "tshirt"),
        "eyeStyle": pick_option(data.get("eyeStyle") or data.get("eye_style"), CHAR_EYE_STYLES, "round"),
        "mouthStyle": pick_option(data.get("mouthStyle") or data.get("mouth_style"), CHAR_MOUTH, "smile"),
    }


def openai_create_character(image: str, frames: list[str], api_key: str) -> dict:
    prompt = f"""You are creating a cozy Mii-style game avatar for Paws & Pause from a player selfie / photobooth strip.

Map the person's look to ONLY these catalog options (exact values required):

skin (hex): {", ".join(CHAR_SKIN)}
hair (hex): {", ".join(CHAR_HAIR)}
outfit (hex): {", ".join(CHAR_OUTFIT)}
eyeColor (hex): {", ".join(CHAR_EYE)}
hairstyle: {", ".join(CHAR_HAIRSTYLES)}
clothing: {", ".join(CHAR_CLOTHING)}
eyeStyle: {", ".join(CHAR_EYE_STYLES)}
mouthStyle: {", ".join(CHAR_MOUTH)}

Rules:
- Prefer the closest catalog colors to what you see
- Infer hairstyle / clothing / eye vibe from the photo; if unclear, pick a cozy default
- suggestedName: short friendly first name (max 12 letters). Prefer English, or Thai if that fits the player better. Not a celebrity name.
- title: short island role like "New Islander", "Harbor Wanderer", "Café Dreamer" (English)
- motto: one warm sentence for their Willow Isle ID card (English)
- summary: 1-2 sentences describing the Mii you built (English, clear and friendly)

Return ONLY valid JSON:
{{
  "suggestedName": "Juniper",
  "child": {{
    "skin": "#F0C08A",
    "hair": "#3A2417",
    "outfit": "#3E7C74",
    "hairstyle": "short",
    "clothing": "hoodie",
    "eyeStyle": "round",
    "eyeColor": "#3A2417",
    "mouthStyle": "smile"
  }},
  "idCard": {{
    "title": "New Islander",
    "motto": "Soft mornings and kinder days."
  }},
  "summary": "..."
}}
"""

    content = [
        {"type": "text", "text": prompt},
        {"type": "text", "text": "Photo strip / main image:"},
        {"type": "image_url", "image_url": {"url": image, "detail": "high"}},
    ]
    for i, frame in enumerate(frames[:4]):
        if not frame:
            continue
        content.append({"type": "text", "text": f"Individual frame {i + 1}:"})
        content.append({"type": "image_url", "image_url": {"url": frame, "detail": "high"}})

    payload = match_vision_chat_json(
        [{"role": "user", "content": content}],
        max_tokens=900,
        temperature=0.2,
    )

    parsed = parse_personality_json(payload["choices"][0]["message"]["content"])
    child = sanitize_child(parsed.get("child") or {})
    suggested = re.sub(r"[^\w\s\-'.]", "", str(parsed.get("suggestedName") or "Friend"), flags=re.UNICODE).strip() or "Friend"
    suggested = re.sub(r"\s+", " ", suggested)[:16]
    id_card = parsed.get("idCard") or parsed.get("id_card") or {}
    title = str(id_card.get("title") or "New Islander").strip()[:28] or "New Islander"
    motto = str(id_card.get("motto") or "Soft mornings and kinder days.").strip()[:90]
    summary = str(parsed.get("summary") or "Your Willow Isle look is ready.").strip()[:220]
    return {
        "suggestedName": suggested,
        "child": child,
        "idCard": {"title": title, "motto": motto},
        "summary": summary,
    }


TAROT_DECK = [
    ("The Sun", "warmth, clarity, play"),
    ("The Moon", "dreams, soft mystery"),
    ("The Star", "hope, gentle guidance"),
    ("The Fool", "new beginnings, curiosity"),
    ("Temperance", "balance, patience"),
    ("Strength", "quiet courage"),
    ("The Hermit", "reflection, cozy solitude"),
    ("Wheel of Fortune", "change, surprise luck"),
    ("The Magician", "craft, intention"),
    ("Ace of Cups", "kindness, friendship"),
    ("Ace of Wands", "spark, energy"),
    ("Two of Pentacles", "juggling, soft rhythm"),
]

NEWS_FEEDS = [
    "https://feeds.bbci.co.uk/news/world/rss.xml",
    "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    "https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best",
]


def fetch_real_world_headlines(limit: int = 3) -> list:
    """Fetch up to three recent real headlines from a public news RSS feed."""
    import xml.etree.ElementTree as ET

    errors = []
    for url in NEWS_FEEDS:
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "PawsPauseMorningBrief/1.0"},
                method="GET",
            )
            with openai_urlopen(req, timeout=12) as resp:
                xml_text = resp.read().decode("utf-8", errors="replace")
            root = ET.fromstring(xml_text)
            items = []
            for item in root.findall(".//item"):
                title = (item.findtext("title") or "").strip()
                link = (item.findtext("link") or "").strip()
                desc = (item.findtext("description") or "").strip()
                desc = re.sub(r"<[^>]+>", "", desc)
                desc = re.sub(r"\s+", " ", desc).strip()
                if title:
                    items.append({"title": title, "url": link, "blurb": desc[:280]})
            if items:
                source = "BBC" if "bbc" in url else ("NYT" if "nytimes" in url else "Reuters")
                return [{
                    "title": item["title"][:140],
                    "url": item.get("url") or "",
                    "blurb": item.get("blurb") or item["title"],
                    "source": source,
                } for item in items[:max(1, min(int(limit or 3), 3))]]
        except Exception as err:
            errors.append(f"{url}: {err}")
            continue
    return [{
        "title": "Islanders pause for a quiet morning",
        "url": "",
        "blurb": "Could not reach live world news feeds, so Willow Isle shares a cozy placeholder headline.",
        "source": "Willow Isle Gazette",
        "offline": True,
        "errors": errors[:2],
    }]


def fetch_real_world_headline() -> dict:
    """Backward-compatible single-headline helper."""
    return fetch_real_world_headlines(1)[0]


def fetch_real_weather(location: str):
    """Fetch current weather from Open-Meteo; return None for blank/offline input."""
    location = (location or "").strip()[:80]
    if not location:
        return None
    try:
        geo_url = "https://geocoding-api.open-meteo.com/v1/search?" + urllib.parse.urlencode({
            "name": location, "count": 1, "language": "en", "format": "json",
        })
        req = urllib.request.Request(geo_url, headers={"User-Agent": "PawsPauseWeather/1.0"})
        with openai_urlopen(req, timeout=12) as resp:
            geo = json.loads(resp.read().decode("utf-8"))
        results = geo.get("results") or []
        if not results:
            return None
        place = results[0]
        forecast_url = "https://api.open-meteo.com/v1/forecast?" + urllib.parse.urlencode({
            "latitude": place["latitude"], "longitude": place["longitude"],
            "current": "temperature_2m,apparent_temperature,precipitation,weather_code",
            "timezone": "auto",
        })
        req = urllib.request.Request(forecast_url, headers={"User-Agent": "PawsPauseWeather/1.0"})
        with openai_urlopen(req, timeout=12) as resp:
            current = json.loads(resp.read().decode("utf-8")).get("current") or {}
        code = int(current.get("weather_code") or 0)
        game_weather = "rain" if code >= 51 or float(current.get("precipitation") or 0) > 0 else ("soft" if code >= 2 else "clear")
        return {
            "location": ", ".join(filter(None, [place.get("name"), place.get("country")])),
            "temperatureC": round(float(current.get("temperature_2m") or 0), 1),
            "feelsLikeC": round(float(current.get("apparent_temperature") or 0), 1),
            "weatherCode": code,
            "gameWeather": game_weather,
            "source": "Open-Meteo",
        }
    except Exception:
        return None


def local_morning_brief(day: int, player_name: str, headline: dict, real_weather=None) -> dict:
    import random

    card, vibe = random.choice(TAROT_DECK)
    upright = random.random() > 0.22
    weather = real_weather.get("gameWeather") if real_weather else random.choice(["clear", "soft", "rain"])
    mood_map = {
        "clear": "bright and open-hearted",
        "soft": "gentle and contemplative",
        "rain": "cozy and reflective",
    }
    island_bits = [
        "The café put out cinnamon rolls before sunrise.",
        "Mara found sea glass by the harbour path.",
        "A stray balloon drifted over the plaza.",
        "Theo tuned the concert lights for tonight.",
        "Ducklings practiced circles on the lake.",
        "Someone left a flower crown on the store porch.",
    ]
    mini = None
    if random.random() < 0.55:
        mini_by_weather = {
            "clear": {"id": "balloon-tap", "title": "Sky Balloon", "blurb": "Keep the plaza balloon aloft with quick taps."},
            "soft": {"id": "petal-catch", "title": "Petal Drift", "blurb": "Catch soft petals before they settle."},
            "rain": {"id": "puddle-hop", "title": "Puddle Hop", "blurb": "Splash the shiny puddles in order."},
        }
        mini = mini_by_weather[weather]
    return {
        "tarot": {
            "card": card,
            "upright": upright,
            "vibe": vibe,
            "reading": (
                f"{card} {'upright' if upright else 'reversed'} greets {player_name or 'you'}. "
                f"Today leans {mood_map[weather]} - follow the {vibe}."
            ),
        },
        "weather": weather,
        "mood": mood_map[weather],
        "islandNews": random.choice(island_bits) + f" Day {day} on Willow Isle feels {mood_map[weather]}.",
        "worldNews": {
            "title": headline.get("title") or "Quiet morning news",
            "summary": (
                f"One story from beyond the island ({headline.get('source', 'News')}): "
                f"{headline.get('blurb') or headline.get('title')}"
            )[:320],
            "source": headline.get("source") or "News",
            "url": headline.get("url") or "",
        },
        "miniEvent": mini,
        "realWeather": real_weather,
    }


def openai_morning_brief(api_key: str, day: int, player_name: str, headline: dict, real_weather=None) -> dict:
    import random

    card, vibe = random.choice(TAROT_DECK)
    upright = random.random() > 0.22
    prompt = f"""You are the cozy morning fortune teller for the game Paws & Pause on Willow Isle.

Player: {player_name or 'Friend'}
Day: {day}
Drawn tarot: {card} ({'upright' if upright else 'reversed'}) - vibe hint: {vibe}

Real-world headline (TRUE news - summarize only this one, do not invent facts):
Title: {headline.get('title')}
Source: {headline.get('source')}
Blurb: {headline.get('blurb')}

Verified current weather (use as truth; do not invent values):
{json.dumps(real_weather, ensure_ascii=False) if real_weather else 'No location supplied; choose island weather normally.'}

Return ONLY JSON:
{{
  "weather": "clear" | "soft" | "rain",
  "mood": "short mood phrase",
  "tarotReading": "2 warm sentences linking the card to today's island mood and weather",
  "islandNews": "1-2 sentences of cozy fictional Willow Isle news that fits the weather/mood",
  "worldSummary": "2 short sentences summarizing ONLY the real headline above for a cozy game bulletin",
  "miniEvent": null or {{ "id": "balloon-tap"|"petal-catch"|"puddle-hop", "title": "...", "blurb": "..." }}
}}

Rules:
- weather MUST be exactly clear, soft, or rain; when verified weather is supplied, use its gameWeather value
- Link tarot tone to weather (sun/star/clear often clear; moon/hermit often soft; wheel/cups can be rain)
- miniEvent about 50% of the time; match id to weather (clear=balloon-tap, soft=petal-catch, rain=puddle-hop)
- Keep language friendly, English, no emojis
"""
    payload = openai_chat_json(
        api_key,
        [{"role": "user", "content": prompt}],
        max_tokens=700,
        temperature=0.7,
    )
    parsed = parse_personality_json(payload["choices"][0]["message"]["content"])
    weather = str(parsed.get("weather") or "soft").strip().lower()
    if weather not in ("clear", "soft", "rain"):
        weather = "soft"
    mini = parsed.get("miniEvent")
    if mini is False:
        mini = None
    if isinstance(mini, dict):
        mid = str(mini.get("id") or "")
        if mid not in ("balloon-tap", "petal-catch", "puddle-hop"):
            mid = {"clear": "balloon-tap", "soft": "petal-catch", "rain": "puddle-hop"}[weather]
        mini = {
            "id": mid,
            "title": str(mini.get("title") or "Morning Mini Event")[:40],
            "blurb": str(mini.get("blurb") or "A small island happening.")[:120],
        }
    else:
        mini = None
    return {
        "tarot": {
            "card": card,
            "upright": upright,
            "vibe": vibe,
            "reading": str(parsed.get("tarotReading") or f"{card} sets a {weather} day.").strip()[:320],
        },
        "weather": weather,
        "mood": str(parsed.get("mood") or "soft-hearted").strip()[:60],
        "islandNews": str(parsed.get("islandNews") or "The island wakes gently.").strip()[:320],
        "worldNews": {
            "title": headline.get("title") or "World news",
            "summary": str(parsed.get("worldSummary") or headline.get("blurb") or "").strip()[:360],
            "source": headline.get("source") or "News",
            "url": headline.get("url") or "",
        },
        "miniEvent": mini,
        "realWeather": real_weather,
    }


def build_morning_brief(api_key: str, day: int, player_name: str, location: str = "") -> dict:
    headlines = fetch_real_world_headlines(3)
    headline = headlines[0]
    real_weather = fetch_real_weather(location)
    if not api_key:
        brief = local_morning_brief(day, player_name, headline, real_weather)
    else:
        try:
            brief = openai_morning_brief(api_key, day, player_name, headline, real_weather)
        except Exception as err:
            brief = local_morning_brief(day, player_name, headline, real_weather)
            brief["aiError"] = friendly_error(err)
    first_summary = (brief.get("worldNews") or {}).get("summary", "")
    brief["worldNewsItems"] = [{
        "title": item.get("title") or "World news",
        "summary": first_summary if index == 0 and first_summary else (item.get("blurb") or item.get("title") or "")[:360],
        "source": item.get("source") or "News",
        "url": item.get("url") or "",
    } for index, item in enumerate(headlines[:3])]
    return brief


STYLE_CHALLENGES = [
    {"title": "Rainy-day Picnic", "brief": "Lila needs a sky-blue top, navy bottoms, and a sunny yellow accessory.", "target": {"top": "sky", "bottom": "navy", "accessory": "sunny"}},
    {"title": "Festival Night", "brief": "Create a bright festival look with a coral top, lilac bottoms, and a gold accessory.", "target": {"top": "coral", "bottom": "lilac", "accessory": "gold"}},
    {"title": "Lakeside Afternoon", "brief": "Choose a sage top, cream bottoms, and a sky-blue accessory for a breezy lake visit.", "target": {"top": "sage", "bottom": "cream", "accessory": "sky"}},
    {"title": "Cozy Café Date", "brief": "Style a warm café outfit with a lilac top, rose bottoms, and a cream accessory.", "target": {"top": "lilac", "bottom": "rose", "accessory": "cream"}},
    {"title": "School Presentation", "brief": "Build a confident look with a cream top, navy bottoms, and a coral accessory.", "target": {"top": "cream", "bottom": "navy", "accessory": "coral"}},
]

STORE_REQUESTS = [
    {"customer":"Mara","request":"I'm refreshing my reading corner. I need something leafy and one soft piece for long afternoons.","targets":["plants","soft"],"praise":"Mara smiles — the corner feels calm and wonderfully cozy."},
    {"customer":"Theo","request":"Harbour evenings are dark, and my desk feels unfinished. Find me a gentle light and a small finishing touch.","targets":["lamps","decor"],"praise":"Theo nods — practical, warm, and exactly right for the harbour."},
    {"customer":"Pip","request":"I'm making a dreamy nap nook. It needs something soft and a little bit of nature.","targets":["soft","plants"],"praise":"Pip hugs the soft piece and puts the plant beside it immediately."},
    {"customer":"Lila","request":"The Boutique window needs a warm glow and one decorative detail before opening.","targets":["lamps","decor"],"praise":"Lila loves the pairing — the whole display finally feels complete."},
]

def build_store_request(api_key: str) -> dict:
    import random
    result = dict(random.choice(STORE_REQUESTS))
    result["aiGenerated"] = False
    if not api_key:
        return result
    prompt = f"""Rewrite a cozy shop request for Paws & Pause. The two correct categories are fixed as {result['targets']}.
Customer: {result['customer']}. Base request: {result['request']}
Return ONLY JSON with request and praise. Do not name the category directly and do not change what the clue means."""
    try:
        payload = openai_chat_json(api_key,[{"role":"user","content":prompt}],max_tokens=180,temperature=0.8)
        parsed = parse_personality_json(payload["choices"][0]["message"]["content"])
        result["request"] = str(parsed.get("request") or result["request"])[:220]
        result["praise"] = str(parsed.get("praise") or result["praise"])[:160]
        result["aiGenerated"] = True
    except Exception as err:
        result["aiError"] = friendly_error(err)
    return result

def build_fashion_critique(api_key: str, look: dict) -> dict:
    top, bottom, accessory = (str(look.get(k) or "soft")[:40] for k in ("top","bottom","accessory"))
    fallback = {"name":f"{top.title()} Island Look","critique":f"Lila loves how the {top} top works with {bottom} bottoms. The {accessory} detail gives it a playful Willow Isle finish!","occasion":"Perfect for a café visit or an afternoon in the plaza.","aiGenerated":False}
    if not api_key:
        return fallback
    prompt=f"""You are Lila, a kind fashion critic in Paws & Pause. Review this outfit: top={top}, bottoms={bottom}, accessory={accessory}.
Return ONLY JSON: name (creative outfit name), critique (2 warm specific sentences, never negative), occasion (one suitable island occasion)."""
    try:
        payload=openai_chat_json(api_key,[{"role":"user","content":prompt}],max_tokens=220,temperature=0.85)
        parsed=parse_personality_json(payload["choices"][0]["message"]["content"])
        return {"name":str(parsed.get("name") or fallback["name"])[:70],"critique":str(parsed.get("critique") or fallback["critique"])[:280],"occasion":str(parsed.get("occasion") or fallback["occasion"])[:160],"aiGenerated":True}
    except Exception as err:
        fallback["aiError"]=friendly_error(err); return fallback

def build_checkers_move(api_key: str, board: list, legal_moves: list) -> dict:
    """Let the model choose only among moves already validated by the game."""
    if not api_key:
        raise RuntimeError("AI opponent is offline")
    safe_moves=[]
    for move in legal_moves[:24]:
        if not isinstance(move, dict):
            continue
        safe_moves.append({"id":str(move.get("id") or "")[:20],"from":int(move.get("from") or 0),"to":int(move.get("to") or 0),"capture":bool(move.get("capture")),"king":bool(move.get("king"))})
    if not safe_moves:
        raise ValueError("No legal moves supplied")
    prompt=f"""You are Willow, a friendly but clever checkers opponent in Paws & Pause.
Board is a 64-cell array: positive pieces are the player, negative pieces are yours, absolute value 2 means king:
{json.dumps(board[:64])}
The game engine has validated these legal moves:
{json.dumps(safe_moves)}
Return ONLY JSON with moveId (exactly one id from the list) and line (one short friendly sentence, no strategy spoilers). Prefer captures, kings, safety, and advancement."""
    payload=openai_chat_json(api_key,[{"role":"user","content":prompt}],max_tokens=120,temperature=0.35)
    parsed=parse_personality_json(payload["choices"][0]["message"]["content"])
    move_id=str(parsed.get("moveId") or "")
    if move_id not in {m["id"] for m in safe_moves}:
        raise ValueError("AI selected a move outside the legal list")
    return {"moveId":move_id,"line":str(parsed.get("line") or "Willow studies the board and moves.")[:120],"aiGenerated":True}


def build_style_brief(api_key: str, difficulty: str) -> dict:
    """Correct answers stay local; OpenAI only adds safe flavor text."""
    import random

    difficulty = difficulty if difficulty in ("easy", "normal", "hard") else "easy"
    challenge = dict(random.choice(STYLE_CHALLENGES))
    challenge["target"] = dict(challenge["target"])
    challenge.update({
        "difficulty": difficulty,
        "successPraise": "Lila smiles: Every detail fits the brief beautifully!",
        "tryAgain": "Lila says: Lovely idea — check the colors in the brief once more.",
        "aiGenerated": False,
    })
    if not api_key:
        return challenge
    prompt = f"""You write tiny customer briefs for the cozy game Paws & Pause.
Challenge title: {challenge['title']}
Required outfit facts (do not change them): {json.dumps(challenge['target'])}
Difficulty: {difficulty}
Base brief: {challenge['brief']}

Return ONLY JSON with keys brief, successPraise, tryAgain.
- brief: 1-2 friendly sentences. For easy, state the required colors clearly. For normal, use a clear occasion plus color hints. For hard, be more poetic but still mention all required colors.
- successPraise and tryAgain: one short sentence spoken by Lila.
- Never add another required clothing item or change the required colors.
"""
    try:
        payload = openai_chat_json(api_key, [{"role": "user", "content": prompt}], max_tokens=260, temperature=0.7)
        parsed = parse_personality_json(payload["choices"][0]["message"]["content"])
        challenge["brief"] = str(parsed.get("brief") or challenge["brief"]).strip()[:280]
        challenge["successPraise"] = str(parsed.get("successPraise") or challenge["successPraise"]).strip()[:160]
        challenge["tryAgain"] = str(parsed.get("tryAgain") or challenge["tryAgain"]).strip()[:160]
        challenge["aiGenerated"] = True
    except Exception as err:
        challenge["aiError"] = friendly_error(err)
    return challenge


# ---------- Soi Dog Foundation adoption catalog (live scrape, cached) ----------
SOIDOG_ORIGIN = "https://www.soidog.org"
SOIDOG_CATALOG = f"{SOIDOG_ORIGIN}/adopt-a-dog"
SOIDOG_UA = (
    "Mozilla/5.0 (compatible; PawsAndPause/1.0; +local course project; "
    "educational adoption spotlight)"
)
SOIDOG_COLOURS = {
    "1": "Black",
    "2": "Brown",
    "3": "White",
    "4": "Grey",
    "5": "Cream",
    "6": "Brindle",
    "7": "Black and Tan",
    "8": "Black and White",
    "9": "Brown and White",
    "10": "Tan and White",
    "11": "Ginger",
    "12": "Tan",
    "13": "Sable",
    "14": "Tricolour",
    "15": "Sable and Tan",
}
_soi_cache: dict | None = None
_soi_cache_at = 0.0
SOI_CACHE_SECONDS = 45 * 60
BLURB_CACHE_PATH = ROOT / ".cache" / "soi_dog_blurbs_v2.json"
BLURB_CACHE_VERSION = 2
_blurb_lock = threading.Lock()
_blurb_inflight: set[str] = set()


def _http_get_text(url: str, timeout: int = 25) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": SOIDOG_UA, "Accept": "text/html"})
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ssl_context()) as resp:
            return resp.read().decode("utf-8", errors="ignore")
    except ssl.SSLError:
        # Some local Python installs lack a complete CA bundle (common on macOS).
        with urllib.request.urlopen(req, timeout=timeout, context=ssl._create_unverified_context()) as resp:
            return resp.read().decode("utf-8", errors="ignore")


def _abs_soidog(url: str) -> str:
    if not url:
        return ""
    if url.startswith("http"):
        return url
    if url.startswith("//"):
        return "https:" + url
    if not url.startswith("/"):
        url = "/" + url
    return SOIDOG_ORIGIN + url


def _field(row: str, class_fragment: str) -> str:
    m = re.search(
        rf'views-field-{re.escape(class_fragment)}[^>]*>\s*<span class="field-content"[^>]*>(.*?)</span>',
        row,
        re.I | re.S,
    )
    if not m:
        return ""
    text = re.sub(r"<[^>]+>", " ", m.group(1))
    return re.sub(r"\s+", " ", text).strip()


def parse_soidog_catalog_html(html: str) -> list[dict]:
    dogs: list[dict] = []
    for row in re.findall(
        r'<div class="views-row">(.*?)</div>\s*(?=<div class="views-row"|<ul class="js-pager)',
        html,
        re.S,
    ):
        name_m = re.search(
            r'views-field-name"><span class="field-content"><a href="(/adopt/[^"]+)">([^<]+)</a>',
            row,
        )
        if not name_m:
            continue
        path, name = name_m.group(1), name_m.group(2).strip()
        img_m = re.search(r'<img[^>]+src="([^"]+)"', row, re.I)
        gender_size = _field(row, "views-soidog-animal-prop-gender-size-field")
        age = _field(row, "views-soidog-animal-date-of-birth-field")
        animal_id = _field(row, "id-1") or ""
        if not animal_id:
            id_m = re.search(r"-(\d+)$", path)
            animal_id = id_m.group(1) if id_m else path
        gender, size = "", ""
        if "," in gender_size:
            gender, size = [p.strip() for p in gender_size.split(",", 1)]
        else:
            gender = gender_size
        travel = "travel donation" in row.lower()
        country = _field(row, "views-soidog-animal-adopt-country-field")
        dogs.append(
            {
                "id": str(animal_id),
                "name": name,
                "gender": gender,
                "size": size,
                "age": age,
                "link": _abs_soidog(path),
                "photo": _abs_soidog(img_m.group(1) if img_m else ""),
                "travelDonation": travel,
                "country": country or None,
                "colour": None,
                "kind": "Dog",
            }
        )
    return dogs


def fetch_soidog_colour_map(wanted_ids: set[str] | None = None) -> dict[str, str]:
    """Build id→colour from public colour filter pages (parallel, early-exit)."""
    from concurrent.futures import ThreadPoolExecutor, as_completed

    colour_by_id: dict[str, str] = {}
    wanted = set(wanted_ids or [])

    def one(cid: str, label: str) -> list[tuple[str, str]]:
        url = f"{SOIDOG_CATALOG}?soidog_animal_prop_dog_color_filter={cid}"
        out: list[tuple[str, str]] = []
        try:
            html = _http_get_text(url, timeout=18)
            for dog in parse_soidog_catalog_html(html):
                out.append((dog["id"], label))
        except Exception:
            pass
        return out

    with ThreadPoolExecutor(max_workers=6) as pool:
        futs = [pool.submit(one, cid, label) for cid, label in SOIDOG_COLOURS.items()]
        for fut in as_completed(futs):
            for did, label in fut.result():
                colour_by_id.setdefault(did, label)
            if wanted and wanted.issubset(colour_by_id.keys()):
                break
    return colour_by_id


def extract_soidog_profile_story(html: str, name: str = "") -> dict:
    """Pull the adoption headline + story body from a Soi Dog profile page."""
    heading = ""
    hm = re.search(
        r'class="soidog-animal-adopt-story-heading"[^>]*>\s*<h2[^>]*>(.*?)</h2>',
        html,
        re.I | re.S,
    )
    if hm:
        heading = re.sub(r"<[^>]+>", " ", hm.group(1))
        heading = re.sub(r"\s+", " ", heading).strip()

    body = ""
    story_m = re.search(
        r'class="soidog-animal-adopt-story"[^>]*>(.*?)</div>\s*</div>\s*</div>\s*<div class="soidog-filter-button-wrapper',
        html,
        re.I | re.S,
    )
    if not story_m:
        story_m = re.search(
            r'class="soidog-animal-adopt-story"[^>]*>(.*?)</div>\s*</div>\s*</div>',
            html,
            re.I | re.S,
        )
    if not story_m:
        story_m = re.search(
            r'class="soidog-animal-adopt-story-wrapper"[^>]*>(.*?)</div>\s*</div>\s*<div class="soidog-animal',
            html,
            re.I | re.S,
        )
    if story_m:
        chunk = story_m.group(1)
        chunk = re.sub(
            r'<div class="soidog-animal-adopt-story-heading"[\s\S]*?</div>',
            " ",
            chunk,
            flags=re.I,
        )
        chunk = re.sub(r"<br\s*/?>", "\n", chunk, flags=re.I)
        chunk = re.sub(r"</p\s*>", "\n", chunk, flags=re.I)
        chunk = re.sub(r"<[^>]+>", " ", chunk)
        chunk = re.sub(r"[ \t\r\f\v]+", " ", chunk)
        chunk = re.sub(r"\n\s*\n+", "\n", chunk)
        body = chunk.strip()
        if name:
            body = re.sub(rf"^Meet\s+{re.escape(name)}\s*", "", body, flags=re.I).strip()

    return {"heading": heading, "body": body}


def enrich_soidog_profile(dog: dict) -> dict:
    """Optional personality + raw story excerpt from the dog's public profile page."""
    try:
        html = _http_get_text(dog["link"], timeout=18)
    except Exception:
        return dog
    personalities = [
        re.sub(r"\s+", " ", p).strip()
        for p in re.findall(r'soidog-animal-prop-personality">\s*([^<]+)', html, re.I)
    ]
    personalities = [p for p in personalities if p]
    story = extract_soidog_profile_story(html, dog.get("name") or "")
    if personalities:
        dog["personalities"] = personalities[:4]
        dog["vibe"] = " · ".join(personalities[:3])
    if story.get("body"):
        dog["story"] = story["body"][:1200]
        dog["storyHeading"] = story.get("heading") or ""
        if not dog.get("blurb"):
            excerpt = story["body"][:180].rstrip()
            if len(story["body"]) > 180:
                excerpt = excerpt.rsplit(" ", 1)[0] + "…"
            dog["blurb"] = excerpt
            dog["blurbSource"] = "soidog-profile"
    return dog


def _load_blurb_cache() -> dict:
    try:
        if BLURB_CACHE_PATH.exists():
            return json.loads(BLURB_CACHE_PATH.read_text(encoding="utf-8"))
    except Exception:
        pass
    return {}


def _save_blurb_cache(cache: dict) -> None:
    try:
        BLURB_CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
        BLURB_CACHE_PATH.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")
    except Exception as err:
        print(f"Could not save Soi Dog blurb cache: {err}")


def apply_cached_ai_blurbs(dogs: list[dict]) -> int:
    """Attach disk-cached rewritten blurbs. Returns how many dogs already have a blurb."""
    cache = _load_blurb_cache()
    have = 0
    for dog in dogs:
        if dog.get("blurb") and dog.get("blurbSource") in ("ai-cache", "ai-story"):
            have += 1
            continue
        entry = cache.get(str(dog.get("id") or ""))
        if (
            isinstance(entry, dict)
            and entry.get("version") == BLURB_CACHE_VERSION
            and entry.get("blurb")
        ):
            dog["blurb"] = str(entry["blurb"]).strip()[:240]
            dog["blurbSource"] = "ai-cache"
            have += 1
    return have


def _blurb_cache_entry_usable(entry) -> bool:
    return (
        isinstance(entry, dict)
        and entry.get("version") == BLURB_CACHE_VERSION
        and bool(entry.get("blurb"))
    )


def _blurb_cache_entry_failed(entry) -> bool:
    return (
        isinstance(entry, dict)
        and entry.get("version") == BLURB_CACHE_VERSION
        and bool(entry.get("failed"))
    )


def fetch_soidog_profile_for_rewrite(dog: dict) -> dict:
    """Fetch profile HTML and return story + personality fields for rewriting."""
    link = (dog.get("link") or "").strip()
    if not link:
        return {}
    html = _http_get_text(link, timeout=18)
    story = extract_soidog_profile_story(html, dog.get("name") or "")
    personalities = [
        re.sub(r"\s+", " ", p).strip()
        for p in re.findall(r'soidog-animal-prop-personality">\s*([^<]+)', html, re.I)
    ]
    personalities = [p for p in personalities if p]
    return {
        "heading": story.get("heading") or "",
        "body": story.get("body") or "",
        "personalities": personalities[:4],
    }


def openai_rewrite_soidog_story(dog: dict, profile: dict, api_key: str) -> str:
    """Rewrite a Soi Dog profile story into a cute 1–2 sentence game blurb."""
    if not api_key:
        return ""
    name = str(dog.get("name") or "This pup").strip()[:40]
    heading = (profile.get("heading") or "").strip()
    body = (profile.get("body") or "").strip()
    if not body and not heading:
        return ""
    body = body[:1400]
    personalities = profile.get("personalities") or dog.get("personalities") or []
    meta_bits = [dog.get("gender"), dog.get("size"), dog.get("age"), dog.get("colour")]
    meta = ", ".join(str(x) for x in meta_bits if x)
    vibe = " · ".join(personalities[:3]) if personalities else ""

    prompt = f"""You write short adoption-spotlight blurbs for a cozy island game (Paws & Pause).

Rewrite this real Soi Dog Foundation profile into a cute, heartwarming 1–2 sentence description (max 220 characters).

Dog name: {name}
Details: {meta or "unknown"}
Personality tags: {vibe or "unknown"}
Profile headline: {heading or "(none)"}
Profile story:
{body}

Rules:
- Keep the dog's spirit and distinctive traits from the story (energy, wink, tongue, playfulness, etc.)
- Warm and hopeful — sound like a kind shelter volunteer
- Soften graphic medical trauma into gentle wording if mentioned (e.g. "cheeky wink" is fine; skip gory details)
- No guilt, no pressure to donate/adopt, no "enquire about me"
- Do not invent facts that aren't in the profile
- Do not mention AI, rewriting, or the website
Return ONLY JSON: {{"blurb":"..."}}
"""
    payload = openai_chat_json(
        api_key,
        [{"role": "user", "content": prompt}],
        max_tokens=220,
        temperature=0.6,
    )
    content = ((payload.get("choices") or [{}])[0].get("message") or {}).get("content") or ""
    parsed = parse_personality_json(content)
    blurb = str(parsed.get("blurb") or "").strip()
    blurb = re.sub(r"\s+", " ", blurb)
    return blurb[:240]


def local_soft_blurb_from_story(dog: dict, profile: dict) -> str:
    """Offline fallback: first friendly sentence(s) from the profile story."""
    name = str(dog.get("name") or "This pup").strip()
    body = (profile.get("body") or "").strip()
    if not body:
        return ""
    parts = re.split(r"(?<=[.!?])\s+", body)
    first = (parts[0] if parts else body).strip()
    if len(first) < 28 and len(parts) > 1:
        first = " ".join(parts[:2]).strip()
    first = re.sub(r"\s+", " ", first)
    if len(first) > 200:
        first = first[:197].rsplit(" ", 1)[0] + "…"
    if name.lower() not in first.lower():
        first = f"{name}: {first}"
    return first[:240]


def _generate_one_ai_blurb(dog: dict, api_key: str) -> None:
    dog_id = str(dog.get("id") or "")
    if not dog_id or not dog.get("link"):
        return
    with _blurb_lock:
        if dog_id in _blurb_inflight:
            return
        cache = _load_blurb_cache()
        entry = cache.get(dog_id)
        if _blurb_cache_entry_usable(entry) or _blurb_cache_entry_failed(entry):
            return
        _blurb_inflight.add(dog_id)
    try:
        profile = fetch_soidog_profile_for_rewrite(dog)
        blurb = ""
        source = "ai-story"
        try:
            if api_key:
                blurb = openai_rewrite_soidog_story(dog, profile, api_key)
        except Exception as err:
            print(f"Soi Dog story rewrite model failed for {dog.get('name')}: {friendly_error(err)}")
        if not blurb:
            blurb = local_soft_blurb_from_story(dog, profile)
            source = "story-excerpt"
        if not blurb:
            with _blurb_lock:
                cache = _load_blurb_cache()
                cache[dog_id] = {
                    "failed": True,
                    "error": "empty story/blurb",
                    "version": BLURB_CACHE_VERSION,
                    "name": dog.get("name"),
                    "updatedAt": int(time.time()),
                }
                _save_blurb_cache(cache)
            return
        with _blurb_lock:
            cache = _load_blurb_cache()
            cache[dog_id] = {
                "blurb": blurb,
                "version": BLURB_CACHE_VERSION,
                "name": dog.get("name"),
                "source": source,
                "updatedAt": int(time.time()),
            }
            _save_blurb_cache(cache)
            global _soi_cache
            if _soi_cache and isinstance(_soi_cache.get("dogs"), list):
                for d in _soi_cache["dogs"]:
                    if str(d.get("id")) == dog_id:
                        d["blurb"] = blurb
                        d["blurbSource"] = source
            print(f"Soi Dog story blurb ready for {dog.get('name')} ({dog_id}) via {source}")
    except Exception as err:
        msg = friendly_error(err)
        print(f"Soi Dog story blurb failed for {dog.get('name')} ({dog_id}): {msg}")
        with _blurb_lock:
            cache = _load_blurb_cache()
            cache[dog_id] = {
                "failed": True,
                "error": msg[:180],
                "version": BLURB_CACHE_VERSION,
                "name": dog.get("name"),
                "updatedAt": int(time.time()),
            }
            _save_blurb_cache(cache)
    finally:
        with _blurb_lock:
            _blurb_inflight.discard(dog_id)


def schedule_ai_blurbs(dogs: list[dict], max_new: int = 10) -> int:
    """Background: rewrite Soi Dog profile stories into short blurbs."""
    key_err = api_key_error(os.getenv("OPENAI_API_KEY") or os.getenv("VITE_OPENAI_API_KEY"))
    api_key = "" if key_err else normalize_api_key(
        os.getenv("OPENAI_API_KEY") or os.getenv("VITE_OPENAI_API_KEY")
    )
    cache = _load_blurb_cache()
    pending: list[dict] = []
    for dog in dogs:
        dog_id = str(dog.get("id") or "")
        if not dog_id or not dog.get("link"):
            continue
        if dog.get("blurb") and dog.get("blurbSource") in ("ai-cache", "ai-story", "story-excerpt"):
            continue
        entry = cache.get(dog_id)
        if _blurb_cache_entry_usable(entry) or _blurb_cache_entry_failed(entry):
            continue
        with _blurb_lock:
            if dog_id in _blurb_inflight:
                continue
        pending.append(dog)
        if len(pending) >= max_new:
            break
    if not pending:
        return 0

    def worker():
        for dog in pending:
            _generate_one_ai_blurb(dog, api_key)

    threading.Thread(target=worker, name="soi-story-blurbs", daemon=True).start()
    return len(pending)



def fetch_soidog_dogs(
    limit: int = 18,
    enrich: int = 0,
    with_colours: bool = False,
    with_ai_blurbs: bool = True,
) -> dict:
    """Live catalog sync: first pages (+ optional colour + profile story rewrites)."""
    global _soi_cache, _soi_cache_at
    from concurrent.futures import ThreadPoolExecutor, wait

    now = time.time()
    if _soi_cache and (now - _soi_cache_at) < SOI_CACHE_SECONDS:
        dogs = _soi_cache.get("dogs") or []
        have = apply_cached_ai_blurbs(dogs)
        pending = schedule_ai_blurbs(dogs) if with_ai_blurbs else 0
        _soi_cache["aiBlurbsReady"] = have
        _soi_cache["aiBlurbsPending"] = pending
        return _soi_cache

    dogs: list[dict] = []
    seen: set[str] = set()
    for page in (0, 1, 2):
        url = SOIDOG_CATALOG if page == 0 else f"{SOIDOG_CATALOG}?page={page}"
        html = _http_get_text(url, timeout=15)
        for dog in parse_soidog_catalog_html(html):
            if dog["id"] in seen:
                continue
            seen.add(dog["id"])
            dogs.append(dog)
            if len(dogs) >= limit:
                break
        if len(dogs) >= limit:
            break

    if with_colours and dogs:
        try:
            with ThreadPoolExecutor(max_workers=1) as pool:
                fut = pool.submit(fetch_soidog_colour_map, {d["id"] for d in dogs})
                done, not_done = wait([fut], timeout=8)
                if done:
                    colour_map = fut.result()
                    for dog in dogs:
                        dog["colour"] = colour_map.get(dog["id"])
                for fut in not_done:
                    fut.cancel()
        except Exception:
            pass

    if enrich > 0 and dogs:
        with ThreadPoolExecutor(max_workers=4) as pool:
            futs = [pool.submit(enrich_soidog_profile, dog) for dog in dogs[:enrich]]
            wait(futs, timeout=8)

    have = apply_cached_ai_blurbs(dogs)
    pending = schedule_ai_blurbs(dogs) if with_ai_blurbs else 0

    payload = {
        "source": "soidog",
        "sourceUrl": SOIDOG_CATALOG,
        "fetchedAt": int(now),
        "cacheSeconds": SOI_CACHE_SECONDS,
        "count": len(dogs),
        "dogs": dogs,
        "aiBlurbsReady": have,
        "aiBlurbsPending": pending,
        "note": "Not in-game adoptions. Listings mirrored from Soi Dog Foundation for awareness.",
    }
    _soi_cache = payload
    _soi_cache_at = now
    return payload


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def guess_type(self, path):
        ctype = super().guess_type(path)
        if ctype == "text/html":
            return "text/html; charset=utf-8"
        if ctype == "text/css":
            return "text/css; charset=utf-8"
        if ctype in ("text/javascript", "application/javascript"):
            return "application/javascript; charset=utf-8"
        return ctype

    def do_OPTIONS(self):
        if self.path.startswith("/api/"):
            self.send_response(204)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()
            return
        self.send_error(404)

    def do_GET(self):
        raw = self.path
        path = raw.split("?", 1)[0].rstrip("/")
        if path == "/api/soi-dogs":
            try:
                want_colours = "colours=1" in raw or "colors=1" in raw
                no_blurbs = "blurbs=0" in raw
                return self._json(200, fetch_soidog_dogs(
                    with_colours=want_colours,
                    with_ai_blurbs=not no_blurbs,
                ))
            except Exception as err:
                return self._json(502, {
                    "error": "Could not reach Soi Dog catalog right now.",
                    "detail": str(err)[:200],
                    "sourceUrl": SOIDOG_CATALOG,
                    "dogs": [],
                })
        if path == "/api/soi-photo":
            return self._proxy_soi_photo(raw)
        return super().do_GET()

    def _proxy_soi_photo(self, raw_path: str):
        """Same-origin proxy for Soi Dog CDN photos (hub cards + shelter canvas)."""
        try:
            qs = urllib.parse.urlparse(raw_path).query
            params = urllib.parse.parse_qs(qs)
            url = (params.get("u") or [""])[0].strip()
            if not url:
                return self.send_error(400, "Missing photo url")
            parsed = urllib.parse.urlparse(url)
            host = (parsed.hostname or "").lower()
            if parsed.scheme not in ("http", "https") or not (
                host == "www.soidog.org"
                or host.endswith(".soidog.org")
                or "soidog" in host
            ):
                return self.send_error(403, "Only Soi Dog images allowed")
            req = urllib.request.Request(
                url,
                headers={"User-Agent": SOIDOG_UA, "Accept": "image/*,*/*"},
            )
            try:
                resp = urllib.request.urlopen(req, timeout=20, context=ssl_context())
            except ssl.SSLError:
                resp = urllib.request.urlopen(req, timeout=20, context=ssl._create_unverified_context())
            with resp:
                data = resp.read()
                ctype = resp.headers.get_content_type() if hasattr(resp.headers, "get_content_type") else None
                if not ctype:
                    ctype = (resp.headers.get("Content-Type") or "image/jpeg").split(";")[0].strip()
            if len(data) > 6_000_000:
                return self.send_error(413, "Image too large")
            self.send_response(200)
            self.send_header("Content-Type", ctype or "image/jpeg")
            self.send_header("Cache-Control", "public, max-age=86400")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        except Exception as err:
            return self._json(502, {"error": "Could not fetch Soi Dog photo", "detail": str(err)[:160]})

    def do_POST(self):
        path = self.path.rstrip("/")
        if path not in ("/api/match-dog", "/api/create-character", "/api/morning-brief", "/api/style-brief", "/api/store-request", "/api/fashion-critique", "/api/checkers-move"):
            self.send_error(404)
            return

        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length) if length else b"{}"
        try:
            payload = json.loads(raw.decode("utf-8"))
        except Exception:
            return self._json(400, {"error": "Invalid JSON body"})

        api_key = normalize_api_key(os.getenv("OPENAI_API_KEY") or os.getenv("VITE_OPENAI_API_KEY"))

        if path == "/api/morning-brief":
            day = int(payload.get("day") or 1)
            player_name = str(payload.get("playerName") or "Friend")[:24]
            location = str(payload.get("location") or "")[:80]
            # Morning brief still works offline if the key is missing.
            key_err = api_key_error(os.getenv("OPENAI_API_KEY") or os.getenv("VITE_OPENAI_API_KEY"))
            try:
                result = build_morning_brief("" if key_err else api_key, day, player_name, location)
                return self._json(200, result)
            except Exception as err:
                return self._json(500, {"error": friendly_error(err)})

        if path == "/api/style-brief":
            difficulty = str(payload.get("difficulty") or "easy")[:12]
            key_err = api_key_error(os.getenv("OPENAI_API_KEY") or os.getenv("VITE_OPENAI_API_KEY"))
            try:
                result = build_style_brief("" if key_err else api_key, difficulty)
                return self._json(200, result)
            except Exception as err:
                return self._json(500, {"error": friendly_error(err)})

        if path == "/api/store-request":
            key_err = api_key_error(os.getenv("OPENAI_API_KEY") or os.getenv("VITE_OPENAI_API_KEY"))
            return self._json(200, build_store_request("" if key_err else api_key))

        if path == "/api/fashion-critique":
            key_err = api_key_error(os.getenv("OPENAI_API_KEY") or os.getenv("VITE_OPENAI_API_KEY"))
            return self._json(200, build_fashion_critique("" if key_err else api_key, payload.get("look") or {}))

        if path == "/api/checkers-move":
            key_err = api_key_error(os.getenv("OPENAI_API_KEY") or os.getenv("VITE_OPENAI_API_KEY"))
            if key_err:
                return self._json(503, {"error":"AI opponent offline","fallback":True})
            try:
                return self._json(200, build_checkers_move(api_key, payload.get("board") or [], payload.get("legalMoves") or []))
            except Exception as err:
                return self._json(502, {"error":friendly_error(err),"fallback":True})

        key_err = match_vision_key_error()
        if key_err:
            return self._json(500, {"error": key_err})

        image = payload.get("image")
        frames = payload.get("frames") or []
        if not image and frames:
            image = frames[0]
        if not image:
            return self._json(400, {"error": "Missing photo. Take a photobooth strip first."})

        try:
            if path == "/api/create-character":
                result = openai_create_character(image, frames, api_key)
            else:
                result = openai_analyze(image, frames, api_key)
            return self._json(200, result)
        except Exception as err:
            return self._json(500, {"error": friendly_error(err)})

    def _json(self, status: int, payload: dict):
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, fmt, *args):
        print("[%s] %s" % (self.log_date_time_string(), fmt % args))


def main():
    key_err = api_key_error(os.getenv("OPENAI_API_KEY") or os.getenv("VITE_OPENAI_API_KEY"))
    gemini_err = gemini_key_error(os.getenv("GEMINI_API_KEY"))
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Paws & Pause match server on http://{HOST}:{PORT}/game_demo.html")
    if gemini_err is None:
        print("Gemini key loaded for avatar/dog match. Trying models:", ", ".join(gemini_model_candidates()[:4]), "...")
    else:
        print("Gemini avatar/dog match:", gemini_err)
    if key_err:
        print("OpenAI warning:", key_err)
    else:
        print("OpenAI key loaded for other AI features. Trying models:", ", ".join(model_candidates()[:5]), "...")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
