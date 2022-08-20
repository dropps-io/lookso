import React, {FC, useState} from 'react';
import styles from './PostInput.module.scss';
import {formatUrl} from "../../core/utils/url-formating";
import {IPFS_GATEWAY, POST_VALIDATOR_ADDRESS} from "../../environment/endpoints";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../store/store";
import imageIcon from '../../assets/icons/image.svg';
import {LSPXXProfilePost} from "../../models/profile-post";
import {fetchPostObjectWithAsset, uploadPostObject} from "../../core/api";
import {connectToAPI, signMessage} from "../../core/web3";
import {setProfileJwt} from "../../store/profile-reducer";
import {UniversalProfile} from "../../core/UniversalProfile/UniversalProfile.class";
import {updateRegistry} from "../../core/update-registry";

interface PostInputProps {
  parentHash?: string;
  childHash?: string;
}

const PostInput: FC<PostInputProps> = (props) => {
  const dispatch = useDispatch();
  const profileImage = useSelector((state: RootState) => state.profile.profileImage);
  const account = useSelector((state: RootState) => state.web3.account);
  const jwt = useSelector((state: RootState) => state.profile.jwt);
  const web3 = useSelector((state: RootState) => state.web3.web3);

  const [inputHeight, setInputHeight] = useState(70);
  const [inputValue, setInputValue] = useState('');
  const [inputFile, setInputFile] = useState(null);
  const postInput = React.useRef<HTMLTextAreaElement>(null);


  async function requestJWT() {
    const resJWT = await connectToAPI(account, web3);
    if (resJWT) {
      dispatch(setProfileJwt(resJWT));
      return resJWT;
    }
    else {
      throw 'Failed to connect';
    }
  }

  function textAreaAdjust() {
    if (postInput.current) {
      setInputValue(postInput.current.value);
      if (postInput.current.scrollHeight !== inputHeight)
        setInputHeight(postInput.current.scrollHeight);
    }
  }

  function handleSubmit(e: any) {
    e.preventDefault();

    if (!inputValue) {
      alert('Empty message');
      return;
    }

    createPost();
  }

  async function createPost() {
    const author: UniversalProfile = new UniversalProfile(account, IPFS_GATEWAY, web3);
    const permissions = await author.fetchPermissionsOf(POST_VALIDATOR_ADDRESS);

    if (!permissions) await author.setPermissionsTo(POST_VALIDATOR_ADDRESS, {SETDATA: true});

    let post: LSPXXProfilePost = {
      version: '0.0.1',
      message: inputValue,
      author: account,
      eoa: '',
      links: []
    };

    const resJWT = jwt ? jwt : await requestJWT();

    if (inputFile) {
      post = await fetchPostObjectWithAsset(post, inputFile, resJWT);
    }
    const signedMessage = await signMessage(account, JSON.stringify(post), web3);
    const postUploaded = await uploadPostObject(post, signedMessage, resJWT);

    await updateRegistry(account, postUploaded.postHash, postUploaded.jsonUrl, web3);
  }

  function handleChangeMessage(e: any) {
    setInputValue(e.target.value);
  }

  function handleChangeFile(e: any) {
    setInputFile(e.target.files[0]);
  }

  return (
    <form onSubmit={handleSubmit} className={`${props.parentHash ? styles.Comment : ''}`}>
      <div className={`${styles.BoxTop}`}>
        <div className={styles.ProfileImgSmall} style={{backgroundImage: `url(${formatUrl(profileImage, IPFS_GATEWAY)})`}}/>
        <textarea onChange={handleChangeMessage} maxLength={256} ref={postInput} className={styles.PostInput} style={{height: `${inputHeight}px`}} onKeyDown={() => textAreaAdjust()} onKeyUp={() => textAreaAdjust()} name="textValue" placeholder="What's happening?"/>
      </div>
      <div className={styles.BoxBottom}>
        <span>{inputValue.length} / 256</span>
        <div className={styles.RightPart}>
          <div className={styles.ImageUpload}>
            <label htmlFor="file-input">
              <img src={imageIcon.src} alt='' />
            </label>

            <input onChange={handleChangeFile} id="file-input" type="file"/>
          </div>
          <button type='submit' className='btn btn-secondary'>{props.parentHash ? 'Reply' : 'Post'}</button>
        </div>
      </div>
    </form>
  );
}


export default PostInput;
