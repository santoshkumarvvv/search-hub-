# CI workflow

`deploy.workflow.yml` is the CI pipeline: type check, production build,
dependency audit, secret scan and a required-file check.

It is parked here rather than in `.github/workflows/` because the automation
that pushed this branch does not hold the `workflows` permission scope, and
GitHub rejects any push that adds a workflow file without it.

## Activate it

```bash
mkdir -p .github/workflows
git mv .github/deploy.workflow.yml .github/workflows/ci.yml
git commit -m "ci: enable build and audit workflow"
git push
```

## What it checks

| Step | Purpose |
|---|---|
| `tsc --noEmit` | Type errors fail the build |
| `next build` | Catches build-time regressions |
| `npm audit --audit-level=high` | Blocks known-vulnerable dependencies |
| secret scan | Blocks committed tokens, PATs, AWS keys, private keys |
| file check | Ensures deploy configs and PWA assets are present |
