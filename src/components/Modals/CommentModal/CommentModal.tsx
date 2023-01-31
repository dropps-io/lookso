import React, { type FC } from 'react';
import { styled, Box } from '@mui/system';
import { ModalUnstyled } from '@mui/base';
import clsx from 'clsx';
import { useRouter } from 'next/router';

import styles from './CommentModal.module.scss';
import crossIcon from '../../../assets/icons/cross.svg';
import PostBox, { type FeedPost } from '../../PostBox/PostBox';
import PostInput from '../../PostInput/PostInput';

// eslint-disable-next-line react/display-name
const BackdropUnstyled = React.forwardRef<HTMLDivElement, { open?: boolean; className: string }>(
  (props, ref) => {
    const { open, className, ...other } = props;
    return <div className={clsx({ 'MuiBackdrop-open': open }, className)} ref={ref} {...other} />;
  }
);

const Modal = styled(ModalUnstyled)`
  position: fixed;
  z-index: 1300;
  right: 0;
  bottom: 0;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Backdrop = styled(BackdropUnstyled)`
  z-index: -1;
  position: fixed;
  right: 0;
  bottom: 0;
  top: 0;
  left: 0;
  background-color: rgba(256, 256, 256, 0.4);
  -webkit-tap-highlight-color: transparent;
`;

interface CustomModalProps extends React.PropsWithChildren {
  open: boolean;
  onClose: (comment?: FeedPost) => any;
  post: FeedPost;
}

const CommentModal: FC<CustomModalProps> = props => {
  const router = useRouter();

  function handleNewPost(comment: FeedPost) {
    if (!router.asPath.includes('/Post/' + props.post.hash)) {
      router.push({
        pathname: '/Post/' + props.post.hash,
        query: {
          newComment: JSON.stringify(comment),
        },
      });
      props.onClose();
    } else {
      props.onClose(comment);
    }
  }

  return (
    <Modal
      aria-labelledby="unstyled-modal-title"
      aria-describedby="unstyled-modal-description"
      open={props.open}
      onClose={() => props.onClose()}
      slots={{ backdrop: Backdrop }}
    >
      <Box className={styles.CommentModal}>
        <img className={styles.Close} onClick={() => props.onClose()} src={crossIcon.src} alt="" />
        <div className={styles.Content}>
          <PostBox post={props.post} static postHierarchy={'main'} />
          <div className={styles.Separator}></div>
          <div className={styles.CommentSection}>
            <PostInput
              key={'CommentInput'}
              onNewPost={handleNewPost}
              parentHash={props.post.hash}
            />
          </div>
        </div>
      </Box>
    </Modal>
  );
};

export default CommentModal;
