import React from "react";

import { Widget } from "../widget";
import { PVComponent, PVWidgetPropType } from "../widgetProps";

import classes from "./readback.module.css";
import {
  IntPropOpt,
  BoolPropOpt,
  InferWidgetProps,
  ChoicePropOpt,
  FontPropOpt,
  ColorPropOpt,
  BorderPropOpt
} from "../propTypes";
import { registerWidget } from "../register";
import { LabelComponent } from "../Label/label";
import { DAlarm, DType } from "../../../types/dtypes";
import { getClass } from "../alarm";

const ReadbackProps = {
  precision: IntPropOpt,
  showUnits: BoolPropOpt,
  fgAlarmSensitive: BoolPropOpt,
  textAlign: ChoicePropOpt(["left", "center", "right"]),
  transparent: BoolPropOpt,
  font: FontPropOpt,
  foregroundColor: ColorPropOpt,
  backgroundColor: ColorPropOpt,
  border: BorderPropOpt
};

// Needs to be exported for testing
export type ReadbackComponentProps = InferWidgetProps<typeof ReadbackProps> &
  PVComponent;

export const ReadbackComponent = (
  props: ReadbackComponentProps
): JSX.Element => {
  const {
    connected,
    value,
    precision,
    font,
    foregroundColor,
    backgroundColor,
    border,
    fgAlarmSensitive = false,
    transparent = false,
    textAlign = "center",
    showUnits = false
  } = props;
  // Decide what to display.
  const alarm = value?.getAlarm() || DAlarm.NONE;
  const display = value?.getDisplay();
  let displayedValue;
  if (!value) {
    displayedValue = "Waiting for value";
  } else {
    if (precision !== undefined && !isNaN(DType.coerceDouble(value))) {
      displayedValue = DType.coerceDouble(value).toFixed(precision);
    } else {
      displayedValue = DType.coerceString(value);
    }
  }

  // Add units if there are any and show units is true
  if (showUnits && display?.units) {
    displayedValue = displayedValue + ` ${display.units}`;
  }

  // Handle foreground alarm sensitivity.
  let className = classes.Readback;
  // TODO: should we show disconnection even if not alarm sensitive?
  if (fgAlarmSensitive) {
    className = getClass(classes, connected, alarm.quality, classes.Readback);
  }
  // Use a LabelComponent to display it.
  return (
    <LabelComponent
      className={className}
      text={displayedValue}
      transparent={transparent}
      textAlign={textAlign}
      font={font}
      foregroundColor={foregroundColor}
      backgroundColor={backgroundColor}
      border={border}
    ></LabelComponent>
  );
};

const ReadbackWidgetProps = {
  ...ReadbackProps,
  ...PVWidgetPropType
};

export const Readback = (
  props: InferWidgetProps<typeof ReadbackWidgetProps>
): JSX.Element => (
  <Widget
    // TODO: Note that we asking for both string and double here;
    // this subverts the intended efficiency.
    pvType={{ string: true, double: true }}
    baseWidget={ReadbackComponent}
    {...props}
  />
);

registerWidget(Readback, ReadbackWidgetProps, "readback");
