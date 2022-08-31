import React, {FC} from "react";
import styles from "./PopupButton.module.scss";

declare interface PopupButtonProps {
    children?: any,
    callback: Function,
    className: any,
}

const PopupButton: FC<PopupButtonProps> = (props) => {
    return (
        <div className={`${styles.PopupButton} ${props.className}`} >
            { props.children }
        </div>
    )
}

export default PopupButton;
