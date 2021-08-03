import {ButtonComponent} from "../components/ButtonComponent";
import {componentType} from "../utils/commonTypes";
import * as commonUtils from "../utils/commonUtils";
import {Col, Row,  Menu} from "antd";
import React from 'react';

export function ButtonGroup(params) {
  const buttonGroupOld: any = [];
  // buttonGroupOld.push({ key: 'addButton', caption: '增加', htmlType: 'button', sortNum: 10, disabled: params.enabled });
  // buttonGroupOld.push({ key: 'addChildButton', caption: '增加子级', htmlType: 'button', sortNum: 20, disabled: params.enabled });
  // buttonGroupOld.push({ key: 'modifyButton', caption: '修改', htmlType: 'button', sortNum: 30, disabled: params.enabled });
  // buttonGroupOld.push({ key: 'postButton', caption: '保存', htmlType: 'submit', sortNum: 40, disabled: !params.enabled });
  // buttonGroupOld.push({ key: 'cancelButton', caption: '取消', htmlType: 'button', sortNum: 50, disabled: !params.enabled });
  // buttonGroupOld.push({ key: 'delButton', caption: '删除', htmlType: 'button', sortNum: 60, disabled: params.enabled });
  if (commonUtils.isNotEmptyArr(params.buttonGroup)) {
    buttonGroupOld.push(...params.buttonGroup);
  }
  const buttons = commonUtils.isEmptyObj(params.container) ? [] : params.container.slaveData.filter(item => item.containerType === 'control' && item.fieldName.endsWith('Button') && !item.fieldName.includes('.'));
  //先找到通用按钮，取配置
  const buttonGroup = buttonGroupOld.map(buttonOld => {
    const index = buttons.findIndex(button => button.fieldName === buttonOld.key);
    let buttonConfig: any = {isVisible: true};
    if (index > -1) {
      buttonConfig = buttons[index];
      buttons.splice(index, 1);
    }
    if (buttonConfig.isVisible) {
      let isDropDown = false;
      let menusData;
      let disabled;
      disabled = params.permissionData ? !(params.permissionData.findIndex(item => item.permissionName &&
        (item.permissionName === buttonOld.key || item.permissionName === buttonConfig.fieldName)) > -1) : false;

      if (buttonOld.key === 'postButton' || buttonConfig.fieldName === 'postButton' ||
          buttonOld.key === 'cancelButton' || buttonConfig.fieldName === 'cancelButton') {
        disabled = params.permissionData ? !(params.permissionData.findIndex(item => item.permissionName &&
          (buttonOld.key === 'addButton' || buttonConfig.fieldName === 'addButton' ||
            buttonOld.key === 'modifyButton' || buttonConfig.fieldName === 'modifyButton')) > -1) : false;
      }

      if (buttonOld.key === 'refreshButton' || buttonConfig.fieldName === 'refreshButton' ||
        buttonOld.key === 'cancelButton' || buttonConfig.fieldName === 'cancelButton') {
        disabled = false;
      }

      let buttonItem = {...buttonOld, disabled: disabled ? disabled : buttonOld.disabled }; // buttonItem 作用是有copyToButton有子菜单，需要使用子菜单的配置
      if (buttonOld.key === 'copyToButton') {
        const buttonChildren = commonUtils.isEmptyObj(params.container) ? [] : params.container.slaveData.filter(item =>
          item.containerType === 'control' && item.isVisible && item.fieldName.startsWith(buttonOld.key + '.') && item.fieldName.split('.').length < 3);
        if (buttonChildren.length === 1) {
          buttonItem = {...buttonOld, ...buttonChildren[0]};
          buttonConfig = {...buttonChildren[0]};
          const buttonChildrenSlave = commonUtils.isEmptyObj(params.container) ? [] : params.container.slaveData.filter(item =>
            item.containerType === 'control' && item.fieldName.startsWith(buttonChildren[0].fieldName + '.'));
          buttonConfig.children = buttonChildrenSlave;
        } else if (buttonChildren.length > 1) {
          isDropDown = true;
          menusData = <Menu onClick={commonUtils.isEmpty(params.onClick) ? undefined : params.onClick.bind(this, 'menu', null)}>{buttonChildren.map(menu => {
            const buttonChildrenSlave = commonUtils.isEmptyObj(params.container) ? [] : params.container.slaveData.filter(item =>
              item.containerType === 'control' && item.fieldName.startsWith(menu.fieldName + '.'));
            menu.children = buttonChildrenSlave;
            // @ts-ignore
            return <Menu.Item key={menu.fieldName} config={menu} > {menu.viewName} </Menu.Item>})
          }</Menu>
        }
      }
      
      const button = {
        caption: buttonOld.caption,
        isDropDown,
        property: { name: buttonItem.key, htmlType: buttonItem.htmlType, disabled: buttonItem.disabled, overlay: menusData },
        event: { onClick: commonUtils.isEmpty(params.onClick) ? undefined : params.onClick.bind(this, buttonItem.key, buttonConfig) },
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