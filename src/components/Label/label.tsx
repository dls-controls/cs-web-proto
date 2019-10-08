import React from "react";

import classes from "./label.module.css";

export const Label = (props: {
  text: string | number;
  style?: object;
}): JSX.Element => (
  // Simple component to display text - defaults to black text and dark grey background
  <div className={`Label ${classes.Label}`} style={props.style}>
    {props.text}
  </div>
);
