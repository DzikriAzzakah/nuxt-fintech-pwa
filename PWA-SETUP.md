# PWA Setup & Installation Guide

Your Shared Finance app is now a fully-featured Progressive Web App (PWA)!

## Features Enabled

✅ **Installable** - Install on home screen (mobile & desktop)
✅ **Offline Support** - Works without internet connection
✅ **Background Sync** - Checks for updates periodically
✅ **App Icons** - Custom branded icons for all devices
✅ **Splash Screens** - Native app-like launch experience
✅ **Service Worker** - Caches assets for better performance

## How to Install

### On Mobile (iOS & Android)
1. Open the app in your mobile browser
2. Tap the Share/Menu button
3. Select "Add to Home Screen" or "Install App"
4. Confirm and the app will be installed

### On Desktop (Chrome, Edge)
1. Open the app in your browser
2. Click the Install button (appears in address bar or menu)
3. Confirm the installation
4. The app will open in standalone window

### On Desktop (Safari)
1. Open the app in Safari
2. Tap Share button
3. Select "Add to Dock"
4. The app will be added to your dock

## Offline Capabilities

The app includes:
- **Asset Caching**: All CSS, JS, images cached for offline access
- **API Response Caching**: Recent requests are cached
- **Fallback Pages**: Core functionality available offline

## Configuration Details

The PWA is configured with:
- **App Name**: Shared Finance
- **Short Name**: Finance
- **Start URL**: / (Home page)
- **Display Mode**: Standalone (full-screen)
- **Theme Color**: Blue (#3B82F6)
- **Orientation**: Portrait

## Browser Support

✅ Chrome 90+
✅ Edge 90+
✅ Firefox 92+
✅ Safari 15+
✅ Samsung Internet
✅ Opera

## Troubleshooting

**App won't install?**
- Ensure you're using an HTTPS connection
- Clear browser cache and try again
- Check browser version compatibility

**Service worker not updating?**
- Uninstall and reinstall the app
- Clear app data in browser settings
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

**Offline features not working?**
- Check browser's storage quota
- Verify service worker registration in DevTools
- Enable offline support in feature flags

## Development

To test PWA features locally:

```bash
npm run build
npm run preview
```

Then use Chrome DevTools (F12):
1. Go to Application > Service Workers
2. Check service worker status
3. Test offline mode
4. Inspect cache storage

## Learn More

- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [@vite-pwa/nuxt Docs](https://vite-pwa-org.netlify.app/frameworks/nuxt)
