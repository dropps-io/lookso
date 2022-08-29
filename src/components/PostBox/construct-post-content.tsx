import React, {FC, useState} from 'react';
import {FeedDisplayParam} from "./PostBox";
import styles from './PostBox.module.scss';
import {shortenAddress} from "../../core/utils/address-formating";
import AddressFeedDisplay from "../AddressFeedDisplay/AddressFeedDisplay";

interface ParamContentProps {
  param: FeedDisplayParam,
  onClick: (e: any, value?: string) => void
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
        <AddressFeedDisplay onClick={props.onClick} address={props.param.value} name={props.param.display} standard={props.param.additionalProperties.interfaceCode ? props.param.additionalProperties.interfaceCode : ''} />
      </strong>
    );
  }
  else if (props.param.type === 'bytes32' || props.param.type === 'bytes') {
    return (
      <>
        <strong className={styles.Bytes32Parameter} title={props.param.value} onClick={(e) => copyToClipboard(e, props.param.value)}>
          {shortenAddress(props.param.value, 5)}
        </strong>
        <span className={`copied ${copied ? 'copied-active' : ''}`}>Copied to clipboard</span>
      </>
      );
  }
  return (
    <strong className={styles.Parameter}>
      {props.param.display ? props.param.display : props.param.value}
    </strong>);
}

interface PostContentProps {
  text: string,
  params: {[key: string]: FeedDisplayParam},
  onClick: (e: any) => void
}

const PostContent: FC<PostContentProps> = (props) => {
  return (
    <p className={styles.PostText}>
      {
        props.text.split(/{([^}]+)}/).map((entry, index) =>
          props.params[entry] ?
            <ParamContent onClick={props.onClick} key={index} param={props.params[entry]}></ParamContent> :
            <span key={index}>{entry}</span>
      )
      }
    </p>
  );
}

export default PostContent;