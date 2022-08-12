import React, {FC} from 'react';
import {FeedDisplayParam} from "./Post";
import styles from './Post.module.scss';
import {shortenAddress} from "../../core/utils/address-formating";
import {useRouter} from "next/router";
import {EXPLORER_URL} from "../../environment/endpoints";

interface ParamContentProps {
  param: FeedDisplayParam,
}

const ParamContent: FC<ParamContentProps> = (props) => {
  const router = useRouter()

  function goToAddress(e: any) {
    e.preventDefault()
    if (props.param.additionalProperties.interfaceCode && props.param.additionalProperties.interfaceCode === 'LSP0')
      router.push('/Profile/' + props.param.value);
    else
      window.open ( EXPLORER_URL + '/address/' + props.param.value, '_blank');
  }
  
  if (props.param.type === 'address') {
    return (
      <strong title={props.param.value} className={`${props.param.additionalProperties.interfaceCode && props.param.additionalProperties.interfaceCode === 'LSP0' ? styles.ProfileParam : ''} ` + styles.AddressParameter} onClick={goToAddress}>
        {props.param.display ? props.param.additionalProperties.interfaceCode && props.param.additionalProperties.interfaceCode === 'LSP0' ? '@' + props.param.display : props.param.display : shortenAddress(props.param.value, 3)}
        <span>#{props.param.value.slice(2, 6)}</span>
      </strong>);
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
        props.text.split(/{([^}]+)}/).map(entry =>
          props.params[entry] ?
            <ParamContent param={props.params[entry]}></ParamContent> :
            <>{entry}</>
      )
      }
    </p>
  );
}

export default PostContent;