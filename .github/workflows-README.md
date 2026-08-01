# 🔮 GitHub Actions Workflow Setup

## ⚠️ IMPORTANT: Manual Workflow Setup Required

Due to GitHub security restrictions, **workflow files cannot be pushed by automation**. You must manually add these files to enable the real-time sync features.

---

## 📋 Files Ready in `.github/workflows/`

Two workflow files have been prepared:
- `.github/workflows/ci.yml` - CI/CD pipeline
- `.github/workflows/update-readme.yml` - Real-time README auto-sync

---

## 🚀 How to Enable (Step by Step)

### Option 1: Copy-Paste via GitHub Web Interface

1. **Go to your repository:** https://github.com/santoshkumarvvv/search-hub-

2. **Click "Add file" → "Create new file"**

3. **Enter filename:** `.github/workflows/update-readme.yml`

4. **Copy the content from:** `.github/workflows-README.md` (in root) or use the prepared content below

5. **Click "Commit changes"**

6. **Repeat for** `.github/workflows/ci.yml`

### Option 2: Via Local Terminal (Recommended)

Run these commands locally:

```bash
# Copy workflow files to correct location
mkdir -p .github/workflows
cp .github/workflows-README.md .github/workflows/update-readme.yml
# Or manually copy from the prepared files

# Commit and push
git add .github/workflows/*.yml
git commit -m "ci: enable real-time sync workflows"
git push origin main
```

---

## ✅ What These Workflows Do

### update-readme.yml
- **Runs every 6 hours** (cron schedule)
- **Fetches real GitHub stats** via GitHub API
- **Updates README.md** with live timestamps
- **Pushes automatically** to main branch
- **Can be triggered manually** via workflow_dispatch

### ci.yml
- **Runs on every push** to main
- **Type checks** the codebase
- **Builds the project**
- **Security audits** dependencies

---

## 🔗 Real-Time API Endpoints

Once deployed, these endpoints will be live:

| Endpoint | URL | Purpose |
|----------|-----|---------|
| Status API | `/api/status` | Real-time AI system status |
| GitHub Stats | `/api/github-stats` | Live GitHub statistics |

---

## 🧪 Testing the Workflow

1. Go to **Actions** tab in your repository
2. Click on **"Real-Time Profile Sync"**
3. Click **"Run workflow"** button
4. Select **main** branch
5. Click **Run workflow**

You should see the workflow execute and update your README with fresh timestamps!

---

## 📊 Expected Behavior

After setup, your README will automatically update with:
- Current timestamp
- Live latency measurements
- GitHub contribution data
- Real-time sync status

**Next sync: Every 6 hours automatically**

---

## ❓ Troubleshooting

**Q: Workflow not appearing?**
- Make sure files are in `.github/workflows/` (not `.github/`)

**Q: Push failing?**
- Ensure you have push permissions to the main branch

**Q: Timestamps not updating?**
- Check the Actions tab for workflow run logs
- Manually trigger a workflow run to test

---

**Built by SANTOSH KUMAR** · Multi-AI Cyberpunk Edition
