# GitHub Setup Guide

## Creating a GitHub Repository

### Option 1: Using GitHub Web Interface

1. **Go to GitHub.com** and sign in to your account

2. **Create New Repository**
   - Click the "+" icon in the top right
   - Select "New repository"
   - Repository name: `tradegpt-landing` (or your preferred name)
   - Description: "AI-Powered Trading Platform with Smart-Money Concepts"
   - Set to **Private** (recommended for proprietary code)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)

3. **Connect Your Local Repository**
   ```bash
   # Add GitHub as remote origin
   git remote add origin https://github.com/YOUR_USERNAME/tradegpt-landing.git
   
   # Push your code to GitHub
   git branch -M main
   git push -u origin main
   ```

### Option 2: Using GitHub CLI (if installed)

```bash
# Create repository directly from command line
gh repo create tradegpt-landing --private --description "AI-Powered Trading Platform"

# Push your code
git push -u origin main
```

## Important Security Notes

✅ **What gets uploaded to GitHub:**
- All source code files
- Configuration files
- `.env.example` template
- Documentation
- `.gitignore` file

❌ **What stays private on your machine:**
- `.env.local` (your actual API keys)
- `node_modules/` folder
- Build artifacts

## After Pushing to GitHub

1. **Verify Security**: Check that `.env.local` is NOT visible in your GitHub repository
2. **Add Collaborators**: If working with a team, add them to the private repository
3. **Set up Branch Protection**: Consider protecting the main branch for production code

## For Team Members

When someone clones your repository:

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/tradegpt-landing.git
cd tradegpt-landing

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add their own API keys

# Start development server
npm run dev
```

## Repository Settings Recommendations

- **Visibility**: Private (for proprietary code)
- **Branch Protection**: Enable for main branch
- **Security Alerts**: Enable Dependabot alerts
- **Actions**: Enable GitHub Actions for CI/CD (optional) 