import * as React from "react";

const commonBasic = (WrapComponent) => {
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

export default commonBasic;






