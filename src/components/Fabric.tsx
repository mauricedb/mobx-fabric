import React, { useEffect } from 'react';
import { fabric } from 'fabric';
import { autorun, toJS } from 'mobx';

import classes from './Fabric.module.css';
import { canvasState } from '../state/canvasState';
import { IsObjectWithId } from '../utils/id';
import { isObject } from 'mobx/dist/internal';

interface SelectionEvent extends fabric.IEvent {
  selected?: fabric.Object[];
  deselected?: fabric.Object[];
}

const connectToState = (target: fabric.Object) => {
  autorun(() => {
    if (IsObjectWithId(target)) {
      const canvasObject = canvasState.canvasObjects.find(
        (c) => c.id === target.id
      );

      if (canvasObject) {
        console.log('Updating fabric.Object', toJS(canvasObject));

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

let isMouseDown = false;
let connectorLine: fabric.Line | null = null;

const getObjectIds = (objects: fabric.Object[] = []) => {
  const objectIds = objects
    .map((o) => {
      if (IsObjectWithId(o)) {
        return o.id;
      }
      return null;
    })
    .filter((o) => o) as number[];

  return objectIds;
};

export const Fabric: React.FC = () => {
  console.log('Rendering Fabric');

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const clientRect = canvasRef.current.getClientRects()[0];
      const canvas = new fabric.Canvas(canvasRef.current, {
        backgroundColor: 'lightcyan',
        height: clientRect.height,
        width: clientRect.width,
      });

      // canvas.on('mouse:dblclick', (e) => {
      //   console.log(e);

      //   const l = new fabric.Line([0, 0, 200, 200], {
      //     stroke: 'red',
      //     // selectable: false,
      //     // evented: false,
      //   });
      //   l.left = e.pointer?.x;
      //   l.top = e.pointer?.y;

      //   canvas.add(l);
      // });

      canvas.on('mouse:down', (object) => {
        isMouseDown = true;

        var pointer = canvas.getPointer(object.e);
        var points = [pointer.x, pointer.y, pointer.x, pointer.y];

        var options = {
          // selectable: false,
          fill: 'black',
          stroke: 'black',
          strokeWidth: 2,
          originX: 'center',
          originY: 'center',
        };

        connectorLine = new fabric.Line(points, options);
        canvas.add(connectorLine);
      });

      canvas.on('mouse:move', (object) => {
        if (isMouseDown && connectorLine) {
          var pointer = canvas.getPointer(object.e);
          connectorLine.set({ x2: pointer.x, y2: pointer.y });
          canvas.requestRenderAll();

          // connectorLine.oCoords.
        }
      });

      canvas.on('mouse:up', () => {
        isMouseDown = false;
      });

      canvas.on('object:modified', ({ target }) => {
        if (IsObjectWithId(target)) {
          const objectState = canvasState.canvasObjects.find(
            (o) => o.id === target.id
          );

          objectState?.copyStateFromFabricObject(target);
        }
      });

      canvas.on('selection:cleared', (e: SelectionEvent) => {
        const deselectedIds = getObjectIds(e.deselected);
        canvasState.updateSelection([], deselectedIds);
      });

      canvas.on('selection:updated', (e: SelectionEvent) => {
        const selectedIds = getObjectIds(e.selected);
        const deselectedIds = getObjectIds(e.deselected);
        canvasState.updateSelection(selectedIds, deselectedIds);
      });

      canvas.on('selection:created', (e: SelectionEvent) => {
        const selectedIds = getObjectIds(e.selected);
        canvasState.updateSelection(selectedIds, []);
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
