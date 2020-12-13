import { makeAutoObservable } from 'mobx';

import { isCircle } from '../utils/fabric';

export type Connection = {
  id: number;
  from: CanvasObjectState;
  to: CanvasObjectState;
};

export type CanvasObjectState = {
  angle?: number;
  fill?: string | fabric.Pattern | fabric.Gradient;
  height?: number;
  id: number;
  klass: string;
  left?: number;
  radius?: number;
  scaleX?: number;
  scaleY?: number;
  top?: number;
  width?: number;
  movingTop?: number;
  movingLeft?: number;
  copyStateFromFabricObject: (object: fabric.Object) => void;
  copyStateFromMovingFabricObject: (object: fabric.Object) => void;
};

const createCanvasObjectState = (obj: {}) => {
  return makeAutoObservable<CanvasObjectState>({
    angle: 0,
    fill: '#0000FF',
    height: 200,
    id: Date.now(),
    klass: 'rect',
    left: 100,
    movingLeft: undefined,
    movingTop: undefined,
    radius: 100,
    top: 100,
    width: 200,
    scaleX: 1,
    scaleY: 1,
    ...obj,

    copyStateFromFabricObject(object: fabric.Object) {
      console.log('Updating state from object', this.id);

      this.angle = object.angle;
      this.height = object.height;
      this.left = object.left;
      this.movingLeft = undefined;
      this.movingTop = undefined;
      this.scaleX = object.scaleX;
      this.scaleY = object.scaleY;
      this.top = object.top;
      this.width = object.width;

      if (isCircle(object)) {
        this.radius = object.radius;
      }
    },
    copyStateFromMovingFabricObject(object: fabric.Object) {
      this.movingLeft = object.left;
      this.movingTop = object.top;
    },
  });
};

const createCanvasState = () => {
  return makeAutoObservable({
    canvasObjects: [] as CanvasObjectState[],
    selected: [] as CanvasObjectState[],
    connections: [] as Connection[],
    isDrawingMode: false,

    addCanvasObject(canvasObject: Partial<CanvasObjectState>) {
      console.log('addCanvasObject', canvasObject.id);

      const temp = createCanvasObjectState(canvasObject);

      this.canvasObjects.push(temp);
    },

    setDrawingMode(mode: boolean) {
      this.isDrawingMode = mode;
    },

    updateSelection(selectedIds: number[], deselectedIds: number[]) {
      const selected = this.selected
        .concat(this.canvasObjects.filter((o) => selectedIds.includes(o.id)))
        .filter((o) => !deselectedIds.includes(o.id));
      this.selected = selected;
    },

    connectSelected() {
      if (this.selected.length === 2) {
        this.connections.push({
          id: Date.now(),
          from: this.selected[0],
          to: this.selected[1],
        });
      }
    },
  });
};

export const canvasState = createCanvasState();
export type CanvasState = typeof canvasState;
