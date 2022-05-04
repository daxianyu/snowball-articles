import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { Axios } from "axios";
import { Button, Select, Modal, Input, Form, message } from "antd";
import "antd/dist/antd.css";
import "./index.css";

const FormItem = Form.Item;
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
  const [user, setUser] = useState("2292705444");
  const [visible, setVisible] = useState(false);
  const [info, setInfo] = useState(null);
  function handleChangeUser(userId) {
    setPage(1);
    setUser(userId);
  }
  const handleChangeInfo = (key, value0) => (event) => {
    const newInfo = { ...info };
    newInfo[key] = value0 || event.target.value;
    newInfo["user"] = {
      subscribeable: false,
      common_count: 0,
      remark: null,
      recommend_reason: null,
      blog_description: null,
      stocks_count: 44,
      recommend: null,
      st_color: "1",
      intro: null,
      follow_me: false,
      allow_all_stock: false,
      stock_status_count: null,
      domain: null,
      type: "1",
      location: null,
      description: "我不是药神，我是药子，江湖人称大郎。",
      id: 2292705444,
      url: null,
      status: 2,
      screen_name: "metalslime",
      gender: "n",
      following: false,
      blocking: false,
      profile: "/2292705444",
      verified: false,
      friends_count: 323,
      followers_count: 83074,
      verified_type: 0,
      province: "省/直辖市",
      city: "城市/地区",
      status_count: 5304,
      last_status_id: 218968671,
      verified_description: null,
      step: "null",
      donate_count: 0,
      name: null,
      verified_infos: null,
      group_ids: null,
      verified_realname: false,
      name_pinyin: null,
      screenname_pinyin: null,
      photo_domain: "//xavatar.imedao.com/",
      live_info: {},
      profile_image_url:
        "community/202111/1639747886002-1639747893243.jpg,community/202111/1639747886002-1639747893243.jpg!180x180.png,community/202111/1639747886002-1639747893243.jpg!50x50.png,community/202111/1639747886002-1639747893243.jpg!30x30.png"
    };
    newInfo["user_id"] = "2292705444";
    newInfo["target"] = newInfo["user_id"] + "/" + newInfo["id"];
    if (key === "created_at") {
      if (Number.isNaN(Number(newInfo[key]))) {
        newInfo["created_at"] = new Date("2022-" + newInfo[key]).valueOf();
      }
    }
    setInfo(newInfo);
    setVisible(true);
  };
  function handleCancel() {
    setVisible(false);
  }
  function handleModify() {
    request
      .put("/save", JSON.stringify(info))
      .then((res) => {
        console.log(res);
        setVisible(false);
        setInfo(null);
      })
      .catch((err) => {
        message.error(err);
        console.error(err);
      });
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
    fetch();
  }, [page, user]);
  return (
    <div>
      <div>
        <Select value={user} onChange={handleChangeUser}>
          <Select.Option value="2292705444">2292705444</Select.Option>
          <Select.Option value="4316634246">4316634246</Select.Option>
          <Select.Option value="1553799558">1553799558</Select.Option>
        </Select>
      </div>
      <Modal
        visible={visible}
        title="修改内容"
        onOk={handleModify}
        onCancel={handleCancel}
      >
        <div>
          <FormItem label="created_at:">
            <Input
              onChange={handleChangeInfo("created_at")}
              value={info ? info.created_at : ""}
            />
          </FormItem>
          <FormItem label="description:">
            <Input
              onChange={handleChangeInfo("description")}
              value={info ? info.description : ""}
            />
          </FormItem>
          <FormItem label="text:">
            <Input
              onChange={handleChangeInfo("text")}
              value={info ? info.text : ""}
            />
          </FormItem>
        </div>
      </Modal>
      {list.map((item) => {
        if (!item) return null;
        return (
          <div key={item.id} style={{ margin: "15px 0" }}>
            <a href={`https://xueqiu.com/${item.author_id}/${item.id}`}>
              【原文】
            </a>
            <span>{item.author}: </span>
            <span dangerouslySetInnerHTML={{ __html: item.text }}></span>
            {item.text ? (
              ""
            ) : (
              <button onClick={handleChangeInfo("id", item.id)}>补充</button>
            )}
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
