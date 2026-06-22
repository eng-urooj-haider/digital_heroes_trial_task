import { useRef } from 'react';
import './OptionsPanel.css';

const PRESET_COLORS = [
  '#f87171', '#fb923c', '#fbbf24', '#a3e635',
  '#34d399', '#22d3ee', '#60a5fa', '#a78bfa',
  '#f472b6', '#ffffff', '#94a3b8', '#1e293b',
];

const TOOL_INFO = {
  pen:       { name: 'Freehand Pen', emoji: '✏️', key: 'P', desc: 'Draw freely on the image' },
  arrow:     { name: 'Arrow',        emoji: '➡️', key: 'A', desc: 'Draw directional arrows' },
  rect:      { name: 'Rectangle',   emoji: '▭',  key: 'R', desc: 'Draw rectangles or boxes' },
  ellipse:   { name: 'Ellipse',     emoji: '⭕', key: 'E', desc: 'Draw circles and ellipses' },
  line:      { name: 'Line',        emoji: '╱',  key: 'L', desc: 'Draw straight lines' },
  highlight: { name: 'Highlight',   emoji: '🟡', key: 'H', desc: 'Highlight regions' },
  text:      { name: 'Text Label',  emoji: '🅣',  key: 'T', desc: 'Add text annotations' },
  step:      { name: 'Step Marker', emoji: '🔢', key: 'S', desc: 'Numbered step markers' },
  pixelate:  { name: 'Pixelate',    emoji: '🔳', key: 'B', desc: 'Pixelate sensitive regions' },
  redact:    { name: 'Redact',      emoji: '⬛', key: 'X', desc: 'Black-box redaction' },
  blur:      { name: 'Soft Blur',   emoji: '🌫️', key: 'F', desc: 'Apply soft blur to region' },
};

export default function OptionsPanel({
  activeTool,
  color, onColorChange,
  lineWidth, onLineWidthChange,
  fontSize, onFontSizeChange,
  opacity, onOpacityChange,
  filled, onFilledChange,
  blurStrength, onBlurStrengthChange,
}) {
  const colorInputRef = useRef(null);

  const toolInfo = TOOL_INFO[activeTool];
  const isCleanerTool = ['pixelate', 'redact', 'blur'].includes(activeTool);
  const isShapeTool = ['rect', 'ellipse'].includes(activeTool);
  const isHighlight = activeTool === 'highlight';
  const isText = activeTool === 'text';

  const lwPct = ((lineWidth - 1) / 29) * 100;
  const opPct = (opacity * 100);

  return (
    <aside className="options-panel" id="options-panel">
      {/* Tool Info */}
      {toolInfo && (
        <div className="tool-info">
          <div className="tool-info-name">
            <span>{toolInfo.emoji}</span>
            <span>{toolInfo.name}</span>
          </div>
          <div className="tool-info-shortcut">
            {toolInfo.desc} · Press <strong>{toolInfo.key}</strong>
          </div>
        </div>
      )}

      {/* Color — only for annotation tools */}
      {!isCleanerTool && (
        <div className="options-section">
          <div className="options-section-title">Color</div>
          <div className="color-grid">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                id={`color-${c.replace('#', '')}`}
                className={`color-swatch ${color === c ? 'selected' : ''}`}
                style={{ background: c }}
                onClick={() => onColorChange(c)}
                aria-label={`Color ${c}`}
                title={c}
              />
            ))}
          </div>
          <div className="color-custom-row">
            <span className="color-custom-label">Custom color</span>
            <input
              ref={colorInputRef}
              type="color"
              className="color-input-native"
              value={color}
              onChange={(e) => onColorChange(e.target.value)}
              id="color-picker-custom"
              aria-label="Custom color picker"
            />
          </div>
        </div>
      )}

      {/* Line Width — for non-text, non-highlight tools */}
      {!isText && !isHighlight && !isCleanerTool && (
        <div className="options-section">
          <div className="options-section-title">Stroke Width</div>
          <div className="option-row">
            <span className="option-label">Width</span>
            <span className="option-value">{lineWidth}px</span>
          </div>
          <input
            type="range"
            className="slider"
            min="1" max="30"
            value={lineWidth}
            onChange={(e) => onLineWidthChange(Number(e.target.value))}
            style={{ '--pct': `${lwPct}%` }}
            id="slider-line-width"
            aria-label="Stroke width"
          />
        </div>
      )}

      {/* Font size for text */}
      {isText && (
        <div className="options-section">
          <div className="options-section-title">Text Size</div>
          <div className="font-size-row">
            <button onClick={() => onFontSizeChange(Math.max(10, fontSize - 2))} aria-label="Decrease font size">−</button>
            <span className="font-size-value">{fontSize}px</span>
            <button onClick={() => onFontSizeChange(Math.min(96, fontSize + 2))} aria-label="Increase font size">+</button>
          </div>
        </div>
      )}

      {/* Opacity for highlight and shapes */}
      {(isHighlight || isShapeTool) && (
        <div className="options-section">
          <div className="options-section-title">Opacity</div>
          <div className="opacity-preview">
            <div
              className="opacity-preview-inner"
              style={{ background: color, opacity }}
            />
          </div>
          <div className="option-row">
            <span className="option-label">Opacity</span>
            <span className="option-value">{Math.round(opacity * 100)}%</span>
          </div>
          <input
            type="range"
            className="slider"
            min="5" max="100"
            value={Math.round(opacity * 100)}
            onChange={(e) => onOpacityChange(Number(e.target.value) / 100)}
            style={{ '--pct': `${opPct}%` }}
            id="slider-opacity"
            aria-label="Opacity"
          />
        </div>
      )}

      {/* Fill style for shapes */}
      {isShapeTool && (
        <div className="options-section">
          <div className="options-section-title">Fill Style</div>
          <div className="toggle-row">
            <button
              className={`toggle-option ${!filled ? 'active' : ''}`}
              onClick={() => onFilledChange(false)}
              id="fill-outline"
            >
              Outline
            </button>
            <button
              className={`toggle-option ${filled ? 'active' : ''}`}
              onClick={() => onFilledChange(true)}
              id="fill-solid"
            >
              Solid
            </button>
          </div>
        </div>
      )}

      {/* Blur strength for cleaner tools */}
      {(activeTool === 'pixelate' || activeTool === 'blur') && (
        <div className="options-section">
          <div className="options-section-title">
            {activeTool === 'pixelate' ? 'Pixelation' : 'Blur'} Strength
          </div>
          <div className="option-row">
            <span className="option-label">Strength</span>
            <span className="option-value">{blurStrength}</span>
          </div>
          <input
            type="range"
            className="slider"
            min="4" max="40"
            value={blurStrength}
            onChange={(e) => onBlurStrengthChange(Number(e.target.value))}
            style={{ '--pct': `${((blurStrength - 4) / 36) * 100}%` }}
            id="slider-blur-strength"
            aria-label="Effect strength"
          />
        </div>
      )}

      {/* Redact color */}
      {activeTool === 'redact' && (
        <div className="options-section">
          <div className="options-section-title">Redact Color</div>
          <div className="toggle-row">
            {['#000000', '#1e293b', '#ffffff', '#ef4444'].map(c => (
              <button
                key={c}
                className={`color-swatch ${color === c ? 'selected' : ''}`}
                style={{ background: c, width: '100%', aspectRatio: '1', border: '2px solid transparent', borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s' }}
                onClick={() => onColorChange(c)}
                aria-label={`Redact color ${c}`}
              />
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
