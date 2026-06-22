import { useState, useEffect } from 'react';
import './ExportPanel.css';
import { exportCanvasToFile, copyCanvasToClipboard, getCanvasDataUrl } from '../../utils/exportCanvas';

const FORMATS = [
  { id: 'png',  name: 'PNG',  desc: 'Lossless, transparent' },
  { id: 'jpeg', name: 'JPEG', desc: 'Smaller file size' },
];

export default function ExportPanel({ canvasRef, onClose }) {
  const [format, setFormat] = useState('png');
  const [quality, setQuality] = useState(92);
  const [previewUrl, setPreviewUrl] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (!canvasRef?.current) return;
    const url = getCanvasDataUrl(canvasRef.current, format, quality / 100);
    setPreviewUrl(url);
  }, [format, quality, canvasRef]);

  const handleDownload = () => {
    if (!canvasRef?.current) return;
    exportCanvasToFile(canvasRef.current, format, quality / 100);
    onClose();
  };

  const handleCopy = async () => {
    if (!canvasRef?.current) return;
    try {
      await copyCanvasToClipboard(canvasRef.current);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2200);
      onClose();
    } catch {
      alert('Copy to clipboard failed. Try downloading instead.');
    }
  };

  const qPct = ((quality - 10) / 90) * 100;

  return (
    <>
      <div className="export-overlay" onClick={onClose} id="export-overlay">
        <div
          className="export-modal"
          onClick={e => e.stopPropagation()}
          id="export-modal"
        >
          <div className="export-modal-header">
            <div className="export-modal-title">📤 Export Image</div>
            <button className="export-close-btn" onClick={onClose} id="export-close" aria-label="Close export">✕</button>
          </div>

          {/* Format */}
          <div className="export-section-label">Format</div>
          <div className="export-format-grid">
            {FORMATS.map(f => (
              <button
                key={f.id}
                id={`export-format-${f.id}`}
                className={`export-format-btn ${format === f.id ? 'selected' : ''}`}
                onClick={() => setFormat(f.id)}
              >
                <div className="export-format-name">{f.name}</div>
                <div className="export-format-desc">{f.desc}</div>
              </button>
            ))}
          </div>

          {/* Quality (JPEG only) */}
          {format === 'jpeg' && (
            <>
              <div className="export-section-label" style={{ marginTop: 4 }}>Quality</div>
              <div className="export-quality-row">
                <span className="export-quality-label">Quality</span>
                <span className="export-quality-value">{quality}%</span>
              </div>
              <input
                type="range"
                className="slider"
                min="10" max="100"
                value={quality}
                onChange={e => setQuality(Number(e.target.value))}
                style={{ '--pct': `${qPct}%`, width: '100%', marginBottom: 16 }}
                id="slider-quality"
                aria-label="Export quality"
              />
            </>
          )}

          {/* Preview */}
          <div className="export-section-label">Preview</div>
          <div className="export-preview">
            {previewUrl && <img src={previewUrl} alt="Export preview" />}
          </div>

          {/* Actions */}
          <div className="export-actions">
            <button className="btn btn-ghost" onClick={handleCopy} id="export-copy-btn">
              📋 Copy
            </button>
            <button className="btn btn-primary" onClick={handleDownload} id="export-download-btn">
              ⬇ Download {format.toUpperCase()}
            </button>
          </div>
        </div>
      </div>

      {copySuccess && (
        <div className="copy-success-badge">✅ Copied to clipboard!</div>
      )}
    </>
  );
}
