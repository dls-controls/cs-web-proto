import { UpdateThrottle, throttleMiddleware } from "./throttleMiddleware";
import { VALUE_CHANGED, CONNECTION_CHANGED, VALUES_CHANGED } from "./actions";
import { vdouble } from "../types/vtypes/vtypes";

// Mock setInterval.
jest.useFakeTimers();
const mockStore = { dispatch: jest.fn() };

describe("UpdateThrottle", (): void => {
  beforeEach((): void => {
    mockStore.dispatch.mockClear();
  });
  it("collects updates", (): void => {
    const updater = new UpdateThrottle(100);
    updater.queueUpdate({
      type: VALUE_CHANGED,
      payload: {
        pvName: "PV",
        value: vdouble(0)
      }
    });
    updater.queueUpdate({
      type: VALUE_CHANGED,
      payload: {
        pvName: "PV",
        value: vdouble(1)
      }
    });
    updater.clearQueue(mockStore);
    expect(mockStore.dispatch).toHaveBeenCalledTimes(1);
  });
});

describe("throttleMidddlware", (): void => {
  const updater = new UpdateThrottle(100);
  beforeEach((): void => {
    mockStore.dispatch.mockClear();
  });
  it("dispatches ValuesChanged when receiving ValueChanged", (): void => {
    const middleware = throttleMiddleware(updater);
    // nextHandler takes next() and returns the actual middleware function
    const nextHandler = middleware(mockStore);
    const mockNext = jest.fn();
    // actionHandler takes an action
    const actionHandler = nextHandler(mockNext);
    const valueAction = {
      type: VALUE_CHANGED,
      payload: { pvName: "pv", value: vdouble(0) }
    };
    actionHandler(valueAction);
    expect(mockStore.dispatch).toHaveBeenCalledTimes(1);
    // The value update is not passed on.
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockStore.dispatch.mock.calls[0][0].type).toEqual(VALUES_CHANGED);
  });
  it("doesn't dispatch when receiving ConnectionChanged", (): void => {
    const middleware = throttleMiddleware(updater);
    // nextHandler takes next() and returns the actual middleware function
    const nextHandler = middleware(mockStore);
    const mockNext = jest.fn();
    // actionHandler takes an action
    const actionHandler = nextHandler(mockNext);
    const connectionAction = {
      type: CONNECTION_CHANGED,
      payload: { pvName: "pv", value: vdouble(0) }
    };
    actionHandler(connectionAction);
    expect(mockStore.dispatch).toHaveBeenCalledTimes(0);
    expect(mockNext).toHaveBeenCalledWith(connectionAction);
  });
});
