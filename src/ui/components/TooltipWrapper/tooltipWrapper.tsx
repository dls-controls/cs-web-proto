// Component to provide basis of other EPICS widgets
// Should take pv name, value, alarm, timestamp
// These values will be displayed in a tooltip when highlighted
// A middle mouse click will copy the PV name to the clipboard

import React, { ReactNode, useState } from "react";
import copyToClipboard from "clipboard-copy";
import Popover from "react-tiny-popover";

import { resolveTooltip } from "../../widgets/tooltip";
import classes from "./tooltipWrapper.module.css";
import { DType } from "../../../types/dtypes";

export const TooltipWrapper = (props: {
  pvName: string;
  connected: boolean;
  value?: DType;
  children: ReactNode;
  style?: object;
  tooltip?: string;
}): JSX.Element => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { pvName, style = {} } = props;

  let activeClasses = "";
  if (props.tooltip) {
    activeClasses += ` ${classes.TooltipAvailable}`;
  }

  const mouseDown = (e: React.MouseEvent): void => {
    if (e.button === 1) {
      setPopoverOpen(true);
      if (pvName) {
        e.currentTarget.classList.add(classes.Copying);
        copyToClipboard(pvName);
      }
      // Stop regular middle-click behaviour if showing tooltip.
      e.preventDefault();
    }
  };
  const mouseUp = (e: React.MouseEvent): void => {
    if (e.button === 1) {
      setPopoverOpen(false);
      e.currentTarget.classList.remove(classes.Copying);
    }
  };

  /* The following elements were separated from the popover element
  for clarity and performance

  In particular, the popover position was found to be causing inefficient
  renders when it was previously in a list of preferred positions, i.e ["top"]
  rather than "top". As we only have one preferred position, this works
  fine for us. If you change it, be sure to measure the performance impact.

  The other functions and objects were separated as good practice to
  prevent React seeing them as new functions/objects on renders which
  can often be an issue with anonymous functions/object
  */
  const popoverPosition = "top";
  function onClickOutside(): void {
    setPopoverOpen(false);
  }

  if (popoverOpen && props.tooltip) {
    const resolvedTooltip = resolveTooltip(props);
    const popoverContent = (): JSX.Element => {
      return <div className={classes.Tooltip}>{resolvedTooltip}</div>;
    };
    return (
      <Popover
        isOpen={popoverOpen}
        position={popoverPosition}
        onClickOutside={onClickOutside}
        content={popoverContent}
      >
        <div
          onMouseDown={mouseDown}
          onMouseUp={mouseUp}
          className={activeClasses}
          style={style}
        >
          {props.children}
        </div>
      </Popover>
    );
  } else {
    return (
      <div
        onMouseDown={mouseDown}
        onMouseUp={mouseUp}
        className={activeClasses}
        style={style}
      >
        {props.children}
      </div>
    );
  }
};
