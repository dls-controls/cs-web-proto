import { WidgetDescription } from "../createComponent";
import { GenericProp, Rule, Expression } from "../../../types/props";
import { ElementCompact, xml2js } from "xml-js";
import { widgets } from "../register";
import { WidgetActions, WRITE_PV, OPEN_WEBPAGE } from "../widgetActions";
import log from "loglevel";
import { MacroMap } from "../../../redux/csState";
import { Color } from "../../../types/color";
import { FontStyle, Font } from "../../../types/font";
import { StringOrNumProp, StringProp } from "../propTypes";
import { Border, BorderStyle } from "../../../types/border";
import { XmlDescription } from "./opiUtils";

const OPI_WIDGET_MAPPING: { [key: string]: any } = {
  "org.csstudio.opibuilder.Display": "display",
  "org.csstudio.opibuilder.widgets.TextUpdate": "readback",
  "org.csstudio.opibuilder.widgets.TextInput": "input",
  "org.csstudio.opibuilder.widgets.Label": "label",
  "org.csstudio.opibuilder.widgets.groupingContainer": "grouping",
  "org.csstudio.opibuilder.widgets.Rectangle": "shape",
  "org.csstudio.opibuilder.widgets.ActionButton": "actionbutton",
  "org.csstudio.opibuilder.widgets.MenuButton": "menubutton"
};

function opiParseString(jsonProp: ElementCompact): string {
  if (typeof jsonProp._text === "string") {
    return jsonProp._text;
  } else {
    throw new Error(`Could not parse text from value ${jsonProp._text}`);
  }
}

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

function opiParseColor(jsonProp: ElementCompact): Color {
  const color = jsonProp.color as OpiColor;
  return new Color(
    parseInt(color._attributes.red),
    parseInt(color._attributes.green),
    parseInt(color._attributes.blue)
  );
}

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

function opiParseMacros(jsonProp: ElementCompact): MacroMap {
  const macroMap: MacroMap = {};
  Object.entries(jsonProp as object).forEach(([key, value]): void => {
    macroMap[key] = value["_text"];
  });
  return macroMap;
}

const toArray = (element?: ElementCompact): ElementCompact[] => {
  let array = [];
  if (Array.isArray(element)) {
    array = element;
  } else if (element) {
    array = [element];
  }
  return array;
};

function opiParseActions(jsonProp: ElementCompact): WidgetActions {
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
            pvName: opiParsePvName(action.pv_name),
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

export const opiParseRules = (jsonProp: ElementCompact): Rule[] => {
  const ruleArray = toArray(jsonProp.rules.rule);
  const rules = ruleArray.map((ruleElement: ElementCompact) => {
    const name = ruleElement._attributes?.name as string;
    const xmlProp = ruleElement._attributes?.prop_id as string;

    const outExp = ruleElement._attributes?.out_exp === "true";
    const pvArray = toArray(ruleElement.pv);
    const pvs = pvArray.map((pv: ElementCompact) => {
      return {
        pvName: opiParsePvName(pv),
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
};

function opiParseNumber(jsonProp: ElementCompact): number {
  return Number(jsonProp._text);
}

function opiParsePixels(jsonProp: ElementCompact): string {
  return `${opiParseNumber(jsonProp)}px`;
}

function opiParsePvName(jsonProp: ElementCompact): string {
  const rawPv = opiParseString(jsonProp);
  if (rawPv.includes("://")) {
    return rawPv;
  } else {
    return `ca://${opiParseString(jsonProp)}`;
  }
}

function opiParseHorizonalAlignment(jsonProp: ElementCompact): string {
  const alignments: { [key: number]: string } = {
    0: "left",
    1: "center",
    2: "right"
  };
  return alignments[opiParseNumber(jsonProp)];
}

function opiParseBorder(props: any): Border {
  const borderStyles: { [key: number]: BorderStyle } = {
    0: BorderStyle.None
  };
  const style = borderStyles[opiParseNumber(props.border_style)];
  const width = opiParseNumber(props.border_width);
  const borderColor = opiParseColor(props.border_color);
  /* Line color can override border for certain widgets. */
  let lineColor;
  try {
    lineColor = opiParseColor(props.line_color);
  } catch {}
  const actualColor = width < 2 && lineColor ? lineColor : borderColor;
  const actualStyle = width < 2 && lineColor ? BorderStyle.Line : style;
  return new Border(actualStyle, actualColor, width);
}

function opiParseType(props: any): string {
  return OPI_WIDGET_MAPPING[props._attributes.typeId];
}

type ParserDict = {
  [key: string]: [string, (value: any) => GenericProp];
};

export const SIMPLE_PARSERS: ParserDict = {
  height: ["height", opiParsePixels],
  width: ["width", opiParsePixels],
  x: ["x", opiParsePixels],
  y: ["y", opiParsePixels],
  text: ["text", opiParseString],
  name: ["name", opiParseString],
  textAlign: ["horizontal_alignment", opiParseHorizonalAlignment],
  pvName: ["pv_name", opiParsePvName],
  backgroundColor: ["background_color", opiParseColor],
  foregroundColor: ["foreground_color", opiParseColor],
  precision: ["precision", opiParseNumber],
  visible: ["visible", opiParseBoolean],
  showUnits: ["show_units", opiParseBoolean],
  transparent: ["transparent", opiParseBoolean],
  font: ["font", opiParseFont],
  macros: ["macros", opiParseMacros],
  actions: ["actions", opiParseActions]
};

type ComplexParserDict = {
  [key: string]: (value: any) => GenericProp;
};

export const COMPLEX_PARSERS: ComplexParserDict = {
  type: opiParseType,
  rules: opiParseRules,
  border: opiParseBorder
};

/* Take an object representing a widget and return our widget description. */
export function genericParser(
  widget: any,
  targetWidget: any,
  simpleParsers: ParserDict,
  complexParsers: ComplexParserDict
): WidgetDescription {
  const newProps: any = { type: targetWidget };
  const allProps = {
    type: StringProp,
    x: StringOrNumProp,
    y: StringOrNumProp,
    height: StringOrNumProp,
    width: StringOrNumProp,
    /* Warning for using prop-types at runtime here. */
    ...targetWidget.propTypes
  };
  /* First, parse our props if we know how to. */
  for (const prop of Object.keys(allProps)) {
    log.debug(`Trying to parse prop ${prop}`);
    if (simpleParsers.hasOwnProperty(prop)) {
      log.debug(`simple parser for ${prop}`);
      const [opiPropName, propParser] = simpleParsers[prop];
      try {
        if (widget.hasOwnProperty(opiPropName)) {
          newProps[prop] = propParser(widget[opiPropName]);
          log.debug(`result ${newProps[prop]}`);
        }
      } catch (e) {
        log.error(`Could not convert prop ${prop}:`);
        log.error(widget[prop]);
        log.error(e);
      }
    }
    /* More complex props need access to the entire widget. */
    if (complexParsers.hasOwnProperty(prop)) {
      log.debug(`complex parser for ${prop}`);
      const propParser = complexParsers[prop];
      try {
        newProps[prop] = propParser(widget);
        log.debug(`result ${newProps[prop]}`);
      } catch (e) {
        log.error(`Could not convert prop ${prop}:`);
        log.error(e);
      }
    }
  }

  return newProps;
}

export function parseOpiWidget(props: any): WidgetDescription {
  const typeid = opiParseType(props);
  let targetWidget;
  try {
    targetWidget = widgets[typeid][0];
  } catch {
    targetWidget = widgets["shape"][0];
  }
  const widgetDescription = genericParser(
    props,
    targetWidget,
    SIMPLE_PARSERS,
    COMPLEX_PARSERS
  );
  widgetDescription.position = "absolute";
  /* Re-index simple parsers so we can find the correct one
     for the opi prop. */
  const opiPropParsers: ParserDict = {};
  Object.entries(SIMPLE_PARSERS).forEach(([jsonProp, vals]) => {
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
  /* Patch up local PVs? */
  /* Child widgets */
  const childWidgets = toArray(props.widget);
  widgetDescription.children = childWidgets.map((child: any) => {
    return parseOpiWidget(child);
  });
  return widgetDescription;
}

export function parseOpi(xmlString: string): any {
  // Convert it to a "compact format"
  const compactJSON = xml2js(xmlString, {
    compact: true
  }) as XmlDescription;
  // We don't care about the position of the top-level display widget.
  // We place it at 0,0 within its container.
  compactJSON.display.x = { _text: "0" };
  compactJSON.display.y = { _text: "0" };
  log.debug(compactJSON);

  return parseOpiWidget(compactJSON.display);
}
