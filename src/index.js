import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { Axios } from "axios";
import { Input } from "antd";
import "antd/dist/antd.css";
import "./index.css";

const request = new Axios({
  baseURL: "https://xueqiu-timelines.daxianyu.workers.dev"
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
              l.current = [...l.current];
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
  return (
    <div>
      {list.map((item) => {
        if (!item) return null;
        return (
          <div key={item.id} style={{ margin: "0 15px" }}>
            <a href={`https://xueqiu.com/${item.author_id}/${item.id}`}>
              【原文】
            </a> 
            <span>{item.author}: </span>
            <span dangerouslySetInnerHTML={{ __html: item.text }}></span>
          </div>
        );
      })}
    </div>
  );
}
