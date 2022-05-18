import React from "react";
import { Modal } from "antd";

export default function Comments(props) {
  // const [] =
  return (
    <Modal
      visible={props.visible}
      onCancel={props.onClose}
      onOk={props.onClose}
      title="评论详情"
    >
      <iframe
        className="comment-iframe"
        src={props.commentUrl}
        title="comment"
      />
    </Modal>
  );
}
