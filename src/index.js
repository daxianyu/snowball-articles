import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { Axios } from "axios";
import { Button, Select, InputNumber, message, Spin, Popconfirm } from "antd";
import "antd/dist/antd.css";
import "./index.css";
import moment from "moment";
import SearchSelect from "./SearchSelect";
import Pubkey from "./Pubkey";
import Login from "./Login";
import Comment from "./Comment";

const lastSuber = localStorage.getItem("suber");

const request = new Axios({
  baseURL: "https://sbservice.daxianyu.cn",
  withCredentials: true
});

request.interceptors.response.use((res) => {
  if (res.status === 401 || res.status === 500) {
    message.warning(res.data);
  }
  return res;
});

ReactDOM.render(
  <div className="App">
    <h2>XUEQIU SNOWBALL</h2>
    <List />
  </div>,
  document.getElementById("root")
);

function List() {
  const l = useRef([]);
  const [spinning, setSpinning] = useState(false);
  const [userMap, setUserMap] = useState({});
  const [page, setPage] = useState(1);
  const [tempPage, setTempPage] = useState(1);
  const [list, setList] = useState([]);
  const [user, setUser] = useState(+lastSuber);
  const [subers, setSubers] = useState([]);
  const [toSub, setToSub] = useState(null);
  const [loginVisible, setLoginVisibility] = useState(false);
  const [pushVisible, setPushVisibility] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [commentInfo, setCommentInfo] = useState(null);
  function handleChangeUser(userId) {
    setPage(1);
    setTempPage(1);
    setUser(userId);
    localStorage.setItem("suber", userId);
  }
  async function fetchUserList() {
    try {
      const response = await request.get("/userlist");
      const users = JSON.parse(response.data);
      const map = {};
      users.forEach((u) => {
        map[u.id] = u;
      });
      setSubers(users);
      setUserMap(map);
    } catch (err) {
      console.error(JSON.stringify(err));
    }
  }

  async function fetchMsg() {
    const response = await request.get("/msg");
    if (response.data) {
      message.info(response.data, 5);
    }
  }

  async function fetchCurrentUser() {
    try {
      const response = await request.get("/userInfo");
      if (response.status === 401) {
        setLoginVisibility(true);
        return;
      }
      const userInfo = JSON.parse(response.data);
      userInfo.subs = userInfo.subs || [];
      setCurrentUser(userInfo);
      if (!user || userInfo.subs.indexOf(user) === -1) {
        setUser(userInfo.subs.length ? userInfo.subs[0] : "2292705444");
      }
      if (!userInfo || userInfo.name === "guest") {
        fetchMsg();
      }
    } catch (err) {
      console.error(JSON.stringify(err));
    }
  }

  async function fetchPageList(user, page) {
    try {
      const response = await request.get(`/query?user=${user}&page=${page}`);
      l.current = [];
      setList(l.current);
      setSpinning(false);
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
  }

  // 初始化
  useEffect(() => {
    fetchUserList();
    fetchCurrentUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        setToSub(null);
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
        await fetchCurrentUser();
      } catch (err) {
        message.error(err.message);
      }
    }
    unSubscribeFetch();
    // unListen(subId);
  }

  function listen(subId) {
    if (!currentUser.key) {
      setPushVisibility(true);
      return;
    }
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

  function handleLogout() {
    async function Logout() {
      try {
        await request.get("/logout");
        window.location.reload();
      } catch (err) {
        message.error(err.message);
      }
    }
    Logout();
  }

  useEffect(() => {
    if (user) {
      fetchPageList(user, page);
    } else {
      if (page > 1) {
        message.warning("请先选择或搜索用户进行关注！");
      }
    }
  }, [page, user]);

  function handleChangeToSub(sub) {
    setToSub(sub);
    if (currentUser.name === "guest" && !currentUser.subs.length && sub) {
      fetchPageList(sub.value, page);
    }
  }

  function handleRefresh() {
    fetchPageList(user, page);
    setSpinning(true);
  }

  if (!currentUser) {
    return (
      <Login visible={loginVisible} onChangeVisibility={setLoginVisibility} />
    );
  }

  return (
    <div>
      {currentUser && pushVisible ? (
        <Pubkey
          user={currentUser}
          visible={pushVisible}
          onClose={() => setPushVisibility()}
        />
      ) : null}
      <div>
        <div style={{ display: subers.length ? "block" : "none" }}>
          {(currentUser.subs.length && (
            <Select
              style={{ width: 130, marginRight: 10 }}
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
          {user && currentUser.subs.indexOf(+user) > -1 ? (
            <Button.Group>
              {currentUser.listen && currentUser.listen.indexOf(+user) > -1 ? (
                <Popconfirm
                  onConfirm={() => {
                    unListen(user);
                  }}
                  title="确认？"
                >
                  <Button>取推</Button>
                </Popconfirm>
              ) : (
                <Button
                  onClick={() => {
                    listen(user);
                  }}
                >
                  推送
                </Button>
              )}
              <Popconfirm
                title="确认？"
                onConfirm={() => {
                  unSubscribe(user);
                }}
              >
                <Button>取关</Button>
              </Popconfirm>
              <Button onClick={handleRefresh}>
                {spinning ? <Spin /> : "刷新"}
              </Button>
            </Button.Group>
          ) : null}
        </div>
        <div style={{ marginTop: 10 }}>
          <SearchSelect
            style={{ width: 255, marginRight: 10 }}
            value={toSub}
            placeholder="🔍搜索用户"
            preList={subers}
            onChange={(sub) => {
              handleChangeToSub(sub);
            }}
          />
          {toSub ? (
            isSubscribed(toSub) ? (
              <Popconfirm
                title="确认？"
                onConfirm={() => {
                  unSubscribe(toSub.value);
                }}
              >
                <Button>取关</Button>
              </Popconfirm>
            ) : (
              <Button
                onClick={() => {
                  subscribe(toSub.value, toSub.text);
                }}
              >
                关注
              </Button>
            )
          ) : null}
        </div>
      </div>

      <div style={{ minHeight: 250 }}>
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
                <span
                  type="link"
                  className="ant-btn-link link"
                  onClick={() => {
                    setCommentInfo({
                      visible: true,
                      url: `https://sbservice.daxianyu.cn/comments/${item.id}`
                    });
                  }}
                >
                  【评论】
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {commentInfo && (
        <Comment
          visible={commentInfo.visible}
          commentUrl={commentInfo.url}
          onClose={() => setCommentInfo(null)}
        />
      )}
      <div style={{ marginTop: 10 }}>
        <Button.Group>
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
        </Button.Group>
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
        <div>
          <span
            className="ant-btn-link link"
            onClick={() => setPushVisibility(true)}
          >
            推送设置
          </span>
          {(!currentUser ||
            !currentUser.name ||
            currentUser.name === "guest") && (
            <Button type="link" onClick={() => setLoginVisibility(true)}>
              登录
            </Button>
          )}
          {currentUser && currentUser.name && currentUser.name !== "guest" && (
            <Button type="link" onClick={() => handleLogout()}>
              注销
            </Button>
          )}
          {currentUser && currentUser.name && currentUser.name !== "guest" && (
            <span>
              有效期至：
              {moment(currentUser.expired_at).format("YYYY-MM-DD HH:mm")}
            </span>
          )}
        </div>
        <Login visible={loginVisible} onChangeVisibility={setLoginVisibility} />
      </div>
    </div>
  );
}
