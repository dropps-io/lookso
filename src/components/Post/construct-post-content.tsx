import React, {FC, useState} from 'react';
import {FeedDisplayParam} from "./Post";
import styles from './Post.module.scss';
import {shortenAddress} from "../../core/utils/address-formating";
import {useRouter} from "next/router";
import {EXPLORER_URL} from "../../environment/endpoints";
import UserTag from "../UserTag/UserTag";
import AssetTag from "../AssetTag/AssetTag";

interface ParamContentProps {
  param: FeedDisplayParam,
}

const ParamContent: FC<ParamContentProps> = (props) => {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  function goToAddress() {
    window.open( EXPLORER_URL + '/address/' + props.param.value, '_blank');
  }

  function goToAccount() {
    router.push('/Profile/' + props.param.value);
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
      <strong title={props.param.value}>
        {
          props.param.additionalProperties && props.param.additionalProperties.interfaceCode === 'LSP0' ?
            <UserTag username={props.param.display} address={props.param.value} onClick={goToAccount} />
            :
            props.param.additionalProperties && props.param.additionalProperties.interfaceCode ?
              <AssetTag name={props.param.display} address={props.param.value} onClick={goToAddress} />
              :
              <span>{shortenAddress(props.param.value, 3)}</span>
        }
      </strong>
    );
  }
  else if (props.param.type === 'bytes32' || props.param.type === 'bytes') {
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