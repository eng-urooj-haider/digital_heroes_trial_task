/**
 * exportCanvas.js — Export canvas to file or clipboard
 */

/**
 * Download canvas as PNG or JPEG
 */
export function exportCanvasToFile(canvas, format = 'png', quality = 0.92) {
  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const extension = format === 'jpeg' ? 'jpg' : 'png';

  const dataUrl = canvas.toDataURL(mimeType, quality);

  const link = document.createElement('a');
  link.download = `screenshot-${Date.now()}.${extension}`;
  link.href = dataUrl;
  link.click();
}

/**
 * Copy canvas image to clipboard
 */
export async function copyCanvasToClipboard(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      try {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        resolve(true);
      } catch (err) {
        reject(err);
      }
    }, 'image/png');
  });
}

/**
 * Get canvas data URL
 */
export function getCanvasDataUrl(canvas, format = 'png', quality = 0.92) {
  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  return canvas.toDataURL(mimeType, quality);
}
