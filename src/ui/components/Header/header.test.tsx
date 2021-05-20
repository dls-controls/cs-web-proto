import React from "react";
import { contextRender } from "../../../testResources";
import { Header } from "./header";

describe("<Header />", (): void => {
  test("it renders the title", (): void => {
    const { getByText } = contextRender(<Header />);
    expect(getByText("cs-web-proto")).toBeInTheDocument();
  });
});
