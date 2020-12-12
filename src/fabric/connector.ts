import { fabric } from 'fabric';
import { autorun } from 'mobx';

import { CanvasObjectState, Connection } from '../state/canvasState';

const centerOfObject = (from: CanvasObjectState): fabric.Point => {
  return new fabric.Point(
    (from.left ?? 0) + (from.width ?? 0) / 2,
    (from.top ?? 0) + (from.height ?? 0) / 2
  );
};

const connectToState = (target: fabric.Line, state: Connection) => {
  autorun(() => {
    console.log('Updating fabric.Line', state.id);
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

export const createConnector = (state: Connection) => {
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

  connectToState(connectorLine, state);

  return connectorLine;
};
