import "../../styles/atom.scss";
import SvgIcn from "../../data/IconCompo";

const platformIcon = (p) => {
  const v = (p || "").toLowerCase();
  if (v.includes("windows")) return "windows";
  if (v.includes("apple") || v.includes("mac") || v.includes("ios")) return "apple";
  if (v.includes("android")) return "android";
  if (v.includes("linux")) return "linux";
  if (v.includes("browser") || v.includes("web")) return "browser";
  return null;
};

const priceIcon = (p) => {
  const v = (p || "").toLowerCase();
  if (v.includes("freemium")) return { name: "freemium", cls: "price-freemium" };
  if (v.includes("free")) return { name: "free", cls: "price-free" };
  if (v.includes("paid")) return { name: "paid", cls: "price-paid" };
  return { name: "money", cls: "price-other" };
};

const Card = ({ item, href, imgSrc, img, baseLogoPath = "/assets/cards_logo/", name, description, platforms, platform, price, tags, isFav, onToggleFav, itemKey }) => {
  const data = item || {};
  const finalHref = href || data.link || "#";
  const rawImg = img || data.img || "";
  const finalImgSrc = imgSrc || (rawImg ? `${baseLogoPath}${rawImg}` : null);
  const finalName = name || data.name || "";
  const finalDesc = description || data.engDescription || data.description || "";
  const platStr = platform || data.platform || "";
  const finalPlatforms = Array.isArray(platforms) ? platforms : platStr.split(",").map((s) => s.trim()).filter(Boolean);
  const finalPrice = price || data.price || "";
  const tagStr = tags || data.tags || "";
  const finalTags = Array.isArray(tags) ? tags : String(tagStr).split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <a href={finalHref} className="tool-card" target="_blank" rel="noopener noreferrer">
      <button type="button" className={`fav-btn ${isFav ? 'on' : 'off'}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFav && onToggleFav({ itemKey: itemKey || finalHref, item: data, isFav }); }}>
        <SvgIcn Name={isFav ? "fav_on" : "fav_on"} />
      </button>
      <div className="tool-logo">
        {finalImgSrc ? (
          <img src={finalImgSrc} alt={finalName} loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }} />
        ) : null}
        <div className="tool-logo-fallback" style={{ display: finalImgSrc ? "none" : "flex" }}>
          <SvgIcn Name="apps" />
        </div>
      </div>
      <div className="tool-meta">
        <div className="tool-name">{finalName}</div>
        {finalDesc && <div className="tool-desc">{finalDesc}</div>}
        <div className="tool-icons">
          {finalPrice && (() => {
            const pi = priceIcon(finalPrice);
            return <span className={`tool-icon ${pi.cls}`}><SvgIcn Name={pi.name} /></span>;
          })()}
          {finalPlatforms.map((p, i) => {
            const ic = platformIcon(p);
            if (!ic) return null;
            return <span key={i} className="tool-icon"><SvgIcn Name={ic} /></span>;
          })}
        </div>
        {finalTags.length > 0 && (
          <div className="tool-tags">
            {finalTags.map((t, i) => (
              <span key={i} className="tool-tag">{t}</span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
};

export default Card;