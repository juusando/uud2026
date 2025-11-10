import React, { useState } from 'react'; // Import React and useState
import "../../styles/atom.scss"; // Adjust the path as needed
import SvgIcn from '../../data/IconCompo'; // Import the SvgIcn component to render icons

const CheckboxInput = ({ 
  label, 
  className = '', 
  iconChecked, 
  iconUnchecked, 
  children 
}) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(prev => !prev); // Toggle the checkbox state
  };

  return (
    <label className={`checkbox-icon-box ${className}`} onClick={handleCheckboxChange}>
      <span className={`custom-checkbox ${isChecked ? 'checked' : ''}`}>
        {/* Render custom icon based on checked state, use iconChecked as fallback when iconUnchecked is not provided */}
        {isChecked ? <SvgIcn Name={iconChecked} /> : <SvgIcn Name={iconUnchecked || iconChecked} />}
      </span>
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleCheckboxChange}
        className="checkbox-input"
        style={{ display: 'none' }} // Hide the default checkbox
      />
      {label}
      {children} {/* Render additional children */}
    </label>
  );
};

export default CheckboxInput;
