# 🔮 CI Pipeline — Cyberpunk Edition

```
╔═══════════════════════════════════════════════════════════════╗
║  SearchHub CI/CD Pipeline · Powered by SANTOSH KUMAR          ║
║  Status: ONLINE · Neural Network: ACTIVE                       ║
╚═══════════════════════════════════════════════════════════════╝
```

`deploy.workflow.yml` is the CI pipeline: type check, production build,
dependency audit, secret scan and a required-file check.

It is parked here rather than in `.github/workflows/` because the automation
that pushed this branch does not hold the `workflows` permission scope, and
GitHub rejects any push that adds a workflow file without it.

## ⚡ Activate Pipeline

```bash
mkdir -p .github/workflows
git mv .github/deploy.workflow.yml .github/workflows/ci.yml
git commit -m "ci: enable build and audit workflow"
git push
```

## 🔍 Security Scans

| Step | Purpose | Status |
|---|---|---|
| `tsc --noEmit` | Type errors fail the build | **GUARDED** |
| `next build` | Catches build-time regressions | **GUARDED** |
| `npm audit --audit-level=high` | Blocks known-vulnerable dependencies | **GUARDED** |
| secret scan | Blocks committed tokens, PATs, AWS keys, private keys | **GUARDED** |
| file check | Ensures deploy configs and PWA assets are present | **GUARDED** |

---

**Built by SANTOSH KUMAR** · Multi-AI Cyberpunk Edition · {new Date().getFullYear()}
