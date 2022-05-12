import { Select } from "antd";
import React from "react";
import { Axios } from "axios";

const { Option } = Select;

let timeout;
let currentValue;

const request = new Axios({
  baseURL: "https://utils.daxianyu.cn"
});

function fetch(value, callback) {
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
  currentValue = value;

  function fake() {
    request
      .get("/user?q=" + value)
      .then((res) => JSON.parse(res.data))
      .then((d) => {
        if (currentValue === value) {
          callback(
            d.map((x) => ({
              value: `${x[1]}`,
              text: x[0]
            }))
          );
        }
      });
  }

  timeout = setTimeout(fake, 1000);
}

export default class SearchInput extends React.Component {
  state = {
    data: [],
    value: undefined
  };

  handleSearch = (value) => {
    if (value) {
      fetch(value, (data) => this.setState({ data }));
    } else {
      this.setState({ data: [] });
    }
  };

  handleChange = (value) => {
    let newSub = null;
    this.state.data.forEach((sub) => {
      if (sub.value === value) {
        newSub = sub;
      }
    });
    this.props.onChange(newSub);
  };

  render() {
    const options = this.state.data.map((d) => (
      <Option key={d.value}>{d.text}</Option>
    ));
    return (
      <Select
        showSearch
        value={this.props.value && this.props.value.value}
        placeholder={this.props.placeholder}
        style={this.props.style}
        defaultActiveFirstOption={false}
        showArrow={false}
        filterOption={false}
        allowClear
        onSearch={this.handleSearch}
        onChange={this.handleChange}
        notFoundContent={null}
      >
        {options}
      </Select>
    );
  }
}