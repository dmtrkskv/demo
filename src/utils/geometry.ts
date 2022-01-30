import { clamp } from "ramda";

export interface IPoint {
  x: number;
  y: number;
}
export interface IDimensions {
  width: number;
  height: number;
}

export type ILineSegment = [IPoint, IPoint];

export const enum EBoxSide {
  top = "top",
  bottom = "bottom",
  left = "left",
  right = "right",
}

export interface IPosition extends IPoint, IDimensions {}

export function getDimensions({ width, height }: IPosition): IDimensions {
  return { width, height };
}

export function getOrigin({ x, y }: IPosition): IPoint {
  return { x, y };
}

export function clampPositionInDimensions(
  position: IPosition,
  { width, height }: IDimensions
) {
  return {
    ...position,
    ...{
      x: clamp(0, width - position.width, position.x),
      y: clamp(0, height - position.height, position.y),
    },
  };
}

function toRadiusVector(a: IPoint, b: IPoint): IPoint {
  return { x: b.x - a.x, y: b.y - a.y };
}

function dot(a: IPoint, b: IPoint): number {
  return a.x * b.x + a.y * b.y;
}

export function pointProjection([a, b]: ILineSegment, c: IPoint): IPoint {
  const ac = toRadiusVector(a, c);
  const ab = toRadiusVector(a, b);

  // Коэффициент между [расстоянием от А до точки проекции] и [длиной вектора AB]
  const t = dot(ac, ab) / dot(ab, ab);

  return { x: a.x + ab.x * t, y: a.y + ab.y * t };
}
