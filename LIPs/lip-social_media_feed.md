---
lip: XX
title: Social Media Feed
status: Draft
type: Meta
author: Samuel Videau <samuel@dropps.io>, António Pedro <antonio@dropps.io>
created: 2022-07-26
updated: 2022-08-24
requires: ERC725Y, LSP2
---

## Simple Summary

This standard describes a data model to store Social Media information such as posts, likes and follows. 

## Abstract

This standard defines a set of key-value pairs that are useful to create a Social Media Feed, combining [ERC725Account](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-0-ERC725Account.md) and an open distributed storage network such as [IPFS](https://ipfs.tech/) or [ARWEAVE](https://arweave.org).

## Motivation

Real interoperability requires social media itself to be separated from social media companies. This proposal aims to create a common interoperable standard in which messages generated on one social media app could be transported and read in any other application.

Using a standardized data model to store social media makes content platform-independent and allows it to be read and stored easily. This content can be added to an [ERC725Account](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-0-ERC725Account.md), giving it a Social Media Account character.

## Specification

Every Universal Profile that participates in the Social Media standard SHOULD add the following ERC725Y data keys:

### ERC725Y Data Keys

#### LSPXXSocialRegistry

A JSON file that lists all the social media actions of a profile, including posts, likes and follows.

```json
  {
      "name": "LSPXXSocialRegistry",
      "key": "0x661d289e41fcd282d8f4b9c0af12c8506d995e5e9e685415517ab5bc8b908247",
      "keyType": "Singleton",
      "valueType": "bytes",
      "valueContent": "JSONURL"
  }
```

This should be updated everytime a new post is added by the user.

The linked JSON file SHOULD have the following format:

```js
{
  "LSPXXSocialRegistry": {
    "posts": [ // Messages authored by the profile. Includes original posts, comments and reposts.
      {
        "url": "string", // The url in decentralized storage with the post content and metadata
        "hash": "string" // The hash of the post object
      },
      ...
    ],
    "follows": [ "Address", ... ], // UPs this account has subscribed.  Will compose the account's feed.
    "likes": ["bytes32", ...], // The identifiers of all the posts this account has liked
  }
}
```

A Profile Post can be an original message, a comment on another post or a repost. The JSON file should have the following format:

```js
{
  "LSPXXProfilePost": {
    "version": "0.0.1",
    "author": "Address", // The Universal Profile who authored the post
    "validator": "Address", // Address of a time stamper smart contract which will certify the post date
    "message": "string", // The post original content
    "links": [
      {
        "title": "string", // The link's label
        "url": "string"
      },
      ...
    ],
    "asset": { // Each post can have up to 1 media file attached. 
      "hashFunction": "keccak256(bytes)",
      "hash": "string",
      "url": "string", 
      "fileType": "string"
    },
    "parentHash": "string" // or null. A post with a parent is a comment.
    "childHash": "string" // or null. A post with a child is a repost. 
  },
  "LSPXXProfilePostHash": {// Hash of the LSPXXProfilePost object
    "hashFunction": 'keccak256(bytes)',
    "hash": "string",
  }, 
  "LSPXXProfilePostEOASignature": "string"
}
```

## Copyright

Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
