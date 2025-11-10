import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import "../../styles/atom.scss";
import SvgIcn from "../../data/IconCompo";

const MenuDropdown = ({
  trigger,
  items = [],
  align = "right",
  className = "",
  onOpenChange,
  defaultOpen = false,
  open: controlledOpen,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const rootRef = useRef(null);

  const toggleOpen = useCallback(() => {
    const current = controlledOpen ?? open;
    const next = !current;
    setOpen(next);
    if (onOpenChange) onOpenChange(next);
  }, [controlledOpen, open, onOpenChange]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
        if (onOpenChange) onOpenChange(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onOpenChange]);

  const handleItemClick = useCallback((item, e) => {
    if (item.disabled) {
      e.preventDefault();
      return;
    }
    const isNavigation = Boolean(item.to || item.href);
    if (!isNavigation) {
      e.preventDefault();
    }
    if (item.onClick) item.onClick(e);
    setOpen(false);
    if (onOpenChange) onOpenChange(false);
  }, [onOpenChange]);

  const menuItems = useMemo(() => {
    return items.map((item, idx) => {
      const href = item.href || item.to || "#";
      return (
        <li key={idx} className={`menu-item ${item.disabled ? "disabled" : ""}`}>
          <a href={href} onClick={(e) => handleItemClick(item, e)}>
            {item.iconR && (
              <span className="iconR">
                <SvgIcn Name={item.iconR} />
              </span>
            )}
            <span className="label">{item.label}</span>
            {item.icon && !item.iconR && (
              <span className="icon">
                <SvgIcn Name={item.icon} />
              </span>
            )}
          </a>
        </li>
      );
    });
  }, [items, handleItemClick]);

  return (
    <div ref={rootRef} className={`menu-dropdown ${className}`}>
      <div
        className="menu-trigger"
        onClick={(e) => {
          // Prevent default if trigger contains an anchor to avoid page jump
          e.preventDefault();
          e.stopPropagation();
          toggleOpen();
        }}
      >
        {trigger}
      </div>
      {(controlledOpen ?? open) && (
        <div className={`menu-panel ${align === "right" ? "align-right" : "align-left"} ${className}`}>
          <ul className="menu-items">
            {menuItems}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MenuDropdown;