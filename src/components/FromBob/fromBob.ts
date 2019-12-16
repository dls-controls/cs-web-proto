/* Provide the same component as fromJson but converting bob files and
providing a useful widget dictionary */

import React, { useState } from "react";
import log from "loglevel";

import {
  WidgetDescription,
  widgetDescriptionToComponent
} from "../Positioning/positioning";
import { MacroMap } from "../../redux/csState";
import { Label } from "../Label/label";
import { Readback } from "../Readback/readback";
import { Input } from "../Input/input";
import { Display } from "../Display/display";
import { Shape } from "../Shape/shape";
import { GroupingContainer } from "../GroupingContainer/groupingContainer";
import { WidgetPropType } from "../Widget/widget";
import {
  convertBobToWidgetDescription,
  bobParseBoolean,
  bobParsePrecision,
  bobParseColor,
  bobParseMacros,
  bobParseActions
} from "./bobConversionUtils";
import { ActionButton } from "../ActionButton/actionButton";
import { registerWidget } from "../register";
import { StringProp, InferWidgetProps } from "../propTypes";

const EMPTY_WIDGET: WidgetDescription = {
  type: "empty",
  position: "absolute",
  x: 0,
  y: 0,
  width: 0,
  height: 0
};

const ERROR_WIDGET: WidgetDescription = {
  type: "label",
  position: "relative",
  fontWeight: "bold",
  backgroundColor: "red",
  text: "Error"
};

const WidgetFromBobProps = {
  file: StringProp,
  ...WidgetPropType
};

export const WidgetFromBob = (
  props: InferWidgetProps<typeof WidgetFromBobProps>
): JSX.Element => {
  const [bob, setBob] = useState<string>("");
  const [renderedFile, setFile] = useState("");
  const [currentMacros, setMacros] = useState<MacroMap>({});

  // Extract props
  const { file, macroMap } = props;

  // Using directly from React for testing purposes
  React.useEffect((): (() => void) => {
    // Will be set on the first render
    let mounted = true;
    if (file !== renderedFile) {
      fetch(file)
        .then(
          (response): Promise<any> => {
            return response.text();
          }
        )
        .then((bob): void => {
          // Check component is still mounted when result comes back
          if (mounted) {
            setBob(bob);
            setFile(file);
            setMacros(macroMap as MacroMap);
          }
        });
    }

    // Clean up function
    return (): void => {
      mounted = false;
    };
  });

  if (macroMap !== currentMacros) {
    setMacros(macroMap as MacroMap);
  }

  const widgetDict = {
    textupdate: Readback,
    "org.csstudio.opibuilder.widgets.TextUpdate": Readback,
    textentry: Input,
    "org.csstudio.opibuilder.widgets.TextInput": Input,
    label: Label,
    "org.csstudio.opibuilder.widgets.Label": Label,
    group: GroupingContainer,
    "org.csstudio.opibuilder.widgets.groupingContainer": GroupingContainer,
    display: Display,
    rectangle: Shape,
    "org.csstudio.opibuilder.widgets.Rectangle": Shape,
    action_button: ActionButton, // eslint-disable-line @typescript-eslint/camelcase
    "org.csstudio.opibuilder.widgets.ActionButton": ActionButton,
    "org.csstudio.opibuilder.widgets.BoolButton": Shape,
    empty: Display,
    widgetFromBob: WidgetFromBob
  };

  const functionSubstitutions = {
    macros: bobParseMacros,
    background_color: bobParseColor, // eslint-disable-line @typescript-eslint/camelcase
    foreground_color: bobParseColor, // eslint-disable-line @typescript-eslint/camelcase
    precision: bobParsePrecision,
    visible: bobParseBoolean,
    transparent: bobParseBoolean,
    actions: bobParseActions
  };

  const keySubstitutions = {
    pv_name: "pvName", // eslint-disable-line @typescript-eslint/camelcase
    macros: "macroMap",
    opi_file: "file", // eslint-disable-line @typescript-eslint/camelcase
    background_color: "backgroundColor", // eslint-disable-line @typescript-eslint/camelcase
    foreground_color: "color", // eslint-disable-line @typescript-eslint/camelcase
    // Rename style prop to make sure it isn't used directly to style components.
    style: "bobStyle" // eslint-disable-line @typescript-eslint/camelcase
  };

  let component: JSX.Element;
  try {
    let bobDescription;
    if (bob === "") {
      bobDescription = EMPTY_WIDGET;
    } else {
      // Convert the bob to widget description style object
      bobDescription = convertBobToWidgetDescription(
        bob,
        functionSubstitutions,
        keySubstitutions
      );
    }
    log.info(bobDescription);

    // Apply the Bob height to the top level if relative layout and none have been provided
    if (props.containerStyling.position === "relative") {
      props.containerStyling.height =
        props.containerStyling.height || bobDescription.height;
      props.containerStyling.width =
        props.containerStyling.width || bobDescription.width;
    }

    // Overflow set to scroll only if needed
    // If height or width is defined and is smaller than Bob
    const overflow =
      props.containerStyling.position === "absolute" &&
      (bobDescription.height > (props.containerStyling.height || 0) ||
        bobDescription.width > (props.containerStyling.width || 0))
        ? "scroll"
        : "visible";

    component = widgetDescriptionToComponent(
      {
        type: "display",
        containerStyling: props.containerStyling,
        widgetStyling: props.widgetStyling,
        overflow: overflow,
        children: [bobDescription]
      },
      widgetDict,
      macroMap
    );
  } catch (e) {
    log.error(`Error converting Bob into components in ${file}`);
    log.error(e);
    log.error(e.msg);
    log.error(e.object);
    component = widgetDescriptionToComponent(
      ERROR_WIDGET,
      widgetDict,
      macroMap
    );
  }

  return component;
};

registerWidget(WidgetFromBob, WidgetFromBobProps, "widgetFromBob");
