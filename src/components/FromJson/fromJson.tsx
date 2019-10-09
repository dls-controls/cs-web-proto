import React, { useState } from "react";
import {
  objectToPosition,
  PositionDescription
} from "../Positioning/positioning";
import { Label } from "../Label/label";
import { Blank } from "../Positioning/ionpExample";
import {
  ConnectedReadback,
  ConnectedCopyReadback,
  ConnectedStandaloneReadback
} from "../Readback/readback";
import { ConnectedInput } from "../Input/input";

interface FromJsonProps {
  file: string;
}

const EMPTY_DESC = {
  type: "empty",
  x: 0,
  y: 0,
  width: 0,
  height: 0
};

export const FromJson = (props: FromJsonProps): JSX.Element => {
  const [json, setJson] = useState<PositionDescription>(EMPTY_DESC);

  if (json["type"] === "empty") {
    fetch(props.file)
      .then(
        (response): Promise<any> => {
          return response.json();
        }
      )
      .then((json): void => {
        setJson(json);
      });
  }
  const compDict = {
    blank: Blank,
    empty: Blank,
    label: Label,
    readback: ConnectedStandaloneReadback,
    connectedReadback: ConnectedReadback,
    connectedCopyReadback: ConnectedCopyReadback,
    input: ConnectedInput
  };

  return (
    <div
      style={{
        position: "relative",
        height: json["height"]
      }}
    >
      {objectToPosition(json, compDict)}
    </div>
  );
};
