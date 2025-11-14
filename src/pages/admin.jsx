import "../styles/atom.scss";
import "../styles/auth.scss";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../ui/compo/Header.jsx";
import Popup from "../ui/atom/Popup";
import UserSidebar from "../ui/compo/UserSidebar.jsx";
import CountryFlag from "../data/IconCountry";
import countriesData from "../data/countries.json";
import SvgIcn from "../data/IconCompo.js";
import pb, { getCurrentUser, isAuthenticated, getAvatarBlob, logoutUser } from "../services/pocketbase";

const AdminPage = () => {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [users, setUsers] = useState([]);
  const [favCounts, setFavCounts] = useState({});
  const [avatars, setAvatars] = useState({});
  const [popupUser, setPopupUser] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [dragCol, setDragCol] = useState(null);
  const [columns, setColumns] = useState(["flag", "username", "name", "role", "totalFavs", "view"]);

  useEffect(() => {
    const u = getCurrentUser();
    if (!isAuthenticated() || !u || String(u.email || "") !== "hafid@juusando.com") {
      navigate("/");
      return;
    }
    setAuthorized(true);
  }, [navigate]);

  useEffect(() => {
    if (!authorized) return;
    const load = async () => {
      const list = await pb.collection("users").getFullList({ sort: "name" });
      setUsers(list);
      const favs = await pb.collection("favs").getFullList({});
      const map = {};
      favs.forEach((f) => {
        const uid = f.user;
        map[uid] = (map[uid] || 0) + 1;
      });
      setFavCounts(map);
      const avatarPairs = await Promise.all(
        list.map(async (u) => {
          const fileName = u.avatar || u.photo;
          if (!fileName) return [u.id, null];
          const url = await getAvatarBlob(u, fileName);
          return [u.id, url];
        })
      );
      const av = {};
      avatarPairs.forEach(([id, url]) => { av[id] = url; });
      setAvatars(av);
    };
    load();
  }, [authorized]);

  const countryIsoFor = (country) => {
    if (!country) return null;
    const match = countriesData.find((c) => c.label === country);
    return match && match.iso2 ? match.iso2.toLowerCase() : null;
  };

  const openPopup = (u) => {
    setPopupUser(u);
    setPopupOpen(true);
  };

  const closePopup = () => {
    setPopupOpen(false);
    setPopupUser(null);
  };

  const headers = useMemo(() => {
    const arr = ["photo", ...columns];
    return arr;
  }, [columns]);

  const onDragStart = (key) => {
    setDragCol(key);
  };

  const onDrop = (target) => {
    if (!dragCol || dragCol === target) return;
    if (target === "photo" || dragCol === "photo") return;
    const idxFrom = columns.indexOf(dragCol);
    const idxTo = columns.indexOf(target);
    if (idxFrom < 0 || idxTo < 0) return;
    const next = columns.slice();
    next.splice(idxFrom, 1);
    next.splice(idxTo, 0, dragCol);
    setColumns(next);
    setDragCol(null);
  };

  if (!authorized) return null;

  return (
    <>
      <Header />
      <div className="main_box">
        <div className="content-box" style={{ width: "100%" }}>
          <div className="profile-field">
            {/* <span>Admin</span> */}
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="uud-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {headers.map((h) => (
                    <th
                      key={h}
                      draggable={h !== "photo"}
                      onDragStart={() => onDragStart(h)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => onDrop(h)}
                      style={{ textTransform: "capitalize", padding: "8px" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const iso = countryIsoFor(u.country);
                  const total = favCounts[u.id] || 0;
                  const row = {
                    flag: (
                      iso ? <CountryFlag Name={iso} className="country" /> : null
                    ),
                    photo: (
                      avatars[u.id] ? (
                        <img src={avatars[u.id]} alt="avatar" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                      ) : (
                        <div className="profile-avatar-fallback" style={{ width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>
                          No Photo
                        </div>
                      )
                    ),
                    username: <a href={`/${u.username}`}>@{u.username}</a>,
                    name: <span>{u.name || ""}</span>,
                    role: <span>{u.role || ""}</span>,
                    totalFavs: <span>{total}</span>,
                    view: (
                      <span onClick={() => openPopup(u)} style={{ cursor: "pointer" }}>
                        <SvgIcn Name="user_circle" />
                      </span>
                    ),
                  };
                  const order = ["photo", ...columns];
                  return (
                    <tr key={u.id}>
                      {order.map((k) => (
                        <td key={k} style={{ padding: "8px", borderTop: "1px solid #eee" }}>{row[k]}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Popup isOpen={popupOpen} onClose={closePopup}  >
        {popupUser && (
          <UserSidebar
            user={popupUser}
            avatarUrl={avatars[popupUser.id] || null}
            countryIso={countryIsoFor(popupUser.country)}
            favCount={favCounts[popupUser.id] || 0}
            isOwner={pb.authStore?.model && pb.authStore.model.id === popupUser.id}
            onSettingsClick={() => navigate("/setting")}
            onLogoutClick={() => { logoutUser(); navigate("/"); }}
          />
        )}
      </Popup>
    </>
  );
};

export default AdminPage;