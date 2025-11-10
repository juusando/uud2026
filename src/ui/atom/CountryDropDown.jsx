import "../../styles/atom.scss"; // Adjust this path if necessary
import { useState, useEffect, useRef } from 'react';
import countriesData from "../../data/countries.json"; // Adjust this path if necessary
import CountryFlag from "../../data/IconCountry"; // Import the CountryFlag component
import SvgIcn from "../../data/IconCompo";

const CountryDropDown = ({ 
  placeholder, 
  className = '', 
  onSelect,
  iconR = "drop_down",
  focusR = "drop_up",
  iconRDelete = "trash",
  iconRDeleteFocus = "trash_ani",
  value = ""
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isHoveringClearIcon, setIsHoveringClearIcon] = useState(false);
  const [hasMatch, setHasMatch] = useState(true);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const optionRefs = useRef([]); // Array of refs for each option

  const options = countriesData.map(country => ({
    label: country.label,
    iso2: country.iso2,
    value: country.value,
  }));

  // Initialize with value prop
  useEffect(() => {
    if (value) {
      // Find the country option that matches the value
      const matchedOption = options.find(option => 
        option.label === value || option.value === value
      );
      if (matchedOption) {
        setInputValue(matchedOption.label);
        setSelectedOption(matchedOption);
      }
    } else {
      setInputValue("");
      setSelectedOption(null);
    }
  }, [value]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // Filter options based on input
    const filtered = options.filter(option =>
      option.label.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredOptions(filtered);

    // Check if the input matches a selected option
    const matchedOption = options.find(option => option.label.toLowerCase() === value.toLowerCase());
    if (matchedOption) {
      setSelectedOption(matchedOption);
      setHasMatch(true);
    } else {
      setSelectedOption(null); // Clear selected option if input doesn't match any
      // Set hasMatch based on whether there are any filtered options or if input is empty
      setHasMatch(filtered.length > 0 || value === '');
    }
    setHighlightedIndex(-1); // Reset highlighted index
  };

  const handleOptionClick = (option) => {
    setInputValue(option.label);
    setSelectedOption(option);
    setFilteredOptions([]);
    onSelect?.(option);
  };

  const handleClearInput = () => {
    setInputValue("");
    setSelectedOption(null);
    setFilteredOptions(options);
    // Propagate clear to parent so it can save empty location
    onSelect?.("");
  };

  const handleFocus = () => {
    setIsFocused(true);
    setFilteredOptions(options);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown" && highlightedIndex < filteredOptions.length - 1) {
      setHighlightedIndex(prevIndex => {
        const newIndex = prevIndex + 1;
        scrollToHighlightedOption(newIndex);
        return newIndex;
      });
    } else if (e.key === "ArrowUp" && highlightedIndex > 0) {
      setHighlightedIndex(prevIndex => {
        const newIndex = prevIndex - 1;
        scrollToHighlightedOption(newIndex);
        return newIndex;
      });
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      handleOptionClick(filteredOptions[highlightedIndex]);
    }
  };

  const scrollToHighlightedOption = (index) => {
    if (optionRefs.current[index]) {
      optionRefs.current[index].scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!dropdownRef.current?.contains(event.target) && !inputRef.current?.contains(event.target)) {
        setFilteredOptions([]);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`input-icon-box ${isFocused ? 'focused' : ''} ${className}`}>
      <div className="input-container">
        {/* Show the default icon only if no flag is displayed */}
        {!selectedOption && <SvgIcn Name="canva" className="icon " />}

        {/* Show the flag if an option is selected and matches the input value */}
        {selectedOption && inputValue === selectedOption.label && (
          <CountryFlag Name={selectedOption.iso2.toLowerCase()} className="flag-icon-in-input" />
        )}

        <input
          type="text"
          className={`input ${isFocused ? 'focused-input' : ''} ${!hasMatch ? 'no-match' : ''}`}
          placeholder={placeholder}
          value={inputValue}
          onFocus={handleFocus}
          onBlur={() => {
            setIsFocused(false);
            // If the input value is empty, reset selected option
            if (!inputValue) setSelectedOption(null);
          }}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          ref={inputRef}
        />
        
        {/* Right icon - changes based on focus state and input value */}
        <span
          className="icon right-icon"
          onClick={inputValue ? handleClearInput : null}
          onMouseEnter={() => setIsHoveringClearIcon(true)}
          onMouseLeave={() => setIsHoveringClearIcon(false)}
        >
          {inputValue ? (
            <SvgIcn Name={isHoveringClearIcon ? iconRDeleteFocus : iconRDelete} />
          ) : (
            <SvgIcn Name={isFocused ? focusR : iconR} />
          )}
        </span>
      </div>

      {isFocused && filteredOptions.length > 0 && (
        <ul className="dropdown" ref={dropdownRef}>
          {filteredOptions.map((option, index) => (
            <li
              key={index}
              ref={el => optionRefs.current[index] = el} // Attach a ref to each option
              className={`dropdown-option ${index === highlightedIndex ? 'highlighted' : ''}`}
              onMouseDown={() => handleOptionClick(option)}
              style={{ color: index === highlightedIndex ? 'blue' : 'black' }}
            >
              <CountryFlag Name={option.iso2.toLowerCase()} />
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CountryDropDown;
