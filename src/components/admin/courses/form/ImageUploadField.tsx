
import React, { useState, useEffect } from 'react';
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Image, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ImageUploadFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  objectPrefix?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  control,
  name,
  label,
  objectPrefix = 'courses'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [bucketReady, setBucketReady] = useState(false);

  // Check if the course-assets bucket exists
  useEffect(() => {
    const checkBucket = async () => {
      try {
        const { data: buckets, error } = await supabase.storage.listBuckets();
        
        if (error) {
          console.warn("Error checking buckets:", error);
          return;
        }
        
        const courseAssetsBucket = buckets?.find(b => b.name === 'course-assets');
        
        if (!courseAssetsBucket) {
          console.warn("Bucket 'course-assets' not found. It may need to be created in Supabase.");
          toast.error("Storage bucket not configured. Contact administrator.", {
            id: "bucket-error",
            duration: 5000
          });
          return;
        }
        
        setBucketReady(true);
        console.log("'course-assets' bucket is ready for use");
      } catch (err) {
        console.error("Error checking storage bucket:", err);
      }
    };
    
    checkBucket();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image");
      return;
    }

    setIsUploading(true);
    
    try {
      if (!bucketReady) {
        const { data: buckets } = await supabase.storage.listBuckets();
        const courseAssetsBucket = buckets?.find(b => b.name === 'course-assets');
        
        if (!courseAssetsBucket) {
          throw new Error("Bucket 'course-assets' not found. Contact administrator.");
        }
      }
      
      // Create a unique file name using timestamp
      const fileExt = file.name.split('.').pop();
      const fileName = `covers/${objectPrefix}-${Date.now()}.${fileExt}`;
      
      console.log(`Attempting to upload to course-assets/${fileName}`);
      
      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('course-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error("Upload error details:", error);
        throw error;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('course-assets')
        .getPublicUrl(fileName);
      
      console.log("File uploaded successfully. Public URL:", publicUrl);
      
      // Update the form field with the new URL
      onChange(publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      
      if (error.message && error.message.includes("storage/bucket-not-found")) {
        toast.error("Storage not configured. Contact administrator.");
      } else {
        toast.error(`Error uploading image: ${error.message || "Unknown error"}`);
      }
    } finally {
      setIsLoading(false);
      // Clear the input value so the same file can be selected again
      e.target.value = '';
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className="space-y-3">
            <div className="flex gap-2">
              <FormControl>
                <div className="flex-1 relative">
                  <Input 
                    type="text" 
                    {...field} 
                    placeholder="https://example.com/image.png"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center">
                    <Image className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </FormControl>
              <div className="relative">
                <Button 
                  type="button" 
                  variant="outline"
                  disabled={isUploading || !bucketReady}
                  className="relative"
                  onClick={() => document.getElementById(`image-upload-${name}`)?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'Uploading...' : !bucketReady ? 'Initializing...' : 'Upload'}
                </Button>
                <input 
                  id={`image-upload-${name}`}
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, field.onChange)}
                  className="hidden"
                />
              </div>
            </div>
            {field.value && (
              <div className="border rounded-md p-2 flex justify-center">
                <img 
                  src={field.value} 
                  alt="Course image" 
                  className="max-h-32 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                    target.onerror = null;
                  }}
                />
              </div>
            )}
          </div>
        </FormItem>
      )}
    />
  );
};
