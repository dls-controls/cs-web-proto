// Page to show off the progress bar and slide control
import React from "react";

import { WidgetFromJson } from "../components/FromJson/fromJson";

export const PerformancePage = (): JSX.Element => (
  <WidgetFromJson
    file="http://localhost:3000/performancePage.json"
    macroMap={{}}
    containerStyling={{ position: "relative" }}
  />
);
