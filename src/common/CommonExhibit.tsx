import {Col, Form, Row} from "antd";
import React, {useMemo} from "react";
import * as commonUtils from "../utils/commonUtils";
import {SelectComponent} from "../components/SelectComponent";
import {InputComponent} from "../components/InputComponent";
import {NumberComponent} from "../components/NumberComponent";
import {CheckboxComponent} from "../components/CheckboxComponent";
import {DatePickerComponent} from "../components/DatePickerComponent";

export const CommonExhibit = (props) => {
  const { [props.name + 'Data']: masterDataOld, masterContainer } = props;
  const masterData = commonUtils.isEmptyObj(masterDataOld) ? {} : masterDataOld;
  const masterComponent = commonUtils.isEmptyObj(masterContainer) ? '' :
    masterContainer.slaveData.filter(item => item.isVisible).map(item => {
      const selectParams = {
        name: props.name,
        fieldName: item.fieldName,
        label: item.viewName,
        dropType: item.dropType,
        viewDrop: item.viewDrop,
        property: {value: masterData[item.fieldName] },
        masterData,
        event: {onChange: props.onSelectChange}
      };
      const inputParams = {
        name: props.name,
        fieldName: item.fieldName,
        label: item.viewName,
        dropType: item.dropType,
        viewDrop: item.viewDrop,
        property: {value: masterData[item.fieldName]},
        masterData,
        event: {onChange: props.onInputChange}
      };
      const checkboxParams = {
        name: props.name,
        fieldName: item.fieldName,
        label: item.viewName,
        property: {checked: masterData[item.fieldName]},
        masterData,
        event: {onChange: props.onCheckboxChange}
      };
      const numberParams = {
        name: props.name,
        fieldName: item.fieldName,
        label: item.viewName,
        property: {checked: masterData[item.fieldName]},
        masterData,
        event: {onChange: props.onNumberChange}
      };
      const dateParams = {
        name: props.name,
        fieldName: item.fieldName,
        label: item.viewName,
        property: {checked: masterData[item.fieldName]},
        masterData,
        event: {onChange: props.onNumberChange}
      };
      if (item.fieldType === 'varchar') {
        if (item.dropType === 'sql' || item.dropType === 'const') {
          const component = useMemo(() => {
            return (<SelectComponent {...selectParams}  />
            )
          }, [masterData[item.fieldName]]);
          return component;
        } else {
          const component = useMemo(() => {
            return (<InputComponent {...inputParams}  />
            )
          }, [masterData[item.fieldName]]);
          return component;
        }
      } else if (item.fieldType === 'decimal' || item.fieldType === 'smallint' || item.fieldType === 'int') {
        const component = useMemo(() => {
          return (<NumberComponent {...numberParams}  />
          )
        }, [masterData[item.fieldName]]);
        return component;
      } else if (item.fieldType === 'tinyint') {
        const component = useMemo(() => {
          return (<CheckboxComponent {...checkboxParams}  />
          )
        }, [masterData[item.fieldName]]);
        return component;
      } else if (item.fieldType === 'datetime') {
        const component = useMemo(() => {
          return (<DatePickerComponent {...dateParams}  />
          )
        }, [masterData[item.fieldName]]);
        return component;
      }
    });
  console.log('masterComponent', masterContainer, masterComponent);
  return (
    <Form name="basic" onFinishFailed={props.onFinishFailed} onFinish={props.onFinish}>
      <Row style={{ height: 'auto', overflow: 'auto' }}>
        <Col>
          {masterComponent}
        </Col>
      </Row>
    </Form>
  );
}