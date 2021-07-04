import * as request from "../utils/request";
import * as application from "./application";

const categoryListButtonEvent = async (key, config, e, childParams, props) => {
  const { dispatch, dispatchModifyState, commonModel, routeId } = props;
  if (key === 'syncBillButton') {
    const url: string = `${application.urlPrefix}/button/syncBill`;
    const params = {
      routeId,
      groupId: commonModel.userInfo.groupId,
      shopId: commonModel.userInfo.shopId,
      containerId: config.superiorId,
      containerSlaveId: config.id,
    }
    const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
    if (interfaceReturn.code === 1) {
      const returnState = await props.getAllData();
      dispatchModifyState({ ...returnState, slaveSelectedRows: [], slaveSelectedRowKeys: [] });
      props.gotoSuccess(dispatch, interfaceReturn);
    } else {
      props.gotoError(dispatch, interfaceReturn);
    }
  }
  return {};
}

export default categoryListButtonEvent;