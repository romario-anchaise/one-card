import { downloadFile } from "./browser";
export async function downloadQrPng(svg: SVGSVGElement): Promise<void> {
  const url = URL.createObjectURL(
    new Blob([new XMLSerializer().serializeToString(svg)], {
      type: "image/svg+xml",
    }),
  );
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("PNG no disponible.");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, 1024, 1024);
    context.drawImage(image, 0, 0, 1024, 1024);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (value) =>
          value ? resolve(value) : reject(new Error("PNG no disponible.")),
        "image/png",
      ),
    );
    downloadFile(blob, "one-card-qr.png", "image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}
