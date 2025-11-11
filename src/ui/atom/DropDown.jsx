import "../../styles/atom.scss";
import SvgIcn from "../../data/IconCompo";
import { useState, useEffect, useRef, Children } from 'react';

const DropdownInput = ({
  label,
  iconL,
  iconR,
  iconRDelete,
  iconRDeleteFocus,
  focusL,
  focusR,
  focusRHover,
  placeholder,
  className = '',
  onSelect,
  children,
  value = "",
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [isHoveringRightIcon, setIsHoveringRightIcon] = useState(false);
  const [isHoveringLeftIcon, setIsHoveringLeftIcon] = useState(false);
  const [hasMatch, setHasMatch] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef(null);

  const options = Children.toArray(children).map(child => child.props.children);

  // Update inputValue when value prop changes
  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    const filtered = options.filter(option =>
      option.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredOptions(filtered);
    setHasMatch(value === "" || filtered.length > 0);
  };

  const handleOptionClick = (option) => {
    setInputValue(option);
    setFilteredOptions([]);
    onSelect?.(option);
    setIsFocused(false);
  };

  const handleClearInput = () => {
    setInputValue("");
    setFilteredOptions(options);
    // Propagate clear to parent so it can save empty value
    onSelect?.("");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.input-icon-box')) {
        setFilteredOptions([]);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
    setFilteredOptions(options);
  };

  useEffect(() => {
    if (dropdownRef.current && inputValue) {
      const selectedOption = Array.from(dropdownRef.current.children).find(
        (child) => child.textContent === inputValue
      );
      if (selectedOption) {
        selectedOption.scrollIntoView({ block: 'center', inline: 'nearest' });
      }
    }
  }, [isFocused]);

  return (
    <div className={`input-container ${className}`}>
      {label && <div className="input-label">{label}</div>}
      <div className={`input-icon-box ${isFocused ? 'focused' : ''}`}>
      <span 
        className="icon left-icon"
        onMouseEnter={() => setIsHoveringLeftIcon(true)}
        onMouseLeave={() => setIsHoveringLeftIcon(false)}
      >
        <SvgIcn Name={isFocused ? focusL : iconL} />
      </span>
      <input
        type="text"
        className={`input ${!hasMatch ? 'no-match' : ''}`}
        placeholder={placeholder}
        value={inputValue}
        onFocus={handleFocus}
        onBlur={() => setIsFocused(false)}
        onChange={handleInputChange}
        onKeyDown={(e) => {
          if (isFocused && filteredOptions.length > 0) {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setSelectedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
            } else if (e.key === 'Enter' && selectedIndex >= 0) {
              e.preventDefault();
              handleOptionClick(filteredOptions[selectedIndex]);
            }
          }
        }}
      />
      <span 
        className="icon right-icon" 
        onClick={handleClearInput}
        onMouseEnter={() => setIsHoveringRightIcon(true)}
        onMouseLeave={() => setIsHoveringRightIcon(false)}
      >
        {inputValue && iconRDelete ? (
          <SvgIcn Name={isHoveringRightIcon ? iconRDeleteFocus : iconRDelete} />
        ) : (
          <SvgIcn Name={isFocused 
            ? (isHoveringRightIcon && focusRHover ? focusRHover : focusR) 
            : iconR} />
        )}
      </span>

      {isFocused && filteredOptions.length > 0 && (
        <ul className="dropdown" ref={dropdownRef}>
          {filteredOptions.map((option, index) => (
            <li
              key={index}
              className={`dropdown-option ${index === selectedIndex ? 'selected' : ''} ${option === inputValue ? 'selected-option' : ''}`}
              onMouseDown={() => handleOptionClick(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
      </div>
    </div>
  );
};

export default DropdownInput;
