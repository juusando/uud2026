import React, { useState } from 'react';
import "../../styles/atom.scss"; 
import SvgIcn from "../../data/IconCompo"; 

const TagCheck = ({ tags }) => {
  const [selectedTags, setSelectedTags] = useState([]);

  const handleTagClick = (value) => {
    setSelectedTags((prevSelected) => 
      prevSelected.includes(value) 
        ? prevSelected.filter((tag) => tag !== value) 
        : [...prevSelected, value]
    );
  };

  return (
    <div className="tag-container">
      {tags.map((tag) => (
        <div
          key={tag.value}
          className={`tag ${selectedTags.includes(tag.value) ? 'selected' : ''}`} 
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

export default TagCheck;
