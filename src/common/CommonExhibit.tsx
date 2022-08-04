/*
 * @Author: xulinyu xlyhacker@gmail.com
 * @Date: 2022-07-25 21:50:19
 * @LastEditors: xulinyu xlyhacker@gmail.com
 * @LastEditTime: 2022-08-04 06:54:56
 * @FilePath: \xwrFront\src\common\CommonExhibit.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {Col, Row} from "antd";
import React from "react";
import * as commonUtils from "../utils/commonUtils";
import {SelectComponent} from "../components/SelectComponent";
import {InputComponent} from "../components/InputComponent";
import {NumberComponent} from "../components/NumberComponent";
import {CheckboxComponent} from "../components/CheckboxComponent";
import {DatePickerComponent} from "../components/DatePickerComponent";
import ProvinceCityArea from "./ProvinceCityArea";
import {TreeSelectComponent} from "../components/TreeSelectComponent";

export const CommonExhibit = (props) => {
  const colSpan = { xs: 12, sm: 12, md: 8, lg: 6 }
  const { [props.name + 'Data']: masterDataOld, masterContainer, enabled: enabledOld } = props;
  const masterData = commonUtils.isEmptyObj(masterDataOld) ? {} : masterDataOld;
  const masterComponent = commonUtils.isEmptyObj(masterContainer) ? '' :
    masterContainer.slaveData.filter(item => (item.containerType === 'field' || item.containerType === 'relevance' || item.containerType === 'relevanceNotView' || item.containerType === 'relevanceInstant' || item.containerType === 'spare' || item.containerType === 'cascader') && item.isVisible).map(item => {
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
        } else if (item.dropType === 'sql' || item.dropType === 'current' || item.dropType === 'const') {
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
      //只能在最外围使用钩子函数，里面再用的话，不能减少组件与增加组件显示不显示。否则报 Rendered fewer hooks than expected
      // component = useMemo(()=>{ return (component)}, [masterData[item.fieldName], enabled, item.viewName]);
      return <Col {...colSpan}>{component}</Col>;
    });

  return (
    <Row style={{ height: 'auto', overflow: 'auto', width: '100%'}} gutter={[12, 12]} className="xwr-form-container-row">
      {masterComponent}
    </Row>
  );
}