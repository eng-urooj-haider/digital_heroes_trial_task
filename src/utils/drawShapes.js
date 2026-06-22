/**
 * drawShapes.js — Canvas shape rendering utilities
 */

export function drawArrow(ctx, x1, y1, x2, y2, color, lineWidth) {
  const headLen = Math.max(12, lineWidth * 4);
  const angle = Math.atan2(y2 - y1, x2 - x1);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Line (shortened slightly for arrowhead)
  const shorten = headLen * 0.7;
  const ex = x2 - Math.cos(angle) * shorten;
  const ey = y2 - Math.sin(angle) * shorten;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(ex, ey);
  ctx.stroke();

  // Arrowhead
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - headLen * Math.cos(angle - Math.PI / 6),
    y2 - headLen * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    x2 - headLen * Math.cos(angle + Math.PI / 6),
    y2 - headLen * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawRect(ctx, x1, y1, x2, y2, color, lineWidth, filled = false, opacity = 1) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = 'round';

  const rx = Math.min(x1, x2);
  const ry = Math.min(y1, y2);
  const rw = Math.abs(x2 - x1);
  const rh = Math.abs(y2 - y1);

  if (filled) {
    ctx.fillRect(rx, ry, rw, rh);
  } else {
    ctx.strokeRect(rx, ry, rw, rh);
  }
  ctx.restore();
}

export function drawEllipse(ctx, x1, y1, x2, y2, color, lineWidth, filled = false, opacity = 1) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;

  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  const rx = Math.abs(x2 - x1) / 2;
  const ry = Math.abs(y2 - y1) / 2;

  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);

  if (filled) {
    ctx.fill();
  } else {
    ctx.stroke();
  }
  ctx.restore();
}

export function drawLine(ctx, x1, y1, x2, y2, color, lineWidth) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

export function drawText(ctx, text, x, y, color, fontSize, fontWeight = 600) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `${fontWeight} ${fontSize}px Inter, sans-serif`;
  ctx.textBaseline = 'top';

  // Draw text background for readability
  const metrics = ctx.measureText(text);
  const padding = 6;
  const lines = text.split('\n');
  const lineHeight = fontSize * 1.3;
  const maxWidth = Math.max(...lines.map(l => ctx.measureText(l).width));

  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(
    x - padding,
    y - padding,
    maxWidth + padding * 2,
    lines.length * lineHeight + padding * 2
  );

  ctx.fillStyle = color;
  lines.forEach((line, i) => {
    ctx.fillText(line, x, y + i * lineHeight);
  });
  ctx.restore();
}

export function drawHighlight(ctx, x1, y1, x2, y2, color, opacity = 0.35) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  const rx = Math.min(x1, x2);
  const ry = Math.min(y1, y2);
  const rw = Math.abs(x2 - x1);
  const rh = Math.abs(y2 - y1);
  ctx.fillRect(rx, ry, rw, rh);
  ctx.restore();
}

export function drawStepMarker(ctx, x, y, stepNumber, color, size = 28) {
  ctx.save();

  // Circle
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // Border
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Number
  ctx.fillStyle = '#fff';
  ctx.font = `700 ${Math.round(size * 0.5)}px Inter, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(stepNumber), x, y);
  ctx.restore();
}

export function drawFreePath(ctx, points, color, lineWidth) {
  if (points.length < 2) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const mx = (prev.x + curr.x) / 2;
    const my = (prev.y + curr.y) / 2;
    ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
  }
  ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
  ctx.stroke();
  ctx.restore();
}
