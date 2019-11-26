import { writePv } from "./hooks/useSubscription";
import { valueToVtype } from "./vtypes/utils";
import log from "loglevel";

export const OPEN_WEBPAGE = "OPEN_WEBPAGE";
export const WRITE_PV = "WRITE_PV";

export interface OpenWebpage {
  type: typeof OPEN_WEBPAGE;
  url: string;
  description: string;
}

export interface WritePv {
  type: typeof WRITE_PV;
  pvName: string;
  value: string | number;
  description: string;
}

export type Action = OpenWebpage | WritePv;

export interface Actions {
  actions: Action[];
  executeAsOne: boolean;
}

/* Special class to ensure that switches on Action type are complete. */
class InvalidAction extends Error {
  public constructor(val: never) {
    super(`Invalid action: ${val}`);
  }
}

export const getActionDescription = (action: Action): string => {
  if (action.description) {
    return action.description;
  } else {
    switch (action.type) {
      case WRITE_PV:
        return `Write ${action.value} to ${action.pvName}`;
      case OPEN_WEBPAGE:
        return `Open ${action.url}`;
      default:
        throw new InvalidAction(action);
    }
  }
};

export const executeAction = (action: Action): void => {
  switch (action.type) {
    case OPEN_WEBPAGE:
      window.open(action.url);
      break;
    case WRITE_PV:
      writePv(action.pvName, valueToVtype(action.value));
      break;
    default:
      throw new InvalidAction(action);
  }
};

export const executeActions = (actions: Actions): void => {
  log.debug(`executing an action ${actions.actions[0].type}`);
  let toExecute: Action[] = [];
  if (actions.executeAsOne) {
    toExecute = actions.actions;
  } else {
    toExecute = [actions.actions[0]];
  }
  for (const action of toExecute) {
    executeAction(action);
  }
};
