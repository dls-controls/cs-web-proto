// Special-case filename App.tsx is permitted.
/* eslint unicorn/filename-case: 0 */ // --> OFF

import React from "react";
import "./App.css";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { getStore, initialiseStore } from "./redux/store";
import log from "loglevel";
import { lightTheme, darkTheme, ThemeContext } from "./themeContext";
import { SimulatorPlugin } from "./connection/sim";
import { ConiqlPlugin } from "./connection/coniql";
import { ConnectionForwarder } from "./connection/forwarder";
import { DynamicPageWidget } from "./components/DynamicPage/dynamicPage";
import { Connection } from "./connection/plugin";
import { ActionButton } from "./components/";
import { OPEN_PAGE } from "./widgetActions";

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
  const simulator = new SimulatorPlugin(100);
  const fallbackPlugin = simulator;
  const plugins: [string, Connection][] = [
    ["sim://", simulator],
    ["loc://", simulator],
    ["", fallbackPlugin]
  ];
  if (settings.coniqlSocket !== undefined) {
    const coniql = new ConiqlPlugin(settings.coniqlSocket);
    plugins.unshift(["pva://", coniql]);
  }
  const plugin = new ConnectionForwarder(plugins);
  initialiseStore(plugin);
  const store = getStore();
  const { toggle, dark } = React.useContext(ThemeContext);
  applyTheme(dark ? darkTheme : lightTheme);

  return (
    <BrowserRouter>
      <Provider store={store}>
        <div className="App">
          <button type="button" onClick={toggle}>
            Toggle Theme
          </button>
          <ActionButton
            containerStyling={{
              position: "relative",
              height: "30px",
              width: "100px",
              margin: "auto",
              padding: "",
              border: "",
              minWidth: "",
              maxWidth: ""
            }}
            text="Main Menu"
            actions={{
              executeAsOne: false,
              actions: [
                { type: OPEN_PAGE, location: "app", page: "menu", macros: "{}" }
              ]
            }}
          />
          <DynamicPageWidget
            routePath="app"
            containerStyling={{
              position: "relative",
              height: "",
              width: "",
              margin: "",
              padding: "",
              border: "",
              minWidth: "",
              maxWidth: ""
            }}
          />
        </div>
      </Provider>
    </BrowserRouter>
  );
};

export default App;
