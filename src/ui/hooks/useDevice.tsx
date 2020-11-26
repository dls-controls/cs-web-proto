import { useSelector } from "react-redux";
import { CsState } from "../../redux/csState";
import { deviceSelector, deviceComparator } from "./utils";
import { useDeviceSubscription } from "./useDeviceSubscription";
import { DType } from "../../types/dtypes";

export interface Device {
  connected: boolean;
  device: string;
  readonly: boolean;
  value: DType;
}

export function useDevice(
  componentId: string,
  device: string
): Device | undefined {
  useDeviceSubscription(componentId, device);
  const description: any = useSelector<CsState, {}>(
    (state: CsState): {} => deviceSelector(device, state),
    deviceComparator
  );
  return description;
}
