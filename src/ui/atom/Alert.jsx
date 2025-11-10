import React, { useState, useEffect } from 'react';
import '../../styles/atom.scss';
import SvgIcn from '../../data/IconCompo';

// Alert types with their properties
const ALERT_TYPES = {
  success: {
    icon: 'ok',
    className: 'alert-success',
    defaultMessage: 'Operation completed signup successfully!'
  },
  error: {
    icon: 'horror',
    className: 'alert-error',
    defaultMessage: 'An error occurred. Please try again.'
  },
  warning: {
    icon: 'hand1',
    className: 'alert-warning',
    defaultMessage: 'Warning: Please check your input.'
  },
  info: {
    icon: 'name_card',
    className: 'alert-info',
    defaultMessage: 'Here is some information for you.'
  },
  loading: {
    icon: 'loading_ani',
    className: 'alert-loading',
    defaultMessage: 'Loading, please wait...'
  }
};

// Default duration in milliseconds
const DEFAULT_DURATION = 4000;

const Alert = ({ 
  message, 
  type = 'info', 
  isVisible = false, 
  onClose,
  duration = DEFAULT_DURATION
}) => {
  const [isShowing, setIsShowing] = useState(isVisible);
  const [isLeaving, setIsLeaving] = useState(false);
  
  useEffect(() => {
    if (isVisible) {
      setIsShowing(true);
      setIsLeaving(false);
      
      // Auto-hide after duration
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);
  
  const handleClose = () => {
    setIsLeaving(true);
    
    // Wait for animation to complete before fully closing
    setTimeout(() => {
      setIsShowing(false);
      if (onClose) onClose();
    }, 300); // Animation duration
  };
  
  if (!isShowing) return null;
  
  const alertType = ALERT_TYPES[type] || ALERT_TYPES.info;
  
  return (
    <div className={`alert-container ${isLeaving ? 'alert-leaving' : 'alert-entering'}`}>
      <div className={`alert ${alertType.className}`}>
        <div className="alert-icon">
          <SvgIcn Name={alertType.icon} />
        </div>
        <div className="alert-message">{message}</div>
        <button className="alert-close" onClick={handleClose}>
          <SvgIcn Name="close" />
        </button>
      </div>
    </div>
  );
};

// Alert Manager to handle multiple alerts
export const useAlertManager = (defaultMessages = {}) => {
  const [alerts, setAlerts] = useState([]);
  
  // Resolve default messages, allowing overrides via provider props
  const resolvedDefaultMessages = {
    success: defaultMessages.success ?? ALERT_TYPES.success.defaultMessage,
    error: defaultMessages.error ?? ALERT_TYPES.error.defaultMessage,
    warning: defaultMessages.warning ?? ALERT_TYPES.warning.defaultMessage,
    info: defaultMessages.info ?? ALERT_TYPES.info.defaultMessage,
    loading: defaultMessages.loading ?? ALERT_TYPES.loading.defaultMessage,
  };
  
  // Function to add a new alert
  const addAlert = (message, type = 'info', duration = DEFAULT_DURATION) => {
    const id = Date.now();
    // Use provided message if non-empty; else fall back to customizable defaults per type
    const hasCustomMessage =
      typeof message === 'string' ? message.trim().length > 0 : message != null;
    const alertMessage = hasCustomMessage
      ? message
      : resolvedDefaultMessages[type] ?? ALERT_TYPES.info.defaultMessage;
    
    setAlerts(prev => [...prev, { id, message: alertMessage, type, duration }]);
    
    // Auto-remove after duration + animation time
    setTimeout(() => {
      removeAlert(id);
    }, duration + 300);
    
    return id;
  };
  
  // Function to remove an alert - now clears all alerts
  const removeAlert = (id) => {
    // Clear all alerts instead of filtering
    setAlerts([]);
  };
  
  return {
    alerts,
    addAlert,
    removeAlert,
    success: (message, duration) => addAlert(message, 'success', duration),
    error: (message, duration) => addAlert(message, 'error', duration),
    warning: (message, duration) => addAlert(message, 'warning', duration),
    info: (message, duration) => addAlert(message, 'info', duration)
  };
};

// Create an AlertProvider component to use the hook
export const AlertProvider = ({ children, messages }) => {
  const alertManager = useAlertManager(messages || {});
  
  // Get only the most recent alert (if any)
  const latestAlert = alertManager.alerts.length > 0 
    ? alertManager.alerts[alertManager.alerts.length - 1] 
    : null;
  
  return (
    <AlertContext.Provider value={alertManager}>
      {children}
      {latestAlert && (
        <Alert
          key={latestAlert.id}
          message={latestAlert.message}
          type={latestAlert.type}
          isVisible={true}
          onClose={() => alertManager.removeAlert(latestAlert.id)}
          duration={latestAlert.duration}
        />
      )}
    </AlertContext.Provider>
  );
};

// Create a context to access the alert manager
export const AlertContext = React.createContext(null);

// Custom hook to use the alert manager
export const useAlert = () => {
  const context = React.useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export default Alert;