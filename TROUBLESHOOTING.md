# Troubleshooting - Blank Page

If you see a blank page at http://localhost:3000, try these steps:

## 1. Check Browser Console

Open browser DevTools (F12 or Cmd+Option+I) and check the Console tab for errors.

Common errors:
- **Module not found**: Missing dependencies
- **Cannot read property**: Runtime error
- **Network error**: API call failing

## 2. Check Terminal Output

Look at the terminal where `npm run dev` is running for:
- Build errors
- TypeScript errors
- Module resolution errors

## 3. Clear Browser Cache

```bash
# Hard refresh in browser
Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

Or clear browser cache completely.

## 4. Restart Dev Server

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

## 5. Check Environment Variables

Make sure `.env.local` exists and has:
```env
VITE_API_URL=
```

## 6. Verify Dependencies

```bash
npm install
```

## 7. Check for TypeScript Errors

```bash
npx tsc --noEmit
```

## 8. Common Issues

### Issue: Blank white page
**Solution**: Check browser console for JavaScript errors

### Issue: "Cannot find module"
**Solution**: Run `npm install` again

### Issue: "API_NOT_AVAILABLE" errors in console
**Solution**: This is normal in offline mode, ignore it

### Issue: React not rendering
**Solution**: Check if `index.tsx` is importing `App.tsx` correctly

## 9. Quick Fix

Try this complete reset:

```bash
# Stop server
# Clear node_modules
rm -rf node_modules
rm package-lock.json

# Reinstall
npm install

# Start fresh
npm run dev
```

## 10. Check Network Tab

In browser DevTools → Network tab:
- Are files loading? (index.html, index.tsx, etc.)
- Any 404 errors?
- Any CORS errors?

## Still Not Working?

1. **Check the terminal output** - Look for error messages
2. **Check browser console** - Look for JavaScript errors
3. **Verify port 3000 is free**: `lsof -ti:3000`
4. **Try a different port**: Update `vite.config.ts` port to 3001

---

**Most common cause**: JavaScript error in browser console. Always check there first!
