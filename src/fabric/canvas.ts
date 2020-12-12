import { fabric } from 'fabric';
import { autorun } from 'mobx';

import { canvasState } from '../state/canvasState';
import { IsObjectWithId } from '../utils/id';
import { createConnector } from '../fabric/connector';
import { createCanvasObject } from '../fabric/canvasObject';

interface SelectionEvent extends fabric.IEvent {
  selected?: fabric.Object[];
  deselected?: fabric.Object[];
}

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

const initializeCanvasToState = (canvas: fabric.Canvas) => {
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
};

const initializeStateToCanvas = (canvas: fabric.Canvas) => {
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
      createCanvasObject(state, canvas);
    });
  });

  autorun(() => {
    console.log('Checking canvasState.connections');

    const currentObjectIds = getObjectIds(canvas.getObjects());
    const newObjects = canvasState.connections.filter(
      (o) => !currentObjectIds.includes(o.id)
    );

    newObjects.forEach((state) => {
      const connectorLine = createConnector(state);
      canvas.add(connectorLine);
    });
  });
};

export const initialize = (canvas: fabric.Canvas) => {
  initializeCanvasToState(canvas);
  initializeStateToCanvas(canvas);
};
