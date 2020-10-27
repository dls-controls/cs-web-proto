import React from "react";

import { Widget } from "../widget";
import { PVWidgetPropType, PVComponent } from "../widgetProps";
import {
  InferWidgetProps,
  PositionProp,
  FloatPropOpt,
  ColorPropOpt
} from "../propTypes";
import { registerWidget } from "../register";
import { ShapeComponent } from "../Shape/shape";
import { Color } from "../../../types/color";

const PolylineProps = {
  width: FloatPropOpt,
  position: PositionProp,
  lineWidth: FloatPropOpt,
  backgroundColor: ColorPropOpt
};

export type PolylineComponentProps = InferWidgetProps<typeof PolylineProps> &
  PVComponent;

export const PolylineComponent = (
  props: PolylineComponentProps
): JSX.Element => {
  const shapeProps = {
    shapeWidth: `${props.width}px`,
    shapeHeight: `${props.lineWidth}px`,
    backgroundColor: props.backgroundColor
  };

  return <ShapeComponent {...shapeProps} />;
};

const PolylineWidgetProps = {
  ...PolylineProps,
  ...PVWidgetPropType
};

export const Polyline = (
  props: InferWidgetProps<typeof PolylineWidgetProps>
): JSX.Element => <Widget baseWidget={PolylineComponent} {...props} />;

registerWidget(Polyline, PolylineWidgetProps, "polyline");
