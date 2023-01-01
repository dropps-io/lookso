import React, {FC, useEffect, useState} from 'react';
import styles from './Transaction.module.scss';
import SidebarButtons from "../../SidebarButtons/SidebarButtons";
import Navbar from "../../Navbar/Navbar";
import {GetTransactionResponse} from "../../../models/transaction";
import {fetchTransaction} from "../../../core/api/api";
import {useSelector} from "react-redux";
import {RootState} from "../../../store/store";
import copyIcon from '../../../assets/icons/copy.svg';
import AssetTag from "../../AssetTag/AssetTag";
import {AddressDisplay, ProfileDisplay} from "../../../models/profile";
import {DEFAULT_PROFILE_IMAGE} from "../../../core/utils/constants";
import UserTag from "../../UserTag/UserTag";
import {shortenAddress} from "../../../core/utils/address-formating";

interface TransactionProps {
  hash: string
}

export const initialGetTransactionResponse: GetTransactionResponse = {
  hash: '',
  from: '',
  to: '',
  value: '',
  input: '',
  blockNumber: 0,
  methodId: '',
  decodedFunctionCallParts: []
}
const Transaction: FC<TransactionProps> = (props) => {

  const web3 = useSelector((state: RootState) => state.web3.web3);

  const [tx, setTx] = useState<GetTransactionResponse>(initialGetTransactionResponse);
  const [date, setDate] = useState<string>('');
  const [sender, setSender] = useState<AddressDisplay>({
    address: "0x02d23d393jjs", image: DEFAULT_PROFILE_IMAGE, interfaceCode: "LSP0", name: "samuel-v"
  });
  const [receiver, setReceiver] = useState<AddressDisplay>({
    address: "0x02d23d393jjs", image: DEFAULT_PROFILE_IMAGE, interfaceCode: "LSP0", name: "samuel-v"
  });

  useEffect(() => {
    if (props.hash) {
      fetchTransaction(props.hash).then(res => {
        setTx(res);
        res.blockNumber;
        if (res.blockNumber) {
          web3.eth.getBlock(res.blockNumber).then(block => {
            setDate((new Date((block.timestamp as number) * 1000)).toUTCString());
          });
        }
      });
    }
  }, [props.hash]);

  return (
    <div className={styles.TxPage} data-testid="Transaction">
      <SidebarButtons/>
      <div className={styles.Header}><Navbar/></div>
      <div className={styles.TxPageContent}>
        <div className={styles.UpperPart}>
          <div className={styles.TxFlow}>
            <div className={styles.TxFlowUpper}>
              <div className={styles.Block}>
                <div className={styles.Square}></div>
                <span>
                  <span>23243242</span>
                  <span> - </span>
                  <span>12/12/2021 21:32</span>
                </span>
              </div>
              <div className={styles.txHash}>
                <span>0x240b41b705b417591bffd6c452a113c66fd6ae3351405ff6b146ab9638f73451</span>
                <img src={copyIcon.src} alt=""/>
              </div>
            </div>
            <div className={styles.TxFlowMain}>
              <div className={styles.AddressDisplayLarge}>
                <div className={styles.Image}></div>
                <div className={styles.Identifier}>
                  {
                    ['LSP7', 'LSP8'].includes(sender.interfaceCode) ?
                      <AssetTag name={sender.name} address={sender.address} postHierarchy='main'/>
                      :
                      sender.interfaceCode === 'LSP0' ?
                        <UserTag username={sender.name} address={sender.address}/>
                        :
                        <span>{shortenAddress(sender.address, 4)}</span>
                  }
                </div>
              </div>
              <div className={styles.ActionSeparator}>
                <div className={styles.Separator}></div>
                <span>{tx.decodedFunctionCallParts.length > 0 ?
                  tx.decodedFunctionCallParts[tx.decodedFunctionCallParts.length]
                    .methodInterface.name
                  :
                  'Unknown Function'
                }</span>
              </div>
              <div className={styles.AddressDisplayLarge}>
                <div className={styles.Image}></div>
                <div className={styles.Identifier}>
                  {
                    ['LSP7', 'LSP8'].includes(receiver.interfaceCode) ?
                      <AssetTag name={receiver.name} address={receiver.address} postHierarchy='main'/>
                      :
                      sender.interfaceCode === 'LSP0' ?
                        <UserTag username={receiver.name} address={receiver.address}/>
                        :
                        <span>{shortenAddress(receiver.address, 4)}</span>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Transaction;
