/* 
Hook to return variables related to screen width and height.
The below code was taken from the following article
https://stackoverflow.com/questions/36862334/get-viewport-window-height-in-reactjs
*/

import { useState, useEffect } from 'react';

export default function useWindowDimensions() {

  const hasWindow = typeof window !== 'undefined';

  function getWindowDimensions() {
    const width = hasWindow ? window.innerWidth : null;
    const height = hasWindow ? window.innerHeight : null;
    const mobile = width < 576
    const largeScreen = width >= 992
    return {
      width,
      height,
      mobile,
      largeScreen
    };
  }

  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    if (hasWindow) {
      function handleResize() {
        setWindowDimensions(getWindowDimensions());
      }

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [hasWindow]);

  return windowDimensions;
}