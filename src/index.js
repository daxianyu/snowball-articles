import React from "react";
import ReactDOM from "react-dom";
import { version } from "antd";
import { Input } from 'antd'
import "antd/dist/antd.css";
import "./index.css";

ReactDOM.render(
  <div className="App">
    <h1>雪球文章搜索</h1>
    <Input />
  </div>,
  document.getElementById("root")
);
