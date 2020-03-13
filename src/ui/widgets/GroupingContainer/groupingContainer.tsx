import React, { CSSProperties } from "react";

import { Widget } from "../widget";
import { WidgetPropType } from "../widgetProps";
import { registerWidget } from "../register";
import {
  StringProp,
  ChildrenPropOpt,
  InferWidgetProps,
  BorderPropOpt
} from "../propTypes";

const GroupingContainerProps = {
  name: StringProp,
  children: ChildrenPropOpt,
  border: BorderPropOpt
};

// Generic display widget to put other things inside
export const GroupingContainerComponent = (
  props: InferWidgetProps<typeof GroupingContainerProps>
): JSX.Element => {
  const style: CSSProperties = {
    position: "relative",
    height: "100%",
    width: "100%",
    ...props.border?.css()
  };
  return <div style={style}>{props.children}</div>;
};

const GroupingWidgetProps = {
  ...GroupingContainerProps,
  ...WidgetPropType
};

export const GroupingContainer = (
  props: InferWidgetProps<typeof GroupingWidgetProps>
): JSX.Element => <Widget baseWidget={GroupingContainerComponent} {...props} />;

registerWidget(GroupingContainer, GroupingWidgetProps, "grouping");
