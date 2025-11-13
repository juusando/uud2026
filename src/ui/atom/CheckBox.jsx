import React, { useState } from 'react';
import "../../styles/atom.scss";
import SvgIcn from '../../data/IconCompo';

const CheckboxInput = ({
  label,
  className = '',
  iconChecked,
  iconUnchecked,
  children,
  checked,
  onChange,
  hideInnerIcon = false,
  rightIcon,
  rightIconClass,
}) => {
  const [uncontrolledChecked, setUncontrolledChecked] = useState(false);
  const isControlled = typeof checked === 'boolean';
  const actualChecked = isControlled ? checked : uncontrolledChecked;

  const handleCheckboxChange = () => {
    if (isControlled) {
      onChange?.(!checked);
    } else {
      setUncontrolledChecked(prev => {
        const next = !prev;
        onChange?.(next);
        return next;
      });
    }
  };

  return (
    <label className={`checkbox-icon-box ${className}`} onClick={handleCheckboxChange}>
      <span className={`custom-checkbox ${actualChecked ? 'checked' : ''}`}>
        {!hideInnerIcon && actualChecked && (
          <SvgIcn Name={iconChecked} />
        )}
      </span>
      <input
        type="checkbox"
        checked={actualChecked}
        onChange={handleCheckboxChange}
        className="checkbox-input"
        style={{ display: 'none' }}
      />
      {label}
      {children}
      {rightIcon && (
        <span className={`checkbox-right-icon ${rightIconClass || ''}`}>
          <SvgIcn Name={rightIcon} />
        </span>
      )}
    </label>
  );
};

export default CheckboxInput;
