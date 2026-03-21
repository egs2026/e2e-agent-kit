# Mode Cleanup Guide (No-Confusion Operation)

This platform now uses explicit modes:

- **core (Platform Mode):** demo/scaffold validation
- **ag (Product Mode):** real Anti Gravity validation

## Command aliases

```bash
npm run test:platform
npm run test:ag
```

## Project key convention

All run scripts support:

```bash
PROJECT_KEY=<project>
```

Examples:

```bash
PROJECT_KEY=core npm run regression
PROJECT_KEY=ag npm run regression
PROJECT_KEY=crm npm run security
```

Run IDs are prefixed, enabling reliable report filtering.

## Spec validation by mode

```bash
npm run spec:validate:combined -- --project=core
npm run spec:validate:combined -- --project=ag
```

Requirements file resolution:
- `spec/requirements-core.json`
- `spec/requirements-ag.json`
- fallback: `spec/requirements.json`

## Report explorer filtering

In `/reports/` use:
- Search filter
- File type filter
- **Project filter** (auto-detected from run IDs)

This prevents mixing core/demo runs with real product runs.
