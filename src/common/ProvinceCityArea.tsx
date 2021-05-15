import React from "react";
import {CascaderComponent} from "../components/CascaderComponent";
import pcaData from './pca-code.json';

const ProvinceCityArea = (props) => {
  const params = { ...props};
  params.property.options = pcaData;
  params.property.fieldNames= { label: 'name', value: 'name', children: 'children' };
  return (<CascaderComponent {...params}/>);
}

export default ProvinceCityArea;