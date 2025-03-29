
import React, { useCallback, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileUp, Image as ImageIcon, X } from 'lucide-react';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);
  
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, []);
  
  const handleFiles = useCallback((files: FileList) => {
    const file = files[0];
    
    if (!file.type.match('image.*')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
      onImageUpload(file);
    };
    reader.readAsDataURL(file);
    
    toast({
      title: "Image uploaded",
      description: "Your image has been uploaded successfully.",
    });
  }, [toast, onImageUpload]);
  
  const removeImage = useCallback(() => {
    setPreviewUrl(null);
  }, []);
  
  return (
    <div className="w-full">
      {!previewUrl ? (
        <Card className={`border-2 border-dashed ${dragActive ? 'border-medical-400 bg-medical-50' : 'border-gray-300'} transition-colors duration-200`}>
          <CardContent className="p-0">
            <div
              className="flex flex-col items-center justify-center py-10 px-6"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Drag & drop your image</h3>
              <p className="text-sm text-gray-500 mb-4 text-center">or click to browse your files</p>
              
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleChange}
              />
              <label htmlFor="file-upload">
                <Button variant="outline" className="flex items-center gap-2" asChild>
                  <span>
                    <FileUp className="h-4 w-4" />
                    Browse Files
                  </span>
                </Button>
              </label>
              
              <p className="text-xs text-gray-400 mt-4">Supports JPG, PNG, GIF up to 10MB</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <ImageIcon className="h-5 w-5 text-medical-600 mr-2" />
                <span className="text-sm font-medium">Uploaded Image</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove image</span>
              </Button>
            </div>
            <div className="relative">
              <img 
                src={previewUrl} 
                alt="Uploaded preview" 
                className="w-full rounded-md border border-gray-200 object-contain" 
                style={{ maxHeight: '300px' }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageUploader;
