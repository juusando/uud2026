import "../../styles/atom.scss";
import SvgIcn from "../../data/IconCompo";
import { useState } from 'react';

const Input = ({
  iconL,
  iconR,
  focusL,
  focusR,
  placeholder, 
  className,
  label,
  prefix,
  children,
  id,
  name,
  value,
  onChange,
  type = "text",
  counter
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const toggleFocus = (state) => setIsFocused(state);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // Handle onChange with character limit enforcement
  const handleChange = (e) => {
    if (counter && e.target.value.length > counter) {
      return; // Prevent typing beyond the limit
    }
    if (onChange) {
      onChange(e);
    }
  };

  // Determine the actual input type
  const inputType = type === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`input-container ${className || ''}`}>
      {label && <div className="input-label">{label}</div>}
      <div className={`input-icon-box ${isFocused ? 'focused' : ''} ${className && className.includes('error') ? 'error' : ''}`}>
        {iconL && (
          <span className="icon left-icon">
            <SvgIcn Name={isFocused && focusL ? focusL : iconL} />
          </span>
        )}
        <div className="input-wrapper">
          {prefix && <span className="input-prefix">{prefix}</span>}
          <input
            type={inputType}
            id={id}
            name={name}
            value={value}
            onChange={handleChange}
            onFocus={() => toggleFocus(true)}
            onBlur={() => toggleFocus(false)}
            className="input"
            placeholder={placeholder} 
          />
        </div>
        {iconR && (
          <span className="icon right-icon">
            <SvgIcn Name={isFocused && focusR ? focusR : iconR} />
          </span>
        )}
        {counter && (
          <span className="char-counter" >
            {counter - (value ? value.length : 0)}
          </span>
        )}
        {type === "password" && (
          <span 
            className="icon right-icon password-toggle" 
            onClick={togglePasswordVisibility}
            style={{ cursor: 'pointer' }}
          >
            <SvgIcn Name={showPassword ? "eye_on" : "eye_off"} />
          </span>
        )}
      </div>
      {isFocused && children && (
        <div className="input-children">
          {children}
        </div>
      )}
    </div>
  );
};

export default Input;
