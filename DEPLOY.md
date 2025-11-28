# Netlify Deployment Guide

## Quick Deploy Steps

1. **Build locally to test**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   
   **Option A: GitHub Integration (Recommended)**
   - Push your code to GitHub
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repo
   - Netlify will auto-detect settings from `netlify.toml`
   - Click "Deploy"

   **Option B: Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod
   ```

3. **Configure Firebase Authentication**:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Navigate to: Authentication → Settings → Authorized domains
   - Add your Netlify domain (e.g., `your-app.netlify.app`)

## Environment Configuration

The app now uses environment-based configuration:
- **Development**: `src/environments/environment.ts`
- **Production**: `src/environments/environment.prod.ts`

Firebase credentials are currently in these files. For enhanced security in production:
1. Use Netlify Environment Variables
2. Never commit sensitive keys to public repos

## Security Checklist

Before going live:
- ✅ Firebase rules deployed (`firestore.rules`, `storage.rules`)
- ✅ Netlify domain added to Firebase authorized domains
- ⚠️ Consider using Netlify environment variables for API keys
- ⚠️ Review Firebase security rules for production use

## Files Created/Modified

- `netlify.toml` - Netlify build configuration
- `src/environments/environment.ts` - Development Firebase config
- `src/environments/environment.prod.ts` - Production Firebase config
- `src/app/app.config.ts` - Now uses environment variables
- `DEPLOY.md` - This deployment guide

## Build Output

After running `npm run build`, the production-ready files will be in:
```
dist/diemvi/browser/
```

This is automatically configured in `netlify.toml`.

## Troubleshooting

**Build fails on Netlify:**
- Check Node version (set to 20 in netlify.toml)
- Verify all dependencies are in package.json
- Check build logs for specific errors

**Firebase connection fails:**
- Verify Firebase config in environment files
- Check Firebase project is active
- Ensure authorized domains include Netlify domain

**Routes not working (404 errors):**
- Verify redirects in netlify.toml are configured
- Check that publish directory is correct

## Support

For issues:
- Netlify: [docs.netlify.com](https://docs.netlify.com)
- Firebase: [firebase.google.com/docs](https://firebase.google.com/docs)
