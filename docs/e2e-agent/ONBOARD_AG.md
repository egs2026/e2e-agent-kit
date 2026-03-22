# Onboarding: Anti Gravity (Product Mode) (ag)

## 1) Configure project key
Use this key for all runs:

`PROJECT_KEY=ag`

## 2) Requirements file
- spec/requirements-ag.json

## 3) Create first draft test from story
`npm run ai:generate-spec -- --story=e2e/stories/ag/US-001-primary-flow.md --severity=P1 --id=AG-P1-001`

## 4) Run project-scoped tests
`PROJECT_KEY=ag npm run regression`
`PROJECT_KEY=ag npm run security`

## 5) Validate against requirements
`npm run spec:validate:combined -- --project=ag`

## 6) Reports explorer
Open: https://e2e.egsmyapps.biz.id/reports/
Use **Project filter** => ag

## Notes
- Base URL target: https://e2e.egsmyapps.biz.id
- Update selectors/assertions before production usage.
