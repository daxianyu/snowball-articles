import React, { useEffect, useState, useRef } from "react";
import { Axios } from "axios";
import { Input, Modal, message, Form } from "antd";

const request = new Axios({
  baseURL: "https://sbservice.daxianyu.cn"
});

const FormItem = Form.Item;

export default function Login(props) {
  const [userInfo, setUserInfo] = useState({
    name: void 0,
    pwd: void 0
  });

  function handleCancel() {
    props.onChangeVisibility(false);
  }

  function handleSubmit() {
    async function submit() {
      const response = await request.post("/login", JSON.stringify(userInfo));
      if (response.status !== 200) {
        message.warning(response.data);
      } else {
        localStorage.setItem("token", response.data);
        window.location.reload();
      }
    }

    if (userInfo.name && userInfo.pwd) {
      submit();
    }
  }

  function onChangeUserInfo(key) {
    return function (event) {
      setUserInfo({
        ...userInfo,
        [key]: event.target.value
      });
    };
  }

  return (
    <div>
      <Modal
        onCancel={handleCancel}
        onOk={handleSubmit}
        title="登录"
        visible={props.visible}
        width={400}
      >
        <FormItem label="用户名">
          <Input
            placeholder="用户名"
            name="name"
            value={userInfo.name}
            onChange={onChangeUserInfo("name")}
          />
        </FormItem>
        <FormItem label="密码">
          <Input
            placeholder="密码"
            name="password"
            type="password"
            value={userInfo.pwd}
            onChange={onChangeUserInfo("pwd")}
          />
        </FormItem>
      </Modal>
    </div>
  );
}
