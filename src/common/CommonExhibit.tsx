import {Col, Form, Row} from "antd";
import React, {useMemo} from "react";
import * as commonUtils from "../utils/commonUtils";
import {SelectComponent} from "../components/SelectComponent";
import {InputComponent} from "../components/InputComponent";
import {NumberComponent} from "../components/NumberComponent";
import {CheckboxComponent} from "../components/CheckboxComponent";
import {DatePickerComponent} from "../components/DatePickerComponent";

export const CommonExhibit = (props) => {
  const { [props.name + 'Data']: masterDataOld, masterContainer, enabled } = props;
  const masterData = commonUtils.isEmptyObj(masterDataOld) ? {} : masterDataOld;
  const masterComponent = commonUtils.isEmptyObj(masterContainer) ? '' :
    masterContainer.slaveData.filter(item => item.isVisible).map(item => {
      const selectParams = {
        name: props.name,
        fieldName: item.fieldName,
        label: item.viewName,
        dropType: item.dropType,
        viewDrop: item.viewDrop,
        property: {value: masterData[item.fieldName], disabled: !enabled },
        masterData,
        event: {onChange: props.onSelectChange}
      };
      const inputParams = {
        name: props.name,
        fieldName: item.fieldName,
        label: item.viewName,
        dropType: item.dropType,
        viewDrop: item.viewDrop,
        property: {value: masterData[item.fieldName], disabled: !enabled },
        masterData,
        event: {onChange: props.onInputChange}
      };
      const checkboxParams = {
        name: props.name,
        fieldName: item.fieldName,
        label: item.viewName,
        property: {checked: masterData[item.fieldName], disabled: !enabled },
        masterData,
        event: {onChange: props.onCheckboxChange}
      };
      const numberParams = {
        name: props.name,
        fieldName: item.fieldName,
        label: item.viewName,
        property: {checked: masterData[item.fieldName], disabled: !enabled },
        masterData,
        event: {onChange: props.onNumberChange}
      };
      const dateParams = {
        name: props.name,
        fieldName: item.fieldName,
        label: item.viewName,
        property: {checked: masterData[item.fieldName], disabled: !enabled },
        masterData,
        event: {onChange: props.onNumberChange}
      };
      let component;
      if (item.fieldType === 'varchar') {
        if (item.dropType === 'sql' || item.dropType === 'const') {
          component = <SelectComponent {...selectParams}  />;
        } else {
          component = <InputComponent {...inputParams}  />;
        }
      } else if (item.fieldType === 'decimal' || item.fieldType === 'smallint' || item.fieldType === 'int') {
        component = <NumberComponent {...numberParams} />
      } else if (item.fieldType === 'tinyint') {
        component = <CheckboxComponent {...checkboxParams}  />
      } else if (item.fieldType === 'datetime') {
        component = <DatePickerComponent {...dateParams}  />
      }
      component = useMemo(()=>{ return (component)}, [masterData[item.fieldName], enabled]);
      return <Col span={8}>{component}</Col>;
    });

  return (
    <Form name="basic" onFinishFailed={props.onFinishFailed} onFinish={props.onFinish}>
      <Row style={{ height: 'auto', overflow: 'auto' }}>
        {masterComponent}
      </Row>
    </Form>
  );
}