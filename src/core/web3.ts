import Web3 from "web3";

declare const window: any;

export function listenChanges() {
  window.ethereum.on('chainChanged', () => {
    getWeb3Info();
  });
  window.ethereum.on('accountsChanged', () => {
    getWeb3Info();
  });
}

export async function getWeb3Info() {
  const web3 = new Web3(window.ethereum);
  const accounts: string[] = await web3.eth.getAccounts();
  if (accounts.length === 0) throw 'No account connected';
  const balance = Web3.utils.fromWei(await web3.eth.getBalance(accounts[0]), 'ether');
  // TODO verify how to fetch network id
  // const networkId = await web3.eth.net.getId();
  const networkId = 0;

  return {
    web3,
    account: accounts[0],
    balance,
    networkId
  }
}

export async function connectWeb3() {
  const web3 = new Web3(window.ethereum);
  const accounts: string[] = await web3.eth.requestAccounts();
  if (accounts.length > 0) return await getWeb3Info();
}