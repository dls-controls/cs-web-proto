import React from "react";
import propTypes from "prop-types";

import classes from "./readback.module.css";
import { VType } from "../../vtypes/vtypes";
import { alarmOf, AlarmSeverity } from "../../vtypes/alarm";
import { vtypeToString } from "../../vtypes/utils";
import { PVWidget, PVWidgetInterface } from "../Widget/widget";
import { PVWidgetProps } from "../Widget/widgetprops";

export interface ReadbackProps {
  connected: boolean;
  value?: VType;
  precision?: number;
  style?: object;
}

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

export const ReadbackComponent = (props: ReadbackProps): JSX.Element => {
  let { connected, value, precision = undefined, style } = props;
  const alarm = alarmOf(value);
  let displayedValue;
  if (!value) {
    displayedValue = "Waiting for value";
  } else {
    displayedValue = vtypeToString(value, precision);
  }
  style = { backgroundColor: "#383838", ...props.style };

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

// interface ReadbackWidgetProps {
//   precision?: number;
// }

const ReadbackWidgetProps = {
  precision: propTypes.number,
  ...PVWidgetProps
};

export const Readback = (
  props: propTypes.InferProps<typeof ReadbackWidgetProps>
): JSX.Element => <PVWidget baseWidget={ReadbackComponent} {...props} />;

Readback.propTypes = ReadbackWidgetProps;
