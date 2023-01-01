import {Contract} from "./contract";

export interface Transaction {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  input: string;
  blockNumber: number | null;
  methodId: string;
}

export interface GetTransactionResponse extends Transaction{
  decodedFunctionCallParts: DecodedFunctionCall[]
}
export type DecodedFunctionCall = {
  contract: Contract,
  methodInterface: Omit<MethodInterface, 'hash' | 'type'>,
  decodedParameters: DecodedParameter[]
};

export type MethodInterface = {
  id: string,
  hash: string,
  type: string,
  name: string,
}