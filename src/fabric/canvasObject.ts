import { fabric } from "fabric";
import { autorun, runInAction } from "mobx";

import { CanvasObjectState } from "../state/canvasState";
import { updateAnchors } from "./canvas";

const connectToState = (target: fabric.Object, state: CanvasObjectState) => {
  autorun(() => {
    console.log("Updating fabric.Object", state.id, state.type);

    target.animate(
      {
        angle: state.angle ?? 0,
        fill: (state.fill as string) ?? "black",
        height: state.height ?? 0,
        left: state.left ?? 0,
        radius: state.radius ?? 0,
        scaleX: state.scaleX ?? 1,
        scaleY: state.scaleY ?? 1,
        top: state.top ?? 0,
        width: state.width ?? 0,
      },
      {
        onChange: () => {
          target.canvas?.requestRenderAll();
        },
        onComplete: () => {
          runInAction(() => updateAnchors(state, target));
        },
      }
    );
  });
};

export const createCanvasObject = (
  state: CanvasObjectState,
  canvas: fabric.Canvas
) => {
  console.log("New Object:", state.id, state.type);

  if (state.type) {
    const klass = fabric.util.getKlass(state.type, "fabric");
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
