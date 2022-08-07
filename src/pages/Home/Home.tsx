import React, { FC } from 'react';
import styles from './Home.module.scss';
import Navbar from "../../components/Navbar/Navbar";
import impactImage from "../../assets/images/impact-image.png";
import impactImage2 from "../../assets/images/impact-image-2.png";
import shape1 from "../../assets/images/shape1.png";
import titleUnderline from "../../assets/images/title_underline.png";
import layerHeadlines from "../../assets/images/layer-headlines.png";
import transparencyIcon from "../../assets/icons/transparency.svg";
import peopleIcon from "../../assets/icons/people.svg";
import explorerIcon from "../../assets/icons/explorer.svg";


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

    <section className={styles.HeadlinesSection}>
      <div className={styles.BoxHeadlines}></div>
      <img className={styles.LayerHeadlines} src={layerHeadlines.src} alt=""/>
      <div className={styles.Headline}>
        <div className={styles.HeadlineIcon}>
          <img src={transparencyIcon.src} alt=""/>
        </div>
        <h3>Transparency</h3>
        <p>The data associated with a Universal Profile is always accessible regardless of the owner’s or the platform’s intentions. This is made possible through the use of decentralised platforms, namely LUKSO (blockchain) and Arweave (decentralised storage)</p>
      </div>
      <div className={styles.Headline}>
        <div className={styles.HeadlineIcon}>
          <img src={peopleIcon.src} alt=""/>
        </div>
        <h3>User-owned content</h3>
        <p>Through LSP69 (a social media interoperability standard proposed by the DROPPS team) users wishing to join similar Universal Profile-based platforms can easily carry their information over, including their posts, comments and followers</p>
      </div>
      <div className={styles.Headline}>
        <div className={styles.HeadlineIcon}>
          <img src={explorerIcon.src} alt=""/>
        </div>
        <h3>Explorer meets social</h3>
        <p>Besides traditional social media features (posts, followers etc) LOOKSO  also displays other on-chain activity associated with Universal Profiles in a user-friendly manner, such as contract interactions or value transfers </p>
      </div>
    </section>

    <section className={styles.ThirdSection}>
      <div className={styles.LeftPart}>
        <h2>Is LOOKSO live?</h2>
        <p>The dApp’s current version is live only within the L16 testnet.
          Once LUKSO’s mainnet goes live we will roll out the definitive version of our platform, along with a user-friendly interface for linking your testnet activity to your mainnet Universal Profile</p>
      </div>
      <img className={styles.RightPart} src={impactImage2.src}></img>
    </section>
  </div>
);

export default Home;
