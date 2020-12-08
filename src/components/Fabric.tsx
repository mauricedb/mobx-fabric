import React, { useEffect } from 'react';
import { fabric } from 'fabric';
import { autorun } from 'mobx';

import classes from './Fabric.module.css';
import { canvasState } from '../state/canvasState';
import { IsObjectWithId } from '../utils/id';

const connectToState = (target: fabric.Object) => {
  autorun(() => {
    if (IsObjectWithId(target)) {
      const canvasObject = canvasState.canvasObjects.find(
        (c) => c.id === target.id
      );

      if (canvasObject) {
        console.log('canvasObject updating', canvasObject.id);

        target.animate(
          {
            angle: canvasObject.angle ?? 0,
            fill: (canvasObject.fill as string) ?? 'black',
            height: canvasObject.height ?? 0,
            left: canvasObject.left ?? 0,
            radius: canvasObject.radius ?? 0,
            top: canvasObject.top ?? 0,
            width: canvasObject.width ?? 0,
          },
          {
            onChange: () => target.canvas?.requestRenderAll(),
          }
        );
      }
    }
  });
};

export const Fabric: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const clientRect = canvasRef.current.getClientRects()[0];
      const canvas = new fabric.Canvas(canvasRef.current, {
        backgroundColor: 'lightcyan',
        height: clientRect.height,
        width: clientRect.width,
      });

      canvas.on('object:modified', ({ target }) => {
        if (IsObjectWithId(target)) {
          const objectState = canvasState.canvasObjects.find(
            (o) => o.id === target.id
          );

          objectState?.copyStateFromFabricObject(target);
        }
      });

      autorun(() => {
        canvas.isDrawingMode = canvasState.isDrawingMode;
      });

      autorun(() => {
        const canvasIds = canvas.getObjects().map((o) => {
          if (IsObjectWithId(o)) {
            return o.id;
          }
          return undefined;
        });

        const newCanvasObjects = canvasState.canvasObjects.filter(
          (c) => !canvasIds.includes(c.id)
        );

        newCanvasObjects.forEach((element) => {
          if (element.klass) {
            const klass = fabric.util.getKlass(element.klass, '');
            klass.fromObject(
              {
                id: element.id,
              },
              (newObject: any) => {
                connectToState(newObject);
                canvas.add(newObject);
              }
            );
          }
        });
      });
    }
  }, []);

  return <canvas className={classes.fabric} ref={canvasRef} />;
};
