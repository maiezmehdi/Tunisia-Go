/**
 * Shrinks a photo in the browser before upload: longest side at most `maxSide` px, re-encoded as JPEG.
 * Phone photos (4–10 MB) come out around 200–500 KB, and EXIF data (including GPS) is dropped.
 */
export async function resizeImage(file: File, maxSide = 1600, maxBytes = 900_000): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no canvas');
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  for (const quality of [0.82, 0.7, 0.55]) {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (blob && (blob.size <= maxBytes || quality === 0.55)) return blob;
  }
  throw new Error('encode failed');
}
