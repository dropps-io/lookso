import React, { type FC } from 'react';
import { styled, Box } from '@mui/system';
import { ModalUnstyled } from '@mui/base';
import clsx from 'clsx';

import styles from './CustomModal.module.scss';
import crossIcon from '../../assets/icons/cross.svg';

// eslint-disable-next-line react/display-name
const BackdropUnstyled = React.forwardRef<HTMLDivElement, { open?: boolean; className: string }>(
  (props, ref) => {
    const { open, className, ...other } = props;
    return <div className={clsx({ 'MuiBackdrop-open': open }, className)} ref={ref} {...other} />;
  }
);

const Modal = styled(ModalUnstyled)`
  position: fixed;
  z-index: 1300;
  right: 0;
  bottom: 0;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Backdrop = styled(BackdropUnstyled)`
  z-index: -1;
  position: fixed;
  right: 0;
  bottom: 0;
  top: 0;
  left: 0;
  background-color: rgba(256, 256, 256, 0.4);
  -webkit-tap-highlight-color: transparent;
`;

interface CustomModalProps extends React.PropsWithChildren {
  open: boolean;
  onClose: () => any;
}

const CustomModal: FC<CustomModalProps> = props => (
  <Modal
    aria-labelledby="unstyled-modal-title"
    aria-describedby="unstyled-modal-description"
    open={props.open}
    onClose={props.onClose}
    slots={{ backdrop: Backdrop }}
  >
    <Box className={styles.CustomModal}>
      <div className={styles.Close}>
        <img onClick={props.onClose} src={crossIcon.src} alt="" />
      </div>
      <div className={styles.Content}>{props.children}</div>
    </Box>
  </Modal>
);

export default CustomModal;
