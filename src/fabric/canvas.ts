import { fabric } from 'fabric';
import { autorun, runInAction } from 'mobx';

import { CanvasObjectState, canvasState } from '../state/canvasState';
import { IsObjectWithId } from '../utils/id';
import { createConnector } from '../fabric/connector';
import { createCanvasObject } from '../fabric/canvasObject';
import { isCircle } from '../utils/fabric';

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

const addPointIfDefined = (
  matrix: any[] | undefined,
  ...points: (fabric.Point | undefined)[]
): fabric.Point[] => {
  return points.reduce((anchors, point) => {
    if (point) {
      return [
        ...anchors,
        matrix ? fabric.util.transformPoint(point, matrix) : point,
      ];
    } else {
      return anchors;
    }
  }, [] as fabric.Point[]);
};

export const updateAnchors = (
  state: CanvasObjectState,
  target: fabric.Object,
  matrix?: any[]
) => {
  const oCoords = target.calcCoords();

  switch (target.type) {
    case 'rect':
      state.anchors = addPointIfDefined(
        matrix,
        oCoords?.mt,
        oCoords?.ml,
        oCoords?.mr,
        oCoords?.mb,
        oCoords?.tl,
        oCoords?.tr,
        oCoords?.bl,
        oCoords?.br
      );
      break;
    case 'circle':
      state.anchors = addPointIfDefined(
        matrix,
        oCoords?.mt,
        oCoords?.ml,
        oCoords?.mr,
        oCoords?.mb
      );
      break;
    case 'triangle':
      state.anchors = addPointIfDefined(
        matrix,
        oCoords?.mt,
        oCoords?.bl,
        oCoords?.br
      );
      break;
    default:
      throw new Error(`Should not get here for type: ${target.type}`);
  }
};

const getTargets = (target?: fabric.Object): fabric.Object[] => {
  if (!target) {
    return [];
  } else if (target instanceof fabric.ActiveSelection) {
    return target.getObjects();
  } else {
    return [target];
  }
};

const onObjectsMoving = (eventName: string, { target }: fabric.IEvent) => {
  console.log(eventName, target?.type);

  if (target) {
    const targets = getTargets(target);
    var mGroup =
      target instanceof fabric.ActiveSelection
        ? target.calcTransformMatrix(true)
        : undefined;

    runInAction(() => {
      targets.forEach((t) => {
        if (IsObjectWithId(t)) {
          const state = canvasState.canvasObjects.find((o) => o.id === t.id);

          if (state) {
            updateAnchors(state, t, mGroup);
          }
        }
      });
    });
  }
};

const initializeCanvasToState = (canvas: fabric.Canvas) => {
  canvas.on('object:modified', ({ target }) => {
    if (IsObjectWithId(target)) {
      const state = canvasState.canvasObjects.find((o) => o.id === target.id);

      if (state) {
        runInAction(() => {
          console.log('Updating state from object', state.id);

          state.angle = target.angle;
          state.height = target.height;
          state.left = target.left;
          state.scaleX = target.scaleX;
          state.scaleY = target.scaleY;
          state.top = target.top;
          state.width = target.width;

          updateAnchors(state, target);

          if (isCircle(target)) {
            state.radius = target.radius;
          }
        });
      }
    }
  });

  canvas.on('object:rotating', (e) => onObjectsMoving('object:rotating', e));
  canvas.on('object:scaling', (e) => onObjectsMoving('object:scaling', e));
  canvas.on('object:moving', (e) => onObjectsMoving('object:moving', e));

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
