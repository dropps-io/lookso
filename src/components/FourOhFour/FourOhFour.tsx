import React, { type FC } from 'react';
import Link from 'next/link';

import styles from './FourOhFour.module.scss';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';

interface FourOhFourProps {}

const FourOhFour: FC<FourOhFourProps> = () => (
  <div className={styles.FourOhFour} data-testid="FourOhFour">
    <div className={styles.FourOhFourHeader}>
      <Navbar />
    </div>
    <div className={styles.FourOhFourContent}>
      <div>
        <h2>404</h2>
        <p>Sorry, this page does not exist 🤷</p>
        <Link href={'/'}>
          <button className={`btn btn-main`}>Go to home</button>
        </Link>
      </div>
    </div>
    <div className={styles.FourOhFourFooter}>
      <Footer />
    </div>
  </div>
);

export default FourOhFour;
