# Phase 3 — AI-Assisted Authoring + NL Refinement

This phase introduces core AI-like authoring functions to close parity gaps:

## 1) Story -> JSON Spec Generator
- Script: `e2e/scripts/ai-generate-spec.mjs`
- Input: markdown user story
- Output: draft spec JSON in `e2e/specs/<priority>/`

### Example
```bash
npm run ai:generate-spec -- \
  --story=e2e/stories/US-001-login-and-create.md \
  --severity=P1 \
  --id=P1-301
```

Output includes:
- generated `steps`
- generated `assertions`
- metadata (`generatedFrom`, `generationNotes`)

> Important: This is a draft generator. Always review selectors/assertions before production runs.

## 2) Natural-Language Spec Refinement
- Script: `e2e/scripts/ai-refine-spec.mjs`
- Input: target spec + feedback text
- Behavior: applies rule-based refinement updates

### Example
```bash
npm run ai:refine-spec -- \
  --spec=e2e/specs/p1/P1-301-login-and-create-core-record.json \
  --feedback="increase timeout, add wait for dashboard, use fallback selector"
```

Refinement rules currently support:
- increase timeouts for flaky/slow flows
- add explicit dashboard waits
- add visible error assertion
- add fallback selectors on click steps

## 3) Included Story Template Example
- `e2e/stories/US-001-login-and-create.md`

Use this structure for future story-driven test generation.

## 4) Operating Model
1. Write/update user story in `e2e/stories/*.md`
2. Generate draft spec with `ai:generate-spec`
3. Review and adjust selector fidelity
4. Run smoke/regression
5. Refine via natural language using `ai:refine-spec`
6. Re-run and commit

## 5) Known Limits (current)
- Generator is heuristic/rule-based (not full LLM autonomy yet)
- Requires manual selector verification
- Best for accelerating draft creation and iteration speed

This foundation enables the next upgrade path to true model-backed scenario generation.
