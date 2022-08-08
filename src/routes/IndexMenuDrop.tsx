/*
 * @Author: xulinyu xlyhacker@gmail.com
 * @Date: 2022-08-08 21:35:33
 * @LastEditors: xulinyu xlyhacker@gmail.com
 * @LastEditTime: 2022-08-08 23:41:24
 * @FilePath: \xwrFront\src\routes\indexMenuDrop.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useEffect, useState } from "react";
import { Drawer, Menu } from "antd";
import type { MenuProps } from "antd";
type MenuItem = Required<MenuProps>["items"][number];
const IndexMenuDrop = (props) => {
  const [drawVisible, setDrawVisivle] = useState(true);
  const [menuGroup, setMenuGroup] = useState([]);
  const [baiscMenu, setBasicMenu] = useState([]);

  useEffect(() => {
    setDrawVisivle(props.visible);
  }, [props.visible]);

  useEffect(() => {
    if (props.menus && props.menus.length) {
      let _menus = props.menus
      let secondMenu = _menus[0].children;
      delete _menus[0].children
      console.log('_menus=========', _menus)
      let firstMenu =_menus;
      setBasicMenu(firstMenu);
      setMenuGroup(secondMenu);
    }
  }, [props.menus]);
  const onClose = () => {
    setDrawVisivle(false);
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

  return (
    <Drawer
      zIndex={99}
      style={{marginTop: 50}}
      placement="left"
      closable={false}
      onClose={onClose}
      visible={drawVisible}
    >
      <Menu mode="vertical" theme="light" items={baiscMenu} />
    </Drawer>
  );
};
export default IndexMenuDrop;
