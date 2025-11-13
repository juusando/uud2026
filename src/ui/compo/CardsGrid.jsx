import React from "react";
import Card from "../atom/Card.jsx";
import SvgIcn from "../../data/IconCompo";

const CardsGrid = ({ items = [], error = "", totalCount = 0, className = "" }) => {
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
        items.map((it, idx) => (
          <Card key={idx} item={it} />
        ))
      )}
      {showEnd && (
        <div className="end-state">
          {/* <div className="end-text">No More Cards</div> */}
                    <div className="end-icon"><SvgIcn Name="no_data" /></div>

        </div>
      )}
    </div>
  );
};

export default CardsGrid;