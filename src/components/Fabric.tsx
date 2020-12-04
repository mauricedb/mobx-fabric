import React, { useEffect } from 'react';
import { fabric } from 'fabric';
import { changeDependenciesStateTo0 } from 'mobx/dist/internal';

// fabric.Canvas
export const Fabric: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: 'lightblue',
      isDrawingMode: true,
      height: window.innerHeight,
      width: window.innerWidth,
    });

    canvas.on('object:added', (e) => {
      e.target?.animate(
        { angle: 45, top: '+=100' },
        {
          onChange: () => canvas.requestRenderAll(),
        }
      );

      canvas.isDrawingMode = false;
    });
  }, []);

  return <canvas ref={canvasRef} />;
};
