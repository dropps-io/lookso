import { type Link } from '../../../../models/types/metadata-objects';

export interface LSPXXProfilePost {
  version: string;
  author: string; // Address (UP)
  validator: string;
  nonce: string;
  message: string;
  links?: Link[];
  tags?: string[];
  asset?: {
    hashFunction: 'keccak256(bytes)';
    hash: string;
    url: string;
    fileType: string;
  };
  parentHash?: string;
  childHash?: string;
}

export interface ProfilePost {
  LSPXXProfilePost: LSPXXProfilePost;
  LSPXXProfilePostHash: string;
}
