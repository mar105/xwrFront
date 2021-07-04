import {ButtonComponent} from "../../components/ButtonComponent";
import {componentType} from "../../utils/commonTypes";
import * as commonUtils from "../../utils/commonUtils";
import {Col, Row} from "antd";
import React from 'react';

export function ButtonGroup(params) {
  const buttonGroupOld: any = [];
  buttonGroupOld.push({ key: 'addButton', caption: '增加', htmlType: 'button', sortNum: 10, disabled: params.enabled });
  buttonGroupOld.push({ key: 'addChildButton', caption: '增加子级', htmlType: 'button', sortNum: 20, disabled: params.enabled });
  buttonGroupOld.push({ key: 'modifyButton', caption: '修改', htmlType: 'button', sortNum: 30, disabled: params.enabled });
  buttonGroupOld.push({ key: 'postButton', caption: '保存', htmlType: 'submit', sortNum: 40, disabled: !params.enabled });
  buttonGroupOld.push({ key: 'cancelButton', caption: '取消', htmlType: 'button', sortNum: 50, disabled: !params.enabled });
  buttonGroupOld.push({ key: 'delButton', caption: '删除', htmlType: 'button', sortNum: 60, disabled: params.enabled });

  if (commonUtils.isNotEmptyArr(params.buttonGroup)) {
    buttonGroupOld.push(...params.buttonGroup);
  }
  const buttons = commonUtils.isEmptyObj(params.slaveContainer) ? [] : params.slaveContainer.slaveData.filter(item => item.containerType === 'control');
  //先找到通用按钮，取配置
  const buttonGroup = buttonGroupOld.map(item => {
    const index = buttons.findIndex(button => button.fieldName === item.key);
    let buttonConfig: any = {isVisible: true};
    if (index > -1) {
      buttonConfig = buttons[index];
      buttons.splice(index, 1);
    }
    if (buttonConfig.isVisible) {
      const button = {
        caption: item.caption,
        property: { name: item.key, htmlType: item.htmlType, disabled: item.disabled },
        event: { onClick: commonUtils.isEmpty(params.onClick) ? undefined : params.onClick.bind(this, item.key, buttonConfig) },
        componentType: componentType.Soruce,
      };

      return <Col><ButtonComponent {...button} /></Col>;
    }

  });

  //剩余的为界面其他按钮配置
  const buttonGroupOther = buttons.filter(item => item.isVisible).map(item => {
    const button = {
      caption: item.viewName,
      property: { name: item.fieldName, htmlType: 'button', disabled: item.disabled },
      event: { onClick: commonUtils.isEmpty(params.onClick) ? undefined : params.onClick.bind(this, item.fieldName, item) },
      componentType: componentType.Soruce,
    };
    return <Col><ButtonComponent {...button} /></Col>;
  });
  buttonGroup.push(...buttonGroupOther);

  return <Row style={{ height: 'auto', overflow: 'auto' }}>{buttonGroup}</Row>;
}