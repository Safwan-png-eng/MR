import { CharacterUpload } from '@/components/character-upload';
import { syncCharacterImages } from '@/lib/character-images';

export default async function CharactersPage() {
  // Sync character images when page loads
  try {
    await syncCharacterImages();
    console.log('✅ Character images synced on page load');
  } catch (error) {
    console.error('❌ Failed to sync character images:', error);
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Character Images</h1>
          <p className="text-muted-foreground">
            Upload and manage your WebP character images. Set a default character that will persist after restart.
          </p>
        </div>
        
        <CharacterUpload />
      </div>
    </div>
  );
}