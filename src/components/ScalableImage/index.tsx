import { useDrag } from "../../decorators/dnd";
import { useBooleanState } from "../../decorators/useBooleanState";
import { IScaleEvent, useScale } from "../../decorators/useScale";
import { useCallbackRef } from "../../decorators/useCallbackRef";
import { BoundingBox } from "../../utils/boundingBox";
import { defineWheelScalingK, noop } from "../../utils/common";
import { NumbersRange } from "../../utils/numbersRange";
import { Point } from "../../utils/point";
import { IImageBoxProps, ImageBox } from "../ImageBox";
import { IResizeCallback } from "../Resizable/hooks";
import { IDragEvent } from "../../utils/drag";

interface IProps extends IImageBoxProps {
  viewBox: NonNullable<IImageBoxProps["viewBox"]>;
  onViewBoxChange: IResizeCallback;
  scaleBounds?: NumbersRange;
}

export const ScalableImage: React.FC<IProps> = ({
  box,
  src,
  viewBox,
  onViewBoxChange,
  scaleBounds = new NumbersRange(0.2, 1),
}) => {
  const [element, setElement] = useCallbackRef();

  function handleScale({ delta, pressedKeys, origin }: IScaleEvent) {
    const nextViewBox = viewBox
      .scale(defineWheelScalingK(delta))
      .constrainSize(scaleBounds, scaleBounds)
      .placeInSameOrigin(viewBox, origin)
      .clampByOuter(BoundingBox.byOnlyDeltas(1, 1));

    onViewBoxChange({ box: nextViewBox, pressedKeys });
  }

  useScale(element, { onChange: handleScale });

  const handleDrag = function ({ movement, pressedKeys }: IDragEvent) {
    const scaledDelta = movement.div(
      new Point(box.dx / viewBox.dx, box.dy / viewBox.dy)
    );

    const nextViewBox = viewBox
      .shift(scaledDelta.negate())
      .clampByOuter(BoundingBox.byOnlyDeltas(1, 1));

    onViewBoxChange({ box: nextViewBox, pressedKeys });
  };

  const isScaled = viewBox.dx < 1 || viewBox.dy < 1;

  const [isDrag, enableDragFlag, disableDragFlag] = useBooleanState(false);
  useDrag({
    element,
    onChange: isScaled ? handleDrag : noop,
    onStart: isScaled ? enableDragFlag : noop,
    onEnd: isScaled ? disableDragFlag : noop,
  });

  return (
    <div
      ref={setElement}
      style={{ cursor: isScaled ? (isDrag ? "grabbing" : "grab") : "auto" }}
    >
      <ImageBox box={box} src={src} viewBox={viewBox} />
    </div>
  );
};
