// import {Col, Form, Row} from "antd";
// import {ButtonGroup} from "../ButtonGroup";
// import {connect} from "react-redux";
// import * as commonUtils from "../../../utils/commonUtils";
// import commonBase from "../../../common/commonBase";
// import commonBasic from "../../commonBasic";
// import React from "react";
//
// const Category = (props) => {
//   const [form] = Form.useForm();
//   props.onSetForm(form);
//   const layout = {
//     labelCol: { span: 8 },
//     wrapperCol: { span: 16 },
//   };
//   return (
//     <Form {...layout} name="basic" form={form} onFinishFailed={onFinishFailed} onFinish={onFinish}>
//       <Row style={{ height: 'auto', overflow: 'auto' }}>
//         <Col>
//           {component}
//         </Col>
//       </Row>
//       <ButtonGroup {...buttonGroup} />
//     </Form>
//   );
// }
//
// export default connect(commonUtils.mapStateToProps)(commonBase(commonBasic(Category)));