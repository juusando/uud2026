import "../../styles/atom.scss";
import SvgIcn from "../../data/IconCompo";
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Button = ({ iconL, iconR, hoverL, hoverR, children, className, to, onClick, type, disabled }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick(e);
    }
  };

  if (type) {
    return (
      <button
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
      </button>
    );
  }

  if (to) {
    return (
      <Link
        to={to}
        className={`button ${className || ''} ${disabled ? 'disabled' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {iconL && <SvgIcn Name={isHovered && hoverL ? hoverL : iconL} className="svg-icon" />}
        {children}
        {iconR && <SvgIcn Name={isHovered && hoverR ? hoverR : iconR} className="svg-icon" />}
      </Link>
    );
  }

  return (
    <a
      href="#"
      className={`button ${className || ''} ${disabled ? 'disabled' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {iconL && <SvgIcn Name={isHovered && hoverL ? hoverL : iconL} className="svg-icon" />}
      {children}
      {iconR && <SvgIcn Name={isHovered && hoverR ? hoverR : iconR} className="svg-icon" />}
    </a>
  );
};

export default Button;
