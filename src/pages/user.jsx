import "../styles/atom.scss";
import "../styles/auth.scss";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import CountryFlag from "../data/IconCountry";
import countriesData from "../data/countries.json";
import pb, { getAvatarBlob, logoutUser } from "../services/pocketbase";
import Button from "../ui/atom/Button";
import { useNavigate } from "react-router-dom";
import Header from "../ui/compo/Header.jsx";

const PublicUser = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        setStatus("Loading profile...");
        const record = await pb
          .collection("users")
          .getFirstListItem(`username="${username}"`);
        setUser(record);
        setStatus("");

        const avatarField = record.avatar || record.photo;
        if (avatarField) {
          try {
            const url = await getAvatarBlob(record, avatarField);
            setAvatarUrl(url);
          } catch (_) {
            setAvatarUrl(null);
          }
        } else {
          setAvatarUrl(null);
        }
      } catch (err) {
        setStatus("User not found");
        setUser(null);
      }
    };
    if (username) loadUser();
  }, [username]);

  const countryIso = useMemo(() => {
    if (!user?.country) return null;
    const match = countriesData.find((c) => c.label === user.country);
    return match?.iso2 || null;
  }, [user?.country]);

  if (status && !user) {
    return <div className="main_box"><div className="auth-form">{status}</div></div>;
  }

  if (!user) return null;

  return (
    <>
      <Header />
      <div className="main_box">
      <div className="auth-form">
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
          <span>@{user.username}</span>
        </div>
        <div className="profile-field word">
          <span>{user.word || "Not provided"}</span>
        </div>
        <div className="profile-field">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {countryIso && (
              <CountryFlag
                Name={countryIso.toLowerCase()}
                style={{ width: 32, height: 32, borderRadius: "50%" }}
              />
            )}
            <span>{(user.country || "Not provided").slice(0, 16)}</span>
          </div>
        </div>
        <div className="profile-field">
          <span>{user.role || "Not provided"}</span>
        </div>

        <div className="button-box">
          <Button
            onClick={() => navigate(`/setting`)}
            type="button"
            iconL="setting"
            className="nav-btn"
          />
          <Button
            onClick={() => { logoutUser(); navigate('/'); }}
            type="button"
            iconL="logout"
            className="nav-btn"
          />
        </div>
      </div>
      </div>
    </>
  );
};

export default PublicUser;