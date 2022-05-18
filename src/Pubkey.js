import React, { useEffect, useState } from "react";
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
  const [img1, setImg1] = useState();
  const [img2, setImg2] = useState();
  const [key, setKey] = useState(props.user.key);
  useEffect(() => {
    request.get("/image/appstore_pushdeer").then((res) => {
      setImg1(res.data);
    });
    request.get("/image/pushdeer_key").then((res) => {
      setImg2(res.data);
    });
  }, []);

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
          {img1 ? <img alt="图1" style={contentStyle} src={img1} /> : null}
        </div>
        <div>
          {img2 ? <img alt="图1" style={contentStyle} src={img2} /> : null}
        </div>
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
