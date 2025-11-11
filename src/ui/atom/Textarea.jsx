import "../../styles/atom.scss";
import SvgIcn from "../../data/IconCompo";
import { useState } from 'react';

const TextArea = ({
  title,
  iconL = "icon05",
  placeholder,
  className,
  maxLength = 50,
  value,
  onChange,
  name
}) => {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (event) => {
    const { value } = event.target;
    if (value.length <= maxLength) {
      // Update internal state only if uncontrolled
      if (value === undefined || value === null || typeof value === 'string') {
        setText(value);
      }
      // Notify parent if onChange provided
      if (onChange) {
        onChange(event);
      }
    }
  };

  const currentText = typeof value === 'string' ? value : text;
  const remainingCharacters = maxLength - currentText.length;
  const counterClass = remainingCharacters === 0 ? 'char-counter red' : 'char-counter';

  return (
    <div className={`textarea-icon-box ${className}`}>
      <div className="input-top-box">
        <div className="left-side">
          {iconL && (
            <span className={`icon left-icon ${isFocused ? 'focused' : ''}`}>
              <SvgIcn Name={iconL} />
            </span>
          )}
          {title && <div className={`textarea-title ${isFocused ? 'focused' : ''}`}>{title}</div>}
        </div>
        <div className={counterClass}>
          {remainingCharacters}
        </div>
      </div>

      <textarea
        name={name}
        value={currentText}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="input"
        placeholder={placeholder}
        maxLength={maxLength}
      />
    </div>
  );
};

export default TextArea;
