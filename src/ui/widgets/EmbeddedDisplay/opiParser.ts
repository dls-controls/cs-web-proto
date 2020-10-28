import log from "loglevel";
import { ElementCompact, xml2js } from "xml-js";
import { Rule, Expression } from "../../../types/props";
import { WidgetActions, WRITE_PV, OPEN_WEBPAGE } from "../widgetActions";
import { MacroMap } from "../../../types/macros";
import { Color } from "../../../types/color";
import { FontStyle, Font } from "../../../types/font";
import { Border, BorderStyle } from "../../../types/border";
import {
  Position,
  AbsolutePosition,
  RelativePosition
} from "../../../types/position";
import {
  ComplexParserDict,
  ParserDict,
  parseWidget,
  toArray,
  PatchFunction
} from "./parser";
import { REGISTERED_WIDGETS } from "../register";
import { WidgetDescription } from "../createComponent";
import { PV } from "../../../types/pv";

export interface XmlDescription {
  _attributes: { [key: string]: string };
  x?: { _text: string };
  y?: { _text: string };
  height?: { _text: string };
  width?: { _text: string };
  widget?: XmlDescription;
  [key: string]: any;
}

/**
 * maps a widget typeId specified in an opi file to a corresponding registered
 * widget name
 */
const OPI_WIDGET_MAPPING: { [key: string]: any } = {
  "org.csstudio.opibuilder.Display": "display",
  "org.csstudio.opibuilder.widgets.TextUpdate": "readback",
  "org.csstudio.opibuilder.widgets.TextInput": "input",
  "org.csstudio.opibuilder.widgets.Label": "label",
  "org.csstudio.opibuilder.widgets.groupingContainer": "grouping",
  "org.csstudio.opibuilder.widgets.Rectangle": "shape",
  "org.csstudio.opibuilder.widgets.ActionButton": "actionbutton",
  "org.csstudio.opibuilder.widgets.MenuButton": "menubutton",
  "org.csstudio.opibuilder.widgets.symbol.multistate.MultistateMonitorWidget":
    "symbol",
  "org.csstudio.opibuilder.widgets.LED": "led"
};

/**
 * Attempts to return the text from a json property, otherwise throws an error
 * @param jsonProp
 */
function opiParseString(jsonProp: ElementCompact): string {
  if (typeof jsonProp._text === "string") {
    return jsonProp._text;
  } else {
    throw new Error(`Could not parse text from value ${jsonProp._text}`);
  }
}

/**
 * Attempts to return a boolean from the text representation of a boolean
 * on a json property, otherwise throws an error
 * @param jsonProp
 */
function opiParseBoolean(jsonProp: ElementCompact): boolean {
  const boolText = jsonProp._text;
  if (boolText === "false") {
    return false;
  } else if (boolText === "true") {
    return true;
  } else {
    throw new Error(`Could not parse boolean from value ${boolText}`);
  }
}

export interface OpiColor {
  _attributes: { name: string; red: string; blue: string; green: string };
}

/**
 * Returns a Color object from a json property
 * @param jsonProp
 */
export function opiParseColor(jsonProp: ElementCompact): Color {
  const color = jsonProp.color as OpiColor;
  return Color.fromRgba(
    parseInt(color._attributes.red),
    parseInt(color._attributes.green),
    parseInt(color._attributes.blue)
  );
}

/**
 * Returns a Font object extracted from a json property
 * @param jsonProp
 */
export function opiParseFont(jsonProp: ElementCompact): Font {
  const opiStyles: { [key: number]: FontStyle } = {
    0: FontStyle.Regular,
    1: FontStyle.Bold,
    2: FontStyle.Italic,
    3: FontStyle.BoldItalic
  };
  let fontAttributes;
  if (jsonProp.hasOwnProperty("fontdata")) {
    fontAttributes = jsonProp["fontdata"]._attributes;
  } else {
    fontAttributes = jsonProp["opifont.name"]._attributes;
  }
  const { fontName, height, style } = fontAttributes;
  return new Font(height, opiStyles[style], fontName);
}

/**
 * Returns a macro map from a json object
 * @param jsonProp
 */
function opiParseMacros(jsonProp: ElementCompact): MacroMap {
  const macroMap: MacroMap = {};
  Object.entries(jsonProp as object).forEach(([key, value]): void => {
    macroMap[key] = value["_text"];
  });
  return macroMap;
}

/**
 * Creates a WidgetActions object from the actions tied to the json object
 * @param jsonProp
 * @param defaultProtocol
 */
export function opiParseActions(
  jsonProp: ElementCompact,
  defaultProtocol: string
): WidgetActions {
  const actionsToProcess = toArray(jsonProp.action);

  // Extract information about whether to execute all actions at once
  const executeAsOne = jsonProp._attributes?.execute_as_one === "true";

  // Turn into an array of Actions
  const processedActions: WidgetActions = {
    executeAsOne: executeAsOne,
    actions: []
  };

  actionsToProcess.forEach((action): void => {
    log.debug(action);
    const type = action._attributes?.type;
    try {
      if (type === WRITE_PV) {
        processedActions.actions.push({
          type: WRITE_PV,
          writePvInfo: {
            pvName: opiParsePvName(
              action.pv_name,
              defaultProtocol
            ).qualifiedName(),
            value: action.value._text,
            description:
              (action.description && action.description._text) || undefined
          }
        });
      } else if (type === OPEN_WEBPAGE) {
        processedActions.actions.push({
          type: OPEN_WEBPAGE,
          openWebpageInfo: {
            url: action.hyperlink._text,
            description:
              (action.description && action.description._text) || undefined
          }
        });
      }
    } catch (e) {
      log.error(
        `Could not find action of type ${type} in available actions to convert`
      );
    }
  });

  return processedActions;
}

/**
 * Returns a rules object from a json element
 * @param jsonProp
 * @param defaultProtocol
 */
export const opiParseRules = (
  jsonProp: ElementCompact,
  defaultProtocol: string
): Rule[] => {
  if (!jsonProp.rules) {
    return [];
  } else {
    const ruleArray = toArray(jsonProp.rules.rule);
    const rules = ruleArray.map((ruleElement: ElementCompact) => {
      const name = ruleElement._attributes?.name as string;
      const xmlProp = ruleElement._attributes?.prop_id as string;

      const outExp = ruleElement._attributes?.out_exp === "true";
      const pvArray = toArray(ruleElement.pv);
      const pvs = pvArray.map((pv: ElementCompact) => {
        return {
          pvName: opiParsePvName(pv, defaultProtocol),
          trigger: pv._attributes?.trig === "true"
        };
      });
      const expArray = toArray(ruleElement.exp);
      const expressions = expArray.map((expression: ElementCompact) => {
        const value = expression.value;
        return {
          boolExp: expression._attributes?.bool_exp as string,
          value: value
        };
      });
      return {
        name: name,
        prop: xmlProp,
        outExp: outExp,
        expressions: expressions,
        pvs: pvs
      };
    });
    return rules;
  }
};

/**
 * Creates a Number object from a json properties object
 * @param jsonProp
 */
function opiParseNumber(jsonProp: ElementCompact): number {
  return Number(jsonProp._text);
}

/**
 * Creates a new PV object after extracting the pvName from the json object
 * @param jsonProp
 * @param defaultProtocol
 */
export function opiParsePvName(
  jsonProp: ElementCompact,
  defaultProtocol: string
): PV {
  const rawPv = opiParseString(jsonProp);
  return PV.parse(rawPv, defaultProtocol);
}

/**
 * Converts an alignment number present in the json properties, into
 * a string e.g. "left", "center", "right"
 * @param jsonProp
 */
function opiParseHorizontalAlignment(jsonProp: ElementCompact): string {
  const alignments: { [key: number]: string } = {
    0: "left",
    1: "center",
    2: "right"
  };
  return alignments[opiParseNumber(jsonProp)];
}

/**
 * Creates a new Border object
 * @param props
 */
function opiParseBorder(props: any): Border {
  const borderStyles: { [key: number]: BorderStyle } = {
    0: BorderStyle.None,
    1: BorderStyle.Line,
    2: BorderStyle.Dashed,
    3: BorderStyle.Dotted,
    4: BorderStyle.GroupBox
  };
  let style = BorderStyle.None;
  let width = 0;
  let borderColor = Color.BLACK;
  /* Line color can override border for certain widgets. */
  let lineColor;
  try {
    style = borderStyles[opiParseNumber(props.border_style)];
    width = opiParseNumber(props.border_width);
    borderColor = opiParseColor(props.border_color);
    lineColor = opiParseColor(props.line_color);
  } catch {
    // If we can't parse these, assume the defaults.
  }
  const actualColor = width < 2 && lineColor ? lineColor : borderColor;
  const actualStyle = width < 2 && lineColor ? BorderStyle.Line : style;
  return new Border(actualStyle, actualColor, width);
}

/**
 * Converts a typeId into a registered component name using the
 * OPI_WIDGET_MAPPING object
 * @param props
 */
function opiParseType(props: any): string {
  const typeId = props._attributes.typeId;
  if (OPI_WIDGET_MAPPING.hasOwnProperty(typeId)) {
    return OPI_WIDGET_MAPPING[typeId];
  } else {
    return typeId;
  }
}

/**
 * Parses a props object into AbsolutePosition object
 * @param props
 */
function opiParsePosition(props: any): Position {
  const { x, y, width, height } = props;
  try {
    return new AbsolutePosition(
      `${opiParseNumber(x)}px`,
      `${opiParseNumber(y)}px`,
      `${opiParseNumber(width)}px`,
      `${opiParseNumber(height)}px`
    );
  } catch (error) {
    const msg = `Failed to parse position (${x},${y},${width},${height}): ${error}`;
    throw new Error(msg);
  }
}

/**
 * Parses a props object to extract the filename (NOT THE PATH) of an
 * image file
 * @param props
 */
function opiParseImageFile(props: any): string {
  const splitDirectory = opiParseString(props).split("/");
  const filename = splitDirectory[splitDirectory.length - 1];
  return filename;
}

/**
 * Attempt to return the widget associated with a props object, failing
 * that will return a shape object
 * @param props
 */
function opiGetTargetWidget(props: any): React.FC {
  const typeid = opiParseType(props);
  let targetWidget;
  try {
    targetWidget = REGISTERED_WIDGETS[typeid][0];
  } catch {
    targetWidget = REGISTERED_WIDGETS["shape"][0];
  }
  return targetWidget;
}

/**
 * Simple object types, with the name they appear under in the .opi file
 * and the parsing function to use
 */
export const OPI_SIMPLE_PARSERS: ParserDict = {
  text: ["text", opiParseString],
  name: ["name", opiParseString],
  textAlign: ["horizontal_alignment", opiParseHorizontalAlignment],
  backgroundColor: ["background_color", opiParseColor],
  foregroundColor: ["foreground_color", opiParseColor],
  precision: ["precision", opiParseNumber],
  precisionFromPv: ["precision_from_pv", opiParseBoolean],
  visible: ["visible", opiParseBoolean],
  showUnits: ["show_units", opiParseBoolean],
  transparent: ["transparent", opiParseBoolean],
  font: ["font", opiParseFont],
  macroMap: ["macros", opiParseMacros],
  src: ["image_file", opiParseImageFile],
  showLabel: ["show_boolean_label", opiParseBoolean],
  stretchToFit: ["stretch_to_fit", opiParseBoolean],
  alarmSensitive: ["border_alarm_sensitive", opiParseBoolean],
  lineWidth: ["line_width", opiParseNumber],
  width: ["width", opiParseNumber],
  height: ["height", opiParseNumber],
  rotation: ["degree", opiParseNumber],
  flipHorizontal: ["flip_horizontal", opiParseBoolean],
  flipVertical: ["flip_vertical", opiParseBoolean]
};

/**
 * Complex object types, with the parsing function to use, no name
 * like t he simple parser object because they do not have one name
 * in the .opi file
 */
export const OPI_COMPLEX_PARSERS: ComplexParserDict = {
  type: opiParseType,
  position: opiParsePosition,
  border: opiParseBorder
};

function opiPatchRules(widgetDescription: WidgetDescription): void {
  /* Re-index simple parsers so we can find the correct one
     for the opi prop. */
  const opiPropParsers: ParserDict = {};
  Object.entries(OPI_SIMPLE_PARSERS).forEach(([jsonProp, vals]) => {
    opiPropParsers[vals[0]] = [jsonProp, vals[1]];
  });
  /* Patch up the rules by converting the prop to our name
     and converting the value to the correct type. */
  widgetDescription.rules?.forEach((rule: Rule) => {
    if (opiPropParsers.hasOwnProperty(rule.prop)) {
      const [newPropName, parser] = opiPropParsers[rule.prop];
      rule.prop = newPropName;
      rule.expressions.forEach((expression: Expression) => {
        const convertedValue = parser(expression.value);
        expression.convertedValue = convertedValue;
      });
    }
  });
}

export const OPI_PATCHERS: PatchFunction[] = [opiPatchRules];

export function parseOpi(
  xmlString: string,
  defaultProtocol: string
): WidgetDescription {
  // Convert it to a "compact format"
  const compactJSON = xml2js(xmlString, {
    compact: true
  }) as XmlDescription;
  // We don't care about the position of the top-level display widget.
  // We place it at 0,0 within its container.
  compactJSON.display.x = { _text: "0" };
  compactJSON.display.y = { _text: "0" };
  log.debug(compactJSON);

  const simpleParsers: ParserDict = {
    ...OPI_SIMPLE_PARSERS,
    pvName: [
      "pv_name",
      (pvName: ElementCompact): PV => opiParsePvName(pvName, defaultProtocol)
    ],
    actions: [
      "actions",
      (actions: ElementCompact): WidgetActions =>
        opiParseActions(actions, defaultProtocol)
    ]
  };

  const complexParsers = {
    ...OPI_COMPLEX_PARSERS,
    rules: (rules: Rule[]): Rule[] => opiParseRules(rules, defaultProtocol)
  };

  log.debug(compactJSON.display);

  const displayWidget = parseWidget(
    compactJSON.display,
    opiGetTargetWidget,
    "widget",
    simpleParsers,
    complexParsers,
    false,
    OPI_PATCHERS
  );

  displayWidget.position = new RelativePosition(
    displayWidget.position.width,
    displayWidget.position.height
  );
  return displayWidget;
}
