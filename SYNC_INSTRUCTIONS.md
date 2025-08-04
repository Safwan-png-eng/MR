# How to Sync Character Images Added via GitHub 🔄

When you add WebP images directly through GitHub (not through the upload interface), they won't automatically appear in your app until you sync them.

## Quick Sync Methods

### Method 1: Use the Sync Script (Recommended)
```bash
npm run sync-characters
```

This will:
- ✅ Scan for all WebP files in `public/characters/images/`
- ✅ Add them to the configuration
- ✅ Set a default character if none exists
- ✅ Show you a summary of what was synced

### Method 2: Use the Sync Button in the App
1. Start your development server: `npm run dev`
2. Visit `/characters` in your browser
3. Click the "Sync" button in the top-right corner of the upload card
4. Your images will be synced and appear immediately

### Method 3: Automatic Sync on Page Load
- Simply visit `/characters` in your app
- The sync will run automatically when the page loads
- Check the browser console for sync confirmation

## Adding Images via GitHub

1. **Upload your WebP files** to the `public/characters/images/` folder via GitHub
2. **Run sync** using one of the methods above
3. **Visit `/characters`** to see your images and set a default

## File Requirements

- ✅ **Format**: WebP only (`.webp` extension)
- ✅ **Size**: Maximum 10MB per file
- ✅ **Location**: Must be in `public/characters/images/` folder
- ✅ **Naming**: Use descriptive names like `hero-portrait.webp`

## Example Workflow

```bash
# 1. Add images via GitHub to public/characters/images/
# 2. Pull the changes locally (or run on server)
git pull

# 3. Sync the images
npm run sync-characters

# 4. Start your app
npm run dev

# 5. Visit /characters to see your images
```

## Troubleshooting

### Images not appearing after sync?
- Check file format is `.webp`
- Verify files are in `public/characters/images/` folder
- Check browser console for errors
- Try refreshing the page

### Sync script fails?
- Make sure you're in the project root directory
- Check file permissions on the characters folder
- Verify Node.js is installed and working

### Default character not set?
- The first image found will automatically become default
- You can change the default by clicking the star icon in the app
- Or manually edit `public/characters/defaults/characters.json`

---

**Pro Tip**: After adding images via GitHub, always run `npm run sync-characters` to ensure they appear in your app! 🚀