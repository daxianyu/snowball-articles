import React, { useState } from "react";
import { Input, Modal, Carousel, message } from "antd";
import { request } from "./request";
const contentStyle = {
  color: "#fff",
  lineHeight: "160px",
  textAlign: "center",
  background: "#364d79",
  maxWidth: "80%"
};

request.interceptors.response.use((res) => {
  if (res.status === 401 || res.status === 500) {
    message.warning(res.data);
  }
  return res;
});

export default function Pubkey(props) {
  const [key, setKey] = useState(props.user.key);

  function submit() {
    request
      .post("/addkey", JSON.stringify({ key }))
      .then((res) => {
        if (res.data === "success") {
          message.success("请查看是否收到推送消息！");
          props.onClose();
        }
        message.error("设置失败");
      })
      .catch((err) => {
        message.error("设置失败");
      });
  }

  function cancel() {
    props.onClose();
  }

  return (
    <Modal
      title="推送设置"
      visible={props.visible}
      onOk={submit}
      onCancel={cancel}
    >
      <Carousel autoplay>
        <div>
          <span>
            首先在应用商店下载pushdeer软件; 安卓用户点击
            <a target="__blank" href="./pushdeer-alpha-5.apk">
              下载
            </a>
            安装文件 ，务必允许推送
          </span>
          <img alt="图1" style={contentStyle} src="./pushkey1.jpeg" />
        </div>
        <div>
          <span>将软件key页面生成的key保存在下方的文本框中</span>
          <img alt="图1" style={contentStyle} src="./pushkey2.jpeg" />
        </div>
        <div>设置成功后便会收到一条推送成功通知。</div>
      </Carousel>
      <Input
        placeholder="填入生成的Key"
        value={key}
        autocapitalize="off"
        autocorrect="off"
        onChange={(e) => setKey(e.target.value)}
      />
    </Modal>
  );
}
