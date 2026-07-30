# CI workflow

`deploy.workflow.yml` is the CI + GitHub Pages deployment pipeline.

It is parked here rather than in `.github/workflows/` because the automation that
opened this branch does not hold the `workflows` permission scope and GitHub
rejects pushes that add workflow files without it.

## Activate it

```bash
mkdir -p .github/workflows
git mv .github/deploy.workflow.yml .github/workflows/deploy.yml
git commit -m "ci: enable deploy workflow"
git push
```

Then in **Settings → Pages**, set **Source** to **GitHub Actions**.

## What it does

| Job | Step | Purpose |
|---|---|---|
| `validate` | `node --check` | Catches JS syntax errors in `script.js` and `sw.js` |
| `validate` | JSON parse | Fails the build on malformed `catalog.json` / manifest |
| `validate` | secret scan | Blocks committed tokens, PATs, AWS keys and private keys |
| `validate` | file check | Ensures every asset the app needs is present |
| `deploy` | Pages deploy | Publishes `docs/` — runs only after `validate` passes |
