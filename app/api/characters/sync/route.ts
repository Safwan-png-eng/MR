import { NextResponse } from 'next/server';
import { syncCharacterImages } from '@/lib/character-images';

export async function POST() {
  try {
    console.log('🔄 Manual sync triggered...');
    const config = await syncCharacterImages();
    const characterCount = Object.keys(config.characters).length;
    
    return NextResponse.json({
      success: true,
      message: `Successfully synced ${characterCount} character image(s)`,
      characters: Object.values(config.characters),
      defaultCharacter: config.defaultCharacter
    });
    
  } catch (error) {
    console.error('Error during manual sync:', error);
    return NextResponse.json(
      { error: 'Failed to sync character images' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Same as POST for convenience
  return POST();
}