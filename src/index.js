import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Axios } from "axios";
import { Button, InputNumber, message, Spin, Image } from "antd";
import { UpCircleOutlined, RedoOutlined, DownCircleOutlined } from '@ant-design/icons'
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

const sUserAgent = navigator.userAgent;
let isMobile = true;
if (sUserAgent.indexOf("Android") > -1 || sUserAgent.indexOf("iPhone") > -1) {
  isMobile = true;
}

request.interceptors.response.use((res) => {
  if (res.status === 401 || res.status === 500) {
    message.warning(res.data);
  }
  return res;
});

ReactDOM.render(
  <div className="App">
    <h2 id="title">XUEQIU SNOWBALL 订阅</h2>
    <List />
  </div>,
  document.getElementById("root")
);

function List() {
  const [spinning, setSpinning] = useState(false);
  const [userMap, setUserMap] = useState({});
  const [page, setPage] = useState(1);
  const [tempPage, setTempPage] = useState(1);
  const [list, setList] = useState([]);
  const [suberId, setSuberId] = useState(+lastSuber);
  const [subers, setSubers] = useState([]);
  const [loginVisible, setLoginVisibility] = useState(false);
  const [pushVisible, setPushVisibility] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [commentInfo, setCommentInfo] = useState(null);
  function handleChangeSuber(userId) {
    if (userId && userId.target) {
      userId = userId.target.value;
    }
    setPage(1);
    setTempPage(1);
    setSuberId(userId);
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

  async function fetchMsg0() {
    const response = await request.get("/msg0");
    if (response.data) {
      message.info(response.data, 3);
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
      if (!suberId || userInfo.subs.indexOf(+suberId) === -1) {
        // 不默认
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
      setSpinning(true);
      const response = await request.get(
        `/queryList?user=${user || ''}&page=${page}`
      );
      setList(JSON.parse(response.data));
      document.body.scrollTop = document.documentElement.scrollTop = 0;
      setSpinning(false);
    } catch (err) {
      setSpinning(false);
      console.log(err);
    }
  }

  // 初始化
  useEffect(() => {
    fetchUserList();
    fetchCurrentUser();
    fetchMsg0();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function subscribe(subId, name) {
    async function subscribeFetch() {
      try {
        await request.post(
          `/subscribe`,
          JSON.stringify({ id: subId, name: name })
        );
        message.success("关注成功");
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

  function listen(subId, name) {
    if (!currentUser.key) {
      setPushVisibility(true);
      return;
    }
    async function listenFetch() {
      try {
        await request.post(`/listen`, JSON.stringify({ id: subId, name }));
        message.success("已加推送");
        await fetchCurrentUser();
        await fetchUserList();
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
    fetchPageList(suberId, page);
    // if (suberId) {} else {
    //   if (page > 1) {
    //     message.warning("请先选择或搜索用户进行关注！");
    //   }
    // }
  }, [page, suberId]);

  function handleChangeToSub(sub) {
    // if (currentUser.name === "guest" && !currentUser.subs.length && sub) {
    //   fetchPageList(sub && sub.value, page);
    // } else {
    handleChangeSuber(sub && sub.value)
    // }
  }

  function handleRefresh() {
    fetchPageList(suberId, page);
    setSpinning(true);
  }

  function handleReComment() {
    request.get("/recomment?id=" + commentInfo.id);
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
        <div style={{ marginTop: 10 }}>
          <SearchSelect
            style={{ width: 255, marginRight: 10 }}
            placeholder="🔍 搜索用户"
            preList={subers}
            user={currentUser}
            selected={userMap[suberId] || suberId}
            onRefresh={handleRefresh}
            onListen={listen}
            onUnListen={unListen}
            onSub={subscribe}
            onUnSub={unSubscribe}
            onChange={(sub) => {
              handleChangeToSub(sub);
            }}
          />
        </div>
      </div>

      <Spin style={{ minHeight: 250 }} spinning={spinning}>
        {list.map((item) => {
          if (!item) return null;
          return (
            <div className="card" key={item.id}>
              <div className="card-title">
                <div className="card-head">
                  <div>
                    <img alt="头像" src={`https://xavatar.imedao.com/${item.headers.split(',')[2]}`}/>
                  </div>
                </div>
                <div >
                  <span style={{ paddingLeft: 5 }}>{item.author}</span>
                  <div>
                    <a
                      target="__blank"
                      href={`https://xueqiu.com/${item.author_id}/${item.id}`}
                    >【原文】
                    </a>发表于{" "}
                    {moment(Number(item.created_at)).format("YY-MM-DD HH:mm")}{" "}
                  </div>
                </div>
              </div>
              <div>
                <span
                  dangerouslySetInnerHTML={{
                    __html: item.text || item.description
                  }}
                />
                <div>
                  {(!item.text || item.text.indexOf('<') < 0) ?
                    (item.pic ? item.pic.split(',').map(_ => <Image alt="封面" src={_.replace('!thumb.jpg', '')} width={200} />): null)
                    : ''}
                  {item.description && item.firstImg ? (
                    <Image alt="封面" src={item.firstImg} width={200} />
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </Spin>
      {commentInfo && (
        <Comment
          visible={commentInfo.visible}
          commentUrl={commentInfo.url}
          onReComment={handleReComment}
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
            <span>
              用户名：{currentUser.name}
            </span>
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
        <span id="footer" />
        <div className="widget">
          <a href="#title">
            <UpCircleOutlined className="widget-item"/>
          </a>
          <RedoOutlined className="widget-item" onClick={handleRefresh}/>
          <a href="#footer">
            <DownCircleOutlined className="widget-item"/>
          </a>
        </div>
        <Login visible={loginVisible} onChangeVisibility={setLoginVisibility} />
      </div>
    </div>
  );
}
