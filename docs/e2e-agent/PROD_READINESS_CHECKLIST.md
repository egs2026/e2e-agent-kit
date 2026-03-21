# Production Readiness Checklist

Use this checklist for Go/No-Go decisions.

## 1) Business-Critical Coverage
- [ ] P0 journey matrix completed (owner + expected outcome)
- [ ] P0 automated coverage implemented (minimum 5)
- [ ] P1 automated coverage implemented (minimum 5)
- [ ] All selectors stabilized with `data-testid`

## 2) Quality Gates
- [ ] API smoke gate passes
- [ ] UI regression gate passes (P0+P1)
- [ ] P0 pass rate = 100%
- [ ] P1 pass rate >= 95%
- [ ] Flaky tests tracked and quarantined

## 3) Security Baseline
- [ ] Unauthorized route access blocked
- [ ] Post-logout protected route test passes
- [ ] Role-based access checks pass
- [ ] No sensitive secrets in logs/artifacts

## 4) Performance Baseline
- [ ] Health endpoint threshold defined and verified
- [ ] Critical API response threshold defined and verified
- [ ] Critical UI route load baseline established

## 5) Operational Readiness
- [ ] Rollback runbook documented
- [ ] Incident triage runbook documented
- [ ] Monitoring/alert channels configured
- [ ] Backup/restore sanity check done

## 6) UAT & Sign-off
- [ ] UAT script executed
- [ ] Business owner sign-off received
- [ ] No open P0 defects
- [ ] No unacceptable P1 risks

## Final Decision
- [ ] **GO**
- [ ] **NO-GO**

Decision date: __________
Decision owner: __________
Notes: ______________________________________
