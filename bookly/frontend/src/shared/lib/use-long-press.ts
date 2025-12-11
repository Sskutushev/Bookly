// frontend/src/shared/lib/use-long-press.ts

import { useRef, useCallback } from 'react';

interface LongPressOptions {
  threshold?: number;
  onStart?: () => void;
  onFinish?: () => void;
  onCancel?: () => void;
}

export const useLongPress = (
  callback: (e: React.MouseEvent | React.TouchEvent) => void,
  options: LongPressOptions = {}
) => {
  const { threshold = 500, onStart, onFinish, onCancel } = options;
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  const start = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (onStart) onStart();
      
      isLongPressRef.current = false;
      
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        callback(e);
        if (onFinish) onFinish();
      }, threshold);
    },
    [callback, threshold, onStart, onFinish]
  );

  const stop = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      if (!isLongPressRef.current) {
        if (onCancel) onCancel();
      }

      isLongPressRef.current = false;
    },
    [onCancel]
  );

  return {
    onMouseDown: (e: React.MouseEvent) => start(e),
    onMouseUp: (e: React.MouseEvent) => stop(e),
    onMouseLeave: (e: React.MouseEvent) => stop(e),
    onTouchStart: (e: React.TouchEvent) => start(e),
    onTouchEnd: (e: React.TouchEvent) => stop(e),
    onTouchCancel: (e: React.TouchEvent) => stop(e),
  };
};