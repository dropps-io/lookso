import React, {FC, useState} from 'react';
import styles from './Home.module.scss';
import Navbar from "../../components/Navbar/Navbar";
import impactImage from "../../assets/images/impact-image.png";
import impactImage2 from "../../assets/images/impact-image-2.png";
import looksoBanner from "../../assets/images/lookso-banner.png";
import shape1 from "../../assets/images/shape1.png";
import titleUnderline from "../../assets/images/title_underline.png";
import layerHeadlines from "../../assets/images/layer-headlines.png";
import transparencyIcon from "../../assets/icons/transparency.svg";
import peopleIcon from "../../assets/icons/people.svg";
import explorerIcon from "../../assets/icons/explorer.svg";
import Footer from "../../components/Footer/Footer";
import Head from "next/head";
import Link from "next/link";
import Faq from '../../components/Faq/Faq';

interface HomeProps {}

const Home: FC<HomeProps> = ()  => {
  const [foldHeadlines, setFoldHeadlines] = useState([true, true, true]);

  function foldHeadline(n: number) {
    setFoldHeadlines(existing => existing.map((x, i) => i === n ? !x : x ));
  }

  return (
    <div className={styles.Home} data-testid="Home">
        <Head>
          <title>LOOKSO</title>
          <meta name="twitter:card" content={'summary_large_image'}/>
          <meta name="twitter:site" content="@lookso_io"/>
          <meta name="twitter:title" content={`LOOKSO`}/>
          <meta property='twitter:description' content={'A decentralized social feed geared towards Universal Profiles and the LUKSO blockchain'}/>
          <meta property='twitter:creator' content='@undeveloped'/>
          <meta name='description' content={'A decentralized social feed geared towards Universal Profiles and the LUKSO blockchain'}/>
          <meta property='og:title' content={`LOOKSO`}/>
          <meta property='og:image' itemProp='image' content={looksoBanner.src}/>
          <meta property='og:description' content={'A decentralized social feed geared towards Universal Profiles and the LUKSO blockchain'}/>
        </Head>
        <div className={styles.Content}>
          <Navbar/>
          <section className={styles.MainSection}>
            <div>
              <h1>
                Welcome to LOOKSO!
                <img src={titleUnderline.src} alt=""/>
              </h1>
              <h2>A decentralized social feed geared towards Universal Profiles and the LUKSO blockchain</h2>
              <img className={styles.ImpactImgPhoneSize} src={impactImage.src} alt="impact image"/>
              <div className={styles.CallAction}>
                <Link href={'/explore'}>
                  <button className={styles.ImportantBtn}>See what’s happening</button>
                </Link>
                <p>(no login required)</p>
              </div>
              <img className={styles.Shape} src={shape1.src} alt=""/>
              <img className={styles.ImpactImg} src={impactImage.src} alt="impact image"/>
            </div>
          </section>

          <section className={styles.HeadlinesSection}>
            <div className={styles.BoxHeadlines}></div>
            <img className={styles.LayerHeadlines} src={layerHeadlines.src} alt=""/>
            <div className={styles.Headline}>
              <div className={styles.HeadlineIcon}>
                <img src={transparencyIcon.src} alt=""/>
              </div>
              <h3>Transparency</h3>
              <p onClick={() => foldHeadline(0)} className={!foldHeadlines[0] ? styles.UnfoldedHeadline : ''}>
                The data associated with a Universal Profile is always accessible regardless of the owner’s or the platform’s intentions. This is made possible through the use of decentralised platforms, namely <a href={"https://lukso.network/"} target={"_blank"} rel={"noreferrer"}>LUKSO</a> (blockchain) and <a href={"https://www.arweave.org/"} target={"_blank"} rel={"noreferrer"}>Arweave</a> (decentralised storage)              </p>
              <div onClick={() => foldHeadline(0)} className={styles.ToggleHeadline}>{foldHeadlines[0] ? '+' : '-'}</div>
            </div>
            <div className={styles.Headline}>
              <div className={styles.HeadlineIcon}>
                <img src={peopleIcon.src} alt=""/>
              </div>
              <h3>User-owned content</h3>
              <p onClick={() => foldHeadline(1)} className={!foldHeadlines[1] ? styles.UnfoldedHeadline : ''}>
                Through a social media interoperability standard proposed by the DROPPS team, your activity on LOOKSO (posts, comments, replies and follows) are linked solely to your Universal Profile and can be pulled by other social media platforms
              </p>
                <div onClick={() => foldHeadline(1)} className={styles.ToggleHeadline}>{foldHeadlines[1] ? '+' : '-'}</div>
            </div>
            <div className={styles.Headline}>
              <div className={styles.HeadlineIcon}>
                <img src={explorerIcon.src} alt=""/>
              </div>
              <h3>Explorer meets social</h3>
              <p onClick={() => foldHeadline(2)} className={!foldHeadlines[2] ? styles.UnfoldedHeadline : ''}>
                Besides traditional social media features (posts, followers etc) LOOKSO   displays other on-chain activity associated with Universal Profiles in a user-friendly manner, like contract interactions and value transfers               </p>
              <div onClick={() => foldHeadline(2)} className={styles.ToggleHeadline}>{foldHeadlines[2] ? '+' : '-'}</div>
            </div>
          </section>

          <section className={styles.ThirdSection}>
            <div className={styles.LeftPart}>
              <h2>Is LOOKSO live?</h2>
              <p>
                The dApp’s current version is live only within the L16 testnet.
                Once LUKSO’s mainnet goes live we will roll out the definitive version of our platform, along with a user-friendly interface for linking your testnet activity to your mainnet Universal Profile
              </p>
            </div>
            <img className={styles.RightPart} src={impactImage2.src} alt=''></img>
          </section>
          <Faq/>
        </div>
        <Footer/>
      </div>
  );
}

export default Home;
