import { useState, useCallback, useEffect, useRef } from 'react';
import './App.css';

import Header         from './components/Header/Header';
import Toolbar, { KEY_MAP } from './components/Toolbar/Toolbar';
import AnnotationCanvas from './components/Canvas/AnnotationCanvas';
import OptionsPanel   from './components/OptionsPanel/OptionsPanel';
import DropZone       from './components/DropZone/DropZone';
import ExportPanel    from './components/ExportPanel/ExportPanel';

import { useAnnotations } from './hooks/useAnnotations';
import { useClipboardPaste } from './hooks/useClipboard';

export default function App() {
  // Image state
  const [image, setImage]       = useState(null);
  const [fileName, setFileName] = useState('');

  // Tool state
  const [activeTool, setActiveTool] = useState('arrow');
  const [color, setColor]           = useState('#f87171');
  const [lineWidth, setLineWidth]   = useState(3);
  const [fontSize, setFontSize]     = useState(20);
  const [opacity, setOpacity]       = useState(0.85);
  const [filled, setFilled]         = useState(false);
  const [blurStrength, setBlurStrength] = useState(12);

  // UI state
  const [showExport, setShowExport] = useState(false);

  // Annotations
  const {
    annotations, addAnnotation, clearAll,
    undo, redo, canUndo, canRedo, stepCounter,
  } = useAnnotations();

  // Composite canvas ref (for export)
  const compositeCanvasRef = useRef(null);

  // File input ref (for header "Open" button)
  const fileInputRef = useRef(null);

  // Handle image loaded from DropZone or clipboard
  const handleImageLoaded = useCallback((url, file) => {
    setImage(url);
    setFileName(file?.name || 'pasted-image.png');
    clearAll();
  }, [clearAll]);

  // Clipboard paste
  useClipboardPaste(handleImageLoaded);

  // Annotation filter: strip _noop entries for count display
  const realAnnotations = annotations.filter(a => a.type !== '_noop');

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      // Ignore if typing in an input/textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') { e.preventDefault(); undo(); }
        if (e.key === 'y') { e.preventDefault(); redo(); }
        if (e.key === 's') { e.preventDefault(); setShowExport(true); }
        return;
      }

      const tool = KEY_MAP[e.key.toLowerCase()];
      if (tool) setActiveTool(tool);
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  // Open new image from header button
  const handleOpenFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      handleImageLoaded(url, file);
    };
    input.click();
  };

  // Return to drop zone
  const handleClear = () => {
    if (realAnnotations.length === 0) {
      setImage(null);
      setFileName('');
    }
    clearAll();
  };

  if (!image) {
    return <DropZone onImageLoaded={handleImageLoaded} />;
  }

  return (
    <div className="app-root">
      <Header
        fileName={fileName}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onClear={handleClear}
        onNewImage={handleOpenFile}
        onExport={() => setShowExport(true)}
        annotationCount={realAnnotations.length}
      />

      <div className="app-body">
        <Toolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          activeColor={color}
        />

        <AnnotationCanvas
          image={image}
          annotations={realAnnotations}
          activeTool={activeTool}
          color={color}
          lineWidth={lineWidth}
          fontSize={fontSize}
          opacity={opacity}
          filled={filled}
          blurStrength={blurStrength}
          stepCounter={stepCounter}
          onAddAnnotation={addAnnotation}
          canvasRef={compositeCanvasRef}
        />

        <OptionsPanel
          activeTool={activeTool}
          color={color}           onColorChange={setColor}
          lineWidth={lineWidth}   onLineWidthChange={setLineWidth}
          fontSize={fontSize}     onFontSizeChange={setFontSize}
          opacity={opacity}       onOpacityChange={setOpacity}
          filled={filled}         onFilledChange={setFilled}
          blurStrength={blurStrength} onBlurStrengthChange={setBlurStrength}
        />
      </div>

      {showExport && (
        <ExportPanel
          canvasRef={compositeCanvasRef}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}
