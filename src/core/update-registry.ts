import {POST_VALIDATOR_ADDRESS} from "../environment/endpoints";
import PostValidator from "../assets/abi/TimestamperArtifact.json";
import {AbiItem} from "web3-utils";
import Web3 from "web3";
import {TransactionReceipt} from "web3-core";

export async function updateRegistry(sender: string, postHash: string, jsonUrl: string, web3: Web3): Promise<TransactionReceipt> {
    const postValidator = new web3.eth.Contract(PostValidator.abi as AbiItem[], POST_VALIDATOR_ADDRESS);
    return await postValidator.methods.post(postHash, jsonUrl).send({from: sender});
}