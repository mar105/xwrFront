import { Modal } from "antd";
import React from "react";

const commonModal = (props) => {
  return <Modal
    visible={props.modalVisible}
    title={props.modalTitle}
    footer={null}
    width={1500}
    onCancel={props.onModalCancel}
  >
    {props.modalPane}
  </Modal>
}

export default commonModal;