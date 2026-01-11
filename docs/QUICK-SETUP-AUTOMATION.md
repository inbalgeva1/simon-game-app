# ⚡ Quick Setup: Automated PR & Deployment

**5-Minute Setup Guide for PMs**

This is a condensed version. For full details, see [AUTOMATED-PR-AND-DEPLOYMENT.md](./AUTOMATED-PR-AND-DEPLOYMENT.md).

---

## ✅ What You Get

After setup, this happens automatically:
1. Developer pushes code → PR auto-created
2. Tests run automatically
3. PR approved → Auto-merged
4. Code merged → Auto-deployed to Render
5. Health checks verify deployment

**No manual steps needed!**

---

## 🚀 Setup Steps (5 minutes)

### Step 1: Workflows Already Created ✅

The workflow files are already in `.github/workflows/`:
- ✅ `auto-pr.yml` - Auto-creates PRs
- ✅ `ci.yml` - Runs tests
- ✅ `auto-merge.yml` - Auto-merges approved PRs
- ✅ `verify-deployment.yml` - Verifies deployments

**You don't need to do anything here!**

### Step 2: Configure GitHub (2 minutes)

1. **Go to GitHub repository**
   - URL: `https://github.com/YOUR_USERNAME/simon-game-app`

2. **Enable Branch Protection**
   - Go to: `Settings` → `Branches`
   - Click: `Add rule`
   - Branch pattern: `main`
   - Enable:
     - ✅ Require pull request reviews
     - ✅ Require status checks (select: `test`, `lint`, `typecheck`, `build`)
     - ✅ Require branches up to date
   - Click: `Create`

3. **Enable Auto-Merge**
   - Go to: `Settings` → `General` → `Pull Requests`
   - Enable: ✅ Allow auto-merge
   - Enable: ✅ Automatically delete head branches

### Step 3: Add Secrets (1 minute)

1. **Go to:** `Settings` → `Secrets and variables` → `Actions`

2. **Add these secrets:**
   - `RENDER_BACKEND_URL`: Your Render backend URL
     - Example: `https://simon-game-backend.onrender.com`
   - `RENDER_FRONTEND_URL`: Your Render frontend URL
     - Example: `https://simon-game-frontend.onrender.com`

### Step 4: Configure Render (1 minute)

1. **Go to Render Dashboard**
   - URL: `https://dashboard.render.com`

2. **For Backend Service:**
   - Click on your backend service
   - Go to: `Settings` → `Auto-Deploy`
   - Enable: ✅ Auto-Deploy: `Yes`
   - Branch: `main`

3. **For Frontend Service:**
   - Click on your frontend service
   - Go to: `Settings` → `Auto-Deploy`
   - Enable: ✅ Auto-Deploy: `Yes`
   - Branch: `main`

### Step 5: Test It! (1 minute)

1. **Create a test branch:**
   ```bash
   git checkout -b feature/test-automation
   ```

2. **Make a small change:**
   ```bash
   echo "# Test" >> README.md
   git add README.md
   git commit -m "test: verify automation"
   git push origin feature/test-automation
   ```

3. **Check GitHub:**
   - Go to: `Actions` tab
   - You should see workflows running
   - A PR should be auto-created

4. **Approve the PR:**
   - Go to the PR
   - Add label: `approved`
   - PR should auto-merge when tests pass

5. **Verify deployment:**
   - After merge, check Render dashboard
   - Deployment should start automatically
   - After 2 minutes, check GitHub Actions
   - `Verify Deployment` workflow should pass

---

## ✅ That's It!

The process is now automated. Every time:
- Developer pushes to feature branch → PR auto-created
- Tests run automatically
- PR approved → Auto-merged
- Code merged → Auto-deployed
- Health checks verify

**No manual intervention needed!**

---

## 📊 How to Monitor

### GitHub Actions Dashboard
- URL: `https://github.com/YOUR_USERNAME/simon-game-app/actions`
- Shows: All workflow runs

### PR Status
- Check PR page for status checks
- Green ✅ = Passing
- Red ❌ = Failing

### Render Dashboard
- URL: `https://dashboard.render.com`
- Shows: Deployment status

---

## 🐛 Troubleshooting

### PR Not Created?
- Check branch name: Must start with `feature/`, `fix/`, `feat/`, or `hotfix/`
- Check GitHub Actions logs

### Tests Failing?
- Click on failed check to see error
- Fix issues and push again

### Auto-Merge Not Working?
- Check all status checks are ✅
- Verify PR has `approved` label
- Check branch is up to date

### Deployment Failing?
- Check Render build logs
- Verify environment variables are set
- Check `render.yaml` configuration

---

## 📚 Full Documentation

For complete details, see:
- [AUTOMATED-PR-AND-DEPLOYMENT.md](./AUTOMATED-PR-AND-DEPLOYMENT.md) - Full technical documentation

---

**Questions?** Check the troubleshooting section or review GitHub Actions logs.

**Ready?** Follow the 5 steps above and you're done! 🎉

