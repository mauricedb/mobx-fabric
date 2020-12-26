import { createContext } from "react";

import { CanvasState, canvasState } from "./canvasState";

export { canvasState } from "./canvasState";

export const CanvasContext = createContext<CanvasState>(canvasState);
