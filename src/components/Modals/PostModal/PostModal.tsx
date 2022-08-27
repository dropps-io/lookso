import React, {FC} from 'react';
import CustomModal from '../../CustomModal/CustomModal';
import styles from './PostModal.module.scss';
import {FeedPost} from "../../PostBox/PostBox";
import PostInput from "../../PostInput/PostInput";

interface PostModalProps {
    open: boolean,
    onClose: (newPost?: FeedPost) => any,
}

const PostModal: FC<PostModalProps> = (props) => {

    function handleNewPost(post: FeedPost) {
        props.onClose(post);
    }

    return (
        <CustomModal open={props.open} onClose={() => props.onClose()}>
            <div className={styles.PostModal}>
                <PostInput key={'PostInput'} onNewPost={handleNewPost} />
            </div>
        </CustomModal>
    );
}

export default PostModal;
