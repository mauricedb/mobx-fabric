import { fabric } from "fabric";
import { autorun, runInAction } from "mobx";

import { CanvasObjectState } from "../state/canvasState";
import { ObjectWithId } from "../utils/id";
import { updateAnchors } from "./canvas";

const connectToState = (target: fabric.Object, state: CanvasObjectState) => {
  ((target as unknown) as ObjectWithId).id = state.id;

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

  if (state.type === "image") {
    if (state.file) {
      const reader = new FileReader();
      reader.addEventListener(
        "load",
        () => {
          if (typeof reader.result === "string") {
            fabric.util.loadImage(reader.result, (imgElement) => {
              var imgInstance = new fabric.Image(imgElement, {
                height: 200,
                width: 200,
              });
              connectToState(imgInstance, state);
              canvas.add(imgInstance);
            });
          }
        },
        false
      );

      reader.readAsDataURL(state.file);
    }
  } else if (state.type) {
    const klass = fabric.util.getKlass(state.type, "fabric");
    klass.fromObject({}, (newObject: fabric.Object) => {
      connectToState(newObject, state);
      canvas.add(newObject);
    });
  }
};
