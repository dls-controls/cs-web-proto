import React from "react";
import { Widget } from "../widget";
import {
  InferWidgetProps,
  StringPropOpt,
  FloatPropOpt,
  BoolPropOpt
} from "../propTypes";
import { PVComponent, PVWidgetPropType } from "../widgetProps";
import { registerWidget } from "../register";
import classes from "./led.module.css";
import { DAlarm } from "../../../types/dtypes";
import { getClass } from "../alarm";

/**
 * rule: a user defined rule for when the led should trigger e.g. "x < 10"
 * scale: a scaling factor for the led from it's default value
 */
const LedProps = {
  scale: FloatPropOpt,
  useRule: BoolPropOpt,
  rule: StringPropOpt
};

export type LedComponentProps = InferWidgetProps<typeof LedProps> & PVComponent;

/**
 * Creates a small led icon which can change color depending on connection
 * and alarm type, css file defines these colours
 * @param props properties to pass in, these will be handled by the below LED
 * function and only extra props defined on LedProps need to be passed in as well,
 * to define some text explaining the meaning of the LED in different colours add a
 * tooltip property in a json file containing a led
 */
export const LedComponent = (props: LedComponentProps): JSX.Element => {
  const { value, connected, useRule, rule, scale = 1.0 } = props;

  let alarm = DAlarm.NONE;
  // User defined rule takes priority over alarm on PV
  if (useRule) {
    switch (rule) {
      case "major":
        alarm = DAlarm.MAJOR;
        break;
      case "minor":
        alarm = DAlarm.MINOR;
        break;
      default:
        alarm = DAlarm.NONE;
        break;
    }
  } else {
    alarm = value?.getAlarm() || DAlarm.NONE;
  }
  const className = getClass(classes, connected, alarm.quality);

  const scaleTransform = {
    transform: `scale(${scale})`
  };

  return <div className={className} style={scaleTransform} />;
};

const LedWidgetProps = {
  ...LedProps,
  ...PVWidgetPropType
};

export const LED = (
  props: InferWidgetProps<typeof LedWidgetProps>
): JSX.Element => <Widget baseWidget={LedComponent} {...props} />;

registerWidget(LED, PVWidgetPropType, "led");
