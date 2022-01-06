import {Col, Row} from "antd";
import React, {useMemo} from "react";
import * as commonUtils from "../utils/commonUtils";
import {SelectComponent} from "../components/SelectComponent";
import {InputComponent} from "../components/InputComponent";
import {NumberComponent} from "../components/NumberComponent";
import {CheckboxComponent} from "../components/CheckboxComponent";
import {DatePickerComponent} from "../components/DatePickerComponent";
import ProvinceCityArea from "./ProvinceCityArea";
import {TreeSelectComponent} from "../components/TreeSelectComponent";

export const CommonExhibit = (props) => {
  const { [props.name + 'Data']: masterDataOld, masterContainer, enabled: enabledOld } = props;
  const masterData = commonUtils.isEmptyObj(masterDataOld) ? {} : masterDataOld;
  const masterComponent = commonUtils.isEmptyObj(masterContainer) ? '' :
    masterContainer.slaveData.filter(item => (item.containerType === 'field' || item.containerType === 'relevance' || item.containerType === 'spare' || item.containerType === 'cascader') && item.isVisible).map(item => {
      const enabled = item.tagType === 'alwaysReadonly' || item.isReadOnly ? false : item.tagType === 'alwaysModify' ? true : enabledOld;
      const selectParams = {
        name: props.name,
        config: item,
        property: {value: masterData[item.fieldName], disabled: !enabled },
        record: masterData,
        event: {onChange: props.onDataChange, getSelectList: props.getSelectList, onDropPopup: props.onDropPopup}
      };
      const treeSelectParams = {
        name: props.name,
        config: item,
        property: {value: masterData[item.fieldName], disabled: !enabled },
        record: masterData,
        event: {onChange: props.onDataChange, getSelectList: props.getSelectList, onDropPopup: props.onDropPopup}
      };
      const inputParams = {
        name: props.name,
        config: item,
        property: {value: masterData[item.fieldName], disabled: !enabled },
        record: masterData,
        event: {onChange: props.onDataChange}
      };
      const checkboxParams = {
        name: props.name,
        config: item,
        property: {checked: masterData[item.fieldName], disabled: !enabled },
        record: masterData,
        event: {onChange: props.onDataChange}
      };
      const numberParams = {
        name: props.name,
        config: item,
        property: {value: masterData[item.fieldName], disabled: !enabled },
        record: masterData,
        event: {onChange: props.onDataChange}
      };
      const dateParams = {
        name: props.name,
        config: item,
        property: {value: masterData[item.fieldName], disabled: !enabled },
        record: masterData,
        event: {onChange: props.onDataChange}
      };
      const provinceCityAreaParams = {
        name: props.name,
        config: item,
        property: {value: masterData[item.fieldName], disabled: !enabled },
        record: masterData,
        event: {onChange: props.onDataChange}
      };

      let component;
      if (item.fieldType === 'varchar') {
        if (item.fieldName.lastIndexOf('ProvinceCityArea') > -1) {
          component = <ProvinceCityArea {...provinceCityAreaParams}  />;
        } else if (item.dropType === 'sql' || item.dropType === 'const') {
          if (item.isTreeDrop) {
            component = <TreeSelectComponent {...treeSelectParams}  />;
          } else {
            component = <SelectComponent {...selectParams}  />;
          }
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
    <Row style={{ height: 'auto', overflow: 'auto' }}>
      {masterComponent}
    </Row>
  );
}