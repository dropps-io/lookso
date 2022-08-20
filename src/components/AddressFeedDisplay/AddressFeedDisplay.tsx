import React, { FC } from 'react';
import styles from './AddressFeedDisplay.module.scss';
import UserTag from "../UserTag/UserTag";
import {shortenAddress} from "../../core/utils/address-formating";
import AssetTag from "../AssetTag/AssetTag";
import {EXPLORER_URL} from "../../environment/endpoints";
import {useRouter} from "next/router";

interface AddressFeedDisplayProps {
  address: string,
  name: string,
  standard: string
}

const AddressFeedDisplay: FC<AddressFeedDisplayProps> = (props) => {
  const router = useRouter();

  function goToAddress() {
    window.open( EXPLORER_URL + '/address/' + props.address, '_blank');
  }

  function goToProfile() {
    router.push('/Profile/' + props.address);
  }

  if (props.standard === 'LSP0') {
    return (
      <span onClick={goToProfile} className={`${styles.AddressFeedDisplay} ${styles.Profile}`} data-testid="AddressFeedDisplay">
        <UserTag username={props.name} address={props.address}></UserTag>
      </span>
    );
  }
  else if (props.standard === 'LSP6') {
    return (
      <span onClick={goToAddress} className={`${styles.AddressFeedDisplay} ${styles.KeyManager}`} data-testid="AddressFeedDisplay">
        <span>🔑 </span>
        {shortenAddress(props.address, 3)}
      </span>
    )
  }
  else if (props.standard === 'LSP7' || props.standard === 'LSP8' || props.standard === 'ERC20' || props.standard === 'ERC721' || props.standard === 'ERC777' || props.standard === 'ERC1155') {
    return (
      <span onClick={goToAddress} className={`${styles.AddressFeedDisplay} ${styles.Asset}`} data-testid="AddressFeedDisplay">
        <AssetTag address={props.address} name={props.name} />
      </span>
    );
  }
  else {
    return (
      <span onClick={goToAddress} className={`${styles.AddressFeedDisplay} ${styles.UnknownStandard}`} data-testid="AddressFeedDisplay">
        {shortenAddress(props.address, 3)}
      </span>
    )
  }
}

export default AddressFeedDisplay;
