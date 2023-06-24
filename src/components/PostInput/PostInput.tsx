import React, { createRef, type FC, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

import styles from './PostInput.module.scss';
import { formatUrl } from '../../core/utils/url-formating';
import { POST_VALIDATOR_ADDRESS } from '../../environment/endpoints';
import { getFeedActions, type RootState } from '../../store/store';
import imageIcon from '../../assets/icons/image.svg';
import crossIcon from '../../assets/icons/cross.svg';
import smileIcon from '../../assets/icons/smile.svg';
import { type LSP19ProfilePost } from '../../models/profile-post';
import {
  fetchPostObjectWithAsset,
  searchInDatabase,
  setNewRegistryPostedOnProfile,
  uploadPostObject,
} from '../../core/api/api';
import { UniversalProfile } from '../../core/UniversalProfile/UniversalProfile.class';
import { updateRegistryWithPost } from '../../core/update-registry';
import PostBox, { type FeedPost } from '../PostBox/PostBox';
import { DEFAULT_PROFILE_IMAGE } from '../../core/utils/constants';
import LoadingModal from '../Modals/LoadingModal/LoadingModal';
import SearchResults from '../SearchResults/SearchResults';
import { type ProfileDisplay } from '../../models/profile';
import { IPFS_GATEWAY, MAX_POST_LENGTH } from '../../environment/constants';

const Picker = dynamic(
  async () => {
    return await import('emoji-picker-react');
  },
  { ssr: false }
);

interface PostInputProps {
  parentHash?: string;
  childPost?: FeedPost;
  onNewPost?: (post: FeedPost) => any;
}

const PostInput: FC<PostInputProps> = props => {
  const dispatch = useDispatch();
  const router = useRouter();
  const profileImage = useSelector((state: RootState) => state.profile.profileImage);
  const accountSelector: string | undefined = useSelector((state: RootState) => state.web3.account);
  const username = useSelector((state: RootState) => state.profile.name);
  const web3 = useSelector((state: RootState) => state.web3.web3);
  const imageInput = createRef<HTMLInputElement>();
  const postInput = React.useRef<HTMLTextAreaElement>(null);

  const account = (): string => {
    return accountSelector || '';
  };

  const [inputHeight, setInputHeight] = useState(70);
  const [inputValue, setInputValue] = useState('');
  const [inputFile, setInputFile] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [profiles, setProfiles] = useState<ProfileDisplay[]>([]);
  const [tagInput, setTagInput] = useState('');

  function textAreaAdjust() {
    if (postInput.current != null) {
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
    setShowEmojiPicker(false);
    try {
      setLoadingMessage(' ');
      const author: UniversalProfile = new UniversalProfile(account(), IPFS_GATEWAY, web3);
      const permissions = await author.fetchPermissionsOf(POST_VALIDATOR_ADDRESS);

      if (!permissions) {
        setLoadingMessage(
          'Your first post will require you to grant LOOKSO permission to save posts on your Universal Profile'
        );
        await author.setPermissionsTo(POST_VALIDATOR_ADDRESS, { SETDATA: true });
      }

      let post: LSP19ProfilePost = {
        version: '0.0.1',
        message: inputValue,
        author: account(),
        validator: POST_VALIDATOR_ADDRESS,
        nonce: Math.floor(Math.random() * 1000000000).toString(),
        links: [],
        childHash: props.childPost?.hash,
        parentHash: props.parentHash,
      };

      if (inputFile) {
        post = await fetchPostObjectWithAsset(post, inputFile, router.asPath, web3);
      }

      setLoadingMessage("We're uploading your post 😎");
      const postUploaded = await uploadPostObject(post, router.asPath, web3);

      setLoadingMessage('Last step: sending your post to the blockchain! ⛓️');
      const receipt = await updateRegistryWithPost(
        account(),
        postUploaded.postHash,
        postUploaded.jsonUrl,
        web3
      );
      await setNewRegistryPostedOnProfile(account(), router.asPath, web3);

      const newPost: FeedPost = {
        date: new Date(),
        author: {
          address: account(),
          name: username,
          image: profileImage,
        },
        name: '',
        type: 'post',
        display: {
          text: post.message,
          params: {},
          image: post.asset != null ? post.asset.url : '',
          tags: { standard: null, standardType: null, copies: null },
        },
        hash: postUploaded.postHash,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        comments: 0,
        likes: 0,
        isLiked: false,
        reposts: 0,
        childPost: props.childPost,
      };
      if (props.onNewPost != null) props.onNewPost(newPost);

      if (!props.parentHash) {
        dispatch(getFeedActions('Explore').addToTopOfStoredFeed([newPost]));
        dispatch(getFeedActions('Feed').addToTopOfStoredFeed([newPost]));
      }

      setInputFile(null);
      setInputValue('');
      setInputHeight(70);
      setLoadingMessage('');
      if (postInput.current != null) {
        postInput.current.value = '';
        postInput.current.style.height = '70px';
      }
    } catch (e) {
      setLoadingMessage('');
    }
  }

  async function searchTagProfiles(input: string) {
    setProfilesLoading(true);
    try {
      setProfiles([]);
      const res = await searchInDatabase(input);
      if (tagInput) setProfiles(res.search.profiles.results);
      setProfilesLoading(false);
    } catch (e) {
      setProfilesLoading(false);
      console.error(e);
    }
  }

  function handleChangeMessage(e: any) {
    handleTaggingInput(e.target.value);
    setInputValue(e.target.value);
  }

  function handleTaggingInput(newInput: string) {
    const splitInput = inputValue
      .split(/@[A-Za-z0-9\.\-\_]+#[A-Za-z0-9]{4}/gm)
      .join('')
      .match(/@[0-9a-z-A-Z\.\-\_]*(?!\S)/gm);
    const splitNewInput = newInput
      .split(/@[A-Za-z0-9\.\-\_]+#[A-Za-z0-9]{4}/gm)
      .join('')
      .match(/@[0-9a-z-A-Z\.\-\_]*(?!\S)/gm);

    if (splitInput != null && splitNewInput != null) {
      let isTagging = false;
      for (let i = 0; i < splitInput.length; i++) {
        if (splitInput[i] !== splitNewInput[i] && splitNewInput[i] !== '@') {
          const newTagInput = splitNewInput[i].replace('@', '');
          setTagInput(newTagInput);
          searchTagProfiles(newTagInput);
          isTagging = true;
          break;
        }
      }
      if (!isTagging) {
        setProfiles([]);
        setTagInput('');
      }
    } else {
      setProfiles([]);
      setTagInput('');
    }
  }

  function handleTaggingClose(profile?: ProfileDisplay) {
    if (!profile?.name) return;
    setProfiles([]);
    const newInput =
      inputValue.replace(
        new RegExp(`@${tagInput}(?!\\S)`),
        '@' + profile.name + '#' + profile.address.slice(2, 6).toUpperCase()
      ) + ' ';
    if (postInput.current != null) {
      postInput.current.value = newInput;
      postInput.current.focus();
    }
    setInputValue(newInput);
    setTagInput('');
    textAreaAdjust();
  }

  function handleChangeFile(e: any) {
    setInputFile(e.target.files[0]);
  }

  function removeInputFile() {
    if (imageInput.current != null) imageInput.current.value = '';
    setInputFile(null);
  }

  const onEmojiClick = (event: any, emojiObject: any) => {
    if (inputValue.length + emojiObject.emoji.length > MAX_POST_LENGTH) return;
    if (postInput.current != null) postInput.current.value = inputValue + emojiObject.emoji;
    setInputValue(value => value + emojiObject.emoji);
  };

  return (
    <>
      {(profiles.length > 0 || profilesLoading || showEmojiPicker) && (
        <div
          className={'backdrop'}
          onClick={() => {
            setProfiles([]);
            setTagInput('');
            setShowEmojiPicker(false);
          }}
        ></div>
      )}
      <LoadingModal open={!!loadingMessage} onClose={() => {}} textToDisplay={loadingMessage} />
      <form
        onSubmit={handleSubmit}
        className={`${props.parentHash ? styles.Comment : ''} ${
          props.childPost != null ? styles.Repost : ''
        }`}
      >
        <div className={`${styles.BoxTop}`}>
          <div
            className={styles.ProfileImgSmall}
            style={{
              backgroundImage: `url(${
                profileImage ? formatUrl(profileImage) : DEFAULT_PROFILE_IMAGE
              })`,
            }}
          />
          <div className={styles.Inputs}>
            <textarea
              onClick={() => {
                setShowEmojiPicker(false);
              }}
              disabled={!!loadingMessage}
              onChange={handleChangeMessage}
              maxLength={MAX_POST_LENGTH}
              ref={postInput}
              className={styles.PostInput}
              style={{ height: `${inputHeight}px` }}
              onKeyDown={() => {
                textAreaAdjust();
              }}
              onKeyUp={() => {
                textAreaAdjust();
              }}
              name="textValue"
              placeholder={
                props.childPost != null
                  ? 'Add comment'
                  : props.parentHash
                  ? 'Add comment'
                  : "What's happening?"
              }
            />
            {(profiles.length > 0 || profilesLoading) && (
              <div className={styles.ProfileTagging}>
                <SearchResults
                  profiles={profiles}
                  onClose={handleTaggingClose}
                  open={true}
                  loading={profilesLoading}
                  transactions={[]}
                />
              </div>
            )}
            {inputFile ? (
              <div className={styles.InputImage}>
                <img
                  onClick={removeInputFile}
                  className={styles.Cross}
                  src={crossIcon.src}
                  alt=""
                />
                <img className={styles.Input} src={URL.createObjectURL(inputFile)} alt="" />
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
        {props.childPost != null && (
          <>
            <br />
            <PostBox post={props.childPost} static postHierarchy={'child'} />
          </>
        )}
        <div className={styles.BoxBottom}>
          <span>
            {inputValue.length} / {MAX_POST_LENGTH.toString()}
          </span>
          <div className={styles.RightPart}>
            <div className={styles.SmileIcon}>
              <img
                onClick={() => {
                  setShowEmojiPicker(!showEmojiPicker);
                }}
                src={smileIcon.src}
                alt=""
              />
              <div
                className={`${styles.EmojiPicker} ${showEmojiPicker ? styles.ActivePicker : ''}`}
              >
                <Picker onEmojiClick={onEmojiClick} disableSearchBar native />
              </div>
            </div>
            <div
              onClick={() => {
                setShowEmojiPicker(false);
              }}
              className={styles.ImageUpload}
            >
              <label
                htmlFor={props.parentHash ? 'Reply' : props.childPost != null ? 'Repost' : 'Post'}
              >
                <img src={imageIcon.src} alt="" />
              </label>
              <input
                ref={imageInput}
                disabled={!!loadingMessage}
                onChange={handleChangeFile}
                id={props.parentHash ? 'Reply' : props.childPost != null ? 'Repost' : 'Post'}
                type="file"
                accept="image/gif, image/jpeg, image/png, image/webp"
              />
            </div>
            <button disabled={!!loadingMessage} type="submit" className="btn btn-secondary">
              {props.parentHash ? 'Reply' : 'Post'}
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default PostInput;
