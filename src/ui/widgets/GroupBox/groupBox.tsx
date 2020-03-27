import React from "react";

import { Widget } from "../widget";
import { WidgetPropType } from "../widgetProps";
import { registerWidget } from "../register";
import { StringProp, ChildrenPropOpt, InferWidgetProps } from "../propTypes";

interface GroupBox {
  name: string;
  children?: JSX.Element;
}

// Widget that renders a group-box style border showing the name prop.
// This could be replaced if we can implement this as part of the
// border prop.
export const GroupBoxComponent = (props: GroupBox): JSX.Element => (
  // Uses an inner margin for children similar to Phoebus
  // This prevents the title being overwritten
  // Could be changed or perhaps customisable as a prop
  <fieldset>
    <legend>{props.name}</legend>
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      {props.children}
    </div>
  </fieldset>
);

const GroupBoxProps = {
  ...WidgetPropType,
  name: StringProp,
  children: ChildrenPropOpt
};

export const GroupingContainer = (
  props: InferWidgetProps<typeof GroupBoxProps>
): JSX.Element => <Widget baseWidget={GroupBoxComponent} {...props} />;

registerWidget(GroupingContainer, GroupBoxProps, "grouping");