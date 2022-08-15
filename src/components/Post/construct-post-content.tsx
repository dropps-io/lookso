import React, {FC, useState} from 'react';
import {FeedDisplayParam} from "./Post";
import styles from './Post.module.scss';
import {shortenAddress} from "../../core/utils/address-formating";
import {useRouter} from "next/router";
import {EXPLORER_URL} from "../../environment/endpoints";

interface ParamContentProps {
  param: FeedDisplayParam,
}

const ParamContent: FC<ParamContentProps> = (props) => {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  function goToAddress(e: any) {
    e.preventDefault()
    if (props.param.additionalProperties.interfaceCode && props.param.additionalProperties.interfaceCode === 'LSP0')
      router.push('/Profile/' + props.param.value);
    else
      window.open ( EXPLORER_URL + '/address/' + props.param.value, '_blank');
  }

  function copyToClipboard(toCopy: string) {
    setCopied(true);
    navigator.clipboard.writeText(toCopy);
    setTimeout(() => {
      setCopied(false);
    }, 500);
  }
  
  if (props.param.type === 'address') {
    return (
      <strong title={props.param.value} className={`${props.param.additionalProperties.interfaceCode && props.param.additionalProperties.interfaceCode === 'LSP0' ? styles.ProfileParam : ''} ` + styles.AddressParameter} onClick={goToAddress}>
        {props.param.display ? props.param.additionalProperties.interfaceCode && props.param.additionalProperties.interfaceCode === 'LSP0' ? '@' + props.param.display : props.param.display : shortenAddress(props.param.value, 3)}
        <span>#{props.param.value.slice(2, 6)}</span>
      </strong>);
  }
  if (props.param.type === 'bytes32' || props.param.type === 'bytes') {
    return (
      <>
        <strong className={styles.Bytes32Parameter} title={props.param.value} onClick={() => copyToClipboard(props.param.value)}>
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
  params: {[key: string]: FeedDisplayParam}
}

const PostContent: FC<PostContentProps> = (props) => {

  return (
    <p>
      {
        props.text.split(/{([^}]+)}/).map((entry, index) =>
          props.params[entry] ?
            <ParamContent key={index} param={props.params[entry]}></ParamContent> :
            <span key={index}>{entry}</span>
      )
      }
    </p>
  );
}

export default PostContent;