
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if a storage bucket exists and creates it if it doesn't
 */
export const ensureStorageBucket = async (bucketName: string): Promise<void> => {
  try {
    // First check if bucket exists
    const { data: buckets, error: getBucketsError } = await supabase
      .storage
      .listBuckets();
      
    if (getBucketsError) {
      console.error("Error checking storage buckets:", getBucketsError);
      return;
    }
    
    // If bucket doesn't exist, create it
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      const { error: createBucketError } = await supabase
        .storage
        .createBucket(bucketName, {
          public: true,
          fileSizeLimit: 1024 * 1024 * 2, // 2MB limit for profile pictures
        });
        
      if (createBucketError) {
        console.error(`Error creating ${bucketName} bucket:`, createBucketError);
      } else {
        console.log(`Created ${bucketName} bucket successfully`);
      }
    }
  } catch (error) {
    console.error("Error in ensureStorageBucket:", error);
  }
};

/**
 * Initialize storage buckets
 */
export const initializeStorage = async (): Promise<void> => {
  await ensureStorageBucket("profiles");
};
