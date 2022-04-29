import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { Axios } from 'axios';
import { Input } from 'antd'
import "antd/dist/antd.css";
import "./index.css";

const request = new Axios({
  baseURL: 'https://iyao.daxianyu.cn',
});

request.get('/query').then(res => console.log(res))

ReactDOM.render(
  <div className="App">
    <h1>雪球文章搜索</h1>
    <Input />
    <List />
  </div>,
  document.getElementById("root")
);

function List() {
  useEffect(() => {
  }, [])

  return <div>12313</div>;
}
