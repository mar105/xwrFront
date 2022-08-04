import * as React from "react";
import { connect } from "dva";
import TabPages from "../TabPages";
import commonBase from "../../common/commonBase";
import * as commonUtils from "../../utils/commonUtils";
import { routeInfo } from "../routeInfo";
import * as application from "../application";
import * as request from "../../utils/request";
import { useEffect } from "react";
import { useRef } from "react";
import { useReducer } from "react";
import { Menu, Avatar, Dropdown, Button } from "antd";
import { UserOutlined, EllipsisOutlined } from "@ant-design/icons";

function IndexPage(props) {
  const [modifySelfState, dispatchModifySelfState] = useReducer(
    (state, action) => {
      return { ...state, ...action };
    },
    {}
  );

  const stompClientRef: any = useRef();
  const panesRef: any = useRef();
  const panesComponentsRef: any = useRef();
  useEffect(() => {
    stompClientRef.current = props.commonModel.stompClient;
  }, [props.commonModel.stompClient]);

  useEffect(() => {
    panesRef.current = props.commonModel.panes;
  }, [props.commonModel.panes]);

  useEffect(() => {
    panesComponentsRef.current = props.panesComponents;
  }, [props.panesComponents]);

  useEffect(() => {
    const intervalWebsocket = setInterval(() => {
      connectionWebsocket();
    }, 5000);
    dispatchModifySelfState({ intervalWebsocket });
    return () => clearInterval(intervalWebsocket);
  }, []);

  const connectionWebsocket = () => {
    const { dispatch, commonModel } = props;
    if (
      commonUtils.isEmpty(stompClientRef.current) ||
      !stompClientRef.current.connected
    ) {
      const stompClient = commonUtils.getWebSocketData(
        stompClientRef.current,
        () => {
          dispatch({
            type: "commonModel/saveStompClient",
            payload: stompClient,
          });
        },
        commonModel.token
      );
    }
  };

  const onClick = (path) => {
    const { dispatch, dispatchModifyState, panesComponents } = props;
    const key = commonUtils.newId();
    const route: any = commonUtils.getRouteComponent(routeInfo, path);
    if (commonUtils.isNotEmptyObj(route)) {
      if (route.title) {
        const panes = commonModel.panes;
        const pane = { key, title: route.title, route: path };
        panes.push(pane);
        panesComponents.push(
          commonUtils.panesComponent(pane, route, null, null, null)
        );
        dispatch({
          type: "commonModel/saveActivePane",
          payload: { ...pane },
        });
        dispatch({
          type: "commonModel/savePanes",
          payload: panes,
        });
        dispatchModifyState({ panesComponents });
      }
      dispatch({
        type: "commonModel/gotoNewPage",
        payload: { newPage: path },
      });
    }
  };

  const onClear = async () => {
    const { dispatch, commonModel } = props;
    const url: string = application.urlCommon + "/verify/clearAllModifying";
    const interfaceReturn = (
      await request.postRequest(
        url,
        commonModel.token,
        application.paramInit({})
      )
    ).data;
    if (interfaceReturn.code === 1) {
    } else {
      props.gotoError(dispatch, interfaceReturn);
    }
  };

  const onExit = async () => {
    const { dispatch } = props;
    clearInterval(modifySelfState.intervalWebsocket);
    if (props.commonModel.stompClient !== null) {
      props.commonModel.stompClient.disconnect();
    }

    dispatch({
      type: "commonModel/gotoNewPage",
      payload: { newPage: "/xwrManage/login" },
    });
  };

  const { commonModel } = props;

  const dropDownMenus = 
   <Menu>
      <Menu.Item>
        <Button onClick={onClear} type="link">
          清除缓存
        </Button>
      </Menu.Item>
      <Menu.Item>
        <Button type="link" onClick={onExit}> 退出
        </Button>
      </Menu.Item>
      <Menu.Item>
    
          <Button type="link" onClick={onClick.bind(this, "/xwrManage/route")}>
            add route
          </Button>
      </Menu.Item>
      
      <Menu.Item>
      <Button type="link"  onClick={onClick.bind(this, "/xwrManage/container")}>
            add container
          </Button>
          
          </Menu.Item><Menu.Item>
            
          <Button type="link"  onClick={onClick.bind(this, "/xwrManage/permission")}>
            add permission
          </Button></Menu.Item><Menu.Item>

          <Button type="link" onClick={onClick.bind(this, "/xwrManage/constant")}>
            add constant
          </Button>
          </Menu.Item>
    </Menu>
  return (
    <div className="xwr-manage-homepage">
      <div className="top-row">
        <div className="left-box">
          <Menu mode="horizontal">
            <Menu.Item>
              <a href="/">主页</a>
            </Menu.Item>
            <Menu.Item>
              <a href="/xwrManage">管理主页</a>
            </Menu.Item>
            <Menu.Item>
              <a href="/xwrManage/register"> register</a>
            </Menu.Item>
            <Menu.Item>
              <a href="/xwrManage/login"> login</a>
            </Menu.Item>
            <Menu.Item>
              <a href="/xwrManage/route"> route</a>
            </Menu.Item>
          </Menu>
        </div>
        <div className="right-box">
          <Avatar icon={<UserOutlined />} className="user-avatar">
          
          </Avatar>
          <span>  {commonModel.userInfo.userName}</span>

          <Dropdown overlay={dropDownMenus} className="corner-action-dropdown">
            <a onClick={(e) => e.preventDefault()}>
                <EllipsisOutlined />
            </a>
          </Dropdown>
        </div>
      </div>

      <div className="xwr-manage-homepage-tab-box">
        <TabPages {...props} />
      </div>
    </div>
  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(IndexPage));
