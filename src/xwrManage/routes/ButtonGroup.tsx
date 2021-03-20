import {ButtonComponent} from "../../components/ButtonComponent";
import {componentType} from "../../utils/commonTypes";
import {Col, Row} from "antd";
import React from 'react';

export function ButtonGroup(params) {
  const buttonGroup = params.buttonGroup.map(item => {
    const button = {
      caption: item.caption,
      property: { htmlType: item.htmlType },
      event: { onClick: item.onClick },
      componentType: componentType.Soruce,
    };
    return <Col><ButtonComponent {...button} /></Col>;
  });
  return <Row style={{ height: 'auto', overflow: 'auto' }}>{buttonGroup}</Row>;
}