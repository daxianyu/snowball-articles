import React, { useEffect, useState, useRef } from "react";
import { Axios } from "axios";
import { Input, Modal, message, Form } from "antd";

const request = new Axios({
  baseURL: "https://sbservice.daxianyu.cn",
  withCredentials: true
});

const FormItem = Form.Item;
const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 }
};
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
        <Form {...layout} layout="horizontal">
          <FormItem label="用户名">
            <Input
              placeholder="用户名"
              name="name"
              width={150}
              value={userInfo.name}
              autocapitalize="off"
              autocorrect="off"
              onChange={onChangeUserInfo("name")}
            />
          </FormItem>
          <FormItem label="密码">
            <Input
              placeholder="密码"
              width={150}
              name="password"
              type="password"
              value={userInfo.pwd}
              onChange={onChangeUserInfo("pwd")}
            />
          </FormItem>
        </Form>
      </Modal>
    </div>
  );
}
