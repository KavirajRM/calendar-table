import React, { useState, useEffect } from "react";
import "./style.css"; // Add necessary styling for the toast

const Toast = ({ message, type = "success", duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose(); // Notify parent to clear the message
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    visible && (
      <div className={`toast ${type}`}>
        <span>{message}</span>
      </div>
    )
  );
};

export default Toast;
