import React, { useState } from 'react';
import "../../styles/atom.scss"; // Ensure you have styles for the tags
import SvgIcn from "../../data/IconCompo"; // Assuming this is your icon component

const TagsRadio = ({ tabs }) => {
  const [selectedTag, setSelectedTag] = useState(null);

  const handleTagClick = (value) => {
    setSelectedTag(value); // Update the selected tag when clicked
  };

  return (
    <div className="tag-container">
      {tabs && tabs.map((tag) => (
        <div
          key={tag.value}
          className={`tag ${selectedTag === tag.value ? 'selected' : ''}`} // Apply 'selected' class if the tag is selected
          onClick={() => handleTagClick(tag.value)} 
        >
          {tag.icon && (
            
              <SvgIcn Name={tag.icon} /> 
            
          )}
          {tag.name && (
            <span className="tag-name">{tag.name}</span> 
          )}
        </div>
      ))}
    </div>
  );
};

export default TagsRadio;
