import React from "react";
import Card from "../atom/Card.jsx";
import SvgIcn from "../../data/IconCompo";

const CardsGrid = ({ items = [], error = "", totalCount = 0, className = "", favoritesSet, onToggleFav, getKey }) => {
  const showEmpty = !error && items.length === 0;
  const showEnd = !error && totalCount > 0 && items.length >= totalCount;

  return (
    <div className={`cards-grid ${showEmpty ? 'empty' : ''} ${className}`}>
      {error && <div className="status status--error">{error}</div>}
      {showEmpty ? (
        <div className="empty-state">
          <div className="empty-icon"><SvgIcn Name="no_item" /></div>
        </div>
      ) : (
        items.map((it, idx) => {
          const key = getKey ? getKey(it) : (it.link || it.name);
          const isFav = favoritesSet ? favoritesSet.has(key) : false;
          return <Card key={idx} item={it} itemKey={key} isFav={isFav} onToggleFav={onToggleFav} />;
        })
      )}
      {showEnd && (
        <div className="end-state">
          <div className="end-icon"><SvgIcn Name="stop" /></div>
          <div className="end-text">No more items</div>
        </div>
      )}
    </div>
  );
};

export default CardsGrid;