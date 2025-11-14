import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../ui/atom/Button";
import pb, { getCurrentUser, isAuthenticated, getAvatarBlob, logoutUser } from "../../services/pocketbase";
import "../../styles/compo.scss";
import SvgIcn from "../../data/IconCompo";

const Header = () => {
  const [user, setUser] = useState(getCurrentUser());
  const [avatarUrl, setAvatarUrl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setUser(getCurrentUser());
    // React to auth changes (login/logout, profile update)
    const unsub = pb.authStore.onChange(() => {
      setUser(getCurrentUser());
    });
    return () => {
      // onChange returns nothing in some versions; guard
      if (typeof unsub === "function") unsub();
    };
  }, []);

  useEffect(() => {
    const loadAvatar = async () => {
      if (user && (user.avatar || user.photo)) {
        const fileName = user.avatar || user.photo;
        const url = await getAvatarBlob(user, fileName);
        setAvatarUrl(url);
      } else {
        setAvatarUrl(null);
      }
    };
    loadAvatar();
  }, [user]);

  const loggedIn = isAuthenticated();
  const location = useLocation();
  const isActive = (p) => location.pathname.startsWith(p);

  return (
    <header className="uud-header">
  
        <Button className="left-header" hoverL="uud_line" to="/">
          <SvgIcn Name={"logo01"} className="logomark"/>
          <SvgIcn Name={"logotype_en"} className="logotype"/>
        </Button>
      
      <nav className="center-header">
        <Button className={`nav-btn ${isActive('/tools') ? 'active' : ''}`} iconL="tool" to="/tools">Tools</Button>
        <Button className={`nav-btn ${isActive('/resos') ? 'active' : ''}`} iconL="resos" to="/resos">Resos</Button>
        <Button className={`nav-btn ${isActive('/ideaz') ? 'active' : ''}`} iconL="idea" to="/ideaz">Ideaz</Button>
        <Button className={`nav-btn ${isActive('/apps') ? 'active' : ''}`} iconL="apps" to="/apps">Apps</Button>
        <Button className={`nav-btn ${isActive('/talx') ? 'active' : ''}`} iconL="talx" to="/talx">Talx</Button>
      </nav>
      <div className="right-header">
        {loggedIn ? (
          <>
            {avatarUrl ? (
              <div type="button" className="avatar-btn" onClick={() => { if (user?.username) navigate(`/${user.username}`); }}>
                <img className="avatar" src={avatarUrl} alt="User" />
              </div>
            ) : (
              <Button className="nav-btn" iconL="user_circle" onClick={() => { if (user?.username) navigate(`/${user.username}`); }} />
            )}
          </>
        ) : (
          <div className="auth-actions">
            <Button  className="" iconL="login" to="/login"><span>Access</span></Button>
            {/* <Button className="signup" iconL="signup" to="/signup"><span>Signup</span></Button> */}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
