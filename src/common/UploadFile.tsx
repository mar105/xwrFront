import React, {useReducer} from "react";
import { Modal, Upload} from "antd";
import { PlusOutlined } from '@ant-design/icons';
import * as commonUtils from "../utils/commonUtils";

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
    const suffix = file.name.substring(file.name.lastIndexOf(".") + 1, file.name.length).toLowerCase();
    if (suffix === 'jpg' || suffix === 'png' || suffix === 'gif' || suffix === 'bmp' || suffix === 'jpeg' ||
      suffix === 'tif' || suffix === 'tiff' || suffix === 'ico') {
      dispatchModifySelfState({
        previewImage: file.url || file.preview,
        previewVisible: true,
        previewTitle: file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
      });
    } else if (!file.url) {
      window.open(file.url);
    }

  };

  const onChange = ({ fileList }) => {
    params.dispatchModifyState({ [params.name + 'FileList']: fileList });
  }

  const beforeUpload = file => {
    params.dispatchModifyState({ [params.name + 'FileList']: [...params.fileList, file] });
    return false;
  }

  const onRemove = file => {
    const delFileList = commonUtils.isEmptyArr(params.delFileList) ? [] : params.delFileList;
    params.dispatchModifyState({ [params.name + 'DelFileList']: [...delFileList, file] });
  }

  // const onDownload = file => {
  //   if (!file.url) {
  //     window.open(file.url);
  //   }
  // }

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
      onRemove={onRemove}
      onPreview={onPreview}
      // onDownload={onDownload}
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