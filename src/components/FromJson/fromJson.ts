import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import log from "loglevel";

import {
  widgetDescriptionToComponent,
  WidgetDescription
} from "../Positioning/positioning";
import { MacroMap } from "../../redux/csState";
import { Label } from "../Label/label";
import { Readback } from "../Readback/readback";
import { Input } from "../Input/input";
import { Shape } from "../Shape/shape";
import { FlexContainer } from "../FlexContainer/flexContainer";
import { ProgressBar } from "../ProgressBar/progressBar";
import { SlideControl } from "../SlideControl/slideControl";
import { MenuButton } from "../MenuButton/menuButton";
import { Display } from "../Display/display";
import { ActionButton } from "../ActionButton/actionButton";
import { DynamicPageWidget } from "../DynamicPage/dynamicPage";
import { WidgetFromBob } from "../FromBob/fromBob";
import { GroupingContainer } from "../GroupingContainer/groupingContainer";
import { WidgetPropType, InferWidgetProps } from "../Widget/widget";
import { resolve } from "dns";

const EMPTY_WIDGET: WidgetDescription = {
  type: "empty",
  containerStyling: { position: "absolute", x: 0, y: 0, width: 0, height: 0 }
};

const ERROR_WIDGET: WidgetDescription = {
  type: "label",
  containerStyling: { position: "relative" },
  widgetStyling: {
    fontWeight: "bold",
    backgroundColor: "red"
  },
  text: "Error"
};

const WidgetFromJsonProps = {
  file: PropTypes.string.isRequired,
  ...WidgetPropType
};

export const WidgetFromJson = (
  props: InferWidgetProps<typeof WidgetFromJsonProps>
): JSX.Element | null => {
  const [json, setJson] = useState<WidgetDescription>(EMPTY_WIDGET);
  const [renderedFile, setFile] = useState("");
  const [currentMacros, setMacros] = useState<MacroMap>({});

  // Extract props
  let { file, macroMap } = props;

  if (file !== renderedFile) {
    fetch(file)
      .then(x => new Promise(resolve => setTimeout(() => resolve(x), 5000)))
      .then(
        (response): Promise<any> => {
          return (response as Response).json();
        }
      )
      .then((json): void => {
        // Check component is still mounted when result comes back

        setJson(json);
        setFile(file);
        setMacros(macroMap as MacroMap);
      });
  }

  if (macroMap !== currentMacros) {
    setMacros(macroMap as MacroMap);
  }

  const widgetDict = {
    readback: Readback,
    shape: Shape,
    input: Input,
    label: Label,
    progressbar: ProgressBar,
    slidecontrol: SlideControl,
    menubutton: MenuButton,
    flexcontainer: FlexContainer,
    actionbutton: ActionButton,
    display: Display,
    empty: Display,
    widgetFromJSON: WidgetFromJson,
    dynamicpage: DynamicPageWidget,
    widgetFromBob: WidgetFromBob,
    grouping: GroupingContainer
  };

  let component: JSX.Element | null;
  try {
    component = widgetDescriptionToComponent(json, widgetDict, currentMacros);
  } catch (e) {
    log.error(`Error converting JSON into components in ${file}`);
    log.error(e.msg);
    log.error(e.object);
    component = widgetDescriptionToComponent(
      ERROR_WIDGET,
      widgetDict,
      currentMacros
    );
  }

  return component;
};

WidgetFromJson.propTypes = WidgetFromJsonProps;
