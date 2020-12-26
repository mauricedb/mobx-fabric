import { useEffect, useRef } from "react";
import { fabric } from "fabric";

import classes from "./Fabric.module.css";
import { initialize } from "../fabric/canvas";

export const Fabric: React.FC = () => {
  console.log("Rendering Fabric");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const clientRect = canvasRef.current.getClientRects()[0];
      const canvas = new fabric.Canvas(canvasRef.current, {
        backgroundColor: "lightcyan",
        height: clientRect.height,
        width: clientRect.width,
      });

      initialize(canvas);
    }
  }, []);

  return <canvas className={classes.fabric} ref={canvasRef} />;
};
