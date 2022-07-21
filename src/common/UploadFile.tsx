import React, {useReducer} from "react";
import { Modal, Upload} from "antd";
import { PlusOutlined, CloudDownloadOutlined } from '@ant-design/icons';
import * as commonUtils from "../utils/commonUtils";

export function UploadFile(params) {
  const newState = params.isSelfModify ? { fileList: commonUtils.isEmptyArr(params.fileList) ? [] : [...params.fileList],
    delFileList: commonUtils.isEmptyArr(params.delFileList) ? [] : [...params.delFileList] } : {};
  const [modifySelfState, dispatchModifySelfState] = useReducer((state, action) => {
    return {...state, ...action };
  },{...newState});
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
    } else if (file.url) {
      window.open(file.url);
    }

  };

  const onChange = ({ fileList }) => {
    if (params.isSelfModify) {
      dispatchModifySelfState({ fileList });
    } else {
      params.dispatchModifyState({ [params.name + 'FileList']: fileList });
    }

  }

  const beforeUpload = file => {
    if (params.isSelfModify) {
      dispatchModifySelfState({ fileList: [...modifySelfState.fileList, file] });
    } else {
      params.dispatchModifyState({ [params.name + 'FileList']: [...params.fileList, file] });
    }
    return false;
  }

  const onRemove = file => {
    if (params.isSelfModify) {
      const delFileList = commonUtils.isEmptyArr(modifySelfState.delFileList) ? [] : modifySelfState.delFileList;
      dispatchModifySelfState({ delFileList: [...delFileList, file] });
    } else {
      const delFileList = commonUtils.isEmptyArr(params.delFileList) ? [] : params.delFileList;
      params.dispatchModifyState({ [params.name + 'DelFileList']: [...delFileList, file] });
    }

  }

  const onDownload = (file) => {
    if (file.url) {
      window.open(file.url);
    }
  };

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

  const showUploadList = { showDownloadIcon: true, downloadIcon: <CloudDownloadOutlined />, showRemoveIcon: true };

  return <div>
    <Upload
      // action={application.urlUpload + '/uploadFile'}
      listType="picture-card"
      fileList={params.isSelfModify ? modifySelfState.fileList : params.fileList}
      multiple
      beforeUpload={beforeUpload}
      onRemove={onRemove}
      onPreview={onPreview}
      onDownload={onDownload}
      // onDownload={onDownload}
      onChange={onChange}
      showUploadList={showUploadList}
      {...params.property}
    >
      { params.button ? params.button : params.enabled ? uploadButton : null}
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