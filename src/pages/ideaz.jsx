import "../styles/atom.scss";
import "../styles/auth.scss";
import React from "react";
import Header from "../ui/compo/Header.jsx";

const Ideaz = () => {
  return (
    <>
      <Header />
      <div className="main_box">
        <div className="auth-form">
          <div className="profile-field">
            <span>Ideaz</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Ideaz;
