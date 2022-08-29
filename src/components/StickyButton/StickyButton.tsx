import React, {FC} from "react";
import styles from "./StickyButton.module.scss";
import Image from "next/image";


declare interface StickButtonProps {
    icon: any // icon asset
    alt: string // alt for icon image
    callback: Function // callback function when user click on button
    color: string // button color
}

const StickyButton: FC<StickButtonProps> = (props) => {
    return (
        <button className={styles.StickyButton} onClick={() => props.callback()} style={{ backgroundColor: `var(${props.color})`}}>
            <img src={props.icon.src} alt={props.alt} width={20} height={20}/>
        </button>
    )
}

export default StickyButton;
