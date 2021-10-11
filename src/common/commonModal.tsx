import { Modal } from "antd";
import React from "react";

const commonModal = (props) => {
  return <Modal
    visible={props.modalVisible}
    title={props.modalTitle}
    footer={null}
    onCancel={props.onModalCancel}
  >
  </Modal>
}

export default commonModal;