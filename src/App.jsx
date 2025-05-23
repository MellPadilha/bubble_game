import { useEffect, useRef } from 'react';
import p5 from 'p5';
import { createSketch } from './sketch';

export default function App() {
  const sketchRef = useRef();

  useEffect(() => {
    const myP5 = new p5(createSketch, sketchRef.current);

    return () => {
      myP5.remove();
    };
  }, []);

  return <div ref={sketchRef} id="sketch-container" />;
}
