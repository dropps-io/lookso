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

  function handleNewRepost(repost: FeedPost) {
    const newPost = repost;
    newPost.childPost = props.post;
    props.onClose(newPost);
  }

  return (
    <CustomModal open={props.open} onClose={() => props.onClose()}>
      <div className={styles.RepostModal}>
        <PostInput key={'RepostInput'} onNewPost={handleNewRepost} childPost={props.post}/>
      </div>
    </CustomModal>
  );
}

export default RepostModal;
