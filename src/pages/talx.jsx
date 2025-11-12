import "../styles/atom.scss";
import "../styles/auth.scss";
import React from "react";
import Header from "../ui/compo/Header.jsx";

const Talx = () => {
  return (
    <>
      <Header />
      <div className="main_box">
        <div className="auth-form">
          <div className="profile-field">
            <span>Talx</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Talx;
