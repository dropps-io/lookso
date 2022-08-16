import {useDispatch} from "react-redux";
import {ReactNode, useEffect} from "react";
import {getWeb3Info, listenChanges} from "../core/web3";
import {setAccount, setBalance, setInitialized, setNetworkId, setWeb3} from "../store/web3-reducer";
import {setProfileInfo} from "../store/profile-reducer";

const InitProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch();
  let initializing = false;

  useEffect( () => {
    if (!initializing) {
      initializing = true;
      initApp();
    }
  });

  async function initApp() {
    try {
      const web3Info = await getWeb3Info();
      dispatch(setWeb3(web3Info.web3));
      dispatch(setAccount(web3Info.account));
      dispatch(setBalance(web3Info.balance));
      dispatch(setNetworkId(web3Info.networkId));
      dispatch(setProfileInfo(web3Info.profileInfo));
    } catch (e) {
    }
    dispatch(setInitialized(true));
    await listenChanges();
  }

  return (<>{children}</>
  )
}

export default InitProvider