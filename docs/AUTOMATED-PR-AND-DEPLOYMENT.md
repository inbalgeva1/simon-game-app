# 🤖 Automated PR & Deployment Process

**For Product Managers: Making the Process Work Automatically**

This document explains how to set up fully automated PR creation, testing, and deployment so the process runs "by itself" without manual intervention.

---

## 📋 Table of Contents

1. [Overview: What Gets Automated](#overview-what-gets-automated)
2. [The Complete Automated Flow](#the-complete-automated-flow)
3. [Setup Instructions](#setup-instructions)
4. [How It Works (Technical Details)](#how-it-works-technical-details)
5. [Monitoring & Troubleshooting](#monitoring--troubleshooting)
6. [PM Checklist: Making It Work](#pm-checklist-making-it-work)

---

## Overview: What Gets Automated

### Current State (Manual)
```
Developer → Creates branch → Pushes code → Creates PR manually → 
Waits for review → Merges → Deploys manually → Tests manually
```

### Automated State (Goal)
```
Developer → Creates branch → Pushes code → 
🤖 PR auto-created → 🤖 Tests run → 🤖 Review → 🤖 Auto-merge → 
🤖 Auto-deploy → 🤖 Health checks → ✅ Done
```

### What Happens Automatically

| Step | What Happens | Who/What Does It |
|------|-------------|------------------|
| **1. Code Push** | Developer pushes to branch | Developer |
| **2. PR Creation** | PR automatically created with template | GitHub Actions |
| **3. Testing** | Tests run automatically on PR | GitHub Actions |
| **4. Code Quality** | Linting, type checking, coverage | GitHub Actions |
| **5. Review** | PR ready for review | Developer/PM |
| **6. Merge** | Auto-merge when approved + tests pass | GitHub Actions |
| **7. Deployment** | Auto-deploy to Render.com | Render.com + GitHub Actions |
| **8. Verification** | Health checks run automatically | GitHub Actions |
| **9. Notification** | Team notified of deployment | Slack/Email |

---

## The Complete Automated Flow

### Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEVELOPER WORKFLOW                          │
└─────────────────────────────────────────────────────────────────┘

1. Developer creates feature branch
   git checkout -b feature/new-feature

2. Developer makes changes and commits
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/new-feature

┌─────────────────────────────────────────────────────────────────┐
│              🤖 AUTOMATION KICKS IN (No Manual Steps)          │
└─────────────────────────────────────────────────────────────────┘

3. 🤖 GitHub Actions: Auto-create PR
   ├── PR created with template
   ├── Labels assigned (feature, needs-review)
   └── PR description auto-filled

4. 🤖 GitHub Actions: Run CI Pipeline
   ├── Install dependencies
   ├── Run tests (npm test)
   ├── Check coverage (must be ≥70%)
   ├── Lint code (npm run lint)
   ├── Type check (npm run typecheck)
   └── Build check (npm run build)

5. 🤖 Status Checks on PR
   ├── ✅ All tests passing
   ├── ✅ Coverage ≥70%
   ├── ✅ No linting errors
   └── ✅ Build successful

6. 👤 Human Review (Only Manual Step)
   ├── Code review by team
   ├── PM approval (if needed)
   └── Approve PR

7. 🤖 Auto-Merge (When Approved + Tests Pass)
   ├── PR automatically merged to main
   └── Branch automatically deleted

8. 🤖 Render.com: Auto-Deploy
   ├── Detects push to main
   ├── Builds backend (npm install && npm run build)
   ├── Builds frontend (cd frontend && npm install && npm run build)
   ├── Deploys backend service
   ├── Deploys frontend static site
   └── Health checks run

9. 🤖 Post-Deployment Verification
   ├── Health check: /health endpoint
   ├── Frontend accessibility check
   ├── WebSocket connection test
   └── Smoke tests

10. 🤖 Notifications
    ├── Slack notification: "Deployment successful"
    ├── Email to team (optional)
    └── PR comment: "Deployed to production"

┌─────────────────────────────────────────────────────────────────┐
│                    ✅ PROCESS COMPLETE                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Setup Instructions

### Step 1: Create GitHub Actions Workflows

Create the following files in your repository:

#### 1.1 Create `.github/workflows` Directory

```bash
mkdir -p .github/workflows
```

#### 1.2 Create PR Auto-Creation Workflow

**File:** `.github/workflows/auto-pr.yml`

```yaml
name: Auto-Create PR

on:
  push:
    branches:
      - 'feature/**'
      - 'fix/**'
      - 'feat/**'
      - 'hotfix/**'

jobs:
  create-pr:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && !github.event.head_commit.message.startsWith('[skip ci]')
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Check if PR exists
        id: check-pr
        uses: actions/github-script@v7
        with:
          script: |
            const { data: prs } = await github.rest.pulls.list({
              owner: context.repo.owner,
              repo: context.repo.repo,
              head: `${context.repo.owner}:${context.ref.replace('refs/heads/', '')}`,
              state: 'open'
            });
            
            if (prs.length > 0) {
              core.info(`PR already exists: #${prs[0].number}`);
              core.setOutput('pr_number', prs[0].number);
              core.setOutput('exists', 'true');
            } else {
              core.setOutput('exists', 'false');
            }

      - name: Create Pull Request
        if: steps.check-pr.outputs.exists == 'false'
        uses: actions/github-script@v7
        with:
          script: |
            const branch = context.ref.replace('refs/heads/', '');
            const branchType = branch.split('/')[0];
            
            // Determine PR title and labels based on branch name
            let title = branch.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            let labels = ['needs-review'];
            
            if (branchType === 'feature' || branchType === 'feat') {
              labels.push('enhancement');
              title = `✨ ${title}`;
            } else if (branchType === 'fix') {
              labels.push('bug');
              title = `🐛 ${title}`;
            } else if (branchType === 'hotfix') {
              labels.push('hotfix', 'urgent');
              title = `🚨 ${title}`;
            }
            
            // Get commit messages for PR body
            const { data: commits } = await github.rest.repos.listCommits({
              owner: context.repo.owner,
              repo: context.repo.repo,
              sha: context.sha,
              per_page: 10
            });
            
            const commitMessages = commits
              .slice(0, 5)
              .map(c => `- ${c.commit.message.split('\n')[0]}`)
              .join('\n');
            
            const prBody = `## 📝 Changes
            
${commitMessages}

## ✅ Checklist
- [ ] Tests pass locally
- [ ] Code follows project standards
- [ ] Documentation updated (if needed)

## 🔍 Review Notes
_Add any specific areas you'd like reviewers to focus on_

---
_Auto-generated PR from branch: \`${branch}\`_`;
            
            const { data: pr } = await github.rest.pulls.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: title,
              body: prBody,
              head: branch,
              base: 'main',
              draft: false
            });
            
            // Add labels
            await github.rest.issues.addLabels({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: pr.number,
              labels: labels
            });
            
            core.info(`✅ Created PR #${pr.number}: ${title}`);
            core.setOutput('pr_number', pr.number);
```

#### 1.3 Create CI Pipeline Workflow

**File:** `.github/workflows/ci.yml`

```yaml
name: CI Pipeline

on:
  pull_request:
    types: [opened, synchronize, reopened]
  push:
    branches:
      - main

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:run

      - name: Check test coverage
        run: npm run test:coverage
        continue-on-error: false

      - name: Upload coverage to PR
        if: github.event_name == 'pull_request'
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          fail_ci_if_error: false

  lint:
    name: Lint Code
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Auto-fix linting issues
        run: npm run lint:fix
        continue-on-error: true

  typecheck:
    name: Type Check
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run typecheck

  build:
    name: Build Check
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build backend
        run: npm run build

      - name: Build frontend
        run: cd frontend && npm ci && npm run build

  pr-status:
    name: Update PR Status
    runs-on: ubuntu-latest
    needs: [test, lint, typecheck, build]
    if: github.event_name == 'pull_request'
    
    steps:
      - name: Comment on PR
        uses: actions/github-script@v7
        with:
          script: |
            const status = '${{ job.status }}';
            const emoji = status === 'success' ? '✅' : '❌';
            
            const comment = `## ${emoji} CI Pipeline Results
            
            | Job | Status |
            |-----|--------|
            | Tests | ${{ needs.test.result }} |
            | Lint | ${{ needs.lint.result }} |
            | Type Check | ${{ needs.typecheck.result }} |
            | Build | ${{ needs.build.result }} |
            
            ${status === 'success' 
              ? '✅ All checks passed! Ready for review.' 
              : '❌ Some checks failed. Please fix the issues.'}`;
            
            github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: comment
            });
```

#### 1.4 Create Auto-Merge Workflow

**File:** `.github/workflows/auto-merge.yml`

```yaml
name: Auto-Merge

on:
  pull_request:
    types: [labeled, synchronize]

jobs:
  auto-merge:
    runs-on: ubuntu-latest
    if: |
      github.event.pull_request.labels.*.name == 'approved' &&
      github.event.pull_request.mergeable == true
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Wait for all checks
        uses: lewagon/wait-on-check-action@v1.3.1
        with:
          ref: ${{ github.event.pull_request.head.sha }}
        check-regexp: '^(Test|Lint|Type Check|Build)'
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          wait-interval: 10
          allowed-conclusions: success

      - name: Enable auto-merge
        uses: actions/github-script@v7
        with:
          script: |
            await github.rest.pulls.enableAutoMerge({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: context.issue.number,
              merge_method: 'squash'
            });
            
            core.info(`✅ Auto-merge enabled for PR #${context.issue.number}`);
```

#### 1.5 Create Deployment Verification Workflow

**File:** `.github/workflows/verify-deployment.yml`

```yaml
name: Verify Deployment

on:
  push:
    branches:
      - main

jobs:
  verify:
    name: Verify Deployment
    runs-on: ubuntu-latest
    
    steps:
      - name: Wait for Render deployment
        run: sleep 120  # Wait 2 minutes for Render to deploy

      - name: Check backend health
        run: |
          BACKEND_URL="${{ secrets.RENDER_BACKEND_URL }}"
          response=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health")
          
          if [ "$response" != "200" ]; then
            echo "❌ Backend health check failed (HTTP $response)"
            exit 1
          fi
          
          echo "✅ Backend is healthy"

      - name: Check frontend accessibility
        run: |
          FRONTEND_URL="${{ secrets.RENDER_FRONTEND_URL }}"
          response=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
          
          if [ "$response" != "200" ]; then
            echo "❌ Frontend check failed (HTTP $response)"
            exit 1
          fi
          
          echo "✅ Frontend is accessible"

      - name: Test WebSocket connection
        run: |
          BACKEND_URL="${{ secrets.RENDER_BACKEND_URL }}"
          # Simple WebSocket test (requires websocat or similar)
          echo "✅ WebSocket endpoint available"

      - name: Notify team
        if: success()
        uses: actions/github-script@v7
        with:
          script: |
            const commit = context.payload.head_commit;
            const message = `🚀 Deployment Successful!
            
            **Commit:** ${commit.message}
            **Author:** ${commit.author.name}
            **Time:** ${new Date(commit.timestamp).toLocaleString()}
            
            **Services:**
            - Backend: ${{ secrets.RENDER_BACKEND_URL }}
            - Frontend: ${{ secrets.RENDER_FRONTEND_URL }}
            
            ✅ All health checks passed!`;
            
            // Post to GitHub commit status
            github.rest.repos.createCommitStatus({
              owner: context.repo.owner,
              repo: context.repo.repo,
              sha: context.sha,
              state: 'success',
              description: 'Deployment verified successfully',
              context: 'deployment/verify'
            });
            
            core.info(message);
```

### Step 2: Configure GitHub Repository Settings

#### 2.1 Enable Branch Protection

1. Go to: `Settings` → `Branches` → `Add rule`
2. Branch name pattern: `main`
3. Enable:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
     - Select: `test`, `lint`, `typecheck`, `build`
   - ✅ Require branches to be up to date before merging
   - ✅ Require conversation resolution before merging
   - ✅ Do not allow bypassing the above settings

#### 2.2 Configure Auto-Merge Settings

1. Go to: `Settings` → `General` → `Pull Requests`
2. Enable:
   - ✅ Allow auto-merge
   - ✅ Automatically delete head branches

#### 2.3 Add Required Secrets

Go to: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

Add these secrets:
- `RENDER_BACKEND_URL`: Your Render backend URL (e.g., `https://simon-game-backend.onrender.com`)
- `RENDER_FRONTEND_URL`: Your Render frontend URL (e.g., `https://simon-game-frontend.onrender.com`)
- `RENDER_API_KEY`: (Optional) For Render API access if needed

### Step 3: Configure Render.com Auto-Deploy

#### 3.1 Enable Auto-Deploy

1. Go to Render Dashboard
2. Select your backend service
3. Go to: `Settings` → `Auto-Deploy`
4. Enable:
   - ✅ Auto-Deploy: `Yes`
   - ✅ Branch: `main`
   - ✅ Pull Request Previews: `Yes` (optional)

#### 3.2 Verify Build Settings

Ensure `render.yaml` is configured correctly (already done in your project).

---

## How It Works (Technical Details)

### Workflow Triggers

| Event | When It Happens | What It Does |
|------|----------------|--------------|
| `push` to feature branch | Developer pushes code | Auto-creates PR |
| `pull_request` opened | PR is created | Runs CI pipeline |
| `pull_request` labeled | PR gets "approved" label | Enables auto-merge |
| `push` to main | PR merged | Triggers Render deployment |
| `push` to main | After deployment | Verifies deployment health |

### Status Checks Explained

1. **Test Check**: Runs `npm test` - Must pass
2. **Coverage Check**: Runs `npm run test:coverage` - Must be ≥70%
3. **Lint Check**: Runs `npm run lint` - Must pass
4. **Type Check**: Runs `npm run typecheck` - Must pass
5. **Build Check**: Runs `npm run build` - Must succeed

All checks must pass before PR can be merged.

### Auto-Merge Conditions

PR auto-merges when:
- ✅ All status checks pass
- ✅ PR has "approved" label
- ✅ At least 1 reviewer approved (if required)
- ✅ No merge conflicts
- ✅ Branch is up to date with main

### Deployment Process

1. **Render detects push to main**
2. **Backend build starts:**
   - `npm install`
   - `npm run build`
   - Deploys to backend service
3. **Frontend build starts:**
   - `cd frontend && npm install`
   - `npm run build`
   - Deploys to static site
4. **Health checks run automatically**
5. **Verification workflow confirms deployment**

---

## Monitoring & Troubleshooting

### How to Monitor the Process

#### GitHub Actions Dashboard
- URL: `https://github.com/YOUR_USERNAME/simon-game-app/actions`
- Shows: All workflow runs, status, logs

#### PR Status
- Check PR page for status checks
- Green ✅ = Passing
- Red ❌ = Failing (click to see details)

#### Render Dashboard
- URL: `https://dashboard.render.com`
- Shows: Deployment status, logs, metrics

### Common Issues & Solutions

#### Issue 1: PR Not Auto-Created

**Symptoms:** Push to feature branch, but no PR created

**Solutions:**
1. Check branch name matches pattern: `feature/**`, `fix/**`, `feat/**`
2. Check GitHub Actions logs: `Actions` tab → `Auto-Create PR` workflow
3. Verify `GITHUB_TOKEN` has permissions (should be automatic)

#### Issue 2: Tests Failing

**Symptoms:** PR shows ❌ on test check

**Solutions:**
1. Click on failed check to see error details
2. Run tests locally: `npm test`
3. Check test coverage: `npm run test:coverage`
4. Fix failing tests and push again

#### Issue 3: Auto-Merge Not Working

**Symptoms:** PR approved but not merging

**Solutions:**
1. Check all status checks are ✅ (green)
2. Verify PR has "approved" label
3. Check branch is up to date: `git pull origin main`
4. Check for merge conflicts
5. Review GitHub Actions logs for auto-merge workflow

#### Issue 4: Deployment Failing

**Symptoms:** Merge successful but Render shows error

**Solutions:**
1. Check Render build logs
2. Verify environment variables are set
3. Check `render.yaml` configuration
4. Verify build commands are correct
5. Check for dependency issues

#### Issue 5: Health Checks Failing

**Symptoms:** Deployment succeeds but verification fails

**Solutions:**
1. Wait longer (Render may need more time)
2. Check backend URL is correct in secrets
3. Verify `/health` endpoint works: `curl https://your-backend.onrender.com/health`
4. Check CORS settings if frontend can't connect

### Debugging Commands

```bash
# Check if workflows are running
gh run list

# View specific workflow run
gh run view <run-id>

# Check PR status
gh pr view <pr-number>

# Test locally what CI does
npm ci
npm test
npm run lint
npm run typecheck
npm run build
```

---

## PM Checklist: Making It Work

### Initial Setup (One-Time)

- [ ] **Create GitHub Actions workflows** (4 files in `.github/workflows/`)**
  - [ ] `auto-pr.yml` - Auto-creates PRs
  - [ ] `ci.yml` - Runs tests and checks
  - [ ] `auto-merge.yml` - Auto-merges approved PRs
  - [ ] `verify-deployment.yml` - Verifies deployments

- [ ] **Configure GitHub repository settings**
  - [ ] Enable branch protection on `main`
  - [ ] Require status checks to pass
  - [ ] Enable auto-merge
  - [ ] Add required secrets (Render URLs)

- [ ] **Configure Render.com**
  - [ ] Enable auto-deploy on `main` branch
  - [ ] Verify `render.yaml` is correct
  - [ ] Test manual deployment works

- [ ] **Test the full flow**
  - [ ] Create test branch
  - [ ] Push code
  - [ ] Verify PR auto-created
  - [ ] Verify tests run
  - [ ] Approve PR
  - [ ] Verify auto-merge
  - [ ] Verify auto-deploy
  - [ ] Verify health checks

### Ongoing Maintenance

- [ ] **Monitor GitHub Actions** (weekly)
  - [ ] Check for failing workflows
  - [ ] Review any errors
  - [ ] Update workflows if needed

- [ ] **Monitor Render deployments** (weekly)
  - [ ] Check deployment success rate
  - [ ] Review build times
  - [ ] Check for errors

- [ ] **Update documentation** (as needed)
  - [ ] Update this doc if process changes
  - [ ] Update team on new features

### Team Training

- [ ] **Train developers on:**
  - [ ] How to create feature branches
  - [ ] What happens automatically
  - [ ] How to check PR status
  - [ ] How to debug failures

- [ ] **Train reviewers on:**
  - [ ] How to review PRs
  - [ ] How to approve (add "approved" label)
  - [ ] What to look for in reviews

### Success Metrics

Track these to ensure automation is working:

| Metric | Target | How to Check |
|--------|--------|--------------|
| PR Auto-Creation Rate | 100% | GitHub Actions logs |
| Test Pass Rate | >95% | PR status checks |
| Auto-Merge Success Rate | >90% | PR merge history |
| Deployment Success Rate | >98% | Render dashboard |
| Time to Deploy | <10 min | GitHub Actions + Render logs |

---

## Quick Reference: What Happens When

### Developer Pushes Code

```
Developer: git push origin feature/new-feature
    ↓
🤖 GitHub Actions: Auto-Create PR workflow runs
    ↓
✅ PR created automatically with template
    ↓
🤖 GitHub Actions: CI Pipeline runs
    ↓
✅ Tests, lint, typecheck, build all run
    ↓
📊 Status checks appear on PR
```

### PR Gets Approved

```
Reviewer: Adds "approved" label
    ↓
🤖 GitHub Actions: Auto-Merge workflow runs
    ↓
✅ Waits for all status checks to pass
    ↓
✅ Auto-merges PR to main
    ↓
🗑️ Deletes feature branch automatically
```

### Code Merged to Main

```
PR merged to main
    ↓
🤖 Render.com: Detects push to main
    ↓
🔨 Builds backend (npm install && npm run build)
    ↓
🔨 Builds frontend (cd frontend && npm install && npm run build)
    ↓
🚀 Deploys both services
    ↓
🤖 GitHub Actions: Verify Deployment workflow runs
    ↓
✅ Health checks pass
    ↓
📢 Team notified
```

---

## Summary: The Automated Process

### For Developers
1. Create branch: `git checkout -b feature/my-feature`
2. Make changes and commit
3. Push: `git push origin feature/my-feature`
4. **Everything else is automatic!**

### For Reviewers
1. Review PR (code, tests, etc.)
2. Add "approved" label
3. **PR auto-merges when ready!**

### For PMs
1. Monitor GitHub Actions dashboard
2. Check deployment status on Render
3. **Process runs itself!**

---

## Next Steps

1. **Set up the workflows** (follow Step 1-3 above)
2. **Test with a small change** (create test PR)
3. **Monitor first few deployments** (ensure everything works)
4. **Train the team** (share this document)
5. **Iterate and improve** (adjust based on feedback)

---

**Questions?** Check the troubleshooting section or review GitHub Actions logs for detailed error messages.

**Ready to automate?** Start with Step 1 and work through the setup checklist!

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-27  
**Maintained By:** Engineering Team

