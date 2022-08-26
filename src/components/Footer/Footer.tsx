import React, { FC } from 'react';
import styles from './Footer.module.scss';
import discordLogo from '../../assets/icons/Discord.svg';
import twitterLogo from '../../assets/icons/Twitter.svg';
import Image from "next/image";

interface FooterProps {}

const Footer: FC<FooterProps> = () => (
  <div className={styles.Footer} data-testid="Footer">
    <div className={styles.FooterBox}></div>
    <div className={styles.FooterContent}>
      <div></div>
      <div className={styles.Credentials}>
        <span>Ⓒ</span>
        <span>Made by DROPPS,<br/>powered by LUKSO</span>
      </div>
      <div className={styles.FooterLinks}>
          <a href={"https://discord.gg/GGJcvRw2uS"} target={"_blank"} rel={'noreferrer'}>
              <Image src={discordLogo.src} width={40} height={30} alt=""/>
          </a>
          <a href={"https://twitter.com/dropps_io"} target={"_blank"} rel={'noreferrer'}>
              <Image src={twitterLogo.src} width={40} height={30} alt=""/>
          </a>
      </div>
    </div>
  </div>
);

export default Footer;
