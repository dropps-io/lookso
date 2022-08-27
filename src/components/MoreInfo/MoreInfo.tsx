import React, {FC, useState} from "react";
import styles from "./MoreInfo.module.scss";
import arrowUpIcon from '../../assets/icons/arrow-up.svg';

declare interface MoreInfoProps {
    tags: string[]
    bio: string
    links: { title: string, url: string }[]
}

const MoreInfo: FC<MoreInfoProps> = (props) => {

    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className={styles.MoreInfo}>
            <button className={`${styles.MoreInfoButton} ${isOpen && styles.MoreInfoButtonOpen}`}
                    onClick={() => setIsOpen(!isOpen)}>More Info <img src={arrowUpIcon.src} alt="Open More Info"/></button>
            {
                isOpen &&
                <div className={styles.MoreInfoWrapper}>
                    {
                        props.tags?.length > 0 &&
                        <div className={styles.MoreInfoTags}>
                            {
                                // filter empty tags
                                props.tags.filter(tag => tag.replace(/\s+/g, '').length > 0).map((tag, index) => {
                                    return (
                                        <div className={styles.MoreInfoTag} key={index}>{ tag }</div>
                                    )
                                })
                            }
                        </div>
                    }
                    {
                        props.bio && <div className={styles.MoreInfoBio}>{ props.bio }</div>
                    }
                    {
                        props.links?.length > 0 &&
                        <div className={styles.MoreInfoLinks}>
                            {
                                props.links.map((link, index) => {
                                    return (
                                        <a className={styles.MoreInfoLink} key={index} href={link.url} target={"_blank"} rel={"noreferrer"}>{ link.title }</a>
                                    )
                                })
                            }
                        </div>
                    }
                </div>
            }
        </div>
    )
}

export default MoreInfo;
