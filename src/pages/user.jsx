import "../styles/atom.scss";
import "../styles/auth.scss";
import "../styles/cards.scss";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import CountryFlag from "../data/IconCountry";
import countriesData from "../data/countries.json";
import pb, { getAvatarBlob, logoutUser, getUserFavorites, addUserFavorite, removeUserFavorite } from "../services/pocketbase";
import Button from "../ui/atom/Button";
import { useNavigate } from "react-router-dom";
import Header from "../ui/compo/Header.jsx";
import UserSidebar from "../ui/compo/UserSidebar.jsx";
import CardsGrid from "../ui/compo/CardsGrid.jsx";
import SvgIcn from "../data/IconCompo.js";

const PublicUser = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [status, setStatus] = useState("");
  const [favSet, setFavSet] = useState(new Set());
  const [favItems, setFavItems] = useState([]);
  const [error, setError] = useState("");

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

  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return [];
    const headers = parseCSVLine(lines[0]);
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      if (!cols || cols.length === 0) continue;
      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = cols[j] ?? "";
      }
      rows.push(obj);
    }
    return rows;
  };

  const parseCSVLine = (line) => {
    const result = [];
    let current = "";
    let inQuotes = false;
    let quoteChar = null;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (!inQuotes && (ch === '"' || ch === '`')) { inQuotes = true; quoteChar = ch; continue; }
      if (inQuotes && ch === quoteChar) {
        const next = line[i + 1];
        if (next === quoteChar) { current += quoteChar; i++; } else { inQuotes = false; quoteChar = null; }
        continue;
      }
      if (!inQuotes && ch === ",") { result.push(current.trim()); current = ""; } else { current += ch; }
    }
    result.push(current.trim());
    return result;
  };

  const getKey = (it) => it.link || it.name || it.img;

  useEffect(() => {
    const loadFavs = async () => {
      try {
        const targetFavs = await getUserFavorites(undefined, user.id);
        const targetKeys = new Set(targetFavs.map((f) => f.itemKey));
        const pageSet = new Set(targetFavs.map((f) => f.page).filter(Boolean));
        const pages = pageSet.size > 0 ? Array.from(pageSet) : ["tools", "resos", "ideaz"];
        const pageToCsv = { tools: "/tools.csv", resos: "/resos.csv", ideaz: "/Ideaz.csv" };
        const allItems = [];
        for (const p of pages) {
          const path = pageToCsv[p];
          if (!path) continue;
          const res = await fetch(path);
          const txt = await res.text();
          const rows = parseCSV(txt);
          const mapped = rows.map((r) => ({
            img: r.img || "",
            name: r.name || "",
            link: r.link || "",
            engDescription: r.engDescription || r.description || "",
            tags: r.tags || "",
            filterTag: r.filterTag || "",
            platform: r.platform || "",
            price: r.price || "",
            _page: p,
          }));
          allItems.push(...mapped);
        }
        const favOnly = allItems.filter((it) => targetKeys.has(getKey(it)));
        setFavItems(favOnly);

        const myFavs = await getUserFavorites();
        const myKeys = new Set(myFavs.map((f) => f.itemKey));
        setFavSet(myKeys);
      } catch (_) {
        setError("Failed to load favorites");
      }
    };
    if (user) loadFavs();
  }, [user]);

  const toggleFav = async ({ itemKey, item, isFav }) => {
    const key = itemKey || getKey(item);
    const isMe = pb.authStore?.model && user && (pb.authStore.model.id === user.id);
    setFavSet((prev) => {
      const next = new Set(prev);
      if (isFav) next.delete(key); else next.add(key);
      return next;
    });
    const page = item?._page;
    if (isFav) {
      await removeUserFavorite(key, page);
      if (isMe) {
        setFavItems((list) => list.filter((it) => getKey(it) !== key));
      }
    } else {
      await addUserFavorite({ itemKey: key, page });
    }
  };

  const favByPage = useMemo(() => {
    const map = { tools: [], resos: [], ideaz: [], other: [] };
    favItems.forEach((it) => {
      const p = it._page || "other";
      if (!map[p]) map[p] = [];
      map[p].push(it);
    });
    return map;
  }, [favItems]);

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

      <div className="layout-hero">

        <UserSidebar
          user={user}
          avatarUrl={avatarUrl}
          countryIso={countryIso}
          favCount={favItems.length}
          isOwner={pb.authStore?.model && pb.authStore.model.id === user.id}
          onSettingsClick={() => navigate(`/setting`)}
          onLogoutClick={() => { logoutUser(); navigate('/'); }}
        />

        {/* - - - - - - - - - - - - - - - - - - - - - - - - */}

        <div className="content-box" style={{ width: "100%" }}>
          {(["tools", "resos", "ideaz"]).map((p) => (
            favByPage[p].length > 0 ? (
              <div key={p} className={`fav-section fav-${p}`}>
                <div className="section-head">
                  <div className="section-title">{p.toUpperCase()}</div>
                  <span className="total">{favByPage[p].length}</span>
                </div>
                <CardsGrid
                  items={favByPage[p]}
                  error={error}
                  totalCount={favByPage[p].length}
                  favoritesSet={favSet}
                  onToggleFav={toggleFav}
                  getKey={getKey}
                />
              </div>
            ) : null
          ))}
        </div>

      </div>
    </>
  );
};

export default PublicUser;






