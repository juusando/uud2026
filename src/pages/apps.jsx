import "../styles/atom.scss";
import "../styles/auth.scss";
import React from "react";
import Header from "../ui/compo/Header.jsx";

const Apps = () => {
  return (
    <div className="page page--apps">
      <Header />
      <div className="main_box">
        <div className="auth-form">
          <div className="profile-field">
            <span>Apps</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Apps;
