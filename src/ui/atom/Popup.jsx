import React, { useState, useEffect } from 'react';
import '../../styles/atom.scss';
import SvgIcn from '../../data/IconCompo';

const Popup = ({ title, text, iconName, isOpen, onClose, children, className }) => {
  const [visible, setVisible] = useState(isOpen);

  useEffect(() => {
    setVisible(isOpen);
    
    // Prevent scrolling when popup is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) {
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <div className={`popup-overlay ${className || ''}`}>
      <div className="popup-container">
        <div className="popup-close" onClick={handleClose}>
            <SvgIcn Name="close" />
          </div>
        <div className="popup-header">
          {iconName && (
            
              <SvgIcn Name={iconName} className="popup-illus"/>
            
          )}
          {title && <div className="popup-title">{title}</div>}

        </div>
        {text && <div className="popup-text">{text}</div>}
        {children && <div className="popup-children-box">{children}</div>}
      </div>
    </div>
  );
};

export const PopupController = ({ 
  trigger, 
  title, 
  text, 
  iconName, 
  children,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const openPopup = () => setIsOpen(true);
  const closePopup = () => setIsOpen(false);

  return (
    <>
      {React.cloneElement(trigger, { onClick: openPopup })}
      <Popup
        isOpen={isOpen}
        onClose={closePopup}
        title={title}
        text={text}
        iconName={iconName}
        className={className}
      >
        {children}
      </Popup>
    </>
  );
};

export default Popup;