import React from "react";
import "./Loading.css";

const Loading = ({ message}) => {
  return (
    <div className="loading-wrapper">
      <div className="loader"></div>
      <p className="loading-text">{message}</p>
    </div>
  );
};

export default Loading;