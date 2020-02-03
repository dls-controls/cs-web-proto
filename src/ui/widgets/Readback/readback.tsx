import React from "react";

import { Widget } from "../widget";
import { PVComponent, PVWidgetPropType } from "../widgetProps";

import classes from "./readback.module.css";
import { alarmOf, AlarmSeverity } from "../../../types/vtypes/alarm";
import { displayOf } from "../../../types/vtypes/display";
import { vtypeToString } from "../../../types/vtypes/utils";
import { IntPropOpt, BoolPropOpt, InferWidgetProps } from "../propTypes";
import { registerWidget } from "../register";

const ReadbackProps = {
  precision: IntPropOpt,
  showUnits: BoolPropOpt
};

// Needs to be exported for testing
export type ReadbackComponentProps = InferWidgetProps<typeof ReadbackProps> &
  PVComponent;

function getClass(alarmSeverity: any): string {
  switch (alarmSeverity) {
    case AlarmSeverity.MINOR: {
      return classes.Minor;
    }
    case AlarmSeverity.MAJOR: {
      return classes.Major;
    }
  }
  return classes.Readback;
}

export const ReadbackComponent = (
  props: ReadbackComponentProps
): JSX.Element => {
  const { connected, value, precision, showUnits = false } = props;
  let { style } = props;
  const alarm = alarmOf(value);
  const display = displayOf(value);
  let displayedValue;
  if (!value) {
    displayedValue = "Waiting for value";
  } else {
    displayedValue = vtypeToString(value, precision);
  }
  style = { backgroundColor: "#383838", ...props.style };

  // Add units if there are any and show units is true
  if (showUnits === true && display.getUnit() !== "") {
    displayedValue = displayedValue + ` ${display.getUnit()}`;
  }

  // Change text color depending on connection state
  if (!connected) {
    style = {
      ...style,
      color: "#ffffff"
    };
  }

  return (
    <div
      className={`Readback ${classes.Readback} ${getClass(
        alarm.getSeverity()
      )}`}
      style={style}
    >
      {displayedValue}
    </div>
  );
};

const ReadbackWidgetProps = {
  ...ReadbackProps,
  ...PVWidgetPropType
};

export const Readback = (
  props: InferWidgetProps<typeof ReadbackWidgetProps>
): JSX.Element => <Widget baseWidget={ReadbackComponent} {...props} />;

registerWidget(Readback, ReadbackWidgetProps, "readback");
