import React, { FC } from 'react';
import styles from './Home.module.scss';
import Navbar from "../../components/Navbar/Navbar";
import impactImage from "../../assets/images/impact-image.png";
import shape1 from "../../assets/images/shape1.png";
import titleUnderline from "../../assets/images/title_underline.png";

interface HomeProps {}

const Home: FC<HomeProps> = () => (
  <div className={styles.Home} data-testid="Home">
    <Navbar></Navbar>
    <section className={styles.MainSection}>
      <h1>
        Welcome to LOOKSO!
        <img src={titleUnderline.src} alt=""/>
      </h1>
      <h2>A decentralized Social feed geared towards Universal Profiles and the LUKSO blockchain</h2>
      <div className={styles.CallAction}>
        <button className={styles.ImportantBtn}>See what’s happening</button>
        <p>No login required</p>
      </div>
      {/*<div className={styles.RightSection}>*/}
      <img className={styles.Shape} src={shape1.src} alt=""/>
      <img className={styles.ImpactImg} src={impactImage.src} alt="impact image"/>
      {/*</div>*/}
    </section>
  </div>
);

export default Home;
