import { Axios } from "axios";

export const request = new Axios({
  baseURL: "https://sbservice.daxianyu.cn",
  withCredentials: true
});
