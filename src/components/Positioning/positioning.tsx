import React from "react";
import log from "loglevel";
// @ts-ignore
import checkPropTypes from "check-prop-types";

import { MacroMap } from "../../redux/csState";
import { BaseWidgetInterface } from "../Widget/widget";

export interface WidgetDescription extends BaseWidgetInterface {
  type: string;
  // All other component properties
  [x: string]: any;
  children?: WidgetDescription[] | null;
}

export function widgetDescriptionToComponent(
  // Converts a JS object matching a position description into React component
  // from the component dictionary provided. Also passes down a macro map which
  // can be overwritten. Uses recursion to generate children.
  widgetDescription: WidgetDescription | null,
  widgetDict: { [index: string]: React.FC<any> },
  existingMacroMap: MacroMap
): JSX.Element | null {
  // If there is nothing here, return null
  if (widgetDescription === null) {
    return null;
  } else {
    // Extract named properties and leave everything else in otherProps
    let {
      type,
      children = null,
      macroMap = {},
      containerStyling,
      ...otherProps
    } = widgetDescription;

    // const LabelProps = {
    //   text: propTypes.oneOfType([propTypes.string, propTypes.number])
    //     .isRequired,
    //   widgetStyling: propTypes.object
    // };

    if (type === "label" || type === "readback") {
      // console.log("Got a label component");
      // console.log(otherProps);
      // console.log(widgetDict[type].propTypes);
      let widgetInfo = { containerStyling: containerStyling, ...otherProps };
      let error: string | undefined = checkPropTypes(
        widgetDict[type].propTypes,
        widgetInfo,
        "widget description",
        type,
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
    }

    // Collect macroMap passed into function and overwrite/add any
    // new values from the object macroMap
    const latestMacroMap = { ...existingMacroMap, ...macroMap };

    // Create the main component
    let Component = widgetDict[type];

    // Create all children components - recursive
    // Pass the latest macroMap down
    let ChildComponents = null;
    if (children) {
      ChildComponents = children.map((child): JSX.Element | null =>
        widgetDescriptionToComponent(child, widgetDict, latestMacroMap)
      );
    } else {
      ChildComponents = null;
    }

    // Return the node with children as children
    // Pass any extra props and macromap
    return (
      <Component
        containerStyling={containerStyling}
        macroMap={latestMacroMap}
        {...otherProps}
      >
        {ChildComponents}
      </Component>
    );
  }
}
