# 🌳 Git Branch Strategy

This project follows a GitFlow-inspired branching strategy for organized development and reliable deployments.

## 📋 Branch Structure

```
main (production)
├── develop (development)
│   ├── feature/email-invitations ✅
│   ├── feature/workout-builder
│   ├── feature/payment-integration
│   └── feature/mobile-app-enhancement
└── hotfix/critical-bug-fix (emergency fixes)
```

## 🎯 Branch Purposes

### 1. `main` Branch (Production)
- **Purpose**: Always stable and ready for deployment
- **Environment**: Production Firebase project
- **Configuration**: Real API keys, production email services
- **Deployment**: Auto-deploys to production when pushed
- **Rules**: No direct commits - only merge from `develop` via PR

### 2. `develop` Branch (Development)
- **Purpose**: Integration branch for new features
- **Environment**: Firebase emulators
- **Configuration**: Mock services for testing
- **Deployment**: Manual testing environment
- **Rules**: Features merge here first before going to `main`

### 3. Feature Branches
- **Purpose**: Individual features (e.g., `feature/email-invitations`)
- **Lifespan**: Short-lived (1-7 days typically)
- **Flow**: Branch from `develop` → merge back to `develop`
- **Naming**: `feature/description-of-feature`

## 🚀 Deployment Workflows

### Development Deployment
```bash
# Switch to develop branch
git checkout develop

# Run development environment
./scripts/deploy-dev.sh
```

### Production Deployment
```bash
# Switch to main branch
git checkout main

# Deploy to production (with safety checks)
./scripts/deploy-prod.sh
```

## 📁 Environment Configurations

| Environment | Branch | Firebase Project | Config Files | Email Service |
|-------------|--------|------------------|--------------|---------------|
| Development | `develop` | `fitness-platform-dev` | `.env.development` | Mock (console) |
| Production | `main` | `fitness-platform-prod` | `.env.production` | SendGrid/Real |

## 🔧 Working with Feature Branches

### Creating a New Feature
```bash
# Start from develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name

# Work on your feature...
# Commit changes regularly
git add .
git commit -m "feat: implement feature component"

# Push to remote
git push -u origin feature/your-feature-name
```

### Merging Feature to Develop
```bash
# Ensure develop is up to date
git checkout develop
git pull origin develop

# Merge feature branch
git merge feature/your-feature-name

# Push to develop
git push origin develop

# Clean up feature branch
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

### Promoting Develop to Production
```bash
# Ensure develop is stable and tested
git checkout develop
npm run test
npm run build

# Switch to main
git checkout main
git pull origin main

# Merge develop into main
git merge develop

# Push to production (triggers auto-deployment)
git push origin main
```

## 🔒 Branch Protection Rules (GitHub)

### `main` Branch
- ✅ Require pull request reviews
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Restrict pushes (no direct commits)
- ✅ Require signed commits

### `develop` Branch
- ✅ Require status checks to pass
- ✅ Delete head branches after merge
- ⚠️ Allow direct pushes (for quick fixes)

## 🚨 Emergency Hotfixes

For critical production bugs:

```bash
# Create hotfix from main
git checkout main
git checkout -b hotfix/critical-issue-description

# Fix the issue
# ... make changes ...

# Test thoroughly
npm run test

# Merge to both main and develop
git checkout main
git merge hotfix/critical-issue-description
git push origin main

git checkout develop
git merge hotfix/critical-issue-description
git push origin develop

# Clean up
git branch -d hotfix/critical-issue-description
```

## 📊 Current Status

- ✅ **main**: Production-ready with trainee invitation system
- ✅ **develop**: Active development branch
- ✅ **Environment configs**: Development and production ready
- ✅ **CI/CD**: GitHub Actions configured
- 🏗️ **Next features**: Workout builder, payment integration

## 🛠️ Quick Commands

```bash
# Switch environments
npm run dev          # Development with emulators
npm run prod         # Production build

# Firebase environments
firebase use fitness-platform-dev    # Development
firebase use fitness-platform-prod   # Production

# View current branch and status
git status
git branch -a
```

## 📞 Need Help?

- **Branch conflicts**: Use `git merge` or create a PR for review
- **Environment issues**: Check `.env.development` vs `.env.production`
- **Deployment problems**: Review deployment logs in GitHub Actions
- **Firebase issues**: Verify project selection with `firebase projects:list`