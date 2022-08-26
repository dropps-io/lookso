import React, { FC } from 'react';
import styles from './ActionModal.module.scss';
import CustomModal from "../../CustomModal/CustomModal";

interface ActionModalProps {
  open: boolean,
  onClose: () => any,
  textToDisplay: string,
  btnText: string,
  callback: () => any
}

const ActionModal: FC<ActionModalProps> = (props) => (
  <CustomModal open={props.open} onClose={props.onClose}>
    <div className={styles.ActionModal} data-testid="ActionModal">
      <p>{props.textToDisplay}</p>
      <button className={`btn btn-main`} onClick={props.callback}>{props.btnText}</button>
    </div>
  </CustomModal>
);

export default ActionModal;
