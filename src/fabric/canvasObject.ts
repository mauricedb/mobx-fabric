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

const connectToStateAndAddImageToCanvas = (
  image: fabric.Object,
  state: CanvasObjectState,
  canvas: fabric.Canvas,
  size: { height: number; width: number }
) => {
  state.scaleY = (state.height ?? 200) / size.height;
  state.scaleX = (state.width ?? 200) / size.width;
  state.height = size.height;
  state.width = size.width;

  connectToState(image, state);

  canvas.add(image);
};

const loadImageFromFile = (state: CanvasObjectState, canvas: fabric.Canvas) => {
  if (state.file) {
    const reader = new FileReader();
    reader.addEventListener(
      "load",
      () => {
        if (typeof reader.result === "string") {
          if (state.file?.type === "image/svg+xml") {
            fabric.loadSVGFromURL(reader.result, function (objects, options) {
              const image = fabric.util.groupSVGElements(objects, options);

              connectToStateAndAddImageToCanvas(image, state, canvas, options);
            });
          } else {
            fabric.util.loadImage(reader.result, (img) => {
              const image = new fabric.Image(img, {});

              connectToStateAndAddImageToCanvas(image, state, canvas, img);
            });
          }
        }
      },
      false
    );

    reader.readAsDataURL(state.file);
  }
};

export const createCanvasObject = (
  state: CanvasObjectState,
  canvas: fabric.Canvas
) => {
  console.log("New Object:", state.id, state.type);

  if (state.type === "image") {
    loadImageFromFile(state, canvas);
  } else if (state.type) {
    const klass = fabric.util.getKlass(state.type, "fabric");
    klass.fromObject({}, (newObject: fabric.Object) => {
      connectToState(newObject, state);
      canvas.add(newObject);
    });
  }
};
