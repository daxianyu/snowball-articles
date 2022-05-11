import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { Axios } from "axios";
import { Button, Select, InputNumber } from "antd";
import "antd/dist/antd.css";
import "./index.css";
import moment from "moment";
import SearchSelect from "./SearchSelect";

const request = new Axios({
  baseURL: "https://sbservice.daxianyu.cn"
});

const utilsRequest = new Axios({
  baseURL: "https://utils.daxianyu.cn"
});

ReactDOM.render(
  <div className="App">
    <h2>雪球快照</h2>
    <List />
  </div>,
  document.getElementById("root")
);

function List() {
  const l = useRef([]);
  const [page, setPage] = useState(1);
  const [tempPage, setTempPage] = useState(1);
  const [list, setList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [user, setUser] = useState("2292705444");
  function handleChangeUser(userId) {
    setPage(1);
    setUser(userId);
  }

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await utilsRequest.get("/users");
        const users = JSON.parse(response.data);
        setUserList(users);
      } catch (err) {
        console.log(JSON.stringify(err));
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await request.get(`/query?user=${user}&page=${page}`);
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
  }, [page, user]);
  return (
    <div>
      <div>
        <Select value={user} onChange={handleChangeUser}>
          {userList.map((u) => (
            <Select.Option value={u} key={u}>
              {u}
            </Select.Option>
          ))}
        </Select>

        <SearchSelect style={{ width: 200 }} />
      </div>

      {list.map((item) => {
        if (!item) return null;
        return (
          <div className="card" key={item.id}>
            <a
              target="__blank"
              href={`https://xueqiu.com/${item.author_id}/${item.id}`}
            >
              【原文】
            </a>
            <div>
              {item.author} 发表于{" "}
              {moment(Number(item.created_at)).format("YY-MM-DD HH:mm")}{" "}
            </div>
            <span dangerouslySetInnerHTML={{ __html: item.text }}></span>
            <a
              target="__blank"
              href={`https://iyao.daxianyu.cn/comments/${item.id}`}
            >
              评论
            </a>
          </div>
        );
      })}

      <div style={{ marginTop: 10 }}>
        <Button
          onClick={() => {
            setPage(page - 1);
            setTempPage(page - 1);
          }}
          disabled={page <= 1}
        >
          上一页
        </Button>
        <Button
          onClick={() => {
            setPage(page + 1);
            setTempPage(page + 1);
          }}
        >
          下一页
        </Button>
        <InputNumber
          min={1}
          value={tempPage}
          onChange={(v) => setTempPage(v)}
        />
        <Button
          onClick={() => {
            setPage(tempPage);
          }}
        >
          跳转
        </Button>
      </div>
    </div>
  );
}
