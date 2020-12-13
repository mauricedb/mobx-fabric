import { fabric } from 'fabric';
import { autorun } from 'mobx';

import { CanvasObjectState, Connection } from '../state/canvasState';

const centerOfObject = (object: CanvasObjectState): fabric.Point => {
  return new fabric.Point(
    (object.movingLeft ?? object.left ?? 0) +
      ((object.width ?? 0) * (object.scaleX ?? 1)) / 2,
    (object.movingTop ?? object.top ?? 0) +
      ((object.height ?? 0) * (object.scaleY ?? 1)) / 2
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
