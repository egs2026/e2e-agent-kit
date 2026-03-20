# Run-Action Parity (Phase 1)

This project now includes a TestSprite-style reusable action interface.

## Reusable Action
- Path: `.github/actions/run-e2e/action.yml`

### Inputs
- `base_url` (required)
- `priority` (optional): `High,Medium,Low` or `P0,P1,P2`
- `blocking` (optional): `true|false`
- `github-token` (optional): enable sticky PR summary comment
- `testsprite-api-key` (optional compatibility input; not used)

### Outputs
- `total_tests`
- `passed_tests`
- `failed_tests`
- `result_url`

## Workflow Example
- Path: `.github/workflows/e2e-run-action-parity.yml`
- Triggers: `pull_request`, `push`, `workflow_dispatch`

## Local parity command
Run selected priorities from CLI:

```bash
PRIORITY=High,Medium npm run e2e:run
```

## Behavior
- `blocking=true`: fails workflow if any test fails
- posts/updates PR summary comment when `github-token` is provided
- uploads artifacts via workflow step
