import { fabric } from "fabric";

const addPointIfDefined = (
  matrix: number[],
  ...points: (fabric.Point | undefined)[]
): fabric.Point[] => {
  return points
    .reduce((anchors, point) => {
      if (point) {
        return [...anchors, point];
      } else {
        return anchors;
      }
    }, [] as fabric.Point[])
    .map((point) => fabric.util.transformPoint(point, matrix));
};

const all8Points = (matrix: number[], oCoords: fabric.Object["oCoords"]) =>
  addPointIfDefined(
    matrix,
    oCoords?.mt,
    oCoords?.ml,
    oCoords?.mr,
    oCoords?.mb,
    oCoords?.tl,
    oCoords?.tr,
    oCoords?.bl,
    oCoords?.br
  );

export const getAnchorPointsMap = new Map<
  string,
  (matrix: number[], oCoords: fabric.Object["oCoords"]) => fabric.Point[]
>();

getAnchorPointsMap.set("rect", all8Points);
getAnchorPointsMap.set("image", all8Points);
getAnchorPointsMap.set("path", all8Points);
getAnchorPointsMap.set(
  "circle",
  (matrix: number[], oCoords: fabric.Object["oCoords"]) =>
    addPointIfDefined(
      matrix,
      oCoords?.mt,
      oCoords?.ml,
      oCoords?.mr,
      oCoords?.mb
    )
);

getAnchorPointsMap.set(
  "triangle",
  (matrix: number[], oCoords: fabric.Object["oCoords"]) =>
    addPointIfDefined(matrix, oCoords?.mt, oCoords?.bl, oCoords?.br)
);
