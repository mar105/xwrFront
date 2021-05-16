import * as React from "react";

const commonListEvent = (WrapComponent) => {
  return function ChildComponent(props) {

    return <WrapComponent
      {...props}
    />
  };
};

export default commonListEvent;