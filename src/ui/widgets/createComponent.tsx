/* eslint react/forbid-foreign-prop-types: 0, no-throw-literal: 0 */

import React from "react";
import log from "loglevel";
import checkPropTypes from "check-prop-types";

import { MacroMap } from "../../redux/csState";
import { Shape } from "./Shape/shape";

export interface WidgetDescription {
  type: string;
  // All other component properties
  [x: string]: any;
  children?: WidgetDescription[];
}

export function widgetDescriptionToComponent(
  // Converts a JS object matching a position description into React component
  // from the component dictionary provided. Also passes down a macro map which
  // can be overwritten. Uses recursion to generate children.
  widgetDescription: WidgetDescription,
  widgetDict: { [index: string]: React.FC<any> },
  existingMacroMap?: MacroMap,
  listIndex?: number
): JSX.Element {
  // Extract known properties and leave everything else in otherProps.
  // It's awkward to split this destructuring into separate let and const.
  // eslint-disable-next-line prefer-const
  let { backgroundColor, ...constProps } = widgetDescription;
  const {
    type,
    children = [],
    macroMap = {},
    position = undefined,
    x = undefined,
    y = undefined,
    height = undefined,
    width = undefined,
    margin = undefined,
    padding = undefined,
    border = undefined,
    minWidth = undefined,
    maxWidth = undefined,
    color = undefined,
    font = undefined,
    fontSize = undefined,
    fontWeight = undefined,
    textAlign = undefined,
    ...otherProps
  } = constProps;

  let Component: React.FC<any>;
  if (widgetDict.hasOwnProperty(type)) {
    Component = widgetDict[type];
  } else {
    log.warn(`Failed to load unknown widget type ${type}`);
    Component = Shape;
    backgroundColor = "magenta";
  }

  function filterUndefinedOut(input: {
    [index: string]: any;
  }): { [index: string]: any } {
    const output: { [index: string]: any } = {};
    let key;

    for (key in input) {
      if (input.hasOwnProperty(key) && input[key] !== undefined) {
        output[key] = input[key];
      }
    }

    return output;
  }

  // Group props into container and widget
  const containerStyling = filterUndefinedOut({
    position: position,
    x: x,
    y: y,
    height: height,
    width: width,
    margin: margin,
    padding: padding,
    border: border,
    minWidth: minWidth,
    maxWidth: maxWidth
  });

  const widgetStyling = filterUndefinedOut({
    color: color,
    font: font,
    fontSize: fontSize,
    fontWeight: fontWeight,
    textAlign: textAlign,
    backgroundColor: backgroundColor
  });

  // Perform checking on propTypes
  const widgetInfo = { containerStyling: containerStyling, ...otherProps };
  const error: string | undefined = checkPropTypes(
    Component.propTypes,
    widgetInfo,
    "widget description",
    Component.name,
    (): void => {
      log.debug("Got an error");
    }
  );
  if (error !== undefined) {
    throw {
      msg: error,
      object: {
        type: type,
        containerStyling: containerStyling,
        ...otherProps
      }
    };
  }

  // Collect macroMap passed into function and overwrite/add any
  // new values from the object macroMap
  const latestMacroMap = { ...existingMacroMap, ...macroMap };

  // Create all children components - recursive
  // Pass the latest macroMap down
  const ChildComponents = children.map(
    (child, index): JSX.Element =>
      widgetDescriptionToComponent(child, widgetDict, latestMacroMap, index)
  );
  // Return the node with children as children
  // Pass any extra props and macromap
  return (
    <Component
      // If this component has siblings, use its index in the array as a key.
      key={listIndex}
      containerStyling={containerStyling}
      widgetStyling={widgetStyling}
      macroMap={latestMacroMap}
      {...otherProps}
    >
      {ChildComponents}
    </Component>
  );
}