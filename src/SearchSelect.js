import { Input, Button, Modal, List, Typography, Popconfirm } from "antd";
import React from "react";
import { Axios } from "axios";

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
    value: undefined,
    loading: false,
    preList: [],
    searched: false,
    visible: false
  };

  static getDerivedStateFromProps(props, state) {
    const preList = props.preList.map((s) => ({
      text: s.name,
      value: `${s.id}`
    }));
    if (
      props.preList && props.preList.length
      && props.user && props.user.listen && props.user.listen.length
    ) {
      const listen = ((props.user||{}).listen || []).slice().reverse();
      preList.sort((prev, next) => listen.indexOf(+next.value) - listen.indexOf(+prev.value));
      return {
        data: state.searched ? state.data : preList,
        preList: preList
      };
    }
    return {
      data: state.searched ? state.data : preList,
      preList: preList
    };
  }

  handleChange = (e) => {
    const value = e.target.value;
    this.setState({ value })
    if (!value || !value.trim()) {
      this.setState({ data: [...this.state.preList] });
    } else {
      this.setState({ loading: true, searched: true });
      fetch(value, (data) => {
        if (value !== (this.state.value || '').trim()) {
          return;
        }
        const listen = (this.props.user || {}).listen || [];
        data.sort((prev, next) => listen.indexOf(prev.value) - listen.indexOf((next.value)))
        this.setState({ data, loading: false });
      });
    }
  };

  handlePeep = (sub) => () => {
    this.props.onChange(sub);
    this.setState({ visible: false });
  }

  handleShowSearch = () => {
    this.setState({ visible: true });
  };

  handleCloseSearch = () => {
    this.setState({ visible: false });
  };

  handleListen = (subId, name) => {
    this.props.onListen(subId, name);
  }

  handleUnListen = (subId) => {
    this.props.onUnListen(subId);
  }

  handleSubscribe = (subId, name) => {
    this.props.onSub(subId, name)
  }

  handleUnSubscribe = (subId) => {
    this.props.onUnSub(subId)
  }

  render() {
    const { listen = [], subs = [] } = this.props.user || {};
    return (
      <React.Fragment>
        <Button
          onClick={this.handleShowSearch}
          style={{ width: 130, paddingLeft: 10, overflow:'hidden', textAlign: 'left', textOverflow: 'ellipsis' }}
        >
          {this.props.selected ? this.props.selected.name : this.props.placeholder}
        </Button>

        <Button.Group style={{ marginLeft: 15 }}>
          {this.props.selected ? (<Button onClick={this.handlePeep(null)}>
            取消
          </Button>) : null}
          <Button onClick={this.props.onRefresh}>
            刷新
          </Button>
        </Button.Group>
        {/*{ this.props.selected ? : null}*/}
        <Modal
          visible={this.state.visible}
          title="搜索用户"
          onOk={this.handleCloseSearch}
          onCancel={this.handleCloseSearch}
        >
          <Input
            // showSearch
            value={this.state.value}
            placeholder={this.props.placeholder}
            style={this.props.style}
            allowClear
            onChange={this.handleChange}
          />
          <List
            bordered
            style={{ marginTop: 10 }}
            size="small"
            pagination={{
              pageSize: 8,
              showLessItems: true,
              // size: "small"
            }}
            dataSource={this.state.data}
            renderItem={(item) => {
              const isListened = listen.indexOf(+item.value) > -1;
              // const isSubed = subs.indexOf(+item.value) > -1;
              const subId = item.value;
              const name = item.text;

              return (
                <List.Item style={{ padding: '4px 8px'}}>
                  <Typography.Text style={{ textDecoration: 'underline'}} onClick={this.handlePeep(item)}>
                    {item.text}
                  </Typography.Text>
                  <Button.Group>
                    {
                      isListened ? (
                        <Popconfirm
                          onConfirm={() => {
                            this.handleUnListen(subId)
                          }}
                          title="确认？"
                        >
                          <Button type="primary" size="small">
                            取推
                          </Button>
                        </Popconfirm>
                      ) : (
                        <Button size="small" onClick={() => this.handleListen(subId, name)}>
                          推送
                        </Button>
                      )
                    }
                    {/*{*/}
                    {/*  isSubed ? (*/}
                    {/*    <Popconfirm*/}
                    {/*      onConfirm={() => {*/}
                    {/*        this.handleUnSubscribe(subId)*/}
                    {/*      }}*/}
                    {/*      title="确认？"*/}
                    {/*    >*/}
                    {/*      <Button type="primary" size="small">*/}
                    {/*        取关*/}
                    {/*      </Button>*/}
                    {/*    </Popconfirm>*/}
                    {/*  ) : (*/}
                    {/*    <Button size="small" onClick={() => this.handleSubscribe(subId, name)}>*/}
                    {/*      关注*/}
                    {/*    </Button>*/}
                    {/*  )*/}
                    {/*}*/}
                  </Button.Group>
                </List.Item>
              );
            }}
          />
        </Modal>
      </React.Fragment>
    );
  }
}
