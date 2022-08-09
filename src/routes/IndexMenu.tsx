/*
 * @Author: xulinyu xlyhacker@gmail.com
 * @Date: 2022-07-25 21:50:19
 * @LastEditors: xulinyu xlyhacker@gmail.com
 * @LastEditTime: 2022-08-09 21:41:49
 * @FilePath: \xwrFront\src\routes\IndexMenu.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {useEffect, useReducer, useState} from "react";
import * as application from "../application";
import * as request from "../utils/request";
import * as commonUtils from "../utils/commonUtils";
import * as React from "react";
import {Button, Menu} from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined, AppstoreOutlined } from '@ant-design/icons';

const IndexMenu = (props) => {
  const [modifySelfState, dispatchModifySelfState] = useReducer((state, action) => {
    return {...state, ...action };
  },{});
  useEffect(() => {
    const {dispatch, commonModel } = props;
    const fetchData = async () => {
      if (commonModel.userInfo.userId !== '') {
        const url: string = application.urlManage + '/route/getAllRoute';
        const userPermissionUrl: string = application.urlPrefix + '/userPermission/getUserPermission?routeId=' + props.routeId +
          '&groupId=' + commonModel.userInfo.groupId + '&shopId=' + commonModel.userInfo.shopId + '&userId=' + commonModel.userInfo.userId;
        const interfaceReturn = (await request.getRequest(url, commonModel.token)).data;
        const userPermissionReturn = commonModel.userInfo.isManage ? { code: 1, data: [] } : (await request.getRequest(userPermissionUrl, commonModel.token)).data;
        if (interfaceReturn.code === 1 && userPermissionReturn.code === 1) {
          const childMenusData = interfaceReturn.data.map(menu => {
            return subMenu(menu, userPermissionReturn.data);
          });
          const menusData = [{ label: '产品与服务', key: 1, icon: <AppstoreOutlined />, children: childMenusData }];
          dispatchModifySelfState({ menusData });
        } else {
          if (interfaceReturn.code !== 1) {
            props.gotoError(dispatch, interfaceReturn);
          }  else if (userPermissionReturn.code !== 1) {
            props.gotoError(dispatch, userPermissionReturn);
          }
        }
      }
    }

    fetchData();
  }, [props.commonModel.userInfo.userId]);

  const subMenu = (menu, userPermission) => {
    if (commonUtils.isNotEmptyArr(menu.children) && menu.isVisible) {
      return {label: menu.viewName, key: menu.id, children: menu.children.map(menu => { return subMenu(menu, userPermission) })
      };
    } else { //if (menu.isVisible) {
      const disabled = props.commonModel.userInfo.isManage ? false : !(userPermission.findIndex(item => item.permissionRouteId === menu.id) > -1);
      return menu.isVisible ? {label: menu.viewName, key: menu.id, menuData: menu, disabled} : undefined;
    }
  }

  const onClick = async (e) => {
    props.callbackAddPane(e.key);
    dispatchModifySelfState({ collapsed: !modifySelfState.collapsed });
    sessionStorage.setItem('collapsed',  JSON.stringify(!modifySelfState.collapsed))
  };

  const onToggleCollapsed = () => {
    dispatchModifySelfState({ collapsed: !modifySelfState.collapsed });
    sessionStorage.setItem('collapsed',  JSON.stringify(!modifySelfState.collapsed))
  }
  return (
    <div style={{ width: modifySelfState.collapsed ? 50 :256 }} className="xwr-index-page-siderbar">
    
      {/* {!modifySelfState.collapsed ? '' : */}
        <Menu onClick={onClick} mode="vertical" subMenuCloseDelay={0.6} items={modifySelfState.menusData} />
      {/* } */}
      <Button type="primary" onClick={onToggleCollapsed} style={{ marginBottom: 16 }} className="sider-bar-collapse-btn">
        {modifySelfState.collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </Button>
    </div>
  );
}

export default IndexMenu;