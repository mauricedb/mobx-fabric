export const isCircle = (o: fabric.Object): o is fabric.Circle => {
  return o?.type === 'circ';
};
