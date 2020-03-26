import React, { useContext } from "react";
import log from "loglevel";
import { Route } from "react-router-dom";
import { History } from "history";

import { Widget } from "../widget";
import { WidgetPropType } from "../widgetProps";
import { ActionButton } from "../ActionButton/actionButton";
import { CLOSE_PAGE } from "../widgetActions";
import { registerWidget } from "../register";
import { StringProp, InferWidgetProps } from "../propTypes";
import { BaseUrlContext } from "../../../baseUrl";
import { EmbeddedDisplay } from "../EmbeddedDisplay/embeddedDisplay";
import { Color } from "../../../types/color";
import { RelativePosition } from "../../../types/position";
import { getUrlInfoFromHistory, UrlPageDescription } from "../urlControl";

export function DynamicPageFetch(props: {
  history: History;
  routePath: string;
}): JSX.Element {
  const baseUrl = useContext(BaseUrlContext);
  const currentUrlInfo = getUrlInfoFromHistory(props.history);
  let pageDesc: UrlPageDescription;
  let file = "";
  let macros = {};
  try {
    pageDesc = currentUrlInfo[props.routePath];
    file = `${baseUrl}/json/${pageDesc.filename}.json`;
    macros = pageDesc.macros ?? {};
    // const file = `${baseUrl}/json/${match.params.json}.json`;
    // let map = {};
  } catch (error) {
    log.warn(currentUrlInfo);
    log.warn(error);
    return <div></div>;
  }

  return (
    <EmbeddedDisplay
      file={file}
      filetype="json"
      macroMap={macros}
      position={new RelativePosition()}
    />
  );
}

const DynamicPageProps = {
  routePath: StringProp
};

// Generic display widget to put other things inside
const DynamicPageComponent = (
  props: InferWidgetProps<typeof DynamicPageProps>
): JSX.Element => (
  <div style={{ width: "100%", height: "100%" }}>
    <Route
      render={(routeProps): JSX.Element => (
        <div>
          <div
            style={{
              position: "relative",
              height: "30px"
            }}
          >
            <div
              style={{
                position: "absolute",
                right: "5px",
                top: "5px",
                width: "40px",
                height: "20px",
                backgroundColor: "green"
              }}
            >
              <ActionButton
                position={new RelativePosition()}
                backgroundColor={Color.parse("#ff3333")}
                foregroundColor={Color.parse("#ffffff")}
                actions={{
                  executeAsOne: false,
                  actions: [
                    {
                      type: CLOSE_PAGE,
                      closePageInfo: {
                        page: props.routePath,
                        description: "Close"
                      }
                    }
                  ]
                }}
                pvName=""
                text="X"
              />
            </div>
          </div>
          <DynamicPageFetch {...routeProps} routePath={props.routePath} />
        </div>
      )}
    />
  </div>
);

const DynamicPageWidgetProps = {
  ...DynamicPageProps,
  ...WidgetPropType
};

export const DynamicPageWidget = (
  props: InferWidgetProps<typeof DynamicPageWidgetProps>
): JSX.Element => <Widget baseWidget={DynamicPageComponent} {...props} />;

registerWidget(DynamicPageWidget, DynamicPageWidgetProps, "dynamicpage");
