import React from "react";
import "./Error.css";

const Error = ({ message }) => {
  return (
    <div style={{ textAlign: "center", padding: "50px", color: "#e74c3c" }}>
      <div style={{ fontSize: "40px", marginBottom: "10px" }}>⚠️</div>
      <h3>Sorry!</h3>
      <p>{message}</p>
      <button 
        onClick={() => window.location.reload()}
        className="retry-btn"
      >
        Try Again
      </button>
    </div>
  );
};

export default Error;