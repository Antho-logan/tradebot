# Security Documentation

## API Key Protection

This project implements secure API key management to protect sensitive credentials:

### Environment Variables
- **Production Keys**: Stored in `.env.local` (never committed to git)
- **Example Template**: `.env.example` shows required variables without exposing real keys
- **Git Ignore**: `.env*` pattern in `.gitignore` prevents accidental commits

### API Key Flow
1. **Server-side**: Environment variable `OPENAI_API_KEY` used by default
2. **Client-side**: Optional user-provided key stored in localStorage only
3. **Fallback**: If no user key provided, server uses environment variable
4. **No Hardcoding**: No API keys are hardcoded in source code

### What's Protected
✅ **Safe to commit:**
- Source code files
- Configuration files
- `.env.example` template
- Documentation

❌ **Never committed:**
- `.env.local` (your actual API keys)
- `node_modules/`
- Build artifacts

### Verification
To verify your setup is secure:

```bash
# Check that .env.local is ignored
git status

# Should NOT show .env.local in tracked files
# Should show .env.example as tracked
```

### For New Developers
1. Clone the repository
2. Copy `.env.example` to `.env.local`
3. Add your own API keys to `.env.local`
4. Never commit `.env.local`

## Best Practices
- Rotate API keys regularly
- Use different keys for development/production
- Monitor API usage for unusual activity
- Keep keys in secure password managers 