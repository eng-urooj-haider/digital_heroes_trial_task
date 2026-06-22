import { useRef, useEffect, useState, useCallback } from 'react';
import './AnnotationCanvas.css';
import {
  drawArrow, drawRect, drawEllipse, drawLine,
  drawText, drawHighlight, drawStepMarker, drawFreePath
} from '../../utils/drawShapes';
import { pixelateRegion, blurRegion, redactRegion } from '../../utils/blurRegion';

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 4;

function renderAnnotations(ctx, annotations, previewAnnotation = null) {
  const all = previewAnnotation ? [...annotations, previewAnnotation] : annotations;
  for (const ann of all) {
    switch (ann.type) {
      case 'pen':
        drawFreePath(ctx, ann.points, ann.color, ann.lineWidth);
        break;
      case 'arrow':
        drawArrow(ctx, ann.x1, ann.y1, ann.x2, ann.y2, ann.color, ann.lineWidth);
        break;
      case 'rect':
        drawRect(ctx, ann.x1, ann.y1, ann.x2, ann.y2, ann.color, ann.lineWidth, ann.filled, ann.opacity);
        break;
      case 'ellipse':
        drawEllipse(ctx, ann.x1, ann.y1, ann.x2, ann.y2, ann.color, ann.lineWidth, ann.filled, ann.opacity);
        break;
      case 'line':
        drawLine(ctx, ann.x1, ann.y1, ann.x2, ann.y2, ann.color, ann.lineWidth);
        break;
      case 'highlight':
        drawHighlight(ctx, ann.x1, ann.y1, ann.x2, ann.y2, ann.color, ann.opacity);
        break;
      case 'text':
        drawText(ctx, ann.text, ann.x, ann.y, ann.color, ann.fontSize);
        break;
      case 'step':
        drawStepMarker(ctx, ann.x, ann.y, ann.stepNumber, ann.color);
        break;
    }
  }
}

export default function AnnotationCanvas({
  image,
  annotations,
  activeTool,
  color,
  lineWidth,
  fontSize,
  opacity,
  filled,
  blurStrength,
  stepCounter,
  onAddAnnotation,
  canvasRef: externalCanvasRef,
}) {
  const baseCanvasRef = useRef(null);
  const annotationCanvasRef = useRef(null);
  const compositeCanvasRef = externalCanvasRef;
  const wrapperRef = useRef(null);
  const textareaRef = useRef(null);

  // Store loaded HTMLImageElement so we can redraw without re-loading
  const loadedImgRef = useRef(null);

  const [zoom, setZoom] = useState(1);
  // canvasSize is ONLY used for the container div style — never passed to canvas JSX props
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPoints, setCurrentPoints] = useState([]);
  const [previewAnnotation, setPreviewAnnotation] = useState(null);
  const [textInput, setTextInput] = useState(null);

  // ─── 1. Load image, set canvas dimensions via refs only, draw ────────────
  useEffect(() => {
    if (!image) return;

    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      loadedImgRef.current = img;

      // Set ALL canvas dimensions imperatively (never through JSX props)
      const setDims = (canvas) => {
        if (!canvas) return;
        canvas.width = width;
        canvas.height = height;
      };

      setDims(baseCanvasRef.current);
      setDims(annotationCanvasRef.current);
      setDims(compositeCanvasRef?.current);

      // Draw the image onto the base canvas
      const ctx = baseCanvasRef.current.getContext('2d');
      ctx.drawImage(img, 0, 0);

      // Update container size for layout (this will re-render but won't touch canvas dims)
      setCanvasSize({ width, height });

      // Auto-fit zoom
      if (wrapperRef.current) {
        const { clientWidth, clientHeight } = wrapperRef.current;
        const scale = Math.min(
          (clientWidth - 80) / width,
          (clientHeight - 80) / height,
          1
        );
        setZoom(Math.max(0.2, scale));
      }
    };
    img.src = image;
  }, [image]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── 2. Redraw base image whenever canvasSize changes (re-render guard) ──
  // This ensures the image is redrawn if React ever clears the canvas
  useEffect(() => {
    if (!loadedImgRef.current || !baseCanvasRef.current) return;
    const ctx = baseCanvasRef.current.getContext('2d');
    ctx.drawImage(loadedImgRef.current, 0, 0);
  }, [canvasSize]);

  // ─── 3. Redraw annotation canvas whenever annotations change ─────────────
  useEffect(() => {
    const canvas = annotationCanvasRef.current;
    if (!canvas || canvas.width === 0) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderAnnotations(ctx, annotations, previewAnnotation);
  }, [annotations, previewAnnotation]);

  // ─── 4. Update composite canvas for export ───────────────────────────────
  useEffect(() => {
    const composite = compositeCanvasRef?.current;
    const base = baseCanvasRef.current;
    const ann = annotationCanvasRef.current;
    if (!composite || !base || !ann || base.width === 0) return;
    const ctx = composite.getContext('2d');
    ctx.clearRect(0, 0, composite.width, composite.height);
    ctx.drawImage(base, 0, 0);
    ctx.drawImage(ann, 0, 0);
  }, [annotations, previewAnnotation]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Mouse event helpers ──────────────────────────────────────────────────
  const getCanvasPos = useCallback((e) => {
    const canvas = annotationCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    const pos = getCanvasPos(e);

    if (activeTool === 'text') {
      // Position relative to the wrapper div (not the scaled canvas-container)
      // so the textarea appears exactly under the cursor regardless of zoom level
      const wrapper = wrapperRef.current;
      const wrapperRect = wrapper.getBoundingClientRect();
      setTextInput({
        x: pos.x,           // canvas coordinate for rendering
        y: pos.y,
        screenX: e.clientX - wrapperRect.left,   // wrapper-relative for textarea CSS
        screenY: e.clientY - wrapperRect.top,
        value: '',
        fontSize,
      });
      return;
    }

    if (activeTool === 'step') {
      onAddAnnotation({
        id: crypto.randomUUID(),
        type: 'step',
        x: pos.x,
        y: pos.y,
        color,
        stepNumber: stepCounter,
      });
      return;
    }

    setIsDrawing(true);
    setStartPos(pos);
    if (activeTool === 'pen') {
      setCurrentPoints([pos]);
    }
  }, [activeTool, color, stepCounter, getCanvasPos, onAddAnnotation]);

  const handleMouseMove = useCallback((e) => {
    if (!isDrawing) return;
    const pos = getCanvasPos(e);

    if (activeTool === 'pen') {
      const pts = [...currentPoints, pos];
      setCurrentPoints(pts);
      setPreviewAnnotation({ type: 'pen', points: pts, color, lineWidth });
      return;
    }

    const preview = buildPreviewAnnotation(activeTool, startPos, pos, { color, lineWidth, opacity, filled });
    setPreviewAnnotation(preview);
  }, [isDrawing, activeTool, startPos, currentPoints, color, lineWidth, opacity, filled, getCanvasPos]);

  const handleMouseUp = useCallback((e) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const pos = getCanvasPos(e);
    setPreviewAnnotation(null);

    if (activeTool === 'pen') {
      if (currentPoints.length > 1) {
        onAddAnnotation({ id: crypto.randomUUID(), type: 'pen', points: currentPoints, color, lineWidth });
      }
      setCurrentPoints([]);
      return;
    }

    const dx = Math.abs(pos.x - startPos.x);
    const dy = Math.abs(pos.y - startPos.y);
    if (dx < 2 && dy < 2 && !['pixelate', 'blur', 'redact'].includes(activeTool)) return;

    // Cleaner tools — paint directly onto base canvas, then signal a re-composite
    if (['pixelate', 'blur', 'redact'].includes(activeTool)) {
      const base = baseCanvasRef.current;
      const ctx = base.getContext('2d');
      if (activeTool === 'pixelate') pixelateRegion(ctx, startPos.x, startPos.y, pos.x, pos.y, blurStrength);
      else if (activeTool === 'blur')    blurRegion(ctx, startPos.x, startPos.y, pos.x, pos.y, blurStrength);
      else if (activeTool === 'redact')  redactRegion(ctx, startPos.x, startPos.y, pos.x, pos.y, color);
      // _noop triggers composite update effect
      onAddAnnotation({ id: crypto.randomUUID(), type: '_noop' });
      return;
    }

    const ann = buildFinalAnnotation(activeTool, startPos, pos, { color, lineWidth, opacity, filled });
    if (ann) onAddAnnotation(ann);
  }, [isDrawing, activeTool, startPos, currentPoints, color, lineWidth, opacity, filled, blurStrength, getCanvasPos, onAddAnnotation]);

  // Text commit — called explicitly by keyboard only (never onBlur)
  const commitText = useCallback(() => {
    if (!textInput) return;
    const trimmed = textInput.value.trim();
    if (trimmed) {
      onAddAnnotation({
        id: crypto.randomUUID(),
        type: 'text',
        x: textInput.x,
        y: textInput.y,
        text: trimmed,
        color,
        fontSize: textInput.fontSize,
      });
    }
    setTextInput(null);
  }, [textInput, color, onAddAnnotation]);

  const cancelText = useCallback(() => setTextInput(null), []);

  // Zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z * delta)));
  }, []);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    wrapper.addEventListener('wheel', handleWheel, { passive: false });
    return () => wrapper.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const zoomIn  = () => setZoom(z => Math.min(MAX_ZOOM, z * 1.25));
  const zoomOut = () => setZoom(z => Math.max(MIN_ZOOM, z * 0.8));
  const zoomFit = () => {
    if (!wrapperRef.current || !canvasSize.width) return;
    const { clientWidth, clientHeight } = wrapperRef.current;
    const scale = Math.min(
      (clientWidth - 80) / canvasSize.width,
      (clientHeight - 80) / canvasSize.height,
      1
    );
    setZoom(Math.max(0.2, scale));
  };

  // Container style — only the div uses canvasSize, NOT the canvas elements
  const contStyle = canvasSize.width ? {
    width: canvasSize.width,
    height: canvasSize.height,
    transform: `scale(${zoom})`,
    transition: 'transform 0.1s ease',
  } : { display: 'none' };

  return (
    <div className="canvas-wrapper" ref={wrapperRef}>
      <div className="canvas-bg-grid" />

      {image ? (
        <>
          <div className="canvas-container" style={contStyle}>
            {/* ⚠️ NO width/height JSX props on any canvas — refs control them imperatively */}
            <canvas ref={baseCanvasRef}       className="canvas-base" />
            <canvas
              ref={annotationCanvasRef}
              className="canvas-annotations"
              data-tool={activeTool}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              id="annotation-canvas"
            />
            {/* Hidden composite for export */}
            <canvas ref={compositeCanvasRef} style={{ display: 'none' }} />
          </div>

          {/* ── Text input overlay ──────────────────────────────────────────
               IMPORTANT: Rendered as sibling of canvas-container, NOT inside it.
               This keeps it outside the CSS transform:scale() so position and
               font-size are always 1:1 with the user's cursor. ──────────── */}
          {textInput && (
            <textarea
              ref={textareaRef}
              className="text-input-overlay"
              autoFocus
              value={textInput.value}
              style={{
                position: 'absolute',
                left: textInput.screenX,
                top: textInput.screenY,
                fontSize: `${textInput.fontSize}px`,
                color,
                zIndex: 50,
              }}
              onChange={(e) => setTextInput(t => ({ ...t, value: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitText(); }
                if (e.key === 'Escape') { e.preventDefault(); cancelText(); }
              }}
              placeholder="Type… Enter to confirm, Esc to cancel"
              id="text-input-overlay"
            />
          )}

          {/* Zoom Controls */}
          <div className="zoom-controls" id="zoom-controls">
            <button className="zoom-btn" onClick={zoomOut} id="zoom-out" aria-label="Zoom out" title="Zoom out">−</button>
            <span className="zoom-value">{Math.round(zoom * 100)}%</span>
            <button className="zoom-btn" onClick={zoomIn}  id="zoom-in"  aria-label="Zoom in"  title="Zoom in">+</button>
            <button className="zoom-btn" onClick={zoomFit} id="zoom-fit" aria-label="Fit to screen" title="Fit to screen" style={{ fontSize: 11, fontWeight: 700 }}>FIT</button>
          </div>
        </>
      ) : null}
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function buildPreviewAnnotation(tool, start, end, opts) {
  const base = { id: '__preview__', color: opts.color, lineWidth: opts.lineWidth, opacity: opts.opacity, filled: opts.filled };
  switch (tool) {
    case 'arrow':     return { ...base, type: 'arrow',     x1: start.x, y1: start.y, x2: end.x, y2: end.y };
    case 'rect':      return { ...base, type: 'rect',      x1: start.x, y1: start.y, x2: end.x, y2: end.y };
    case 'ellipse':   return { ...base, type: 'ellipse',   x1: start.x, y1: start.y, x2: end.x, y2: end.y };
    case 'line':      return { ...base, type: 'line',      x1: start.x, y1: start.y, x2: end.x, y2: end.y };
    case 'highlight': return { ...base, type: 'highlight', x1: start.x, y1: start.y, x2: end.x, y2: end.y };
    case 'pixelate':
    case 'redact':
    case 'blur':
      return { ...base, type: 'rect', opacity: 0.3, filled: true, x1: start.x, y1: start.y, x2: end.x, y2: end.y };
    default: return null;
  }
}

function buildFinalAnnotation(tool, start, end, opts) {
  const id = crypto.randomUUID();
  switch (tool) {
    case 'arrow':     return { id, type: 'arrow',     x1: start.x, y1: start.y, x2: end.x, y2: end.y, color: opts.color, lineWidth: opts.lineWidth };
    case 'rect':      return { id, type: 'rect',      x1: start.x, y1: start.y, x2: end.x, y2: end.y, color: opts.color, lineWidth: opts.lineWidth, filled: opts.filled, opacity: opts.opacity };
    case 'ellipse':   return { id, type: 'ellipse',   x1: start.x, y1: start.y, x2: end.x, y2: end.y, color: opts.color, lineWidth: opts.lineWidth, filled: opts.filled, opacity: opts.opacity };
    case 'line':      return { id, type: 'line',      x1: start.x, y1: start.y, x2: end.x, y2: end.y, color: opts.color, lineWidth: opts.lineWidth };
    case 'highlight': return { id, type: 'highlight', x1: start.x, y1: start.y, x2: end.x, y2: end.y, color: opts.color, opacity: opts.opacity };
    default: return null;
  }
}
