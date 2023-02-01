import React, { FC } from 'react';

import styles from './TabSelector.module.scss';

interface TabSelectorProps {
  tabs: string[];
  selectedTab: string;
  onSelect?: (selectedTab: string) => any;
}

const TabSelector: FC<TabSelectorProps> = props => {
  const onSelect = (tab: string) => {
    if (props.onSelect) props.onSelect(tab);
  };

  return (
    <div className={styles.TabSelector}>
      {props.tabs.map((tab, index) =>
        tab === props.selectedTab ? (
          <h5 key={index}>{tab}</h5>
        ) : (
          <span onClick={() => onSelect(tab)} key={index}>
            {tab}
          </span>
        )
      )}
    </div>
  );
};

export default TabSelector;
