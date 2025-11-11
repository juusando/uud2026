import "../styles/atom.scss";
import "../styles/auth.scss";
import React, { useEffect, useState } from "react";
import Button from "../ui/atom/Button";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../services/pocketbase";

const Home = () => {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(isAuthenticated());
  }, []);
  return (
    <div className="main_box">
      <div className="auth-form">
        <div className="profile-field">
          <span>Welcome to UUD</span>
        </div>
        {!authed && (
          <div className="button-box">
            <Button
              onClick={() => navigate('/login')}
              type="button"
              iconL="login"
              className="nav-btn"
            />
            <Button
              onClick={() => navigate('/signup')}
              type="button"
              iconL="signup"
              className="nav-btn"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;