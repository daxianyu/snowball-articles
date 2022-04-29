import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { Axios } from "axios";
import { Input } from "antd";
import "antd/dist/antd.css";
import "./index.css";

const request = new Axios({
  baseURL: "https://iyao.daxianyu.cn"
});

ReactDOM.render(
  <div className="App">
    <h1>雪球文章搜索</h1>
    <Input />
    <List />
  </div>,
  document.getElementById("root")
);

function List() {
  const l = useRef([]);
  const [list, setList] = useState([]);
  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await request.get("/query");
        Promise.all(
          JSON.parse(response.data).map((id, i) => {
            return request.get("/query?timeline_id=" + id).then((res) => {
              l.current[i] = JSON.parse(res.data);
              setList(l.current);
            });
          })
        );
      } catch (err) {
        console.log(err);
      }
    };
    fetch();
  }, []);
  console.log(list);
  return (
    <div>
      {list.map((item) => {
        return (
          <div key={item.id}>
            <div dangerouslySetInnerHTML={{ __html: item.text }}></div>:{" "}
            <span>{item.text}</span>
          </div>
        );
      })}
    </div>
  );
}
