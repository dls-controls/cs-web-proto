/* A component to load files directly. */

import React, { useEffect, useState, useContext } from "react";
import log from "loglevel";

import {
  WidgetDescription,
  widgetDescriptionToComponent
} from "../createComponent";
import { Color } from "../../../types/color";
import { Font, FontStyle } from "../../../types/font";
import { MacroContext, MacroContextType } from "../../../types/macros";
import { RelativePosition, AbsolutePosition } from "../../../types/position";
import { WidgetPropType } from "../widgetProps";
import { registerWidget } from "../register";
import {
  StringProp,
  InferWidgetProps,
  ChoiceProp,
  MacrosPropOpt
} from "../propTypes";
import { BaseUrlContext } from "../../../baseUrl";
import { parseOpi } from "./opiParser";
import { parseJson } from "./jsonParser";
import { parseBob } from "./bobParser";

const EMPTY_WIDGET: WidgetDescription = {
  type: "shape",
  position: new AbsolutePosition("0", "0", "0", "0")
};

const ERROR_WIDGET: WidgetDescription = {
  type: "label",
  position: new RelativePosition(),
  font: new Font(16, FontStyle.Bold),
  backgroundColor: Color.RED,
  text: "Error"
};

function errorWidget(message: string): WidgetDescription {
  return {
    ...ERROR_WIDGET,
    text: message
  };
}

const EmbeddedDisplayProps = {
  ...WidgetPropType,
  file: StringProp,
  filetype: ChoiceProp(["json", "bob", "opi"]),
  defaultProtocol: StringProp,
  macros: MacrosPropOpt
};

export const EmbeddedDisplay = (
  props: InferWidgetProps<typeof EmbeddedDisplayProps>
): JSX.Element => {
  const [contents, setContents] = useState<string>("");
  const [renderedFile, setFile] = useState("");
  const baseUrl = useContext(BaseUrlContext);

  let file: string;
  if (!props.file.startsWith("http")) {
    file = `${baseUrl}/${props.filetype}/${props.file}`;
  } else {
    file = props.file;
  }

  // Using directly from React for testing purposes
  useEffect((): (() => void) => {
    // Will be set on the first render
    let mounted = true;
    if (file !== renderedFile) {
      fetch(file)
        .then(
          (response): Promise<any> => {
            return response.text();
          }
        )
        .then((text): void => {
          // Check component is still mounted when result comes back
          if (mounted) {
            setContents(text);
            setFile(file);
          }
        });
    }

    // Clean up function
    return (): void => {
      mounted = false;
    };
  });

  let component: JSX.Element;
  try {
    let description = EMPTY_WIDGET;
    if (contents !== "") {
      // Convert the contents to widget description style object
      switch (props.filetype) {
        case "bob":
          description = parseBob(contents, props.defaultProtocol);
          break;
        case "json":
          description = parseJson(contents, props.defaultProtocol);
          break;
        case "opi":
          description = parseOpi(contents, props.defaultProtocol);
          break;
      }
    }
    log.debug(description);

    // Apply the height to the top level if relative layout and none have been provided
    if (props.position instanceof RelativePosition) {
      props.position.height = props.position.height || description.height;
      props.position.width = props.position.width || description.width;
    }

    // Overflow set to scroll only if needed
    // If height or width is defined and is smaller than Bob
    const overflow =
      props.position instanceof AbsolutePosition &&
      (description.height > (props.position.height || 0) ||
        description.width > (props.position.width || 0))
        ? "scroll"
        : "visible";

    component = widgetDescriptionToComponent({
      type: "display",
      position: props.position,
      border: props.border,
      overflow: overflow,
      children: [description]
    });
  } catch (e) {
    const message = `Error converting file ${file} into components.`;
    log.error(message);
    log.error(e);
    log.error(e.msg);
    log.error(e.details);
    component = widgetDescriptionToComponent(errorWidget(message));
  }

  // Include and override parent macros with those from the prop.
  const parentMacros = useContext(MacroContext).macros;
  const embeddedDisplayMacros = props.macros ?? {};
  const embeddedDisplayMacroContext: MacroContextType = {
    // Currently not allowing changing the macros of an embedded display.
    updateMacro: (key: string, value: string): void => {},
    macros: {
      ...parentMacros, // lower priority
      ...embeddedDisplayMacros // higher priority
    }
  };

  return (
    <MacroContext.Provider value={embeddedDisplayMacroContext}>
      {component}
    </MacroContext.Provider>
  );
};

registerWidget(EmbeddedDisplay, EmbeddedDisplayProps, "embeddedDisplay");