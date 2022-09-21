import {useDispatch} from "react-redux";
import {ReactNode, useEffect} from "react";
import {connectToAPI, getAccount, getWeb3Info, listenChanges} from "../core/web3";
import {setAccount, setBalance, setInitialized, setNetworkId, setWeb3} from "../store/web3-reducer";
import {setProfileInfo, setProfileJwt} from "../store/profile-reducer";
import Web3 from "web3";
import {useRouter} from "next/router";

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
    try {
      const account = await getAccount();
      if (router.asPath === '/' || router.asPath === '') await router.push('/feed');
      const web3Info = await getWeb3Info(account);
      dispatch(setWeb3(web3Info.web3));
      dispatch(setAccount(web3Info.account));
      dispatch(setBalance(web3Info.balance));
      dispatch(setNetworkId(web3Info.networkId));
      dispatch(setProfileInfo(web3Info.profileInfo));
      requestJWT(web3Info.account, web3Info.web3)
    } catch (e) {
      dispatch(setAccount(''));
    }
    dispatch(setInitialized(true));
    await listenChanges();
  }

  async function requestJWT(account: string, web3: Web3) {
    const resJWT = await connectToAPI(account, web3);
    if (resJWT) {
      dispatch(setProfileJwt(resJWT));
      return resJWT;
    }
    else {
      throw 'Failed to connect';
    }
  }

  return (<>{children}</>
  )
}

export default InitProvider