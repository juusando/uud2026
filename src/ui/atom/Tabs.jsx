import React from 'react';
import "../../styles/atom.scss"; 
import SvgIcn from "../../data/IconCompo"; 

const TabCheck = ({ tabs, selectedTab: externalSelectedTab, onTabChange }) => {
  const selectedValue = externalSelectedTab || (tabs && tabs.length > 0 ? tabs[0].value : null);

  const handleTabClick = (value) => {
    if (onTabChange) {
      onTabChange(value);
    }
  };

  return (
    <div className="tab-container">
      {tabs.map((tab) => (
        <div
          key={tab.value}
          className={`tab ${selectedValue === tab.value ? 'selected' : ''}`} 
          onClick={() => handleTabClick(tab.value)} 
        >
          {tab.icon && (
            <SvgIcn Name={tab.icon} /> 
          )}
          {tab.name && (
            <span className="tab-name">{tab.name}</span> 
          )}
        </div>
      ))}
    </div>
  );
};

export default TabCheck;
