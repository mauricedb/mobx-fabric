import { fabric } from 'fabric';
import { autorun } from 'mobx';

import { CanvasObjectState } from '../state/canvasState';

const connectToState = (target: fabric.Object, state: CanvasObjectState) => {
  autorun(() => {
    console.log('Updating fabric.Object', state.id);

    target.animate(
      {
        angle: state.angle ?? 0,
        fill: (state.fill as string) ?? 'black',
        height: state.height ?? 0,
        left: state.left ?? 0,
        radius: state.radius ?? 0,
        top: state.top ?? 0,
        width: state.width ?? 0,
      },
      {
        onChange: () => target.canvas?.requestRenderAll(),
      }
    );
  });
};

export const createCanvasObject = (
  state: CanvasObjectState,
  canvas: fabric.Canvas
) => {
  console.log('New Object:', state.id, state.klass);

  if (state.klass) {
    const klass = fabric.util.getKlass(state.klass, '');
    klass.fromObject(
      {
        id: state.id,
      },
      (newObject: fabric.Object) => {
        connectToState(newObject, state);
        canvas.add(newObject);
      }
    );
  }
};
