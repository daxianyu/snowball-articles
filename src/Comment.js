import React from "react";
import { Modal } from "antd";

export default function Comments(props) {
  // const [] =
  return (
    <Modal
      visible={props.visible}
      onCancel={props.onClose}
      onOk={props.onClose}
      title={<span onDoubleClick={props.onReComment}>评论详情</span>}
    >
      <iframe
        className="comment-iframe"
        src={props.commentUrl}
        title="comment"
      />
    </Modal>
  );
}
