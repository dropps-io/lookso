import React, { FC } from 'react';
import CustomModal from '../../CustomModal/CustomModal';
import styles from './RepostModal.module.scss';
import {FeedPost} from "../../PostBox/PostBox";
import PostInput from "../../PostInput/PostInput";

interface RepostModalProps {
  open: boolean,
  onClose: (newPost?: FeedPost) => any,
  post: FeedPost
}

const RepostModal: FC<RepostModalProps> = (props) => {

  return (
    <CustomModal open={props.open} onClose={props.onClose}>
      <div className={styles.RepostModal}>
        <PostInput onNewPost={props.onClose} childPost={props.post}/>
      </div>
    </CustomModal>
  );
}

export default RepostModal;
