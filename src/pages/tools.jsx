import "../styles/atom.scss";
import "../styles/auth.scss";
import "../styles/cards.scss";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "../ui/compo/Header.jsx";
import CardsGrid from "../ui/compo/CardsGrid.jsx";
import FilterSideBar from "../ui/compo/FilterSideBar.jsx";

const parseCSV = (text) => {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);
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
    if (!inQuotes && (ch === '"' || ch === '`')) {
      inQuotes = true;
      quoteChar = ch;
      continue;
    }
    if (inQuotes && ch === quoteChar) {
      const next = line[i + 1];
      if (next === quoteChar) {
        current += quoteChar;
        i++;
      } else {
        inQuotes = false;
        quoteChar = null;
      }
      continue;
    }
    if (!inQuotes && ch === ",") {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
};

const Tools = () => {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [visibleCount, setVisibleCount] = useState(40);
  const [error, setError] = useState("");
  const sentinelRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/tools.csv");
        const txt = await res.text();
        const rows = parseCSV(txt);
        const mapped = rows.map((r) => ({
          img: r.img || "",
          name: r.name || "",
          link: r.link || "",
          engDescription: r.engDescription || "",
          tags: r.tags || "",
          filterTag: r.filterTag || "",
          platform: r.platform || "",
          price: r.price || "",
        }));
        setItems(mapped);
        setFiltered(mapped);
      } catch (e) {
        setError("Failed to load tools");
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

  useEffect(() => {
    const onScroll = () => {
      const nearBottom = window.innerHeight + window.scrollY >= (document.body.offsetHeight - 200);
      if (nearBottom) {
        setVisibleCount((c) => Math.min(c + 60, filtered.length));
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [filtered.length]);

  const visibleItems = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);


  return (
    <div className="page tools-page page--tools">
      <Header />
      <div className="layout-hero">
        {/* <FilterSideBar items={items} onChange={(list) => { setFiltered(list); setVisibleCount(Math.min(40, list.length)); }} /> */}

        <FilterSideBar items={items} onChange={setFiltered} title="TOOLS" logoIcon="tool">
          <FilterSideBar.Tags>
                <span>UX Design</span>
                <span>UI Design</span>
                <span>Image</span>
                <span>Color</span>
                <span>Icon</span>
                <span>Font</span>
                <span>Video</span>
                <span>Sound</span>
                <span>Victor</span>
                <span>Animation</span>
                <span>Ai</span>
                <span>Productivity</span>
                <span>No Code</span>
                <span>Others</span>
          </FilterSideBar.Tags>
          <FilterSideBar.Platforms>
            <span>Mac</span>
            <span>Windows</span>
            <span>Browser</span>
          </FilterSideBar.Platforms>
        </FilterSideBar>

        <CardsGrid items={visibleItems} error={error} totalCount={filtered.length} />
        <div ref={sentinelRef} className="tools-sentinel" />
      </div>
    </div>
  );
};

export default Tools;
