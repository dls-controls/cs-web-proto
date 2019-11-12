import React, { memo } from "react";
import PropTypes from "prop-types";

import {
  InferWidgetProps,
  PVComponent,
  PVWidget,
  PVWidgetPropType,
  FlatPVComponent,
  FlatPVWidget
} from "../../components/Widget/widget";

import classes from "./readback.module.css";
import { alarmOf, AlarmSeverity } from "../../vtypes/alarm";
import { displayOf } from "../../vtypes/display";
import { vtypeToString } from "../../vtypes/utils";

const ReadbackProps = {
  precision: PropTypes.number,
  showUnits: PropTypes.bool
};

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

// Needs to be exported for testing
export type ReadbackComponentProps = InferWidgetProps<typeof ReadbackProps> &
  PVComponent;

export const ReadbackComponent = (
  props: ReadbackComponentProps
): JSX.Element => {
  let { connected, value, precision, showUnits = false, style } = props;
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
): JSX.Element => <PVWidget baseWidget={ReadbackComponent} {...props} />;

Readback.propTypes = ReadbackWidgetProps;

export const FlatReadbackComponent = (
  props: InferWidgetProps<typeof ReadbackProps> & FlatPVComponent
): JSX.Element => {
  let { connected, value, precision, showUnits = false, ...otherProps } = props;
  const alarm = alarmOf(value);
  const display = displayOf(value);
  let displayedValue;
  if (!value) {
    displayedValue = "Waiting for value";
  } else {
    displayedValue = vtypeToString(value, precision);
  }
  let style = {
    backgroundColor: "#383838",
    top: otherProps.y,
    left: otherProps.x,
    height: otherProps.height,
    width: otherProps.width,
    padding: otherProps.padding,
    margin: otherProps.margin,
    color: ""
  };

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
      style={{ position: "absolute", ...style }}
    >
      {displayedValue}
    </div>
  );
};

export const FlatReadback = (
  props: InferWidgetProps<typeof ReadbackProps> & FlatPVWidget
): JSX.Element => <FlatPVWidget Component={FlatReadbackComponent} {...props} />;
