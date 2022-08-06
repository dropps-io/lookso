import React, { FC } from 'react';
import styles from './Home.module.scss';
import Navbar from "../../components/Navbar/Navbar";

interface HomeProps {}

const Home: FC<HomeProps> = () => (
  <div className={styles.Home} data-testid="Home">
    <Navbar></Navbar>
  </div>
);

export default Home;
