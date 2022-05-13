import { Axios } from "axios";
const token = localStorage.getItem("token");

export const request = new Axios({
  baseURL: "https://sbservice.daxianyu.cn",
  headers: {
    token
  }
});
