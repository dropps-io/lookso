import {Link} from "../../../../models/types/metadata-objects";

export type LSPXXProfilePost = {
  version: string,
  author: string, // Address (UP)
  validator: string,
  nonce: string,
  message: string,
  links?: Link[],
  tags?: string[],
  asset?: {
    hashFunction: 'keccak256(bytes)',
    hash: string,
    url: string,
    fileType: string
  },
  parentHash?: string,
  childHash?: string
}

export type ProfilePost = {
  LSPXXProfilePost: LSPXXProfilePost
  LSPXXProfilePostHash: string,
}