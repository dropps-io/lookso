---
lip: XX
title: LIP Profile Post
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

#### SupportedStandards:LSP4DigitalAsset

The supported standard SHOULD be `LSP4DigitalAsset`

```json
{
    "name": "SupportedStandards:LSP4DigitalAsset",
    "key": "0xeafec4d89fa9619884b60000a4d96624a38f7ac2d8d9a604ecf07c12c77e480c",
    "keyType": "Mapping",
    "valueType": "bytes4",
    "valueContent": "0xa4d96624"
}
```

#### LSPXXPostsRecord

A string representing the name for the token collection.

```json
  {
      "name": "LSPXXSocialRegister.json",
      "key": "0xdeba1e292f8ba88238e10ab3c7f88bd4be4fac56cad5194b6ecceaf653468af1",
      "keyType": "Singleton",
      "valueType": "bytes",
      "valueContent": "JSONURL"
  }
```

This should be updated everytime a new post is added by the user.

The linked JSON file SHOULD have the following format:

```json
{
  "LSPXXSocialRegister": {
    "profile_posts": [
      {
        "url": "ipfs://xxx",
        "hash": "fhsefsfesfsh"
      }
    ],
    "following": [
      "0xxxxx1",
      "0xxxxx2",
      "0xxxxx3"
    ]
  }
}
```

The profile post JSON files should have the following format:

```json
{
  "LSPXXProfilePost": {
    "author": "string",
    "date": "date",
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
    }
  },
  "LSPXXProfilePostHash": "string",
  "LSPXXProfilePostSignature": "string"
}
```

## Copyright

Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
