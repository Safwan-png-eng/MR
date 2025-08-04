const fs = require('fs').promises;
const path = require('path');

const CHARACTERS_DIR = path.join(process.cwd(), 'public', 'characters');
const IMAGES_DIR = path.join(CHARACTERS_DIR, 'images');
const DEFAULTS_DIR = path.join(CHARACTERS_DIR, 'defaults');
const CONFIG_FILE = path.join(DEFAULTS_DIR, 'characters.json');

async function ensureDirectories() {
  try {
    await fs.mkdir(IMAGES_DIR, { recursive: true });
    await fs.mkdir(DEFAULTS_DIR, { recursive: true });
    console.log('✅ Directories ensured');
  } catch (error) {
    console.error('❌ Error creating directories:', error);
  }
}

async function syncCharacterImages() {
  try {
    console.log('🔄 Starting character sync...');
    
    await ensureDirectories();
    
    // Load existing config
    let config = { characters: {} };
    try {
      const configData = await fs.readFile(CONFIG_FILE, 'utf-8');
      config = JSON.parse(configData);
    } catch (error) {
      console.log('📝 Creating new config file');
    }
    
    // Scan for WebP files
    const imageFiles = await fs.readdir(IMAGES_DIR);
    const webpFiles = imageFiles.filter(file => 
      file.toLowerCase().endsWith('.webp')
    );
    
    console.log(`🖼️  Found ${webpFiles.length} WebP files:`, webpFiles);
    
    // Add new images to config
    for (const filename of webpFiles) {
      const id = filename.replace('.webp', '');
      const imagePath = `/characters/images/${filename}`;
      
      if (!config.characters[id]) {
        config.characters[id] = {
          id,
          name: id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          filename,
          path: imagePath,
          isDefault: false,
          uploadedAt: new Date().toISOString()
        };
        console.log(`➕ Added character: ${config.characters[id].name}`);
      } else {
        console.log(`✅ Character already exists: ${config.characters[id].name}`);
      }
    }
    
    // Remove deleted images from config
    const existingIds = Object.keys(config.characters);
    for (const id of existingIds) {
      const character = config.characters[id];
      const fileExists = webpFiles.includes(character.filename);
      
      if (!fileExists) {
        console.log(`🗑️  Removing deleted character: ${character.name}`);
        delete config.characters[id];
        if (config.defaultCharacter === id) {
          config.defaultCharacter = undefined;
        }
      }
    }
    
    // Set first character as default if no default is set
    const characterIds = Object.keys(config.characters);
    if (characterIds.length > 0 && !config.defaultCharacter) {
      config.defaultCharacter = characterIds[0];
      config.characters[characterIds[0]].isDefault = true;
      console.log(`⭐ Set default character: ${config.characters[characterIds[0]].name}`);
    }
    
    // Save config
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
    console.log('💾 Configuration saved');
    
    // Summary
    const characterCount = Object.keys(config.characters).length;
    console.log(`\n📊 Sync Summary:`);
    console.log(`   Characters: ${characterCount}`);
    console.log(`   Default: ${config.defaultCharacter ? config.characters[config.defaultCharacter].name : 'None'}`);
    console.log(`   Config file: ${CONFIG_FILE}`);
    
    return config;
    
  } catch (error) {
    console.error('❌ Error syncing character images:', error);
    throw error;
  }
}

// Run the sync
syncCharacterImages()
  .then(() => {
    console.log('\n🎉 Sync completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Sync failed:', error);
    process.exit(1);
  });