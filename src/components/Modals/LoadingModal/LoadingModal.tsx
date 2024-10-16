import React, { type FC } from 'react';
import CircularProgress from '@mui/material/CircularProgress';

import styles from './LoadingModal.module.scss';
import CustomModal from '../../CustomModal/CustomModal';

interface LoadingModalProps {
  open: boolean;
  onClose: () => any;
  textToDisplay: string;
}

const LoadingModal: FC<LoadingModalProps> = props => (
  <CustomModal open={props.open} onClose={props.onClose}>
    <div className={styles.LoadingModal} data-testid="LoadingModal">
      <p>{props.textToDisplay}</p>
      <CircularProgress />
    </div>
  </CustomModal>
);

export default LoadingModal;
