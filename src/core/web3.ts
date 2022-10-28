import Web3 from "web3";
import {fetchProfileAuthJwtToken, fetchProfileAuthSiwe, fetchProfileInfo} from "./api/api";

declare const window: any;

export function listenChanges() {
  // console.log('listening')
  // window.ethereum.on('chainChanged', async () => {
  //   await getWeb3Info();
  // });
  // window.ethereum.on('accountsChanged', async (account: any) => {
  //   console.log(account)
  //   await getWeb3Info();
  // });
}

export async function getAccount(): Promise<string> {
  const web3 = new Web3(window.ethereum);
  const accounts: string[] = await web3.eth.getAccounts();
  if (accounts.length === 0) throw 'No account connected';
  else return accounts[0];
}

export async function getWeb3Info(account?: string) {
  let address = account;
  const web3 = new Web3(window.ethereum);
  if (!address) {
    const accounts: string[] = await web3.eth.getAccounts();
    if (accounts.length === 0) throw 'No account connected';
    address = accounts[0];
  }
  const balance = Web3.utils.fromWei(await web3.eth.getBalance(address), 'ether');
  // TODO verify how to fetch network id
  // const networkId = await web3.eth.net.getId();
  const networkId = 0;

  const profileInfo = await fetchProfileInfo(address);

  return {
    web3,
    account: address,
    balance,
    networkId,
    profileInfo
  }
}

export async function connectWeb3() {
  const web3 = new Web3(window.ethereum);
  const accounts: string[] = await web3.eth.requestAccounts();
  if (accounts.length > 0) return await getWeb3Info();
}

export async function connectToAPI(address: string, path: string, web3: Web3) {
  const siwe = await fetchProfileAuthSiwe(address, path);
  console.log('SIWE Message:');
  console.log(siwe);
  const signedSiwe = await signMessage(address, siwe.message, web3);
  const res = await fetchProfileAuthJwtToken(address, signedSiwe, siwe.issuedAt, path);
  if (res.status === 200) return;
  else throw res.status;
}

export async function signMessage(address: string, data: string, web3: Web3) {
  const res = await web3.eth.sign(data, address);
  // TODO On mainnet, delete the oldversionsig
  // It's being used now as the signature was previously located in res.signature, now it's only res
  const oldVersionSig = JSON.parse(JSON.stringify(res)).signature;
  return oldVersionSig ? oldVersionSig : res;
}