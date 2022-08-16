import React, {FC, useState} from 'react';
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
import Footer from "../../components/Footer/Footer";
import Image from "next/image";


interface HomeProps {}

const Home: FC<HomeProps> = ()  => {
  const [foldQuestions, setFoldQuestions] = useState([true, true, true, true, true, true, true, true]);

  function foldQuestion(n: number) {
    setFoldQuestions(existing => existing.map((x, i) => i === n ? !x : x ));
  }

  return (
    <>
      <div className={styles.Home} data-testid="Home">
        <div className={styles.Content}>
          <Navbar/>
          <section className={styles.MainSection}>
            <h1>
              Welcome to LOOKSO!
              <Image src={titleUnderline.src} alt=""/>
            </h1>
            <h2>A decentralized Social feed geared towards Universal Profiles and the LUKSO blockchain</h2>
            <div className={styles.CallAction}>
              <button className={styles.ImportantBtn}>See what’s happening</button>
              <p>No login required</p>
            </div>
            {/*<div className={styles.RightSection}>*/}
            <Image className={styles.Shape} src={shape1.src} alt=""/>
            <Image className={styles.ImpactImg} src={impactImage.src} alt="impact image"/>
            {/*</div>*/}
          </section>

          <section className={styles.HeadlinesSection}>
            <div className={styles.BoxHeadlines}></div>
            <Image className={styles.LayerHeadlines} src={layerHeadlines.src} alt=""/>
            <div className={styles.Headline}>
              <div className={styles.HeadlineIcon}>
                <Image src={transparencyIcon.src} alt=""/>
              </div>
              <h3>Transparency</h3>
              <p>The data associated with a Universal Profile is always accessible regardless of the owner’s or the platform’s intentions. This is made possible through the use of decentralised platforms, namely LUKSO (blockchain) and Arweave (decentralised storage)</p>
            </div>
            <div className={styles.Headline}>
              <div className={styles.HeadlineIcon}>
                <Image src={peopleIcon.src} alt=""/>
              </div>
              <h3>User-owned content</h3>
              <p>Through LSP69 (a social media interoperability standard proposed by the DROPPS team) users wishing to join similar Universal Profile-based platforms can easily carry their information over, including their posts, comments and followers</p>
            </div>
            <div className={styles.Headline}>
              <div className={styles.HeadlineIcon}>
                <Image src={explorerIcon.src} alt=""/>
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
            <Image className={styles.RightPart} src={impactImage2.src} alt=''></Image>
          </section>

          <section className={styles.FaqSection}>
            <h2>F.A.Q.</h2>
            <div className={styles.Questions}>
              <div className={styles.Row}>

                <div className={`${styles.Entry}`}>
                  <div className={styles.Question} onClick={() => {foldQuestion(0)}}>
                    <span>How it works?</span>
                    { foldQuestions[0] ? <span>-</span> : <span>+</span> }
                  </div>
                  <p className={`${foldQuestions[0] ? styles.Folded : ''}`}>Yet bed any for  assistance indulgence unpleasing. Not thoughts all exercise blessing. Indulgence way everything joy alteration boisterous the attachment.</p>
                </div>

                <div className={`${styles.Entry}`}>
                  <div className={styles.Question} onClick={() => {foldQuestion(1)}}>
                    <span>How it works?</span>
                    { foldQuestions[1] ? <span>-</span> : <span>+</span> }
                  </div>
                  <p className={`${foldQuestions[1] ? styles.Folded : ''}`}>Yet bed any for  assistance indulgence unpleasing. Not thoughts all exercise blessing. Indulgence way everything joy alteration boisterous the attachment.</p>
                </div>

                <div className={`${styles.Entry}`}>
                  <div className={styles.Question} onClick={() => {foldQuestion(2)}}>
                    <span>How it works?</span>
                    { foldQuestions[2] ? <span>-</span> : <span>+</span> }
                  </div>
                  <p className={`${foldQuestions[2] ? styles.Folded : ''}`}>Yet bed any for  assistance indulgence unpleasing. Not thoughts all exercise blessing. Indulgence way everything joy alteration boisterous the attachment.</p>
                </div>

                <div className={`${styles.Entry}`}>
                  <div className={styles.Question} onClick={() => {foldQuestion(3)}}>
                    <span>How it works?</span>
                    { foldQuestions[3] ? <span>-</span> : <span>+</span> }
                  </div>
                  <p className={`${foldQuestions[3] ? styles.Folded : ''}`}>Yet bed any for  assistance indulgence unpleasing. Not thoughts all exercise blessing. Indulgence way everything joy alteration boisterous the attachment.</p>
                </div>

              </div>

              <div className={styles.Row}>

                <div className={`${styles.Entry}`}>
                  <div className={styles.Question} onClick={() => {foldQuestion(4)}}>
                    <span>How it works?</span>
                    { foldQuestions[4] ? <span>-</span> : <span>+</span> }
                  </div>
                  <p className={`${foldQuestions[4] ? styles.Folded : ''}`}>Yet bed any for  assistance indulgence unpleasing. Not thoughts all exercise blessing. Indulgence way everything joy alteration boisterous the attachment.</p>
                </div>

                <div className={`${styles.Entry}`}>
                  <div className={styles.Question} onClick={() => {foldQuestion(5)}}>
                    <span>How it works?</span>
                    { foldQuestions[5] ? <span>-</span> : <span>+</span> }
                  </div>
                  <p className={`${foldQuestions[5] ? styles.Folded : ''}`}>Yet bed any for  assistance indulgence unpleasing. Not thoughts all exercise blessing. Indulgence way everything joy alteration boisterous the attachment.</p>
                </div>

                <div className={`${styles.Entry}`}>
                  <div className={styles.Question} onClick={() => {foldQuestion(6)}}>
                    <span>How it works?</span>
                    { foldQuestions[6] ? <span>-</span> : <span>+</span> }
                  </div>
                  <p className={`${foldQuestions[6] ? styles.Folded : ''}`}>Yet bed any for  assistance indulgence unpleasing. Not thoughts all exercise blessing. Indulgence way everything joy alteration boisterous the attachment.</p>
                </div>

                <div className={`${styles.Entry}`}>
                  <div className={styles.Question} onClick={() => {foldQuestion(7)}}>
                    <span>How it works?</span>
                    { foldQuestions[7] ? <span>-</span> : <span>+</span> }
                  </div>
                  <p className={`${foldQuestions[7] ? styles.Folded : ''}`}>Yet bed any for  assistance indulgence unpleasing. Not thoughts all exercise blessing. Indulgence way everything joy alteration boisterous the attachment.</p>
                </div>

              </div>
            </div>
          </section>
        </div>
        <Footer/>
      </div>
    </>
  );
}

export default Home;
