import "../styles/atom.scss";
import "../styles/auth.scss";
import "../styles/cards.scss";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "../ui/compo/Header.jsx";
import Card from "../ui/atom/Card.jsx";
import FilterSideBar from "../ui/compo/FilterSideBar.jsx";
import SvgIcn from "../data/IconCompo";

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

const Resos = () => {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [visibleCount, setVisibleCount] = useState(40);
  const [error, setError] = useState("");
  const sentinelRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/resos.csv");
        const txt = await res.text();
        const rows = parseCSV(txt);
        const mapped = rows.map((r) => ({
          img: r.img || "",
          name: r.name || "",
          link: r.link || "",
          engDescription: r.engDescription || "",
          tags: r.tags || "",
          filterTag: r.filterTag || "",
        }));
        setItems(mapped);
        setFiltered(mapped);
      } catch (_) {
        setError("Failed to load resources");
      }
    };
    load();
  }, []);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleCount((c) => Math.min(c + 60, filtered.length));
        }
      });
    }, { rootMargin: "600px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [filtered.length]);

  const visibleItems = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  return (
    <div className="page page--resos">
      <Header />
      <div className="tools-layout">
        <FilterSideBar items={items} onChange={setFiltered} title="RESOS" logoIcon="resos" showPlatform={false} showPrice={false} />

        <div className={`cards-grid ${!error && visibleItems.length === 0 ? 'empty' : ''}`}>
          {error && <div className="status status--error">{error}</div>}
          {(!error && visibleItems.length === 0) ? (
            <div className="empty-state">
              <div className="empty-icon"><SvgIcn Name="no_item" /></div>
            </div>
          ) : (
            visibleItems.map((it, idx) => (
              <Card key={idx} item={it} />
            ))
          )}
        </div>
        <div ref={sentinelRef} className="tools-sentinel" />
      </div>
    </div>
  );
};

export default Resos;
