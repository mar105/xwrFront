import {ButtonComponent} from "../../components/ButtonComponent";
import {componentType} from "../../utils/commonTypes";
import * as commonUtils from "../../utils/commonUtils";
import {Col, Row} from "antd";
import React from 'react';

export function ButtonGroup(params) {
  const buttonGroup: any = [];
  buttonGroup.push({ key: 'addButton', caption: '增加', htmlType: 'button', disable: params.enabled, sortNum: 10, onClick: params.onClick, disabled: params.enabled });
  buttonGroup.push({ key: 'addChildButton', caption: '增加子级', htmlType: 'button', disable: params.enabled, sortNum: 20, onClick: params.onClick, disabled: params.enabled });
  buttonGroup.push({ key: 'modifyButton', caption: '修改', htmlType: 'button', disable: params.enabled, sortNum: 30, onClick: params.onClick, disabled: params.enabled });
  buttonGroup.push({ key: 'postButton', caption: '保存', htmlType: 'submit', disable: params.enabled, sortNum: 40, onClick: params.onClick, disabled: !params.enabled });
  buttonGroup.push({ key: 'cancelButton', caption: '取消', htmlType: 'button', disable: params.enabled, sortNum: 50, onClick: params.onClick, disabled: !params.enabled });
  buttonGroup.push({ key: 'delButton', caption: '删除', htmlType: 'button', disable: params.enabled, sortNum: 60, onClick: params.onClick, disabled: params.enabled });
  if (commonUtils.isNotEmptyArr(params.buttonGroup)) {
    buttonGroup.push(...params.buttonGroup);
  }
  const buttons = commonUtils.isEmptyObj(params.slaveContainer) ? [] : params.slaveContainer.slaveData.filter(item => item.containerType === 'control');
  const buttonGroupNew = buttonGroup.map(item => {
    const index = buttons.findIndex(button => button.fieldName === item.key);
    const buttonConfig = index > -1 ? buttons[index] : {};
    const button = {
      caption: item.caption,
      property: { name: item.key, htmlType: item.htmlType, disabled: item.disabled },
      event: { onClick: commonUtils.isEmpty(item.onClick) ? undefined : item.onClick.bind(this, item.key, buttonConfig) },
      componentType: componentType.Soruce,
    };
    return <Col><ButtonComponent {...button} /></Col>;
  });
  return <Row style={{ height: 'auto', overflow: 'auto' }}>{buttonGroupNew}</Row>;
}