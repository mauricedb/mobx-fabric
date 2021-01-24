import { fabric } from "fabric";
import { autorun } from "mobx";

import { CanvasObjectState } from "../state/canvasState";
import { ObjectWithId } from "../utils/id";
import { updateAnchors } from "./canvas";

const connectToState = (target: fabric.Object, state: CanvasObjectState) => {
  ((target as unknown) as ObjectWithId).id = state.id;

  autorun(() => {
    console.log("Updating fabric.Object", state.id, state.type);

    target.set({
      angle: state.angle ?? 0,
      fill: (state.fill as string) ?? "black",
      height: state.height ?? 0,
      left: state.left ?? 0,
      scaleX: state.scaleX ?? 1,
      scaleY: state.scaleY ?? 1,
      top: state.top ?? 0,
      width: state.width ?? 0,
      opacity: 0,
    });

    if (target instanceof fabric.Circle) {
      target.set({
        radius: state.radius ?? 0,
      });
    }

    updateAnchors(state, target);

    target.animate(
      {
        opacity: 1,
      },
      {
        onChange: () => {
          target.canvas?.requestRenderAll();
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
            fabric.util.loadImage(reader.result, (img) => {
              var imgInstance = new fabric.Image(img, {});

              state.scaleY = (state.height ?? 200) / img.height;
              state.scaleX = (state.width ?? 200) / img.width;
              state.height = img.height;
              state.width = img.width;

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
