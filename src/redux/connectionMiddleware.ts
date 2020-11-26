import log from "loglevel";
import { MiddlewareAPI, Dispatch } from "redux";
import {
  ConnectionState,
  ConnectionTypes,
  PvConnection
} from "../connection/plugin";
import {
  SUBSCRIBE,
  WRITE_PV,
  VALUE_CHANGED,
  DEVICE_CHANGED,
  CONNECTION_CHANGED,
  SUBSCRIBE_DEVICE,
  UNSUBSCRIBE,
  Action,
  SubscribeDevice,
  UNSUBSCRIBE_DEVICE
} from "./actions";
import { DType } from "../types/dtypes";

function connectionChanged(
  store: MiddlewareAPI,
  pvDevice: string,
  type: string,
  value: ConnectionState
): void {
  store.dispatch({
    type: CONNECTION_CHANGED,
    payload: { pvDevice, value, type }
  });
}

function valueChanged(
  store: MiddlewareAPI,
  pvName: string,
  value: DType
): void {
  store.dispatch({
    type: VALUE_CHANGED,
    payload: { pvName, value }
  });
}

function deviceChanged(
  store: MiddlewareAPI,
  device: string,
  value: DType
): void {
  store.dispatch({
    type: DEVICE_CHANGED,
    payload: { device, value }
  });
}

export const connectionMiddleware = (connection: ConnectionTypes) => (
  store: MiddlewareAPI
) => (next: Dispatch<Action>): any => (action: Action): Action => {
  if (!connection.isConnected()) {
    connection.connect(
      // Partial function application.
      (pvDevice: string, type: string, value: ConnectionState): void =>
        connectionChanged(store, pvDevice, type, value),
      (pvName: string, value: DType): void =>
        valueChanged(store, pvName, value),
      (device: string, value: DType): void =>
        deviceChanged(store, device, value)
    );
  }

  switch (action.type) {
    case SUBSCRIBE: {
      const { pvName, type } = action.payload;
      // Are we already subscribed?
      let effectivePvName = pvName;
      try {
        effectivePvName = connection.subscribe(pvName, type);
      } catch (error) {
        log.error(`Failed to subscribe to pv ${pvName}`);
        log.error(error);
      }
      // Even if there is a problem subscribing, the action is passed
      // on so that there is a record of this subscription. This
      // allows the unsubscription mechanism still to work.
      action = {
        ...action,
        payload: {
          ...action.payload,
          effectivePvName: effectivePvName,
          pvName: pvName
        }
      };
      break;
    }
    case SUBSCRIBE_DEVICE: {
      const { device } = (action as SubscribeDevice).payload;

      try {
        connection.subscribe(device, { string: true });
      } catch (error) {
        log.error(`Failed to subscribe to device ${device}`);
        log.error(error);
      }

      action = {
        ...action,
        payload: {
          ...action.payload
        }
      };
      break;
    }
    case UNSUBSCRIBE_DEVICE: {
      const { componentId, device } = action.payload;
      const subs = store.getState().deviceSubscriptions;

      if (subs[device].length === 1 && subs[device][0] === componentId) {
        try {
          connection.unsubscribe(device);
        } catch (error) {
          log.error(`Failed to unsubscribe from device ${device}`);
          log.error(error);
        }
      }
      break;
    }
    case WRITE_PV: {
      const { pvName, value } = action.payload;
      const effectivePvName =
        store.getState().effectivePvNameMap[pvName] || pvName;
      try {
        (connection as PvConnection).putPv(effectivePvName, value);
      } catch (error) {
        log.error(`Failed to put to pv ${pvName}`);
        log.error(error);
      }
      break;
    }
    case UNSUBSCRIBE: {
      const { componentId, pvName } = action.payload;
      const subs = store.getState().subscriptions;
      // Is this the last subscriber?
      // The reference will be removed in csReducer.
      const effectivePvName =
        store.getState().effectivePvNameMap[pvName] || pvName;

      if (
        subs[effectivePvName].length === 1 &&
        subs[effectivePvName][0] === componentId
      ) {
        try {
          connection.unsubscribe(pvName);
        } catch (error) {
          log.error(`Failed to unsubscribe from pv ${pvName}`);
          log.error(error);
        }
      }
    }
  }
  return next(action);
};
