import {useDispatch} from "react-redux";
import {ReactNode, useEffect} from "react";
import {getAccount, getWeb3Info, listenChanges} from "../core/web3";
import {setAccount, setBalance, setInitialized, setNetworkId, setWeb3} from "../store/web3-reducer";
import {setProfileInfo} from "../store/profile-reducer";
import {useRouter} from "next/router";

import packageJson from '../../package.json';

const InitProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  let initializing = false;

  useEffect( () => {
    if (!initializing) {
      initializing = true;
      initApp();
    }
  }, []);

  async function initApp() {
    console.log('LOOKSO v' + packageJson.version);
    try {
      const account = await getAccount();
      if (router.asPath === '/' || router.asPath === '') await router.push('/feed');
      const web3Info = await getWeb3Info(account);
      dispatch(setWeb3(web3Info.web3));
      dispatch(setAccount(web3Info.account));
      dispatch(setBalance(web3Info.balance));
      dispatch(setNetworkId(web3Info.networkId));
      dispatch(setProfileInfo(web3Info.profileInfo));
    } catch (e) {
      dispatch(setAccount(''));
    }
    dispatch(setInitialized(true));
    await listenChanges();
  }

  return (<>{children}</>
  )
}

export default InitProvider