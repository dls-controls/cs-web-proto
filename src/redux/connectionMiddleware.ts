import { Store } from "redux";
import { Connection, ConnectionState } from "../connection/plugin";
import {
  CONNECTION_CHANGED,
  SUBSCRIBE,
  WRITE_PV,
  VALUE_CHANGED,
  UNSUBSCRIBE
} from "./actions";
import { NType } from "../ntypes";

function connectionChanged(
  store: Store,
  pvName: string,
  value: ConnectionState
): void {
  store.dispatch({
    type: CONNECTION_CHANGED,
    payload: { pvName: pvName, value: value }
  });
}

function valueChanged(store: Store, pvName: string, value: NType): void {
  store.dispatch({
    type: VALUE_CHANGED,
    payload: { pvName: pvName, value: value }
  });
}

/* Cheating with the types here. */
// eslint doesn't deal with currying very well:
// (x:any): any => (y:any): any => (z:any): any is perverse
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const connectionMiddleware = (connection: Connection) => (
  store: any
) => (next: any): any => (action: any): any => {
  if (!connection.isConnected()) {
    connection.connect(
      // Partial function application.
      connectionChanged.bind(null, store),
      valueChanged.bind(null, store)
    );
  }

  switch (action.type) {
    case SUBSCRIBE: {
      const { pvName } = action.payload;
      const subs = store.getState().subscriptions;
      // Are we already subscribed?
      if (!subs[pvName] || subs[pvName].length === 0) {
        connection.subscribe(action.payload.pvName);
      }
      break;
    }
    case WRITE_PV: {
      connection.putPv(action.payload.pvName, action.payload.value);
      break;
    }
    case UNSUBSCRIBE: {
      const { componentId, pvName } = action.payload;
      const subs = store.getState().subscriptions;
      // Is this the last subscriber?
      // The reference will be removed in csReducer.
      if (subs[pvName].length === 1 && subs[pvName][0] === componentId) {
        connection.unsubscribe(pvName);
      }
    }
  }
  return next(action);
};
