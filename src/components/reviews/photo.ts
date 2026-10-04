// Yorum fotoğrafı: tarayıcıda en fazla 1600 px WebP'ye küçültülür, imzalı adrese doğrudan yüklenir (Vercel 4,5 MB sınırı)
export async function shrinkToWebp(file: File): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", 0.85));
    return blob ?? file;
  } catch {
    return file;
  }
}

/** signEndpoint'e { action: "photo", ext } gönderir, dönen adrese yükler, herkese açık adresi döner */
export async function uploadReviewPhoto(file: File, signEndpoint: string): Promise<string> {
  const blob = await shrinkToWebp(file);
  const ext = blob.type === "image/webp" ? "webp" : (file.name.split(".").pop() ?? "jpg");
  const s = await fetch(signEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "photo", ext }) });
  const d = await s.json().catch(() => ({}));
  if (!s.ok || !d.signedURL) throw new Error(d.error || "Fotoğraf yüklenemedi.");
  const up = await fetch(d.signedURL, { method: "PUT", headers: { "Content-Type": blob.type || "image/jpeg" }, body: blob });
  if (!up.ok) throw new Error("Fotoğraf yüklenemedi.");
  return d.publicUrl as string;
}
