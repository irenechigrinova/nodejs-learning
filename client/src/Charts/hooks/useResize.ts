import { useEffect, useRef, useState, useCallback } from 'react';
import usePrevious from 'hooks/usePrevious';
import useDeepPropsUpdate from 'hooks/useDeepPropsUpdate';

const DELTA = 400;

function useResize(values?: { [key: string]: string | number }): boolean[] {
  const resizeTime = useRef<number>(0);
  const resizeTimeout = useRef<number>();
  const [isResizing, setIsResizing] = useState<boolean>(false);

  const prevValues = usePrevious(values);

  const resizeEnd = useCallback(() => {
    if (resizeTime.current && new Date().getTime() - resizeTime.current < DELTA) {
      resizeTimeout.current = window.setTimeout(resizeEnd, DELTA);
    } else {
      setIsResizing(false);
    }
  }, []);

  const handleResize = useCallback(() => {
    resizeTime.current = new Date().getTime();
    if (!isResizing) {
      clearTimeout(resizeTimeout.current);
      setIsResizing(true);
      resizeTimeout.current = window.setTimeout(resizeEnd, DELTA);
    }
  }, [isResizing, resizeEnd]);

  useDeepPropsUpdate(() => {
    if (values && prevValues) {
      const valuesHaveChanged = Object.keys(values).some(key => prevValues[key] !== values[key]);
      if (valuesHaveChanged) {
        handleResize();
      }
    }
  }, [values, prevValues, handleResize]);

  useEffect(() => {
    window.addEventListener('resize', handleResize, false);

    return () => {
      window.removeEventListener('resize', handleResize, false);
    };
  }, [handleResize]);

  return [isResizing];
}

export default useResize;
