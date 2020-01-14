import React from "react";
import { Widget, WidgetPropType } from "../widget";
import { registerWidget } from "../register";
import { BoolPropOpt, StringPropOpt, InferWidgetProps } from "../propTypes";

const ShapeProps = {
  shapeWidth: StringPropOpt,
  shapeHeight: StringPropOpt,
  shapeRadius: StringPropOpt,
  shapeTransform: StringPropOpt,
  transparent: BoolPropOpt,
  shadow: StringPropOpt
};

export const ShapeComponent = (
  props: InferWidgetProps<typeof ShapeProps>
): JSX.Element => {
  const newStyle: any = {
    width: props.shapeWidth ? props.shapeWidth : "100%",
    height: props.shapeHeight ? props.shapeHeight : "100%",
    borderRadius: props.shapeRadius ? props.shapeRadius : "",
    transform: props.shapeTransform ? props.shapeTransform : "",
    boxShadow: props.shadow ?? ""
  };

  if (props.transparent !== undefined && props.transparent) {
    newStyle["backgroundColor"] = "transparent";
  }
  return <div style={newStyle} />;
};

const ShapeWidgetProps = {
  ...ShapeProps,
  ...WidgetPropType
};

export const Shape = (
  props: InferWidgetProps<typeof ShapeWidgetProps>
): JSX.Element => <Widget baseWidget={ShapeComponent} {...props} />;

registerWidget(Shape, ShapeWidgetProps, "shape");
