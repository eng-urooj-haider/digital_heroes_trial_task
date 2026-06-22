import { useState, useCallback, useRef } from 'react';
import './DropZone.css';

export default function DropZone({ onImageLoaded }) {
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    onImageLoaded(url, file);
  }, [onImageLoaded]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragging(false);
  }, []);

  const handleClick = () => fileInputRef.current?.click();

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  return (
    <div className="dropzone-overlay">
      <div
        className={`dropzone-card ${dragging ? 'dragging' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        id="dropzone-main"
      >
        <div className="dropzone-icon-wrapper">
          <span className="dropzone-icon">🖼️</span>
        </div>

        <div className="dropzone-content">
          <h1 className="dropzone-title">ScreenMark</h1>
          <p className="dropzone-subtitle">
            Drop your screenshot here, click to browse,<br />
            or press <strong>Ctrl+V</strong> to paste from clipboard
          </p>
        </div>

        <div className="dropzone-divider">
          <span>Features</span>
        </div>

        <div className="dropzone-actions">
          <div className="dropzone-badge">✏️ Annotate</div>
          <div className="dropzone-badge">🔳 Blur &amp; Redact</div>
          <div className="dropzone-badge">📤 Export</div>
          <div className="dropzone-badge">🔢 Step Markers</div>
        </div>

        <div className="dropzone-formats">
          <span className="format-tag">PNG</span>
          <span className="format-tag">JPEG</span>
          <span className="format-tag">WebP</span>
          <span className="format-tag">GIF</span>
          <span className="format-tag">BMP</span>
        </div>

        <a
          href="https://digitalheroesco.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="dropzone-digital-heroes-btn btn btn-primary"
          onClick={(e) => e.stopPropagation()}
          id="digital-heroes-link"
        >
          Built for Digital Heroes
        </a>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          style={{ display: 'none' }}
          id="file-input"
        />
      </div>
    </div>
  );
}
