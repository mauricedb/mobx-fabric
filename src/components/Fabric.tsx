import React, { useEffect } from 'react';
import { fabric } from 'fabric';
import { autorun, toJS } from 'mobx';

import classes from './Fabric.module.css';
import {
  CanvasObjectState,
  canvasState,
  Connection,
} from '../state/canvasState';
import { IsObjectWithId } from '../utils/id';

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

const centerOfObject = (from: CanvasObjectState): fabric.Point => {
  return new fabric.Point(
    (from.left ?? 0) + (from.width ?? 0) / 2,
    (from.top ?? 0) + (from.height ?? 0) / 2
  );
};

const connectConnectorToState = (target: fabric.Line, state: Connection) => {
  autorun(() => {
    console.log('Updating fabric.Line', toJS(state));
    const { from, to } = state;
    const fromPos = centerOfObject(from);
    const toPos = centerOfObject(to);
    target.set({
      x1: fromPos.x,
      y1: fromPos.y,
      x2: toPos.x,
      y2: toPos.y,
    });
    target.canvas?.requestRenderAll();
  });
};

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
        console.log('Checking canvasState.isDrawingMode');

        canvas.isDrawingMode = canvasState.isDrawingMode;
      });

      autorun(() => {
        console.log('Checking canvasState.canvasObjects');

        const currentObjectIds = getObjectIds(canvas.getObjects());
        const newObjects = canvasState.canvasObjects.filter(
          (o) => !currentObjectIds.includes(o.id)
        );

        newObjects.forEach((state) => {
          console.log('New Object:', state.id, state.klass);

          if (state.klass) {
            const klass = fabric.util.getKlass(state.klass, '');
            klass.fromObject(
              {
                id: state.id,
              },
              (newObject: any) => {
                connectToState(newObject);
                canvas.add(newObject);
              }
            );
          }
        });
      });

      autorun(() => {
        console.log('Checking canvasState.connections');

        const currentObjectIds = getObjectIds(canvas.getObjects());
        const newObjects = canvasState.connections.filter(
          (o) => !currentObjectIds.includes(o.id)
        );

        newObjects.forEach((state) => {
          console.log('New Connector:', state.id);

          var options = {
            id: state.id,
            selectable: false,
            fill: 'black',
            stroke: 'black',
            strokeWidth: 2,
            originX: 'center',
            originY: 'center',
          };

          const connectorLine = new fabric.Line(undefined, options);
          canvas.add(connectorLine);

          connectConnectorToState(connectorLine, state);
        });
      });
    }
  }, []);

  return <canvas className={classes.fabric} ref={canvasRef} />;
};
