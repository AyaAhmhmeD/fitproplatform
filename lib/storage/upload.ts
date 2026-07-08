import { createAdminClient } from "@/lib/supabase/admin";

export const BUCKETS = {
  avatars: process.env.SUPABASE_BUCKET_AVATARS || "avatars",
  photos: process.env.SUPABASE_BUCKET_PHOTOS || "progress-photos",
  documents: process.env.SUPABASE_BUCKET_DOCUMENTS || "documents",
} as const;

/** Uploads a file buffer to Supabase Storage and returns its public URL. */
export async function uploadFile(params: {
  bucket: keyof typeof BUCKETS;
  path: string;
  file: Buffer | ArrayBuffer;
  contentType: string;
}): Promise<string> {
  const admin = createAdminClient();
  const bucketName = BUCKETS[params.bucket];

  const { error } = await admin.storage.from(bucketName).upload(params.path, params.file, {
    contentType: params.contentType,
    upsert: true,
  });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = admin.storage.from(bucketName).getPublicUrl(params.path);
  return data.publicUrl;
}
