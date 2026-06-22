/**
 * useAnnotations.js — Annotations state management with undo/redo
 */

import { useState, useCallback } from 'react';

const MAX_HISTORY = 80;

export function useAnnotations() {
  const [history, setHistory] = useState([[]]); // stack of annotation snapshots
  const [historyIndex, setHistoryIndex] = useState(0);
  const [stepCounter, setStepCounter] = useState(1);

  const annotations = history[historyIndex];

  const pushHistory = useCallback((newAnnotations) => {
    setHistory(prev => {
      const sliced = prev.slice(0, historyIndex + 1);
      const next = [...sliced, newAnnotations].slice(-MAX_HISTORY);
      return next;
    });
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [historyIndex]);

  const addAnnotation = useCallback((annotation) => {
    const newAnnotations = [...annotations, annotation];
    pushHistory(newAnnotations);
    if (annotation.type === 'step') {
      setStepCounter(prev => prev + 1);
    }
  }, [annotations, pushHistory]);

  const updateAnnotation = useCallback((id, updates) => {
    const newAnnotations = annotations.map(a => a.id === id ? { ...a, ...updates } : a);
    pushHistory(newAnnotations);
  }, [annotations, pushHistory]);

  const deleteAnnotation = useCallback((id) => {
    const newAnnotations = annotations.filter(a => a.id !== id);
    pushHistory(newAnnotations);
  }, [annotations, pushHistory]);

  const clearAll = useCallback(() => {
    pushHistory([]);
    setStepCounter(1);
  }, [pushHistory]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
    }
  }, [historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
    }
  }, [historyIndex, history.length]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
    annotations,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    clearAll,
    undo,
    redo,
    canUndo,
    canRedo,
    stepCounter,
  };
}
