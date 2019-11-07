import React, { memo } from "react";
import PropTypes, { InferProps } from "prop-types";

import { CopyWrapper } from "../CopyWrapper/copyWrapper";
import { AlarmBorder } from "../AlarmBorder/alarmBorder";
import { PvState } from "../../redux/csState";
import { useMacros } from "../../hooks/useMacros";
import { useConnection } from "../../hooks/useConnection";
import { useId } from "react-id-generator";
import { RuleProps } from "../../hooks/useRules";

export type ExcludeNulls<T> = {
  [P in keyof T]: Exclude<T[P], null>;
};
export type InferWidgetProps<T> = ExcludeNulls<InferProps<T>>;
export const StringOrNum = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number
]);
export const MapStringString = PropTypes.objectOf(PropTypes.string);

// Useful types for components which will later be turned into widgets
// Required to define stateless component
export interface Component {
  style?: object;
}

export type PVComponent = Component & PvState;
export type PVInputComponent = PVComponent & { pvName: string };

// Number of prop types organised into useable sections to form more
// complex units
const ContainerFeaturesPropType = {
  margin: PropTypes.string,
  padding: PropTypes.string
};

const RulesPropType = {
  condition: PropTypes.string.isRequired,
  trueState: PropTypes.string.isRequired,
  falseState: PropTypes.string.isRequired,
  substitutionMap: MapStringString.isRequired,
  prop: PropTypes.string.isRequired
};

const AbsoluteContainerProps = {
  position: PropTypes.oneOf(["absolute"]).isRequired,
  x: StringOrNum.isRequired,
  y: StringOrNum.isRequired,
  height: StringOrNum.isRequired,
  width: StringOrNum.isRequired,
  ...ContainerFeaturesPropType
};

const FlexibleContainerProps = {
  position: PropTypes.oneOf(["relative"]).isRequired,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  ...ContainerFeaturesPropType
};
const FlexibleContainerPropsFlat = {
  position: PropTypes.oneOf(["relative"]).isRequired,
  x: PropTypes.oneOf([null]),
  y: PropTypes.oneOf([null]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  ...ContainerFeaturesPropType
};

const WidgetStylingPropType = {
  font: PropTypes.string,
  fontSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  fontWeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  textAlign: PropTypes.oneOf(["center", "left", "right", "justify"]),
  backgroundColor: PropTypes.string
};
type WidgetStyling = InferWidgetProps<typeof WidgetStylingPropType>;

const CommonWidgetProps = {
  widgetStyling: PropTypes.shape(WidgetStylingPropType),
  macroMap: PropTypes.objectOf(PropTypes.string.isRequired),
  rule: PropTypes.shape(RulesPropType)
};

const AbsoluteComponentPropType = {
  containerStyling: PropTypes.shape(AbsoluteContainerProps).isRequired,
  ...CommonWidgetProps
};
type AbsoluteType = InferWidgetProps<typeof AbsoluteComponentPropType>;

const FlexibleComponentPropType = {
  containerStyling: PropTypes.shape(FlexibleContainerProps).isRequired,
  ...CommonWidgetProps
};
type FlexibleType = InferWidgetProps<typeof FlexibleComponentPropType>;

// PropTypes object for a widget which can be expanded
export const WidgetPropType = {
  containerStyling: PropTypes.oneOfType([
    PropTypes.exact(AbsoluteContainerProps),
    PropTypes.exact(FlexibleContainerProps)
  ]).isRequired,
  widgetStyling: PropTypes.exact(WidgetStylingPropType),
  macroMap: PropTypes.objectOf(PropTypes.string.isRequired),
  rule: PropTypes.exact(RulesPropType)
};

const FlatAbsolutePropType = {
  ...AbsoluteContainerProps,
  ...WidgetStylingPropType,
  macroMap: PropTypes.objectOf(PropTypes.string.isRequired)
};

const FlatFlexiblePropType = {
  ...FlexibleContainerPropsFlat,
  ...WidgetStylingPropType,
  macroMap: PropTypes.objectOf(PropTypes.string.isRequired)
};

type FlatAbsoluteType = InferWidgetProps<typeof FlatAbsolutePropType>;
type FlatFlexibleType = InferWidgetProps<typeof FlatFlexiblePropType>;
export type FlatPositioned = FlatAbsoluteType | FlatFlexibleType;
export type FlatWidgetComponent = { Component: React.FC<any> } & FlatPositioned;
interface PVExtras {
  pvName: string;
  copywrapper?: boolean;
  alarmborder?: boolean;
}
export type FlatPVWidget = FlatPositioned & PVExtras;
export type FlatPVComponent = FlatPositioned & PvState;
type FlatPVWidgetComponent = FlatWidgetComponent & PVExtras;

// Allows for either absolute or flexible positioning
export type WidgetProps = AbsoluteType | FlexibleType;
// Internal type for creating widgets
type WidgetComponent = WidgetProps & { baseWidget: React.FC<any> };

// Internal prop types object for properties which are not in a standard widget
const PVExtras = {
  pvName: PropTypes.string.isRequired,
  wrappers: PropTypes.shape({
    copywrapper: PropTypes.bool,
    alarmborder: PropTypes.bool
  })
};
// PropTypes object for a PV widget which can be expanded
export const PVWidgetPropType = {
  ...PVExtras,
  ...WidgetPropType
};
export type PVWidgetProps = WidgetProps & InferWidgetProps<typeof PVExtras>;
type PVWidgetComponent = PVWidgetProps & { baseWidget: React.FC<any> };

// Function to recursively wrap a given set of widgets
const recursiveWrapping = (
  components: React.FC<any>[],
  containerStyling: object,
  widgetStyling: WidgetStyling | null,
  containerProps: object,
  widgetProps: object
): JSX.Element => {
  let [Component, ...remainingComponents] = components;
  if (components.length === 1) {
    // Return the base widget
    return (
      <Component
        style={{ ...containerStyling, ...widgetStyling }}
        {...widgetProps}
      />
    );
  }
  // If container styling is not empty, use it on the wrapper widget
  // and pass on an empty object, otherwise wrap and move down
  else {
    return (
      <Component style={containerStyling} {...containerProps}>
        {recursiveWrapping(
          remainingComponents,
          {},
          widgetStyling,
          containerProps,
          widgetProps
        )}
      </Component>
    );
  }
};

// Function to compare widget props
function widgetPropsAreEqual(
  prevProps: WidgetComponent,
  nextProps: WidgetComponent
): boolean {
  let prevExpanded = {
    ...prevProps.containerStyling,
    ...prevProps.widgetStyling,
    ...prevProps.macroMap,
    ...prevProps.rule
  };
  let nextExpanded = {
    ...nextProps.containerStyling,
    ...nextProps.widgetStyling,
    ...nextProps.macroMap,
    ...nextProps.rule
  };

  if (JSON.stringify(prevExpanded) === JSON.stringify(nextExpanded)) {
    console.log("Props are equal!");
    return true;
  } else {
    return false;
  }
}

export const WidgetMemo = (props: WidgetComponent): JSX.Element => {
  // Generic widget component
  const [id] = useId();
  let idProps = { ...props, id: id };

  // Apply macros.
  const macroProps = useMacros(idProps) as RuleProps;
  // Then rules
  // const ruleProps = useRules(macroProps);

  // Give containers access to everything apart from the containerStyling
  // Assume flexible position if not provided with anything
  const { containerStyling, ...containerProps } = macroProps;

  // Manipulate for absolute styling
  // Put x and y back in as left and top respectively
  const { x = null, y = null } = { ...containerStyling };
  const mappedContainerStyling = { top: y, left: x, ...containerStyling };

  // Extract remaining parameters
  let { baseWidget, widgetStyling = {}, ...baseWidgetProps } = containerProps;

  // Put appropriate components on the list of components to be wrapped
  let components = [baseWidget];

  return recursiveWrapping(
    components,
    mappedContainerStyling,
    widgetStyling,
    containerProps,
    baseWidgetProps
  );
};

export const Widget = memo(WidgetMemo, widgetPropsAreEqual);

// Function to compare widget props
function pvWidgetPropsAreEqual(
  prevProps: PVWidgetComponent,
  nextProps: PVWidgetComponent
): boolean {
  let prevExpanded = {
    pvName: prevProps.pvName,
    ...prevProps.containerStyling,
    ...prevProps.widgetStyling,
    ...prevProps.macroMap,
    ...prevProps.rule
  };
  let nextExpanded = {
    pvName: nextProps.pvName,
    ...nextProps.containerStyling,
    ...nextProps.widgetStyling,
    ...nextProps.macroMap,
    ...nextProps.rule
  };

  if (JSON.stringify(prevExpanded) === JSON.stringify(nextExpanded)) {
    console.log("Props are equal!");
    return true;
  } else {
    return false;
  }
}

export const PVWidgetMemo = (props: PVWidgetComponent): JSX.Element => {
  const [id] = useId();
  let idProps = { ...props, id: id };

  // Apply macros.
  const macroProps = useMacros(idProps) as RuleProps;
  // Then rules
  // const ruleProps = useRules(macroProps);
  const [shortPvName, connected, readonly, latestValue] = useConnection(
    id,
    macroProps.pvName
  );
  let newProps: PVWidgetComponent & PvState = {
    ...props,
    pvName: shortPvName,
    connected: connected,
    readonly: readonly,
    value: latestValue
  };
  // Give containers access to everything apart from the containerStyling
  // Assume flexible position if not provided with anything
  const { containerStyling, ...containerProps } = newProps;

  // Manipulate for absolute styling
  // Put x and y back in as left and top respectively
  const { x = null, y = null } = { ...containerStyling };
  const mappedContainerStyling = { top: y, left: x, ...containerStyling };

  // Extract remaining parameters
  let {
    baseWidget,
    widgetStyling = {},
    wrappers = {},
    ...baseWidgetProps
  } = containerProps;

  const components = [];
  // Done like this in case only one of the values is passed through
  const requestedWrappers = {
    ...{ alarmborder: false, copywrapper: false },
    ...wrappers
  };

  if (requestedWrappers.alarmborder === true) {
    components.push(AlarmBorder);
  }
  if (requestedWrappers.copywrapper === true) {
    components.push(CopyWrapper);
  }

  components.push(baseWidget);

  return recursiveWrapping(
    components,
    mappedContainerStyling,
    widgetStyling,
    containerProps,
    baseWidgetProps
  );
};

export const PVWidget = memo(PVWidgetMemo, pvWidgetPropsAreEqual);

export const FlatWidget = (props: FlatWidgetComponent): JSX.Element => {
  // Generic widget component
  // Generic widget component
  let { Component, ...otherProps } = props;
  const [id] = useId();
  let idProps = { ...otherProps, id: id };

  // Apply macros.
  const macroProps = useMacros(idProps) as RuleProps;
  // // Then rules
  // const ruleProps = useRules(macroProps);

  return <Component {...macroProps} />;
};

export const FlatPVWidget = (props: FlatPVWidgetComponent): JSX.Element => {
  let { Component, ...otherProps } = props;
  const [id] = useId();
  let idProps = { ...otherProps, id: id };

  // Apply macros.
  const macroProps = useMacros(idProps) as RuleProps;
  // Then rules
  // const ruleProps = useRules(macroProps);
  const [shortPvName, connected, readonly, latestValue] = useConnection(
    id,
    macroProps.pvName
  );
  let newProps: FlatPVWidgetComponent & PvState = {
    ...props,
    pvName: shortPvName,
    connected: connected,
    readonly: readonly,
    value: latestValue
  };

  // Leave the wrappers for later
  // if (otherProps.alarmborder === true) {
  //   components.push(AlarmBorder);
  // }
  // if (otherProps.copywrapper === true) {
  //   components.push(CopyWrapper);
  // }

  // components.push(Component);

  return <Component {...newProps} />;
};
