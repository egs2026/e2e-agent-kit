# Flaky Test Policy

## Definition
A flaky test is a case that fails intermittently without a deterministic product/code change.

## Policy
1. Any case failing once in CI is re-run once.
2. If pass on retry, mark as `FLAKY` and do not block release automatically.
3. If flaky for 3 runs within 7 days, quarantine the test and create an issue.
4. Quarantined tests are excluded from blocking gates but tracked in weekly report.

## Ownership
- Test owner triages flaky cause within 48 hours.
- Product/engineering owner confirms fix and re-enables case.

## Exit criteria from quarantine
- 5 consecutive green runs in CI.
