import React, { useState } from "react";
import PropTypes from "prop-types";
import log from "loglevel";

import { Widget } from "../widget";
import { WidgetPropType } from "../widgetProps";
import { registerWidget } from "../register";
import {
  InferWidgetProps,
  StringOrNumPropOpt,
  BorderPropOpt,
  ColorPropOpt
} from "../propTypes";
import { errorWidget } from "../EmbeddedDisplay/embeddedDisplay";
import { parseJson } from "../EmbeddedDisplay/jsonParser";
import { widgetDescriptionToComponent } from "../createComponent";

import { TabBar } from "./tabs";

export const TabContainerProps = {
  tabs: PropTypes.objectOf(PropTypes.object).isRequired,
  maxHeight: StringOrNumPropOpt,
  maxWidth: StringOrNumPropOpt,
  minHeight: StringOrNumPropOpt,
  border: BorderPropOpt,
  backgroundColor: ColorPropOpt
};

export const TabContainerComponent = (
  props: InferWidgetProps<typeof TabContainerProps>
): JSX.Element => {
  const [childIndex, setIndex] = useState(0);

  // TODO: Find out if this repeated calculation can be done in the useMemo hook for measurable performance gains
  const children = Object.values(props.tabs).map((child, index) => {
    try {
      return widgetDescriptionToComponent(
        parseJson(JSON.stringify(child), "pva"),
        index
      );
    } catch (e) {
      const message = `Error transforming children into components`;
      log.error(message);
      log.error(e);
      log.error(e.msg);
      log.error(e.details);
      return widgetDescriptionToComponent(
        parseJson(JSON.stringify(errorWidget(message)), "pva"),
        index
      );
    }
  });

  const tabNames = Object.keys(props.tabs);
  const onTabSelected = (tabName: string): void => {
    setIndex(tabNames.indexOf(tabName));
  };

  return (
    <div>
      <TabBar
        tabNames={tabNames}
        selectedTab={tabNames[childIndex]}
        onTabSelected={onTabSelected}
      ></TabBar>
      {children[childIndex]}
    </div>
  );
};

export const TabContainerWidgetProps = {
  ...TabContainerProps,
  ...WidgetPropType
};

export const TabContainer = (
  props: InferWidgetProps<typeof TabContainerWidgetProps>
): JSX.Element => <Widget baseWidget={TabContainerComponent} {...props} />;

registerWidget(TabContainer, TabContainerProps, "tabcontainer");
