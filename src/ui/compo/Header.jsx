import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../ui/atom/Button";
import MenuDropdown from "../../ui/atom/MenuDropdown";
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

  return (
    <header className="uud-header">
  
        <Button className="left-header" hoverL="uud_line" to="/">
          <SvgIcn Name={"logo01"} className="logomark"/>
          <SvgIcn Name={"logotype_en"} className="logotype"/>
        </Button>
      
      <nav className="center-header">
        <Button className="nav-btn" iconL="tool" to="/tools"><span>Tools</span></Button>
        <Button className="nav-btn" iconL="resos" to="/resos"><span>Resos</span></Button>
        <Button className="nav-btn" iconL="idea" to="/ideaz"><span>Ideaz</span></Button>
        <Button className="nav-btn" iconL="apps" to="/apps"><span>Apps</span></Button>
        <Button className="nav-btn" iconL="talx" to="/talx"><span>Talx</span></Button>
      </nav>
      <div className="right-header">
        {loggedIn ? (
          <div className="user-area">
            <MenuDropdown
              trigger={avatarUrl ? (
                <img className="avatar" src={avatarUrl} alt="User" />
              ) : (
                <Button className="nav-btn" iconL="user_circle"/>
              )}
              onTriggerClick={() => { if (user?.username) navigate(`/${user.username}`); }}
              items={[
                { label: "My Card", iconR: "account", to: "/home" },
                { label: "Setting", iconR: "setting", to: "/home" },
                { label: "Logout", iconR: "logout", onClick: () => logoutUser() },
              ]}
            />
          </div>
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
