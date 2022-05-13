import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { Axios } from "axios";
import { Button, Select, InputNumber, message } from "antd";
import "antd/dist/antd.css";
import "./index.css";
import moment from "moment";
import SearchSelect from "./SearchSelect";
import Login from "./Login";

const token = localStorage.getItem("token");

const request = new Axios({
  baseURL: "https://sbservice.daxianyu.cn",
  headers: {
    token
  }
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
  const [userMap, setUserMap] = useState({});
  const [page, setPage] = useState(1);
  const [tempPage, setTempPage] = useState(1);
  const [list, setList] = useState([]);
  const [user, setUser] = useState("");
  const [toSub, setToSub] = useState(null);
  const [loginVisible, setLoginVisibility] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  function handleChangeUser(userId) {
    setPage(1);
    setTempPage(1);
    setUser(userId);
  }
  async function fetchUserList() {
    try {
      const response = await request.get("/userlist");
      const users = JSON.parse(response.data);
      const map = {};
      users.forEach((u) => {
        map[u.id] = u;
      });
      setUserMap(map);
    } catch (err) {
      console.error(JSON.stringify(err));
    }
  }

  async function fetchCurrentUser() {
    try {
      const response = await request.get("/userInfo");
      const userInfo = JSON.parse(response.data);
      userInfo.subs = userInfo.subs || [];
      setCurrentUser(userInfo);
      if (user && userInfo.subs.indexOf(user) === -1) {
        setUser(userInfo.subs.length ? userInfo.subs[0] : "");
      }
    } catch (err) {
      console.error(JSON.stringify(err));
    }
  }

  useEffect(() => {
    request.interceptors.response.use((res) => {
      if (res.status === 401) {
        setLoginVisibility(true);
      }
      return res;
    });
    fetchUserList();
    fetchCurrentUser();
  }, []);

  function isSubscribed(sub) {
    if (!sub) return false;
    return currentUser.subs.some((u) => u === +sub.value);
  }

  function subscribe(subId, name) {
    async function subscribeFetch() {
      try {
        await request.post(
          `/subscribe`,
          JSON.stringify({ id: subId, name: name })
        );
        await fetchUserList();
        await fetchCurrentUser();
      } catch (err) {
        message.error(err.message);
      }
    }
    subscribeFetch();
  }

  function unSubscribe(subId) {
    async function unSubscribeFetch() {
      try {
        await request.delete("/unsubscribe?id=" + subId);
        await fetchUserList();
        await fetchCurrentUser();
      } catch (err) {
        message.error(err.message);
      }
    }
    unSubscribeFetch();
    unListen(subId);
  }

  function listen(subId) {
    async function listenFetch() {
      try {
        await request.post(`/listen`, JSON.stringify({ id: subId }));
        await fetchCurrentUser();
      } catch (err) {
        message.error(err.message);
      }
    }
    listenFetch();
  }

  function unListen(subId) {
    async function unListenFetch() {
      try {
        await request.delete("/unlisten?id=" + subId);
        await fetchCurrentUser();
      } catch (err) {
        message.error(err.message);
      }
    }
    unListenFetch();
  }

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
    if (user) {
      fetch();
    }
  }, [page, user]);

  if (!currentUser) {
    return (
      <Login visible={loginVisible} onChangeVisibility={setLoginVisibility} />
    );
  }

  return (
    <div>
      <div>
        {(currentUser.subs.length && (
          <Select
            style={{ width: 150, marginRight: 10 }}
            value={user}
            onChange={handleChangeUser}
          >
            {currentUser.subs.map((subId) => {
              const u = userMap[subId];
              if (!u) return null;
              return (
                <Select.Option value={u.id} key={u.name}>
                  {u.name}
                </Select.Option>
              );
            })}
          </Select>
        )) ||
          null}
        {user ? (
          currentUser.listen && currentUser.listen.indexOf(+user) > -1 ? (
            <Button
              onClick={() => {
                unListen(user);
              }}
            >
              取消推送
            </Button>
          ) : (
            <Button
              onClick={() => {
                listen(user);
              }}
            >
              推送
            </Button>
          )
        ) : null}
        <div style={{ marginTop: 10 }}>
          <SearchSelect
            style={{ width: 150, marginRight: 10 }}
            value={toSub}
            onChange={(sub) => {
              setToSub(sub);
            }}
          />
          {toSub ? (
            isSubscribed(toSub) ? (
              <Button
                onClick={() => {
                  unSubscribe(toSub.value);
                }}
              >
                取消监听
              </Button>
            ) : (
              <Button
                onClick={() => {
                  subscribe(toSub.value, toSub.text);
                }}
              >
                监听
              </Button>
            )
          ) : null}
        </div>
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
            <div>
              <a
                target="__blank"
                href={`https://sbservice.daxianyu.cn/comments/${item.id}`}
              >
                评论
              </a>
            </div>
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
