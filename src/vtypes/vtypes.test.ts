import { DISPLAY_NONE } from "./display";
import { RANGE_NONE } from "./defs";
import { ALARM_NONE, AlarmSeverity, AlarmStatus } from "./alarm";
import { timeNow, Time } from "./time";
import { venum, vdoubleArray } from "./vtypes";

describe("Display", (): void => {
  test("DISPLAY_NONE has zero alarm range", (): void => {
    expect(DISPLAY_NONE.getAlarmRange()).toEqual(RANGE_NONE);
  });
  test("DISPLAY_NONE has zero warning range", (): void => {
    expect(DISPLAY_NONE.getWarningRange()).toEqual(RANGE_NONE);
  });
  test("DISPLAY_NONE has zero control range", (): void => {
    expect(DISPLAY_NONE.getControlRange()).toEqual(RANGE_NONE);
  });
  test("DISPLAY_NONE has zero display range", (): void => {
    expect(DISPLAY_NONE.getDisplayRange()).toEqual(RANGE_NONE);
  });
  test("DISPLAY_NONE has no units", (): void => {
    expect(DISPLAY_NONE.getUnit()).toEqual("");
  });
});

describe("Alarm", (): void => {
  test("ALARM_NONE has severity None", (): void => {
    expect(ALARM_NONE.getSeverity()).toEqual(AlarmSeverity.NONE);
  });
  test("ALARM_NONE has status None", (): void => {
    expect(ALARM_NONE.getStatus()).toEqual(AlarmStatus.NONE);
  });
  test("ALARM_NONE has no message", (): void => {
    expect(ALARM_NONE.getName()).toEqual("");
  });
});

describe("Time", (): void => {
  test("timeNow() is valid", (): void => {
    expect(timeNow().isValid()).toEqual(true);
  });
  test("timeNow() has user tag 0", (): void => {
    expect(timeNow().getUserTag()).toEqual(0);
  });
});

describe("VDoubleArray", (): void => {
  test("vdoubleArray function", (): void => {
    const vda = vdoubleArray([1, 2, 3], [3]);
    expect(vda.getValue()).toEqual([1, 2, 3]);
    expect(vda.getSizes()).toEqual([3]);
    expect(vda.getAlarm()).toEqual(ALARM_NONE);
    expect(vda.getAlarm().getSeverity()).toBe(0);
    expect(vda.getTime()).toBeInstanceOf(Time);
  });
});

describe("VEnum", (): void => {
  test("venum function", (): void => {
    const ve = venum(0, ["zero", "one"]);
    expect(ve.getValue()).toBe("zero");
    expect(ve.getIndex()).toBe(0);
    expect(ve.getAlarm().getSeverity()).toBe(0);
    expect(ve.getTime()).toBeInstanceOf(Time);
  });
});
