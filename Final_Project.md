# Final Project — Planning Notes

*Carried over from the HW2 conversation. This is a working document, not the report itself — use it to scope and sequence the actual deliverables.*

---

## 1. What the syllabus actually requires

- **Option (1)** analysis of a social media dataset, **or**
- **Option (2)** an analytics-based solution for a novel application

Deliverables: a **written report** (10–15 pages, single-spaced PDF), a **final presentation** (~10–15 min), and — if an app was built — **code in a GitHub repo with a clear README**.

Strong work is *creative, original, and leaves a lasting impression.*

---

## 2. The framing decision (do this first)

This repo's predecessor (`HW2`) contains two very different things:

1. **Paws & Pause** — a hand-coded cozy life-sim game. No data analysis, no generative AI inside the app (NPC dialogue is static, nothing is agentic).
2. **`reel_agent.py`** — a PydanticAI agent that reads a written proposal and autonomously generates/critiques/revises slides, synthesizes TTS narration, and composes a pitch video. Real multi-step tool-calling, real parallelization.

**The game by itself does not satisfy option (2)** — there's no "generative AI angle" inside it. **The reel agent does** (LLM text generation + TTS audio generation + agentic tool flow).

**Recommended framing:** the novel application is *"an AI agent that turns a written product proposal into a polished pitch video."* Paws & Pause becomes the **demo case study** the agent operates on — not the deliverable itself. This reuses everything already built without retrofitting AI into the game.

> Sanity-check this framing with any teammates / the instructor before writing 12 pages around it.

---

## 3. Coverage checklist (status as of the HW2 handoff)

| Requirement | Status | Notes |
|---|---|---|
| GitHub repo, clear README | ✅ Done | In the HW2 repo; needs to move/adapt into this new repo |
| App built with genAI (models/modalities/agents) | ✅ Done | `reel_agent.py` qualifies — LLM + TTS + tool-calling agent |
| Written report, 10–15 pages | ❌ Not started | `project_proposal.md` (HW2) is ~2 pages and pitches the *game*, not the *agent* — not reusable as-is |
| Executive summary w/ GitHub URL up front | ❌ Not started | |
| Intro: audience/market, genAI angle, status-quo limitations, **ethics/risk/governance** | ❌ Not started | No prose exists anywhere yet |
| Implementation: system diagram, stack, **agentic flow diagram + narrative** | 🟡 Partial | `ai_grading/agent_flow.png` from HW2 is reusable; needs a written narrative around it |
| Results & Analysis: screenshots, honest critique, **informal user testing**, **economics (API/hosting costs)**, **competitive landscape** | 🟡 Partial | `ai_grading/critique_feedback.json` is great raw material for "honest critique"; costs, competitors, and user testing are missing entirely |
| Conclusion: roadmap, ties back to intro | ❌ Not started | |
| References | ❌ Not started | |
| Final presentation (problem → demo → how AI is used → one honest limitation → what's next) | 🟡 Partial | `reel.mp4` is a strong demo asset, but existing slides pitch the *game*, not the *agent tool* |

---

## 4. Improvement plan, in priority order

1. **Lock in the framing** (Section 2) — confirm before writing.
2. **Write the report**, following the syllabus's suggested structure exactly:
   - Title page
   - Executive summary (GitHub URL visible immediately)
   - 1. Introduction — problem/audience/market, generative AI angle, status-quo limitations, ethics/risk/governance
   - 2. Implementation — system description, stack, agentic flow diagram + narrative, repo link + run instructions
   - 3. Results and Analysis — evidence/screenshots, honest critique, informal testing, economics, competitive landscape
   - 4. Conclusion — findings, roadmap, tie back to intro
   - References
3. **Fill the analysis gaps nobody's written yet:**
   - Rough OpenAI API cost per reel generated (LLM calls + `tts-1-hd` audio, per-slide and per-run totals)
   - A small competitive-landscape table (e.g., Pictory, Synthesia, Canva's AI video tools) — how a proposal-to-reel agent differs
   - A short ethics/governance paragraph (AI-generated content disclosure, ToS considerations for the APIs used)
4. **Get informal user feedback** — even 2–3 people watching a generated reel and reacting. This is explicitly requested and is currently the biggest non-writing gap.
5. **Rebuild the presentation deck** around the *agent*, not the game:
   problem it solves → live demo of a reel being generated → agentic/parallelized architecture → one real limitation (e.g., uneven LLM slide critique, limited TTS voice options) → roadmap.

---

## 5. Assets available to reuse from HW2

- `ai_grading/agent_flow.png` — agent flow diagram (Implementation section)
- `ai_grading/critique_feedback.json` — real critique/revision data (Results and Analysis: "what works, what doesn't")
- `reel.mp4` — demo video (presentation + Results and Analysis screenshots)
- `reel_pipeline/*.py`, `reel_agent.py` — the actual agent code (Implementation section walkthrough)
- `README.md` — setup/run instructions (adapt for the new repo)

---

## 6. Open questions to resolve

- [ ] Team members for this project (syllabus allows up to 6)
- [ ] Public or private GitHub repo
- [ ] Final report page budget per section (suggest: Intro ~3pp, Implementation ~3pp, Results ~4pp, Conclusion ~2pp, leaves room for figures)
- [ ] Who will do the informal user testing round, and when
