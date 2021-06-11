import * as React from "react";

const commonListEvent = (WrapComponent) => {
  return function ChildComponent(props) {
    // @ts-ignore
    let form;
    const onSetForm = (formNew) => {
      form = formNew;
    }
    return <WrapComponent
      {...props}
      onSetForm={onSetForm}
    />
  };
};

export default commonListEvent;