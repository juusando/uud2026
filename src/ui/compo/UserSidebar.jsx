import React from "react";
import CountryFlag from "../../data/IconCountry";
import SvgIcn from "../../data/IconCompo.js";
import Button from "../atom/Button";

const UserSidebar = ({ user, avatarUrl, countryIso, favCount, isOwner, onSettingsClick, onLogoutClick }) => {
  return (
    <div className="user-card">
      <div className="sidebar">
        <div className="profile-field">
          <div>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="User Profile"
                className="profile-avatar"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className="profile-avatar-fallback"
              style={{ display: avatarUrl ? "none" : "flex" }}
            >
              No Photo
              <br />
              Uploaded
            </div>
          </div>
        </div>

        <div className="profile-field">
          <span>{user.name || "Not provided"}</span>
        </div>

        <div className="profile-field">
          <span className="role">{user.role || "Not provided"}</span>
        </div>

        <div className="profile-field">
          <div className="country-box">
            {countryIso && (
              <CountryFlag
                Name={countryIso.toLowerCase()}
                className="country"
              />
            )}
            {(user.country || "Not provided").slice(0, 16)}
          </div>
        </div>

        <div className="profile-field">
          <span className="word">{user.word || "Not provided"}</span>
        </div>

        <div className="profile-field username">
          <span>@{user.username}</span>
        </div>

        <div className="favs-box">
          <SvgIcn Name={"fav"} />
          Favs <span>{favCount}</span>
        </div>

        {isOwner && (
          <div className="button-box">
            <Button
              onClick={onSettingsClick}
              type="button"
              iconL="setting"
              className="setting-btn"
            >
              Setting
            </Button>

            <Button
              onClick={onLogoutClick}
              type="button"
              iconL="logout"
              className="setting-btn"
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSidebar;