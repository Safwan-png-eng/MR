'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Image as ImageIcon, Star, StarOff, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface CharacterImage {
  id: string;
  name: string;
  filename: string;
  path: string;
  isDefault: boolean;
  uploadedAt: string;
}

interface CharacterUploadProps {
  onUploadSuccess?: (character: CharacterImage) => void;
  onDefaultChange?: (characterId: string) => void;
}

export function CharacterUpload({ onUploadSuccess, onDefaultChange }: CharacterUploadProps) {
  const [characters, setCharacters] = useState<CharacterImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Fetch existing characters
  const fetchCharacters = useCallback(async () => {
    try {
      const response = await fetch('/api/characters/upload');
      if (response.ok) {
        const data = await response.json();
        setCharacters(data.characters || []);
      }
    } catch (error) {
      console.error('Error fetching characters:', error);
      toast.error('Failed to load character images');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/characters/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    return data;
  };

  const setDefaultCharacter = async (characterId: string) => {
    try {
      const response = await fetch('/api/characters/default', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ characterId }),
      });

      if (response.ok) {
        // Update local state
        setCharacters(prev => 
          prev.map(char => ({
            ...char,
            isDefault: char.id === characterId
          }))
        );
        toast.success('Default character updated');
        onDefaultChange?.(characterId);
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to set default character');
      }
    } catch (error) {
      console.error('Error setting default character:', error);
      toast.error('Failed to set default character');
    }
  };

  const manualSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/characters/sync', {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        setCharacters(data.characters || []);
        toast.success(data.message || 'Characters synced successfully');
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync characters');
    } finally {
      setSyncing(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    
    try {
      for (const file of acceptedFiles) {
        // Validate file type
        if (!file.name.toLowerCase().endsWith('.webp')) {
          toast.error(`${file.name} is not a WebP file. Only WebP images are allowed.`);
          continue;
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Maximum file size is 10MB.`);
          continue;
        }

        try {
          const result = await uploadFile(file);
          toast.success(`${file.name} uploaded successfully!`);
          
          // Add to characters list
          if (result.character) {
            setCharacters(prev => [...prev, result.character]);
            onUploadSuccess?.(result.character);
          }
        } catch (error) {
          console.error('Upload error:', error);
          toast.error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } finally {
      setUploading(false);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/webp': ['.webp']
    },
    multiple: true,
    disabled: uploading
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading character images...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Character Images
              </CardTitle>
              <CardDescription>
                Drag and drop WebP images here, or click to select files. Maximum file size: 10MB.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={manualSync}
              disabled={syncing || uploading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
              ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}
            `}
          >
            <input {...getInputProps()} />
            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-lg">Drop the WebP files here...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">
                  {uploading ? 'Uploading...' : 'Drag & drop WebP images here'}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to select files
                </p>
                <Button variant="outline" disabled={uploading}>
                  Select Files
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Character Gallery */}
      {characters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Character Images ({characters.length})</CardTitle>
            <CardDescription>
              Click the star to set a character as default. The default character will be used when the app restarts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {characters.map((character) => (
                <div
                  key={character.id}
                  className="relative group border rounded-lg overflow-hidden bg-card"
                >
                  <div className="aspect-square relative">
                    <img
                      src={character.path}
                      alt={character.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {character.isDefault && (
                      <Badge className="absolute top-2 left-2 bg-yellow-500 text-yellow-50">
                        Default
                      </Badge>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm truncate" title={character.name}>
                      {character.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate" title={character.filename}>
                      {character.filename}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(character.uploadedAt).toLocaleDateString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDefaultCharacter(character.id)}
                        className="h-8 w-8 p-0"
                        title={character.isDefault ? 'Remove as default' : 'Set as default'}
                      >
                        {character.isDefault ? (
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ) : (
                          <StarOff className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {characters.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No character images yet</h3>
            <p className="text-muted-foreground mb-4">
              Upload your first WebP character image to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}