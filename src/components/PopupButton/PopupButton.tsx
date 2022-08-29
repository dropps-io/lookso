import React, {FC} from "react";
import styles from "./PopupButton.module.scss";

declare interface PopupButtonProps {
    open: boolean
    children?: any,
    callback: Function,
    className: any,
}

const PopupButton: FC<PopupButtonProps> = (props) => {
    return (
      <>
          {props.open && <div className={'backdrop'} onClick={() => props.callback()}></div>}
          <div className={`${styles.PopupButton} ${props.className}`} >
              { props.children }
          </div>
      </>
    )
}

export default PopupButton;
