/** Client-side preparation; does not upload to any service. */
export async function prepareProfilePhoto(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("Elige una imagen JPG, PNG o WebP.");
  if (file.size > 5 * 1024 * 1024)
    throw new Error("La imagen debe pesar menos de 5 MB.");
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("No pudimos abrir esa imagen. Elige otro archivo.");
  }
  try {
    if (bitmap.width * bitmap.height > 40000000)
      throw new Error(
        "La imagen es demasiado grande. Usa una foto de menor resolución.",
      );
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");
    if (!context)
      throw new Error("Tu navegador no permite preparar esta foto.");
    const size = Math.min(bitmap.width, bitmap.height);
    context.drawImage(
      bitmap,
      (bitmap.width - size) / 2,
      (bitmap.height - size) / 2,
      size,
      size,
      0,
      0,
      512,
      512,
    );
    const result = canvas.toDataURL("image/webp", 0.85);
    if (result.length > 750000)
      throw new Error("No pudimos reducir la imagen. Prueba otra foto.");
    return result;
  } finally {
    bitmap.close();
  }
}
