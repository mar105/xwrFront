/*
 * @Author: xulinyu xlyhacker@gmail.com
 * @Date: 2022-08-08 21:35:33
 * @LastEditors: xulinyu xlyhacker@gmail.com
 * @LastEditTime: 2022-08-09 21:36:10
 * @FilePath: \xwrFront\src\routes\indexMenuDrop.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useEffect, useState, useReducer } from "react";
import { Drawer, Menu } from "antd";
import type { MenuProps } from "antd";
import * as application from "../application";
import * as request from "../utils/request";
import * as commonUtils from "../utils/commonUtils";
import { AppstoreOutlined, RightOutlined } from "@ant-design/icons";

type MenuItem = Required<MenuProps>["items"][number];
const IndexMenuDrop = (props) => {
  const [drawVisible, setDrawVisivle] = useState(true);
  const [menuGroup, setMenuGroup] = useState([]);
  const [baiscMenu, setBasicMenu] = useState([]);
  const [modifySelfState, dispatchModifySelfState] = useReducer(
    (state, action) => {
      return { ...state, ...action };
    },
    {}
  );
  useEffect(() => {
    console.log("props.visible==================", props.visible);
    setDrawVisivle(props.visible);
  }, [props.visible]);

  useEffect(() => {
    if (props.menus && props.menus.length) {
      let _menus = props.menus;
      let secondMenu = _menus[0].children;
      let firstMenu = _menus;
      setBasicMenu(firstMenu);
      console.log("secondMenu=========", secondMenu);
      setMenuGroup(secondMenu);
    }
  }, [props.menus]);

  useEffect(() => {
    const { dispatch, commonModel } = props;
    const fetchData = async () => {
      if (commonModel.userInfo.userId !== "") {
        const url: string = application.urlManage + "/route/getAllRoute";
        const userPermissionUrl: string =
          application.urlPrefix +
          "/userPermission/getUserPermission?routeId=" +
          props.routeId +
          "&groupId=" +
          commonModel.userInfo.groupId +
          "&shopId=" +
          commonModel.userInfo.shopId +
          "&userId=" +
          commonModel.userInfo.userId;
        const interfaceReturn = (
          await request.getRequest(url, commonModel.token)
        ).data;
        const userPermissionReturn = commonModel.userInfo.isManage
          ? { code: 1, data: [] }
          : (await request.getRequest(userPermissionUrl, commonModel.token))
              .data;
        if (interfaceReturn.code === 1 && userPermissionReturn.code === 1) {
          const childMenusData = interfaceReturn.data.map((menu) => {
            return subMenu(menu, userPermissionReturn.data);
          });
          const menusData = [
            {
              label: "产品与服务",
              key: 1,
              icon: <AppstoreOutlined />,
              children: childMenusData,
            },
          ];
          dispatchModifySelfState({ menusData });
        } else {
          if (interfaceReturn.code !== 1) {
            props.gotoError(dispatch, interfaceReturn);
          } else if (userPermissionReturn.code !== 1) {
            props.gotoError(dispatch, userPermissionReturn);
          }
        }
      }
    };

    fetchData();
  }, [props.commonModel.userInfo.userId]);

  const subMenu = (menu, userPermission) => {
    if (commonUtils.isNotEmptyArr(menu.children) && menu.isVisible) {
      return {
        label: menu.viewName,
        key: menu.id,
        children: menu.children.map((menu) => {
          return subMenu(menu, userPermission);
        }),
      };
    } else {
      //if (menu.isVisible) {
      const disabled = props.commonModel.userInfo.isManage
        ? false
        : !(
            userPermission.findIndex(
              (item) => item.permissionRouteId === menu.id
            ) > -1
          );
      return menu.isVisible
        ? { label: menu.viewName, key: menu.id, menuData: menu, disabled }
        : undefined;
    }
  };

  const onClose = () => {
    setDrawVisivle(false);
    props.handleCloseMenu();
  };

  const getItem = (
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
    type?: "group"
  ) => {
    return {
      key,
      icon,
      children,
      label,
      type,
    } as MenuItem;
  };

  useEffect(() => {
    console.log(
      "modifySelfState.menusData===========",
      modifySelfState.menusData
    );
  }, [modifySelfState.menusData]);

  const onClick = async (e) => {
    props.callbackAddPane(e.key);
    dispatchModifySelfState({ collapsed: !modifySelfState.collapsed });
    sessionStorage.setItem('collapsed',  JSON.stringify(!modifySelfState.collapsed));
    setDrawVisivle(false);
    props.handleCloseMenu();
  };


  return (
    <Drawer
      zIndex={99}
      width={900}
      style={{ marginTop: 50 }}
      placement="left"
      closable={false}
      maskClosable={true}
      onClose={onClose}
      visible={drawVisible}
      className="xwr-sider-draw"
    >
      <div className="xwr-sider-menu">
        {modifySelfState.menusData &&
          modifySelfState.menusData.map((item, index) => {
            return (
              <div
                className="first-menu-row"
                key={index}
              >
                <div className="menu-name-box">
                  <AppstoreOutlined />
                  <div className="menu-name">{item && item.label}</div>
                </div>

                <RightOutlined />
              </div>
            );
          })}
      </div>
      <div className="xwr-right-menu">
        <div className="xwr-menu-group">
          {modifySelfState.menusData &&
          modifySelfState.menusData[0].children.map((item, index) => {
            return (
              <div key={index} className="submenu-group">
                <h3 className="submenu-group-title">
                  {item && item.label}
                </h3>
                <ul className="each-menu-group">
                  {item &&
                  item.children &&
                  item.children
                    .filter((item) => item != undefined)
                    .map((menuItem, menuItemIndex) => {
                      return (
                        <li className="xwr-each-menu" key={menuItemIndex} onClick={onClick.bind(this, menuItem)}>
                          {menuItem && menuItem.label}
                        </li>
                      );
                    })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </Drawer>
  );
};
export default IndexMenuDrop;
