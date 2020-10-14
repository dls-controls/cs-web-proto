import React from "react";
import { SmartInputComponent } from "./input";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { render } from "@testing-library/react";
import { DAlarm } from "../../../types/dtypes";
import { dstring } from "../../../setupTests";

configure({ adapter: new Adapter() });

let input: JSX.Element;

beforeEach((): void => {
  input = (
    <SmartInputComponent
      pvName="pv"
      value={dstring("hello", DAlarm.MINOR)}
      connected={true}
      readonly={true}
      alarmSensitive={true}
    />
  );
});
describe("<Input />", (): void => {
  it("renders an input", (): void => {
    const { getByDisplayValue } = render(input);
    const renderedInput = getByDisplayValue("hello");
    expect(renderedInput).toBeInTheDocument();
    expect(renderedInput).toHaveClass("warning");
    expect(renderedInput).toHaveClass("readonly");
  });
});
