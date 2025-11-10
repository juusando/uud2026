import "../../styles/atom.scss";
import { useState } from 'react';
import Button from "./Button";
import Input from "./Input";

const CompactField = ({
  iconL,
  focusL,
  placeholder,
  className,
  buttonText,
  buttonIcon,
  buttonHoverIcon,
  onButtonClick,
  prefix,
  label
}) => {
  return (
    <div className="compact-field-hero">
      <div className="compact-input">
        <Input
          iconL={iconL}
          focusL={focusL}
          placeholder={placeholder}
          className={className}
          prefix={prefix}
          label={label}
        />
      </div>
      <div className="compact-button">
        <Button 
          iconR={buttonIcon}
          hoverR={buttonHoverIcon}

          onClick={onButtonClick}
        >
          {buttonText && <span>{buttonText}</span>}
        </Button>
      </div>
    </div>
  );
};

export default CompactField;