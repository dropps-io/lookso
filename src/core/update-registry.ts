import {POST_VALIDATOR_ADDRESS} from "../environment/endpoints";
import PostValidator from "../assets/abi/TimestamperArtifact.json";
import LSP0ERC725Account from "@lukso/lsp-smart-contracts/artifacts/LSP0ERC725Account.json";
import {AbiItem} from "web3-utils";
import Web3 from "web3";
import {TransactionReceipt} from "web3-core";
import {LSPXX_SOCIAL_REGISTRY_KEY} from "../environment/constants";

export async function updateRegistryWithPost(sender: string, postHash: string, jsonUrl: string, web3: Web3): Promise<TransactionReceipt> {
    const postValidator = new web3.eth.Contract(PostValidator.abi as AbiItem[], POST_VALIDATOR_ADDRESS);
    return await postValidator.methods.post(postHash, jsonUrl).send({from: sender});
}

export async function updateRegistry(sender: string, jsonUrl: string, web3: Web3): Promise<TransactionReceipt> {
    const profile = new web3.eth.Contract(LSP0ERC725Account.abi as AbiItem[], sender);
    return await profile.methods.setData(LSPXX_SOCIAL_REGISTRY_KEY, jsonUrl).send({from: sender});
}