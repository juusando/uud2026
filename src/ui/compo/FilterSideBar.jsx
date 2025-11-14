import React, { useEffect, useMemo, useState } from "react";
import SvgIcn from "../../data/IconCompo";
import Input from "../atom/Input";
import CheckboxInput from "../atom/CheckBox";
import "../../styles/atom.scss";

const normalize = (s) => (s || "").toLowerCase();
const splitList = (s) => String(s || "").split(",").map((x) => x.trim()).filter(Boolean);
const platformAliases = (value) => {
  const v = normalize(value);
  if (v.includes("mac") || v.includes("apple") || v.includes("ios")) return ["mac", "apple", "ios"];
  if (v.includes("windows") || v.includes("win")) return ["windows", "win"];
  if (v.includes("browser") || v.includes("web")) return ["browser", "web"];
  if (v.includes("android")) return ["android"];
  if (v.includes("linux")) return ["linux"];
  return [v];
};

const extractValues = (children) => {
  const vals = [];
  React.Children.forEach(children, (child) => {
    if (typeof child === "string") {
      const t = child.trim();
      if (t) vals.push(t);
    } else if (child && child.props && child.props.children) {
      const c = child.props.children;
      if (typeof c === "string") {
        const t = c.trim();
        if (t) vals.push(t);
      } else if (Array.isArray(c)) {
        const txt = c.filter((x) => typeof x === "string").join("").trim();
        if (txt) vals.push(txt);
      }
    }
  });
  return vals;
};

const FilterSideBar = ({ items = [], onChange, className = "", showSearch = true, showTags = true, showPlatform = true, showPrice = true, showFavs = true, favoritesSet, title, logoIcon, logoSrc, children }) => {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("All");
  const [platforms, setPlatforms] = useState(new Set());
  const [prices, setPrices] = useState(new Set());
  const [resetTick, setResetTick] = useState(0);

  const total = items.length;

  const tagsFromChildren = useMemo(() => {
    const slot = React.Children.toArray(children).find((c) => c && c.type === FilterSideBar.Tags);
    return slot ? extractValues(slot.props.children) : null;
  }, [children]);

  const uniqueTags = useMemo(() => {
    let tags;
    if (tagsFromChildren && tagsFromChildren.length > 0) {
      tags = ["All", ...tagsFromChildren];
    } else {
      const set = new Set();
      items.forEach((it) => splitList(it.filterTag).forEach((t) => set.add(t)));
      tags = ["All", ...Array.from(set).sort()];
    }
    if (showFavs) tags.splice(1, 0, "Favs");
    return tags;
  }, [items, tagsFromChildren, showFavs]);

  const platformChildren = useMemo(() => {
    const slot = React.Children.toArray(children).find((c) => c && c.type === FilterSideBar.Platforms);
    return slot ? extractValues(slot.props.children) : null;
  }, [children]);

  const defaultPlatforms = ["Windows", "Apple", "Android", "Linux", "Browser"];
  const platformOptions = (platformChildren && platformChildren.length > 0 ? platformChildren : defaultPlatforms).map((value) => {
    const v = value.toLowerCase();
    const icon = v.includes("windows") ? "windows"
      : (v.includes("apple") || v.includes("mac") || v.includes("ios")) ? "apple"
      : v.includes("android") ? "android"
      : v.includes("linux") ? "linux"
      : "browser";
    return { value, icon };
  });

  const priceOptions = [
    { value: "Free", icon: "free", cls: "free" },
    { value: "Freemium", icon: "freemium", cls: "freemium" },
    { value: "Paid", icon: "paid", cls: "paid" },
  ];

  const filtered = useMemo(() => {
    const q = normalize(query);
    const plat = Array.from(platforms);
    const pr = Array.from(prices);
    return items.filter((it) => {
      const name = normalize(it.name);
      const desc = normalize(it.engDescription || it.description);
      const tags = splitList(it.filterTag);
      const plats = splitList(it.platform);
      const price = normalize(it.price);

      const matchesQuery = q ? (name.includes(q) || desc.includes(q)) : true;
      const key = it.link || it.name || it.img;
      const isFav = favoritesSet && favoritesSet.has(key);
      const matchesTag = tag === "All" ? true : (tag === "Favs" ? isFav : tags.map(normalize).includes(normalize(tag)));
      const platsNorm = plats.map(normalize);
      const matchesPlatform = plat.length === 0 ? true : plat.some((p) => {
        const aliases = platformAliases(p);
        return aliases.some((a) => platsNorm.includes(a));
      });
      const matchesPrice = pr.length === 0 ? true : pr.some((p) => price.includes(normalize(p)));
      return matchesQuery && matchesTag && matchesPlatform && matchesPrice;
    });
  }, [items, query, tag, platforms, prices, favoritesSet]);

  useEffect(() => { if (onChange) onChange(filtered); }, [filtered, onChange]);

  const toggleSet = (set, value) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value); else next.add(value);
    return next;
  };

  const resetAll = () => {
    setQuery("");
    setTag("All");
    setPlatforms(new Set());
    setPrices(new Set());
    setResetTick((n) => n + 1);
  };

  const showing = filtered.length;

  return (
    <div className={`filter-sidebar ${className}`}>
      {(title || logoIcon || logoSrc) && (
        <div className="filter-header">
          {logoSrc ? (
            <img src={logoSrc} alt="logo" className="filter-logo" />
          ) : logoIcon ? (
            <span className="filter-logo">
              <SvgIcn Name={logoIcon} />
            </span>
          ) : null}
          {title && <div className="filter-title">{title}</div>}
        </div>
      )}
      {showSearch && (
        <div className="filter-section">
          <div className="filter-row">
            <Input iconL="search" focusL="search" placeholder="Search tools" value={query} onChange={(e) => setQuery(e.target.value)} suffix={String(showing)} />
          </div>
        </div>
      )}

      {showTags && (
        <div className="filter-section">
          <div className="section-title">Tags</div>
          <div className="chips">
            {uniqueTags.map((t) => (
              <button key={t} className={`chip ${tag === t ? "selected" : ""}`} onClick={() => setTag(t)}>
                {(t === "All" || t === "Favs") && (
                  <span className="chip-left-icon">
                    <SvgIcn Name={t === "All" ? "dots_on" : "fav"} />
                  </span>
                )}
                <span>{t}</span>
                {t === "Favs" && favoritesSet && (
                  <span className="fav-count">{favoritesSet.size}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {showPlatform && (
        <div className="filter-section">
          <div className="section-title">Platform</div>
          <div className="chips-check">
            {platformOptions.map((opt) => (

              <CheckboxInput
                key={`${opt.value}-${resetTick}`}
                label={opt.value}
                iconChecked="ok"
                checked={platforms.has(opt.value)}
                onChange={() => setPlatforms((s) => toggleSet(s, opt.value))}
                rightIcon={opt.icon}
              />

            ))}
          </div>
        </div>
      )}

      {showPrice && (
        <div className="filter-section">
          <div className="section-title">Price</div>
          <div className="chips-check">
            {priceOptions.map((opt) => (
              <CheckboxInput
                key={`${opt.value}-${resetTick}`}
                label={opt.value}
                iconChecked="ok"
                checked={prices.has(opt.value)}
                onChange={() => setPrices((s) => toggleSet(s, opt.value))}
                rightIcon={opt.icon}
                rightIconClass={opt.cls}
              />
            ))}
          </div>
        </div>
      )}
{/* 
      <div className="filter-actions">
        <button className="chip reset" onClick={resetAll}>
          <SvgIcn Name="trash" />
          <span>Reset</span>
        </button>
      </div> */}
    </div>
  );
};

FilterSideBar.Tags = ({ children }) => null;
FilterSideBar.Platforms = ({ children }) => null;

export default FilterSideBar;