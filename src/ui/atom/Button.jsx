import "../../styles/atom.scss";
import SvgIcn from "../../data/IconCompo";
import { useState } from 'react';

const Button = ({ iconL, iconR, hoverL, hoverR, children, className, to, onClick, type, disabled }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick(e);
    }
  };

  // Use button element if type is provided, otherwise use anchor
  const Element = type ? 'button' : 'a';
  
  return (
    <Element
      href={!type ? (to || '#') : undefined}
      type={type}
      disabled={disabled}
      className={`button ${className || ''} ${disabled ? 'disabled' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {iconL && <SvgIcn Name={isHovered && hoverL ? hoverL : iconL} className="svg-icon" />}
      {children}
      {iconR && <SvgIcn Name={isHovered && hoverR ? hoverR : iconR} className="svg-icon" />}
    </Element>
  );
};

export default Button;
