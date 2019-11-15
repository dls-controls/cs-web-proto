// Special-case filename App.tsx is permitted.
/* eslint unicorn/filename-case: 0 */ // --> OFF

import React from "react";
import "./App.css";
import { Provider } from "react-redux";
import { BrowserRouter, Link, Route } from "react-router-dom";
import { getStore, initialiseStore } from "./redux/store";
import log from "loglevel";
import { FrontPage } from "./pages/frontpage";
import { ExamplePage } from "./pages/examplePage";
import { ProgressPage } from "./pages/progressPage";
import { PositioningExamplePage } from "./pages/positioningExamplePage";
import { JsonPage } from "./pages/fromJson";
import { ConiqlPage } from "./pages/coniqlPage";
import { MacrosPage } from "./pages/macrosPage";
import { lightTheme, darkTheme, ThemeContext } from "./themeContext";
import { FlexExamplePage } from "./pages/flexExamplePage";
import { EmbeddedPage } from "./pages/embeddedPage";
import { ShapesPage } from "./pages/shapesPage";

import { SimulatorPlugin } from "./connection/sim";
import { DynamicPage } from "./pages/dynamicPage";
import { ConiqlPlugin } from "./connection/coniql";
import { ConnectionForwarder } from "./connection/forwarder";

import { WidgetFromJson } from "./components/FromJson/fromJson";

var settings: any;
try {
  // Use require so that we can catch this error
  settings = require("./settings");
} catch (e) {
  settings = {};
}

log.setLevel("warn");

function applyTheme(theme: any): void {
  Object.keys(theme).forEach(function(key): void {
    const value = theme[key];
    document.documentElement.style.setProperty(key, value);
  });
}

const App: React.FC = (): JSX.Element => {
  const simulator = new SimulatorPlugin();
  var coniql;
  if (settings.coniqlSocket !== undefined) {
    coniql = new ConiqlPlugin(settings.coniqlSocket);
  } else {
    coniql = undefined;
  }
  const fallbackPlugin = simulator;
  const plugin = new ConnectionForwarder([
    ["sim://", simulator],
    ["loc://", simulator],
    ["pva://", coniql],
    ["", fallbackPlugin]
  ]);
  initialiseStore(plugin);
  const store = getStore();
  const { toggle, dark } = React.useContext(ThemeContext);
  applyTheme(dark ? darkTheme : lightTheme);

  const styleLinkButton = {
    margin: "10px 10px"
  };

  return (
    <BrowserRouter>
      <Provider store={store}>
        <div className="App">
          <button type="button" onClick={toggle}>
            Toggle Theme
          </button>
          <div className="top" id="Links">
            <WidgetFromJson
              file="http://localhost:3000/shapesPage.json"
              containerStyling={{
                position: "relative",
                height: "",
                width: "",
                margin: "",
                padding: ""
              }}
            />
            <Link style={styleLinkButton} to="/">
              Home
            </Link>
            <Link style={styleLinkButton} to="/example">
              Simple example
            </Link>
            <Link style={styleLinkButton} to="/progress">
              Progress
            </Link>
            <Link style={styleLinkButton} to="/positioning">
              Positioning
            </Link>
            <Link style={styleLinkButton} to="/macros">
              Macros
            </Link>
            <Link style={styleLinkButton} to="/fromJson">
              JSON Loading
            </Link>
            <Link style={styleLinkButton} to="/coniql">
              Coniql
            </Link>
            <Link style={styleLinkButton} to="/flex">
              Flex
            </Link>
            <Link style={styleLinkButton} to="/embed">
              Embed
            </Link>{" "}
            <Link style={styleLinkButton} to="/shapes">
              Shapes
            </Link>
            <Link
              style={styleLinkButton}
              to={'/example/ionpExample/{"device":"SR03A-VA-IONP-01"}'}
            >
              Nested
            </Link>
            <Link style={styleLinkButton} to="/graphics">
              Graphics
            </Link>
          </div>
          <div className="primary">
            <Route path="/" exact component={FrontPage} />
            <Route path="/example" component={ExamplePage} />
            <Route path="/progress" component={ProgressPage} />
            <Route
              path="/positioning"
              exact
              component={PositioningExamplePage}
            />
            <Route path="/macros" exact component={MacrosPage} />
            <Route path="/fromJson" exact component={JsonPage} />
            <Route path="/coniql" exact component={ConiqlPage} />
            <Route path="/flex" exact component={FlexExamplePage} />
            <Route path="/embed" exact component={EmbeddedPage} />
          </div>
          <div className="secondary">
            <Route path="/:any/:json/:macros" exact component={DynamicPage} />
            <Route path="/shapes" exact component={ShapesPage} />
          </div>
        </div>
      </Provider>
    </BrowserRouter>
  );
};

export default App;
