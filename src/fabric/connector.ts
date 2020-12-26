import { fabric } from "fabric";
import { autorun } from "mobx";

import { Connection } from "../state/canvasState";

const connectToState = (target: fabric.Line, state: Connection) => {
  autorun(() => {
    console.log("Updating fabric.Line", state.id);
    const { from, to } = state;

    const best = from.anchors.reduce(
      (previousFrom, fromPoint) => {
        const shortest = to.anchors.reduce((previousTo, toPoint) => {
          const distance = toPoint.distanceFrom(fromPoint);

          if (distance < previousTo.distance) {
            return { from: fromPoint, to: toPoint, distance };
          } else {
            return previousTo;
          }
        }, previousFrom);

        if (shortest.distance < previousFrom.distance) {
          return shortest;
        } else {
          return previousFrom;
        }
      },
      {
        from: new fabric.Point(Number.MIN_VALUE, Number.MIN_VALUE),
        to: new fabric.Point(Number.MAX_VALUE, Number.MAX_VALUE),
        distance: Number.MAX_VALUE,
      }
    );

    target.set({
      x1: best.from.x,
      y1: best.from.y,
      x2: best.to.x,
      y2: best.to.y,
    });
  });
};

export const createConnector = (state: Connection) => {
  console.log("New Connector:", state.id);

  var options = {
    id: state.id,
    selectable: false,
    fill: "black",
    stroke: "black",
    strokeWidth: 2,
    originX: "center",
    originY: "center",
  };

  const connectorLine = new fabric.Line(undefined, options);

  connectToState(connectorLine, state);

  return connectorLine;
};
