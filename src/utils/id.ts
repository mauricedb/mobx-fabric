export type ObjectWithId = {
  id: number;
};

export const IsObjectWithId = (value: any): value is ObjectWithId =>
  typeof value?.id === "number";
