import {useEffect, useReducer} from "react";
import * as application from "../application";
import * as request from "../utils/request";
import * as commonUtils from "../utils/commonUtils";
import * as React from "react";
import {Button, Menu} from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined, AppstoreOutlined } from '@ant-design/icons';

const { SubMenu } = Menu;

const IndexMenu = (props) => {
  const [modifySelfState, dispatchModifySelfState] = useReducer((state, action) => {
    return {...state, ...action };
  },{});
  useEffect(() => {
    const {dispatch, commonModel } = props;
    const fetchData = async () => {
      if (commonModel.userInfo.userId !== '') {
        const url: string = `${application.urlManage}/route/getAllRoute`;
        const userPermissionUrl: string = `${application.urlPrefix}/userPermission/getUserPermission?routeId=` + props.routeId +
          '&groupId=' + commonModel.userInfo.groupId + '&shopId=' + commonModel.userInfo.shopId + '&userId=' + commonModel.userInfo.userId;
        const interfaceReturn = (await request.getRequest(url, commonModel.token)).data;
        const userPermissionReturn = commonModel.userInfo.isManage ? { code: 1, data: [] } : (await request.getRequest(userPermissionUrl, commonModel.token)).data;
        if (interfaceReturn.code === 1 && userPermissionReturn.code === 1) {
          const menusData = interfaceReturn.data.map(menu => {
            return subMenu(menu, userPermissionReturn.data);
          });
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
    if (commonUtils.isNotEmptyArr(menu.children) ) {
      return <SubMenu key={menu.id} title={menu.viewName}>
        {menu.children.map(menu => {
          return subMenu(menu, userPermission);
        })}
      </SubMenu>
    } else {
      const disabled = props.commonModel.userInfo.isManage ? false : !(userPermission.findIndex(item => item.permissionRouteId === menu.id) > -1);
      // @ts-ignore
      return <Menu.Item key={menu.id} menuData={menu} disabled={disabled}>{menu.viewName}</Menu.Item>
    }
  }

  const onClick = async (e) => {
    props.callbackAddPane(e.key);
    dispatchModifySelfState({ collapsed: !modifySelfState.collapsed });
  };

  const onToggleCollapsed = () => {
    dispatchModifySelfState({ collapsed: !modifySelfState.collapsed });
  }
  return (
    <div style={{ width: 256 }}>
      <Button type="primary" onClick={onToggleCollapsed} style={{ marginBottom: 16 }}>
        {modifySelfState.collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </Button>
      {!modifySelfState.collapsed ? '' :
        <Menu onClick={onClick} mode="vertical" subMenuCloseDelay={0.6}>
          <SubMenu key="1" icon={<AppstoreOutlined />} title="产品与服务">
            {modifySelfState.menusData}
          </SubMenu>
        </Menu>
      }
    </div>
  );
}

export default IndexMenu;