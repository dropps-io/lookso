import React, {FC, useState} from 'react';
import styles from './PostInput.module.scss';
import {formatUrl} from "../../core/utils/url-formating";
import {IPFS_GATEWAY} from "../../environment/endpoints";
import {useSelector} from "react-redux";
import {RootState} from "../../store/store";

interface PostInputProps {}

const PostInput: FC<PostInputProps> = () => {

  const profileImage = useSelector((state: RootState) => state.profile.profileImage);
  const [inputHeight, setInputHeight] = useState(70);
  const [inputValue, setInputValue] = useState('');
  const postInput = React.useRef<HTMLTextAreaElement>(null);


  function textAreaAdjust() {
    if (postInput.current) {
      setInputValue(postInput.current.value);
      if (postInput.current.scrollHeight !== inputHeight)
        setInputHeight(postInput.current.scrollHeight);
    }
  }

  return (
    <>
      <div className={styles.BoxTop}>
        <div className={styles.ProfileImgSmall} style={{backgroundImage: `url(${formatUrl(profileImage, IPFS_GATEWAY)})`}}/>
        <textarea maxLength={256} ref={postInput} className={styles.PostInput} style={{height: `${inputHeight}px`}} onKeyDown={() => textAreaAdjust()} onKeyUp={() => textAreaAdjust()} name="textValue" placeholder="What's happening?"/>
      </div>
      <div className={styles.BoxBottom}>
        <span>{inputValue.length} / 256</span>
        <button className='btn btn-secondary'>Post</button>
      </div>
    </>
  );
}


export default PostInput;
