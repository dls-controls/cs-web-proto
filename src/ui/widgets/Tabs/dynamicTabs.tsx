import React, { useState, useEffect } from "react";

import { Widget } from "../widget";
import { WidgetPropType } from "../widgetProps";
import { registerWidget } from "../register";
import {
  InferWidgetProps,
  StringOrNumPropOpt,
  BorderPropOpt,
  ColorPropOpt,
  StringProp
} from "../propTypes";
import { EmbeddedDisplay } from "../EmbeddedDisplay/embeddedDisplay";
import { RelativePosition } from "../../../types/position";
import { ActionButton } from "../ActionButton/actionButton";
import { CLOSE_TAB } from "../widgetActions";
import { Color } from "../../../types/color";

import classes from "./navigationTabs.module.css";
import { useHistory } from "react-router-dom";
import { getUrlInfoFromHistory } from "../urlControl";

export const DynamicTabsProps = {
  routePath: StringProp,
  maxHeight: StringOrNumPropOpt,
  maxWidth: StringOrNumPropOpt,
  minHeight: StringOrNumPropOpt,
  border: BorderPropOpt,
  backgroundColor: ColorPropOpt
};

export const DynamicTabsComponent = (
  props: InferWidgetProps<typeof DynamicTabsProps>
): JSX.Element => {
  const history = useHistory();
  const currentUrlInfo = getUrlInfoFromHistory(history);
  const [childIndex, setIndex] = useState(0);

  const tabs = currentUrlInfo[props.routePath] ?? {};

  const children = Object.values(tabs).map((child, index) => (
    <EmbeddedDisplay
      position={new RelativePosition()}
      file={child?.filename + `.${child?.filetype}` || ""}
      filetype={child?.filetype || "json"}
      defaultProtocol="pva"
      macros={child?.macros}
      key={index}
    />
  ));

  useEffect(() => {
    setIndex(children.length - 1);
  }, [children.length]);

  return (
    <div>
      <div className={classes.Bar}>
        {Object.keys(tabs).map(
          (key, index): JSX.Element => (
            <button
              onClick={(): void => {
                setIndex(index);
              }}
              className={classes.Button}
              style={index === childIndex ? { borderStyle: "inset" } : {}}
              key={index}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>{key}</div>
                <ActionButton
                  position={new RelativePosition("40px")}
                  backgroundColor={Color.parse("#ff3333")}
                  foregroundColor={Color.parse("#ffffff")}
                  actions={{
                    executeAsOne: false,
                    actions: [
                      {
                        type: CLOSE_TAB,
                        closeTabInfo: {
                          tab: props.routePath,
                          page: key
                        }
                      }
                    ]
                  }}
                  text="X"
                />
              </div>
            </button>
          )
        )}
      </div>
      {children[childIndex]}
    </div>
  );
};

export const DynamicTabsWidgetProps = {
  ...DynamicTabsProps,
  ...WidgetPropType
};

export const DynamicTabs = (
  props: InferWidgetProps<typeof DynamicTabsWidgetProps>
): JSX.Element => <Widget baseWidget={DynamicTabsComponent} {...props} />;

registerWidget(DynamicTabs, DynamicTabsProps, "dynamictabs");
