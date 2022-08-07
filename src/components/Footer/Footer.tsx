import React, { FC } from 'react';
import styles from './Footer.module.scss';
import discordLogo from '../../assets/icons/Discord.svg';

interface FooterProps {}

const Footer: FC<FooterProps> = () => (
  <div className={styles.Footer} data-testid="Footer">
    <div className={styles.FooterBox}></div>
    <div className={styles.FooterContent}>
      <div></div>
      <div className={styles.Credentials}>
        <span>Ⓒ</span>
        <span>Made by DROPPS,<br/>powered by LUKSO </span>
      </div>
      <img src={discordLogo.src} alt=""/>
    </div>
  </div>
);

export default Footer;
