import React from "react";
import { PVWidget, PVWidgetInterface } from "../Widget/widget";
import classes from "./basicButton.module.css";
import { Link } from "react-router-dom";

export interface BasicButtonProps {
  text: string;
  style?: object;
  image?: string;
}

export const BasicButtonComponent = (props: BasicButtonProps): JSX.Element => {
  if (props.image !== undefined) {
    return (
      <Link to={'/dynamic/ionpExample/{"device":"SR03A-VA-IONP-01"}'}>
        <button className={classes.image}>
          <img src={props.image} alt={props.image}></img>
          <br></br>
          {props.text}
        </button>
      </Link>
    );
  } else {
    return <button>{props.text}</button>;
  }
};

export interface BasicButtonWidgetProps {
  text: string;
  style?: object;
  image?: string;
}

export const BasicButtonWidget = (
  props: BasicButtonWidgetProps
): JSX.Element => {
  return (
    <BasicButtonComponent
      text={props.text}
      style={props.style}
      image={props.image}
    />
  );
};

export const BasicButton = (
  props: BasicButtonWidgetProps & PVWidgetInterface
): JSX.Element => <PVWidget baseWidget={BasicButtonWidget} {...props} />;
