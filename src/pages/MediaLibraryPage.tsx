import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image, UploadCloud, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { chatService } from '@/lib/chat';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
interface ImageAsset {
  url: string;
  filename: string;
}
export function MediaLibraryPage() {
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(true);
  const sessionId = chatService.getSessionId();
  const fetchImages = useCallback(async () => {
    setIsLoadingImages(true);
    try {
      const response = await fetch(`/api/r2/list/${sessionId}`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch images');
      }
      if (data.data?.imageUrls) {
        const fetchedImages: ImageAsset[] = data.data.imageUrls.map((url: string) => ({
          url,
          filename: url.substring(url.lastIndexOf('/') + 1),
        }));
        setImages(fetchedImages);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Failed to load media library', { description: (error as Error).message });
    } finally {
      setIsLoadingImages(false);
    }
  }, [sessionId]);
  useEffect(() => {
    fetchImages();
  }, [fetchImages]);
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setIsUploading(true);
    const uploadPromises = acceptedFiles.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await fetch(`/api/r2/upload/${sessionId}`, {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Upload failed');
        }
        if (data.data) {
          setImages((prev) => [...prev, { url: data.data.imageUrl, filename: data.data.filename }]);
          toast.success(`Uploaded: ${file.name}`);
        }
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        toast.error(`Failed to upload: ${file.name}`, { description: (error as Error).message });
      }
    });
    await Promise.all(uploadPromises);
    setIsUploading(false);
  }, [sessionId]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } });
  const handleDeleteImage = async (filename: string) => {
    try {
      const response = await fetch(`/api/r2/delete/${sessionId}/${filename}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Deletion failed');
      }
      setImages((prev) => prev.filter((img) => img.filename !== filename));
      toast.success(`Deleted: ${filename}`);
    } catch (error) {
      console.error(`Error deleting ${filename}:`, error);
      toast.error(`Failed to delete: ${filename}`, { description: (error as Error).message });
    }
  };
  return (
    <div className="w-full">
      <div className="space-y-12">
        <section className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-fredericka text-artisan-text-primary">Your Media Library</h1>
          <p className="text-lg text-artisan-text-secondary max-w-2xl mx-auto">
            Upload your images, organize them, and use them in your poster designs.
          </p>
        </section>
        <section>
          <Card className="p-6 border-artisan-border shadow-lg transition-all duration-300 hover:shadow-xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-playfair">Upload New Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200
                  ${isDragActive ? 'border-artisan-primary bg-artisan-primary/10 ring-4 ring-artisan-primary/20' : 'border-artisan-border hover:border-artisan-secondary/50 hover:bg-muted/50'}`}
              >
                <input {...getInputProps()} />
                {isUploading ? (
                  <div className="flex items-center space-x-2 text-artisan-primary">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-lg font-medium">Uploading...</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="h-12 w-12 text-artisan-text-secondary mb-4" />
                    <p className="text-lg font-medium text-artisan-text-primary">Drag 'n' drop some files here, or click to select files</p>
                    <p className="text-sm text-muted-foreground">(PNG, JPG, GIF up to 10MB)</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
        <section className="space-y-8">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-artisan-text-primary">Your Assets</h2>
          {isLoadingImages ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-video animate-pulse bg-muted/50 border-artisan-border shadow-sm rounded-lg" />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="text-center text-muted-foreground py-12 space-y-4 border-2 border-dashed rounded-lg">
              <Image className="h-16 w-16 mx-auto opacity-50" />
              <p className="text-xl font-playfair">No images yet. Start by uploading some!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {images.map((image) => (
                <Card key={image.filename} className="overflow-hidden group relative border-artisan-border shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <img
                    src={image.url}
                    alt={image.filename}
                    className="aspect-video object-cover w-full transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="p-4 flex justify-between items-center bg-artisan-card-bg">
                    <span className="text-sm font-medium text-artisan-text-primary truncate">{image.filename}</span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive/70 hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-artisan-card-bg border-artisan-border">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-playfair">Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription className="text-muted-foreground">
                            This action cannot be undone. This will permanently delete your image from the media library.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="hover:bg-muted/80">Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteImage(image.filename)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}