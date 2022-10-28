import React, {FC, useState} from 'react';
import {FeedDisplayParam} from "./PostBox";
import styles from './PostBox.module.scss';
import {shortenAddress} from "../../core/utils/address-formating";
import AddressFeedDisplay from "../AddressFeedDisplay/AddressFeedDisplay";
import {USER_TAG_REGEX} from "../../core/utils/constants";
import {fetchAddressFromUserTag} from "../../core/api/api";
import {useRouter} from "next/router";

interface ParamContentProps {
  param: FeedDisplayParam,
  onClick: (e: any, value?: string) => void,
  postHierarchy: 'main' | 'parent' | 'child'
}

const ParamContent: FC<ParamContentProps> = (props) => {
  const [copied, setCopied] = useState(false);

  function copyToClipboard(e:any, toCopy: string) {
    setCopied(true);
    props.onClick(e, toCopy);
    setTimeout(() => {
      setCopied(false);
    }, 500);
  }
  
  if (props.param.type === 'address') {
    return (
      <strong title={props.param.value}>
        <AddressFeedDisplay
          onClick={props.onClick}
          address={props.param.value}
          name={props.param.display}
          standard={props.param.additionalProperties.interfaceCode ? props.param.additionalProperties.interfaceCode : ''}
          postHierarchy={props.postHierarchy}
        />
      </strong>
    );
  }
  else if (props.param.type === 'bytes32' || props.param.type === 'bytes') {
    return (
      <>
        <strong className={`${styles.Bytes32Parameter} ${props.postHierarchy}`} title={props.param.value} onClick={(e) => copyToClipboard(e, props.param.value)}>
          {shortenAddress(props.param.value, 5)}
        </strong>
        <span className={`copied ${copied ? 'copied-active' : ''} ${props.postHierarchy}`}>Copied to clipboard</span>
      </>
      );
  }
  return (
    <strong className={`${styles.Parameter} ${props.postHierarchy}`}>
      {props.param.display ? props.param.display : props.param.value}
    </strong>);
}

interface PostContentProps {
  text: string,
  params: {[key: string]: FeedDisplayParam},
  onClick: (e: any) => void,
  postHierarchy: 'main' | 'parent' | 'child'
}

const PostContent: FC<PostContentProps> = (props) => {
  return (
    <p className={styles.PostText}>
      {
        props.text.split(/{([^}]+)}/).map((entry, index) =>
          props.params[entry] ?
            <ParamContent onClick={props.onClick} key={index} param={props.params[entry]} postHierarchy={props.postHierarchy}/> :
            <PostText key={index} text={entry} postHierarchy={props.postHierarchy}/>
      )
      }
    </p>
  );
}

interface PostTextProps {
  text: string,
  postHierarchy: 'main' | 'parent' | 'child'
}

const PostText = (props: PostTextProps) => {
  const router = useRouter();

  async function goToProfile(userTag: string) {
    const splitUserTag = userTag.replace('@', '').split('#');
    const address = await fetchAddressFromUserTag(splitUserTag[0], splitUserTag[1]);
    await router.push('/Profile/' + address);
  }

  return (
    <>
      {
        props.text.split('\n').map((sentence, index) =>
          <span key={index}>
            {
              index !== 0 && <br/>
            }
            {
              sentence.split(' ').map((word, i) =>
                word.match(/(< href=")?((https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)))(">(.*)<\/a>)?/gi) ?
                  <a key={i} className={'Link'} href={word} target={'_blank'} rel="noreferrer">{`${word} `}</a>
                  :
                  word.match(USER_TAG_REGEX) ?
                    <span key={i}>
                      <span onClick={() => goToProfile(word)} className={`${styles.ProfileTagged} ${props.postHierarchy}`}>
                        {word.split('#')[0]}
                        <span className={`${styles.Digits} ${props.postHierarchy}`}>#{word.split('#')[1]}</span>
                      </span>
                        {` `}
                    </span>
                    :
                    <span key={i} className={props.postHierarchy}>{`${word} `}</span>
              )
            }
          </span>
        )
      }
    </>
  )
}

export default PostContent;