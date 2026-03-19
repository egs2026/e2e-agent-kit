# Quality Gates

## Release Gate Policy
- P0 suite: 100% PASS required
- P1 suite: >= 90% PASS required
- API regression: 100% PASS required

## Command Mapping
- P0 UI smoke: `npm run smoke`
- API smoke: `npm run smoke:api`
- API regression: `npm run regression:api`
- UI regression (P0+P1): `npm run regression`

## Failure Policy
- Any P0 failure blocks release.
- Any API regression failure blocks release.
- P1 below threshold requires triage ticket before release.
