import './Header.css';

export default function Header({
  fileName,
  canUndo, canRedo,
  onUndo, onRedo,
  onClear,
  onNewImage,
  onExport,
  annotationCount,
}) {
  return (
    <header className="header" id="app-header">
      {/* Brand */}
      <div className="header-brand">
        <div className="header-logo">🖊️</div>
        <div>
          <div className="header-title">ScreenMark</div>
          <div className="header-subtitle">Annotator &amp; Cleaner</div>
        </div>
      </div>

      {/* Center — filename + annotation count */}
      <div className="header-center">
        {fileName && (
          <div className="header-filename" title={fileName}>
            <span className="dot" />
            {fileName}
          </div>
        )}
        {annotationCount > 0 && (
          <span className="shortcut-chip">{annotationCount} annotation{annotationCount !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Right actions */}
      <div className="header-right">
        {/* Undo / Redo */}
        <div className="header-action-group">
          <button
            className="header-action-btn"
            onClick={onUndo}
            disabled={!canUndo}
            id="btn-undo"
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            ↩
          </button>
          <button
            className="header-action-btn"
            onClick={onRedo}
            disabled={!canRedo}
            id="btn-redo"
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
          >
            ↪
          </button>
        </div>

        <button
          className="btn btn-ghost"
          onClick={onClear}
          id="btn-clear"
          style={{ fontSize: 12 }}
        >
          🗑 Clear
        </button>

        <button
          className="btn btn-ghost"
          onClick={onNewImage}
          id="btn-new-image"
          style={{ fontSize: 12 }}
        >
          📁 Open
        </button>

        <button
          className="btn btn-primary"
          onClick={onExport}
          id="btn-export"
          style={{ fontSize: 12 }}
        >
          📤 Export
        </button>
      </div>
    </header>
  );
}
