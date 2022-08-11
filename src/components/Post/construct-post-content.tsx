import {FeedDisplayParam} from "./Post";
import {getWordsBetweenCurlies} from "../../core/utils/words-between-curlies";
import styles from './Post.module.scss';
import {shortenAddress} from "../../core/utils/address-formating";
import {useRouter} from "next/router";
import {EXPLORER_URL} from "../../environment/endpoints";


function constructParamDisplay(param: FeedDisplayParam) {
  const router = useRouter()

  function goToAddress(e: any) {
    e.preventDefault()
    if (param.additionalProperties.interfaceCode && param.additionalProperties.interfaceCode === 'LSP0')
      router.push('/Profile/' + param.value);
    else
      window.open ( EXPLORER_URL + '/address/' + param.value, '_blank');
  }
  
  if (param.type === 'address') {
    return (
      <strong title={param.value} className={styles.AddressParameter} onClick={goToAddress}>
        {param.display ? param.display : shortenAddress(param.value, 3)}
      </strong>);
  }
  return (
    <strong className={styles.Parameter}>
      {param.display ? param.display : param.value}
    </strong>);
}

export function constructPostContent(text: string, params: {[key: string]: FeedDisplayParam}) {

  return (
    <p>
      {
        text.split(/{([^}]+)}/).map(entry =>
          params[entry] ?
            constructParamDisplay(params[entry]) :
            <>{entry}</>
      )
      }
    </p>
  );
}