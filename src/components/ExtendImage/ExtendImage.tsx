import React, {FC, useEffect, useState} from "react";
import styles from "./ExtendImage.module.scss";
import crossIcon from '../../assets/icons/cross.svg'
import {formatUrl} from "../../core/utils/url-formating";
import {DEFAULT_PROFILE_IMAGE} from "../../core/utils/constants";

declare interface MoreInfoProps {
    image: any
    alt: string,
    callback: Function,
    rounded: boolean
}

const ExtendImage: FC<MoreInfoProps> = (props) => {

    useEffect(() => {
        return () => {
            // block body overflow when image is open
            document.body.style.overflowY = document.body.style.overflowY === 'hidden' ? 'auto' : 'hidden'
        };
    }, []);

    return (
        <div className={styles.ExtendImage}>
            <div className={styles.ExtendImageBackDrop} onClick={() => props.callback()}></div>
            <div className={styles.ExtendImageCloseButton}><img src={crossIcon.src} alt="Close" onClick={() => props.callback()}/></div>
            {
                !props.rounded ?
                    <img src={formatUrl(props.image)} alt={props.alt}/>
                : <div className={styles.ExtendImageRounded} style={{backgroundImage: props.image ? `url(${formatUrl(props.image)})` : ''}}></div>
            }
        </div>
    )
}

export default ExtendImage;
