/**
 * blurRegion.js — Pixelate/blur canvas regions for cleaner tool
 */

/**
 * Pixelate a rectangular region of a canvas
 */
export function pixelateRegion(ctx, x1, y1, x2, y2, blockSize = 12) {
  const rx = Math.min(x1, x2);
  const ry = Math.min(y1, y2);
  const rw = Math.abs(x2 - x1);
  const rh = Math.abs(y2 - y1);

  if (rw < 1 || rh < 1) return;

  const imageData = ctx.getImageData(rx, ry, rw, rh);
  const data = imageData.data;

  for (let py = 0; py < rh; py += blockSize) {
    for (let px = 0; px < rw; px += blockSize) {
      const bw = Math.min(blockSize, rw - px);
      const bh = Math.min(blockSize, rh - py);

      // Sample center pixel of block
      const cx = Math.min(px + Math.floor(bw / 2), rw - 1);
      const cy = Math.min(py + Math.floor(bh / 2), rh - 1);
      const idx = (cy * rw + cx) * 4;

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      // Fill entire block with sampled color
      for (let by = 0; by < bh; by++) {
        for (let bx = 0; bx < bw; bx++) {
          const i = ((py + by) * rw + (px + bx)) * 4;
          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
          data[i + 3] = a;
        }
      }
    }
  }

  ctx.putImageData(imageData, rx, ry);
}

/**
 * Fill a region with solid color (redaction)
 */
export function redactRegion(ctx, x1, y1, x2, y2, color = '#000000') {
  const rx = Math.min(x1, x2);
  const ry = Math.min(y1, y2);
  const rw = Math.abs(x2 - x1);
  const rh = Math.abs(y2 - y1);

  if (rw < 1 || rh < 1) return;

  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(rx, ry, rw, rh);
  ctx.restore();
}

/**
 * Apply a simple box blur to a region
 */
export function blurRegion(ctx, x1, y1, x2, y2, radius = 8) {
  const rx = Math.max(0, Math.floor(Math.min(x1, x2)));
  const ry = Math.max(0, Math.floor(Math.min(y1, y2)));
  const rw = Math.ceil(Math.abs(x2 - x1));
  const rh = Math.ceil(Math.abs(y2 - y1));

  if (rw < 1 || rh < 1) return;

  const imageData = ctx.getImageData(rx, ry, rw, rh);
  const data = imageData.data;
  const output = new Uint8ClampedArray(data.length);

  // Simple box blur
  for (let y = 0; y < rh; y++) {
    for (let x = 0; x < rw; x++) {
      let r = 0, g = 0, b = 0, a = 0, count = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < rw && ny >= 0 && ny < rh) {
            const i = (ny * rw + nx) * 4;
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            a += data[i + 3];
            count++;
          }
        }
      }
      const oi = (y * rw + x) * 4;
      output[oi] = r / count;
      output[oi + 1] = g / count;
      output[oi + 2] = b / count;
      output[oi + 3] = a / count;
    }
  }

  const blurred = new ImageData(output, rw, rh);
  ctx.putImageData(blurred, rx, ry);
}
