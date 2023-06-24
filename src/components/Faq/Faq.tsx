import React, { type FC, useState } from 'react';

import styles from './Faq.module.scss';

interface FaqProps {}

const questions = [
  {
    title: 'What is LOOKSO?',
    response:
      'LOOKSO is a decentralized social media platform combining user generated content with blockchain events. An incredibly rich feed displaying on-chain Universal Profile activity, such as contract interactions and profile updates, side by side with user posts, comments and likes.<br><br>' +
      'The LOOKSO protocol leverages decentralized storage networks to minimize the data saved on Universal Profiles, based on the new LSP19 standard. A standard to promote complete interoperability and store social media data, ready to be consumed by any other project adhering to the standard.',
  },
  {
    title:
      'What happens to my posts and social activity (likes, follows, etc) if one day LOOKSO decides to shut down?',
    response:
      "Your social media footprint is permanently stored on the blockchain, according to standards adopted by the whole community. LOOKSO is merely a tool displaying  this content and helping its users interact with the network. Anyone can use a different tool that adheres to the standards because all the content is referenced in each user's Universal Profile.",
  },
  {
    title: 'How is LOOKSO decentralized?',
    response:
      "The LOOKSO plataform is a gateway to social media content stored on a decentralized storage network. A user's actions are performed by him, by logging in with his blockchain account on the platform. No information is ever stored on a centralized server.  No identity information is kept. LOOKSO owns and controls nothing.",
  },
  {
    title: 'Will there be a cost associated with using LOOKSO once LUKSO’s mainnet goes live?',
    response:
      "Uploading data to decentralized storage networks like <a href='https://www.arweave.org/' target='_blank'><a href='https://www.arweave.org/' target='_blank'>Arweave</a></a> has costs. There is also the cost of referencing such data on the <a href='https://lukso.network/' target='_blank'>LUKSO</a> blockchain, under each Universal Profile's keystore.<br><br>" +
      'In the beginning, we will cover the storage costs for you, as we develop novel techniques and optimizations to make the blockchain as inexpensive as it can be.',
  },
  {
    title: 'Who is LOOKSO?',
    response:
      "LOOKSO was built by DROPPS. DROPPS intends on becoming a hub for services pertaining to digital assets in the <a href='https://lukso.network/' target='_blank'>LUKSO</a> blockchain ecosystem.<br><br>" +
      'The core team is made up by Carlos Caldas (CEO), Samuel Videau (Head of Development), António Silva (Head of Research), Rui Pereira (UI/UX Lead) and João Figueira (General Counsel).',
  },
  {
    title: 'Why Arweave instead of IPFS?',
    response:
      "While IPFS is a decentralized storage network, <a href='https://www.arweave.org/' target='_blank'>Arweave</a> is a blockchain tailored for storage. With built-in economic incentives, the cost of long-term storage is paid upfront by its users and the accessibility of content is guaranteed for as long as the network is alive.<br><br>" +
      "Furthermore, <a href='https://www.arweave.org/' target='_blank'>Arweave</a> transactions offer searchable information such as tags and timestamps for the data uploaded. A degree of traceability and metadata that IPFS lacks.\n",
  },
  {
    title: 'Can I delete a post from LOOKSO?',
    response:
      'Yes. Your post will be removed from LOOKSO and from your Universal Profile as well. However, it cannot be removed from decentralized storage.<br><br>' +
      '<strong>If a reference to your post is saved somewhere else, for example in someone else’s UP as a repost, it will still show.</strong>',
  },
  {
    title: 'What do I need in order to use LOOKSO?',
    response:
      "You need to install the <a href='https://docs.lukso.tech/guides/browser-extension/install-browser-extension/' target='_blank'>LUKSO Browser Extension</a> and to create a Universal Profile with it. The LOOKSO platform is not compatible with generic wallets like Metamask because it uses the <a href='https://lukso.network/' target='_blank'>LUKSO</a> standards.<br><br>" +
      'The first time you use LOOKSO, you will be prompted to grant permissions to the Timestamping smart contract LIPXXTimeStamper, so it can update the Social Registry on your Universal Profile. ',
  },
  {
    title: 'Is LOOKSO mobile-compatible?',
    response:
      "Although you can access the LOOKSO webpage on your mobile browser, you will not be able to log in until <a href='https://lukso.network/' target='_blank'>LUKSO</a> releases a mobile version of their Universal Profile extension.<br><br>You can keep an eye out for their announcement channels so you know as soon as this happens!",
  },
  {
    title: 'Why LUKSO?',
    response:
      "<a href='https://lukso.network/' target='_blank'>LUKSO</a> offers an ecosystem and a complete set of tools to simplify the experience of using the blockchain, while improving upon scalability and transaction costs. The two most relevant ones are the Browser Extension, which helps you interact with your Universal Profile, and the Transaction Relayer, which grants great flexibility and ease of use for handling transaction costs.<br><br>" +
      "The <a href='https://lukso.network/' target='_blank'>LUKSO</a> ecosystem, geared towards the creative industries, provides a promising landscape of interoperability and partnerships for a project such as LOOKSO.",
  },
];

const Faq: FC<FaqProps> = () => {
  const [foldQuestions, setFoldQuestions] = useState(new Array(questions.length).fill(true));

  const [numberOfQuestion, setNumberOfQuestion] = useState(questions.length / 2);

  function foldQuestion(n: number) {
    setFoldQuestions(existing => existing.map((x, i) => (i === n ? !x : x)));
  }

  /**
   * Detect click event on faq response
   * @param e
   * @param index
   */
  const contentClickHandler = (e: any, index: number) => {
    const targetLink = e.target.closest('a');
    if (!targetLink) return;
    e.preventDefault();
    if (foldQuestions[index]) return;
    // @ts-expect-error
    window?.open(targetLink.href, '_blank').focus();
  };

  return (
    <section className={styles.Faq}>
      <h2 className={styles.FaqTitle}>F.A.Q.</h2>
      <div className={styles.FaqWrapper}>
        <div className={styles.FaqRow}>
          {/* For each question between 0 to size question / 2 */}
          {questions.slice(0, numberOfQuestion).map(function (question, index) {
            return (
              <div
                key={index}
                className={`${styles.FaqQuestion} ${
                  !foldQuestions[index] ? styles.FaqQuestionFolded : ''
                }`}
              >
                <h3
                  className={styles.FaqQuestionTitle}
                  onClick={() => {
                    foldQuestion(index);
                  }}
                >
                  {question.title}
                  {foldQuestions[index] ? <span>+</span> : <span>-</span>}
                </h3>
                <p
                  onClick={e => {
                    contentClickHandler(e, index);
                  }}
                  className={`${foldQuestions[index] ? styles.FaqResponseFolded : ''}`}
                  dangerouslySetInnerHTML={{ __html: question.response }}
                />
              </div>
            );
          })}
        </div>
        <div className={styles.FaqRow}>
          {/* For each question between size question / 2 to end */}
          {questions.slice(numberOfQuestion, questions.length).map(function (question, index) {
            return (
              <div
                key={index + numberOfQuestion}
                className={`${styles.FaqQuestion} ${
                  !foldQuestions[index + numberOfQuestion] ? styles.FaqQuestionFolded : ''
                }`}
              >
                <h3
                  className={styles.FaqQuestionTitle}
                  onClick={() => {
                    foldQuestion(index + numberOfQuestion);
                  }}
                >
                  {question.title}
                  {foldQuestions[index + numberOfQuestion] ? <span>+</span> : <span>-</span>}
                </h3>
                <p
                  onClick={e => {
                    contentClickHandler(e, index + numberOfQuestion);
                  }}
                  className={`${
                    foldQuestions[index + numberOfQuestion] ? styles.FaqResponseFolded : ''
                  }`}
                  dangerouslySetInnerHTML={{ __html: question.response }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Faq;
