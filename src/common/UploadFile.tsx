import React, {useReducer} from "react";
import { Modal, Upload} from "antd";
import { PlusOutlined } from '@ant-design/icons';

export function UploadFile(params) {
  const [modifySelfState, dispatchModifySelfState] = useReducer((state, action) => {
    return {...state, ...action };
  },{});
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  const onPreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    dispatchModifySelfState({
      previewImage: file.url || file.preview,
      previewVisible: true,
      previewTitle: file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
    });
  };

  const onChange = ({ fileList }) => {
    params.dispatchModifyState({ [params.name + 'FileList']: fileList });
  }

  const beforeUpload = file => {
    params.dispatchModifyState({ [params.name + 'FileList']: [...params.fileList, file] });
    return false;
  }

  const onCancel = () => dispatchModifySelfState({ previewVisible: false });

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return <div>
    <Upload
      // action={application.urlUpload + '/uploadFile'}
      listType="picture-card"
      fileList={params.fileList}
      multiple
      beforeUpload={beforeUpload}
      onPreview={onPreview}
      onChange={onChange}>
      {params.enabled ? uploadButton : null}
    </Upload>
    <Modal
      visible={modifySelfState.previewVisible}
      title={modifySelfState.previewTitle}
      footer={null}
      onCancel={onCancel}
    >
    <img alt="example" style={{ width: '100%' }} src={modifySelfState.previewImage} />
    </Modal>
  </div>

}