/**
 * useClipboard.js — Paste image from clipboard
 */

import { useEffect } from 'react';

export function useClipboardPaste(onImagePasted) {
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            const url = URL.createObjectURL(file);
            onImagePasted(url, file);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onImagePasted]);
}
