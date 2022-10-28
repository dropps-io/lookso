import React, { FC } from 'react';
import styles from './AddressFeedDisplay.module.scss';
import UserTag from "../UserTag/UserTag";
import {shortenAddress} from "../../core/utils/address-formating";
import AssetTag from "../AssetTag/AssetTag";

interface AddressFeedDisplayProps {
  address: string,
  name: string,
  standard: string,
  onClick: (e: any, value?: string) => void,
  postHierarchy: 'main' | 'parent' | 'child'
}

const AddressFeedDisplay: FC<AddressFeedDisplayProps> = (props) => {

  if (props.standard === 'LSP0') {
    return (
      <span onClick={(e) => props.onClick(e, props.address)} className={`${styles.AddressFeedDisplay} ${styles.Profile} ${props.postHierarchy}`} data-testid="AddressFeedDisplay">
        <UserTag username={props.name} address={props.address} postHierarchy={props.postHierarchy}></UserTag>
      </span>
    );
  }
  else if (props.standard === 'LSP6') {
    return (
      <span onClick={(e) => props.onClick(e, props.address)} className={`${styles.AddressFeedDisplay} ${styles.KeyManager} ${props.postHierarchy}`} data-testid="AddressFeedDisplay">
        <span className={props.postHierarchy}>🔑 </span>
        {shortenAddress(props.address, 3)}
      </span>
    )
  }
  else if (props.standard === 'LSP7' || props.standard === 'LSP8' || props.standard === 'ERC20' || props.standard === 'ERC721' || props.standard === 'ERC777' || props.standard === 'ERC1155') {
    return (
      <span onClick={(e) => props.onClick(e, props.address)} className={`${styles.AddressFeedDisplay} ${styles.Asset}`} data-testid="AddressFeedDisplay">
        <AssetTag address={props.address} name={props.name} postHierarchy={props.postHierarchy}/>
      </span>
    );
  }
  else {
    return (
      <span onClick={(e) => props.onClick(e, props.address)} className={`${styles.AddressFeedDisplay} ${styles.UnknownStandard}`} data-testid="AddressFeedDisplay">
        {shortenAddress(props.address, 3)}
      </span>
    )
  }
}

export default AddressFeedDisplay;
