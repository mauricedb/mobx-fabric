import { makeAutoObservable } from 'mobx';

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
  type: string;
  left?: number;
  radius?: number;
  scaleX?: number;
  scaleY?: number;
  top?: number;
  width?: number;
  anchors: fabric.Point[];
};

const createCanvasObjectState = (obj: {}) => {
  return makeAutoObservable<CanvasObjectState>({
    angle: 0,
    fill: '#0000FF',
    height: 200,
    id: Date.now(),
    type: 'rect',
    left: 100,
    radius: 100,
    top: 100,
    width: 200,
    scaleX: 1,
    scaleY: 1,
    anchors: [],
    ...obj,
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

const from = createCanvasObjectState({ id: 1 });
const to = createCanvasObjectState({ id: 2, left: 400, fill: '#FF0000' });

canvasState.canvasObjects.push(from);
canvasState.canvasObjects.push(to);

canvasState.selected.push(from);
canvasState.selected.push(to);
canvasState.connectSelected();
