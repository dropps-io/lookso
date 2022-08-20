import Web3 from "web3";

export function numberToBytes(n: number, length: number): string {
  const hexNumber = Web3.utils.numberToHex(n).slice(2);
  return new Array(length - hexNumber.length + 1).join('0') + hexNumber;
}