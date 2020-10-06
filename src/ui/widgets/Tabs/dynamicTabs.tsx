import React, { useContext } from "react";

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

import { FileContext } from "../../../fileContext";
import { TabBar } from "./tabs";

export const DynamicTabsProps = {
  location: StringProp,
  maxHeight: StringOrNumPropOpt,
  maxWidth: StringOrNumPropOpt,
  minHeight: StringOrNumPropOpt,
  border: BorderPropOpt,
  backgroundColor: ColorPropOpt
};

export const DynamicTabsComponent = (
  props: InferWidgetProps<typeof DynamicTabsProps>
): JSX.Element => {
  const fileContext = useContext(FileContext);
  const tabState = fileContext.tabState[props.location];
  if (!tabState || tabState.fileDetails.length === 0) {
    return (
      <div style={{ border: "1px solid black", minHeight: "50px" }}>
        <h3>Dynamic tabs &quot;{props.location}&quot;: no file loaded.</h3>
      </div>
    );
  } else {
    const openTabs = tabState.fileDetails;
    const selectedTab = tabState.selectedTab;

    // Using object map method found here: https://stackoverflow.com/questions/14810506/map-function-for-objects-instead-of-arrays
    const children = Object.fromEntries(
      Object.values(openTabs).map(([name, description]) => [
        name,
        <EmbeddedDisplay
          position={new RelativePosition()}
          file={{
            path: description?.path || "",
            type: description?.type || "json",
            defaultProtocol: description?.defaultProtocol ?? "ca",
            macros: description?.macros || {}
          }}
          key={name}
        />
      ])
    );
    const tabNames = openTabs.map(([name]) => name);
    const onTabSelected = (tabName: string): void => {
      fileContext.selectTab(props.location, tabName);
    };
    const onTabClosed = (tabName: string): void => {
      fileContext.removeTab(props.location, tabName);
    };

    return (
      <div>
        <TabBar
          tabNames={tabNames}
          selectedTab={selectedTab}
          onTabSelected={onTabSelected}
          onTabClosed={onTabClosed}
        ></TabBar>
        {children[selectedTab]}
      </div>
    );
  }
};

export const DynamicTabsWidgetProps = {
  ...DynamicTabsProps,
  ...WidgetPropType
};

export const DynamicTabs = (
  props: InferWidgetProps<typeof DynamicTabsWidgetProps>
): JSX.Element => <Widget baseWidget={DynamicTabsComponent} {...props} />;

registerWidget(DynamicTabs, DynamicTabsProps, "dynamictabs");
