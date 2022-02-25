import {ButtonComponent} from "../components/ButtonComponent";
import {componentType} from "../utils/commonTypes";
import * as commonUtils from "../utils/commonUtils";
import {Col, Row, Menu, Popconfirm} from "antd";
import React from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import {UploadFile} from "./UploadFile";
import * as application from "../application";
import reqwest from 'reqwest';

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

  const onCustomRequest = (request) => {
    params.dispatchModifyState({ pageLoading: true });
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('routeId', request.data.routeId);
    formData.append('groupId', request.data.groupId);
    formData.append('shopId', request.data.shopId);
    formData.append('saveRouteId', request.data.saveRouteId);
    formData.append('activeId', request.data.activeId);
    formData.append('activeKey', request.data.activeKey);

    reqwest({
      url: request.action,
      method: request.method,
      processData: false,
      data: formData,
      headers: request.headers,
      success: (data) => {
        params.onUploadSuccess(request.data.name, data);
      },
      error: () => {
        params.dispatchModifyState({ pageLoading: false });
      },
    });
  }

  const buttons = commonUtils.isEmptyObj(params.container) ? [] : params.container.slaveData.filter(item => item.containerType === 'control' && item.fieldName.endsWith('Button') && !item.fieldName.includes('.'));
  //先找到通用按钮，取配置
  const buttonGroup = buttonGroupOld.map(buttonOld => {
    const index = buttons.findIndex(button => button.fieldName === buttonOld.key);
    let buttonConfig: any = {fieldName: buttonOld.key, isVisible: true};
    if (index > -1) {
      buttonConfig = buttons[index];
      buttons.splice(index, 1);
    }
    if (params.isModal) {
        //选择框处理
       if (params.modalType === 'select' && buttonConfig.fieldName !== 'selectButton' && buttonConfig.fieldName !== 'cancelButton' && buttonConfig.fieldName !== 'refreshButton') {
         buttonConfig.isVisible = false;
       } else if (params.modalType !== 'select' && buttonConfig.fieldName !== 'postButton') { //新记录处理
         buttonConfig.isVisible = false;
       }
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

      if (params.userInfo.isManage || buttonOld.key === 'refreshButton' || buttonConfig.fieldName === 'refreshButton' ||
        buttonOld.key === 'cancelButton' || buttonConfig.fieldName === 'cancelButton') {
        disabled = false;
      }

      let buttonItem = {...buttonOld, disabled: disabled ? disabled : buttonOld.disabled }; // buttonItem 作用是有copyToButton有子菜单，需要使用子菜单的配置
      if (buttonOld.key === 'copyToButton' || buttonOld.key === 'copyFromButton') {
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
          menusData = <Menu onClick={commonUtils.isEmpty(params.onClick) ? undefined :
            params.onClick.bind(this, buttonOld.key === 'copyToButton' ? 'copyToMenu' : 'copyFromMenu', null)}>{buttonChildren.map(menu => {
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
        event: { onClick: commonUtils.isEmpty(params.onClick) || buttonOld.key === 'delButton' || buttonOld.key === 'invalidButton' ? undefined :
            params.onClick.bind(this, buttonItem.key, buttonConfig) },
        componentType: componentType.Soruce,
      };


      if (buttonOld.key === 'delButton' || buttonOld.key === 'invalidButton') {
        return <Popconfirm title="Are you sure？" icon={<QuestionCircleOutlined style={{color: 'red'}}/>} onConfirm={params.onClick.bind(this, buttonItem.key, buttonConfig)}>
          <Col><ButtonComponent {...button} /></Col>
        </Popconfirm>
      } else if (buttonOld.key.startsWith('importExcel') > 0) {
        const index = commonUtils.isEmptyObj(params.container) ? -1 : params.container.slaveData.findIndex(item => item.fieldName === 'addButton');
        const saveRouteId = index > -1 ? params.container.slaveData[index].popupSelectId : '';
        const uploadParam: any = {
          name: buttonOld.key,
          enabled: false,
          button: <ButtonComponent {...button} />,
          property: {
            listType: 'text',
            action: application.urlUpload + '/excel/importExcel',
            headers: {
              authorization: params.token,
            },
            fileList: [],
            multiple: false,
            beforeUpload: undefined,
            onChange: undefined,
            customRequest: onCustomRequest,
            data: {
              name: buttonOld.key,
              routeId: params.routeId,
              groupId: params.groupId,
              shopId: params.shopId,
              saveRouteId: saveRouteId,
              activeId: buttonConfig.popupActiveId,
              activeKey: buttonConfig.popupActiveKey,
            }
          },
        };
        return <Col><UploadFile {...uploadParam}></UploadFile></Col>;
      } else {
        return <Col><ButtonComponent {...button} /></Col>;
      }
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