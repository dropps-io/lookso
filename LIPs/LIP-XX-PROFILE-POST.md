---
lip: XX
title: LIP Social Registry
status: WIP
type: Meta
author: Samuel Videau <samuel@dropps.io>
created: 2022-07-26
updated: /
---

## Simple Summary

This standard describes a set of [ERC725Y](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-725.md) data key-value pairs that describe social post, following and like system.

## Abstract

This standard, defines a set of data key-value pairs that are useful to describe a social media using posts, following, and likes.

## Motivation

This standard aims to implement social media features for [ERC725](https://github.com/ERC725Alliance/ERC725/blob/main/docs/ERC-725.md) smart contracts, as posts, following, and like system.

## Specification

### ERC725Y Data Keys

#### LSPXXSocialRegistry

A string representing the name for the token collection.

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

```json
{
  "LSPXXSocialRegistry": {
    "posts": [
      {
        "url": "string",
        "hash": "string"
      }
    ],
    "follows": [
      "string"
    ],
    "likes": [
      "string"
    ]
  }
}
```

The profile post JSON files should have the following format:

```json
{
  "LSPXXProfilePost": {
    "version": "0.0.1",
    "author": "string",
    "eoa": "string",
    "message": "string",
    "links": [
      {
        "title": "string",
        "url": "string"
      }
    ],
    "asset": {
      "hashFunction": "keccak256(bytes)",
      "hash": "string",
      "url": "string",
      "fileType": "string"
    },
    "parentHash": "string OR undefined",
    "childHash": "string OR undefined"
  },
  "LSPXXProfilePostHash": "string",
  "LSPXXProfilePostEOASignature": "string"
}
```

## Copyright

Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
