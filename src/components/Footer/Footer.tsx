import React, { type FC } from 'react';
import Image from 'next/image';

import styles from './Footer.module.scss';
import discordLogo from '../../assets/icons/Discord.svg';
import twitterLogo from '../../assets/icons/Twitter.svg';
import droppsLogo from '../../assets/images/dropp-logo.png';

interface FooterProps {}

const Footer: FC<FooterProps> = () => (
  <div className={styles.Footer} data-testid="Footer">
    <div className={styles.FooterBox}></div>
    <div className={styles.FooterContent}>
      <a href={'https://dropps.io'} target={'_blank'} rel={'noreferrer'}>
        <Image src={droppsLogo.src} width={50} height={50} alt="dropps.io dropps logo" />
      </a>
      <div className={styles.Credentials}>
        <span>Ⓒ</span>
        <span>
          Made by{' '}
          <a href="https://dropps.io" target="_blank" rel={'noreferrer'}>
            DROPPS
          </a>
          ,<br />
          powered by LUKSO
        </span>
      </div>
      <div className={styles.FooterLinks}>
        <a href={'https://discord.gg/2eDkpwbK9w'} target={'_blank'} rel={'noreferrer'}>
          <Image src={discordLogo.src} width={40} height={30} alt="" />
        </a>
        <a href={'https://twitter.com/lookso_io'} target={'_blank'} rel={'noreferrer'}>
          <Image src={twitterLogo.src} width={40} height={30} alt="" />
        </a>
      </div>
    </div>
  </div>
);

export default Footer;
