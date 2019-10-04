// Specifically disable some eslint rules
/* eslint unicorn/filename-case: 0 */ // --> OFF

import React from "react";
import "./App.css";
import { Provider } from "react-redux";
import { BrowserRouter, Link, Route } from "react-router-dom";
import { FrontPage } from "./pages/frontpage";
import { InputsPage } from "./pages/inputsPage";
import { ReadbacksPage } from "./pages/readbacksPage";
import { ProgressPage } from "./pages/progressPage";
import { PositioningExamplePage } from "./pages/positioningExamplePage";
import { getStore, initialiseStore } from "./redux/store";
import { SimulatorPlugin } from "./connection/sim";
import { ThemeContext } from "./theme-context";

const App: React.FC = (): JSX.Element => {
  const plugin = new SimulatorPlugin();
  initialiseStore(plugin);
  const store = getStore();

  const { theme, toggle, dark } = React.useContext(ThemeContext)

  const styleLinkButton = {
    backgroundColor: "#eeeeee",
    margin: "10px 10px"
  };

  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="App" style={theme}>
          <button type="button" onClick={toggle}>Toggle Theme</button>
          <h1>CS Web Proto</h1>
          <div id="Links" style={{ margin: "5px" }}>
            <Link style={styleLinkButton} to="/">
              Home
            </Link>
            <Link style={styleLinkButton} to="/inputs">
              Inputs
            </Link>
            <Link style={styleLinkButton} to="/readbacks">
              Readbacks
            </Link>
            <Link style={styleLinkButton} to="/progress">
              Progress
            </Link>
            <Link style={styleLinkButton} to="/positioning">
              Positioning
            </Link>
          </div>
          <div
            id="Central Column"
            style={{
              width: "600px",
              height: "800px",
              border: "solid 3px #dddddd",
              margin: "auto"
            }}
          >
            <Route path="/" exact component={FrontPage} />
            <Route path="/inputs" exact component={InputsPage} />
            <Route path="/readbacks" exact component={ReadbacksPage} />
            <Route path="/progress" exact component={ProgressPage} />
            <Route
              path="/positioning"
              exact
              component={PositioningExamplePage}
            />
          </div>
        </div>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
