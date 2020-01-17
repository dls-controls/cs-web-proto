import React from "react";
import { useSubscription } from "./useSubscription";
import { useSelector } from "react-redux";
import { CsState } from "../../redux/csState";
import { VType } from "../../types/vtypes/vtypes";
import { pvStateSelector, PvArrayResults, pvStateComparator } from "./utils";

export interface PvProps extends React.PropsWithChildren<any> {
  pvName: string;
  effectivePvName: string;
}

export function useConnection(
  id: string,
  pvName?: string
): [string, boolean, boolean, VType?] {
  const pvNameArray = pvName === undefined ? [] : [pvName];
  useSubscription(id, pvNameArray);
  const pvResults = useSelector(
    (state: CsState): PvArrayResults => pvStateSelector(pvNameArray, state),
    pvStateComparator
  );
  let connected = false;
  let readonly = false;
  let value = undefined;
  let effectivePvName = "undefined";
  if (pvName !== undefined) {
    const [pvState, effPvName] = pvResults[pvName];
    effectivePvName = effPvName;
    if (pvState) {
      connected = pvState.connected || false;
      readonly = pvState.readonly || false;
      value = pvState.value;
    }
  }
  return [effectivePvName, connected, readonly, value];
}
