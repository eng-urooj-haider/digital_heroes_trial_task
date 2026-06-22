import './Toolbar.css';

const ANNOTATION_TOOLS = [
  { id: 'pen',       emoji: '✏️', label: 'Pen',      tooltip: 'Freehand Draw (P)' },
  { id: 'arrow',     emoji: '➡️', label: 'Arrow',    tooltip: 'Arrow (A)' },
  { id: 'rect',      emoji: '▭',  label: 'Rect',     tooltip: 'Rectangle (R)' },
  { id: 'ellipse',   emoji: '⭕', label: 'Circle',   tooltip: 'Ellipse (E)' },
  { id: 'line',      emoji: '╱',  label: 'Line',     tooltip: 'Line (L)' },
  { id: 'highlight', emoji: '🟡', label: 'Highlight', tooltip: 'Highlight (H)' },
  { id: 'text',      emoji: '🅣',  label: 'Text',     tooltip: 'Text Label (T)' },
  { id: 'step',      emoji: '🔢', label: 'Step',     tooltip: 'Step Marker (S)' },
];

const CLEANER_TOOLS = [
  { id: 'pixelate', emoji: '🔳', label: 'Blur',    tooltip: 'Pixelate Region (B)' },
  { id: 'redact',   emoji: '⬛', label: 'Redact',  tooltip: 'Black Redact (X)' },
  { id: 'blur',     emoji: '🌫️', label: 'Soft Blur', tooltip: 'Soft Blur (F)' },
];

const KEY_MAP = {
  p: 'pen', a: 'arrow', r: 'rect', e: 'ellipse',
  l: 'line', h: 'highlight', t: 'text', s: 'step',
  b: 'pixelate', x: 'redact', f: 'blur',
};

export default function Toolbar({ activeTool, onToolChange, activeColor }) {
  return (
    <aside className="toolbar" id="toolbar">
      <span className="toolbar-section-label">Annotate</span>
      {ANNOTATION_TOOLS.map((tool) => (
        <button
          key={tool.id}
          id={`tool-${tool.id}`}
          className={`tool-btn ${activeTool === tool.id ? 'active' : ''}`}
          onClick={() => onToolChange(tool.id)}
          data-tooltip={tool.tooltip}
          aria-label={tool.tooltip}
          aria-pressed={activeTool === tool.id}
        >
          <span className="tool-emoji">{tool.emoji}</span>
          <span className="tool-label">{tool.label}</span>
          {activeTool === tool.id && (
            <span
              className="tool-color-dot"
              style={{ background: activeColor }}
            />
          )}
        </button>
      ))}

      <div className="toolbar-divider" />
      <span className="toolbar-section-label">Clean</span>

      {CLEANER_TOOLS.map((tool) => (
        <button
          key={tool.id}
          id={`tool-${tool.id}`}
          className={`tool-btn ${activeTool === tool.id ? 'active' : ''}`}
          onClick={() => onToolChange(tool.id)}
          data-tooltip={tool.tooltip}
          aria-label={tool.tooltip}
          aria-pressed={activeTool === tool.id}
        >
          <span className="tool-emoji">{tool.emoji}</span>
          <span className="tool-label">{tool.label}</span>
        </button>
      ))}
    </aside>
  );
}

export { KEY_MAP };
