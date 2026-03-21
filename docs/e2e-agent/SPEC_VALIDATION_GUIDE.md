# Spec Validation Guide (Requirements vs Test Results)

This feature lets users map product requirements to test cases and validate if executed results meet expectations.

## 1) Requirements source
- File: `spec/requirements.json`
- Add all requirements with IDs (e.g., `REQ-AUTH-001`)

## 2) Link test cases to requirements
In each spec JSON, add:

```json
"requirementIds": ["REQ-AUTH-001", "REQ-SEC-001"]
```

## 3) Run test pack
Example:

```bash
npm run regression
npm run security
```

## 4) Validate against spec
Use latest run automatically:

```bash
npm run spec:validate
```

Use combined latest regression + security runs (recommended):

```bash
npm run spec:validate:combined
```

Or specific run(s):

```bash
npm run spec:validate -- --run-id=20260321T092456Z-regression
npm run spec:validate -- --run-ids=20260321T092456Z-regression,20260321T092541Z-security
```

## 5) Outputs
Generated inside run folder:
- `spec-validation.json`
- `spec-validation.md`

Includes:
- requirement coverage rate
- requirement pass rate
- pass/fail/not-executed/uncovered requirements
- linked test cases per requirement

## 6) Interpretation
- `pass`: all executed linked cases passed
- `fail`: at least one linked executed case failed
- `not_executed`: requirement linked to cases but none executed in selected run
- `uncovered`: no test case links to requirement
