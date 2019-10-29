import React from "react";
import { useId } from "react-id-generator";
import { useSubscription } from "../../hooks/useCs";
import { useSelector } from "react-redux";
import { CsState } from "../../redux/csState";
import { VType } from "../../vtypes/vtypes";

export interface PvProps extends React.PropsWithChildren<any> {
  pvName: string;
  shortPvName: string;
}

function pvStateSelector(
  pvName: string,
  state: CsState
): [string, boolean, boolean, VType?] {
  let shortPvName = state.shortPvNameMap[pvName] || pvName;
  const pvState = state.valueCache[shortPvName];
  let connected = false;
  let readonly = false;
  let value = undefined;
  if (pvState != null) {
    connected = pvState.connected || false;
    readonly = pvState.readonly || false;
    value = pvState.value;
  }
  return [shortPvName, connected, readonly, value];
}

export function useConnection(
  pvName?: string
): [string, boolean, boolean, VType?] {
  const [id] = useId();
  useSubscription(id, pvName);
  const [shortPvName, connected, readonly, latestValue] = useSelector(
    (state: CsState): [string, boolean, boolean, VType?] => {
      if (pvName) {
        return pvStateSelector(pvName, state);
      } else {
        return ["", false, false, undefined];
      }
    }
  );
  return [shortPvName, connected, readonly, latestValue];
}
