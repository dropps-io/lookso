import React, { FC } from 'react';
import { styled } from "@mui/system";
import styles from './ExtendImage.module.scss';
import {ModalUnstyled} from "@mui/base";
import clsx from "clsx";
import crossIcon from '../../assets/icons/cross.svg';
import {formatUrl} from "../../core/utils/url-formating";

// eslint-disable-next-line react/display-name
const BackdropUnstyled = React.forwardRef<
    HTMLDivElement,
    { open?: boolean; className: string }
    >((props, ref) => {
    const { open, className, ...other } = props;
    return (
        <div
            className={clsx({ 'MuiBackdrop-open': open }, className)}
            ref={ref}
            {...other}
        />
    );
});

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

interface ExtendImageProps extends React.PropsWithChildren {
    open: boolean,
    callback: () => any,
    image: any
    alt: string,
    rounded: boolean
}

const ExtendImage: FC<ExtendImageProps> = (props) => (
    <Modal
        aria-labelledby="unstyled-modal-title"
        aria-describedby="unstyled-modal-description"
        open={props.open}
        onClose={props.callback}
        slots={{ backdrop: Backdrop }}
    >
        <div className={styles.ExtendImage}>
            <div className={styles.ExtendImageBackDrop} onClick={() => props.callback()}></div>
            <div className={styles.ExtendImageCloseButton}><img src={crossIcon.src} alt="Close" onClick={() => props.callback()}/></div>
            {
                !props.rounded ?
                    <img src={formatUrl(props.image)} alt={props.alt}/>
                    : <div className={styles.ExtendImageRounded} style={{backgroundImage: props.image ? `url(${formatUrl(props.image)})` : ''}}></div>
            }
        </div>
    </Modal>
);

export default ExtendImage;
