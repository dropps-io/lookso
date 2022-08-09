import {useDispatch, useSelector} from "react-redux";
import {ReactNode, useEffect} from "react";
import {connectToAPI, getWeb3Info, listenChanges} from "../core/web3";
import {setAccount, setBalance, setNetworkId, setWeb3} from "../store/web3-reducer";
import {setProfileInfo, setProfileJwt} from "../store/profile-reducer";
import {RootState} from "../store/store";

const InitProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch();
  const jwt: string = useSelector((state: RootState) => state.profile.jwt);
  let initializing = false;

  useEffect( () => {
    if (!initializing) {
      initializing = true;
      initApp();
    }
  });

  async function initApp() {
    const web3Info = await getWeb3Info();
    dispatch(setWeb3(web3Info.web3));
    dispatch(setAccount(web3Info.account));
    dispatch(setBalance(web3Info.balance));
    dispatch(setNetworkId(web3Info.networkId));
    dispatch(setProfileInfo(web3Info.profileInfo));
    await listenChanges();
    if (!jwt) {
      const resJWT = await connectToAPI(web3Info.account, web3Info.web3);
      if (resJWT) dispatch(setProfileJwt(jwt));
    }
  }

  return (<>{children}</>
  )
}

export default InitProvider