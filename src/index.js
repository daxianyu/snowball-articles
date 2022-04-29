import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { Axios } from "axios";
import { Button } from "antd";
import "antd/dist/antd.css";
import "./index.css";

const request = new Axios({
  baseURL: "https://xueqiu-timelines.daxianyu.workers.dev"
});

ReactDOM.render(
  <div className="App">
    <h1>雪球文章搜索</h1>
    <List />
  </div>,
  document.getElementById("root")
);

function List() {
  const l = useRef([]);
  const [page, setPage] = useState(1);
  const [list, setList] = useState([]);
  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await request.get("/query?page=" + page);
        l.current = [];
        setList(l.current);
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
  }, [page]);
  return (
    <div>
      {list.map((item) => {
        if (!item) return null;
        return (
          <div key={item.id} style={{ margin: "15px 0" }}>
            <a href={`https://xueqiu.com/${item.author_id}/${item.id}`}>
              【原文】
            </a>
            <span>{item.author}: </span>
            <span dangerouslySetInnerHTML={{ __html: item.text }}></span>
          </div>
        );
      })}

      <div>
        <Button
          onClick={() => {
            setPage(page - 1);
          }}
          disabled={page <= 1}
        >
          上一页
        </Button>
        <Button
          onClick={() => {
            setPage(page + 1);
          }}
        >
          下一页
        </Button>
      </div>
    </div>
  );
}
