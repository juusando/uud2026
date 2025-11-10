import React, { useEffect, useRef, useState } from "react";
import "../../styles/atom.scss";

const ColorDropdown = ({ trigger, onColorSelect, currentColor }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const colors = [
    // { name: "Default", value: "#ffffff" },
    // { name: "Light Blue", value: "#e3f2fd" },
    // { name: "Light Green", value: "#e8f5e8" },
    // { name: "Light Pink", value: "#fce4ec" },
    // { name: "Light Purple", value: "#f3e5f5" },
    // { name: "Light Orange", value: "#fff3e0" },
    // { name: "Light Yellow", value: "#fffde7" },
    // { name: "Light Gray", value: "#f5f5f5" },
    // { name: "Light Cyan", value: "#e0f2f1" },
    // { name: "Light Indigo", value: "#e8eaf6" },
    // { name: "Light Teal", value: "#e0f2f1" },
    // { name: "Light Amber", value: "#fff8e1" },
     // Blues (4 distinct cool blues)
    { name: "Ocean Blue", value: "#0077BE" },
    { name: "Cerulean", value: "#2A52BE" },
    { name: "Cornflower", value: "#6495ED" },
    { name: "Ice Blue", value: "#B0E0E6" },

    // Greens (4 distinct fresh greens)
    { name: "Lime Zest", value: "#32CD32" },
    { name: "Shamrock", value: "#45CEA2" },
    { name: "Meadow", value: "#3CB371" },
    { name: "Fern", value: "#4F7942" },

    // Yellows (4 distinct bright yellows)
    { name: "Goldenrod", value: "#DAA520" },
    { name: "Sunflower", value: "#FFDA03" },
    { name: "Honey", value: "#FDB813" },
    { name: "Lemon", value: "#FFF700" },

    // Oranges (4 distinct vivid oranges)
    { name: "Tangerine", value: "#FF8C00" },
    { name: "Pumpkin", value: "#FF7518" },
    { name: "Mango", value: "#FFC324" },
    { name: "Apricot", value: "#FBCEB1" },

    // Reds (4 distinct strong reds)
    { name: "Crimson", value: "#DC143C" },
    { name: "Cherry", value: "#990F02" },
    { name: "Ruby", value: "#E0115F" },
    { name: "Brick", value: "#B22222" },

    // Purples (4 distinct rich purples)
    { name: "Plum", value: "#8E4585" },
    { name: "Amethyst", value: "#9966CC" },
    { name: "Iris", value: "#5A4FCF" },
    { name: "Wisteria", value: "#C9A0DC" },

    // Browns (4 distinct earthy browns)
    { name: "Saddle", value: "#8B4513" },
    { name: "Umber", value: "#635147" },
    { name: "Caramel", value: "#AF6E4D" },
    { name: "Khaki", value: "#C3B091" },

    // Grays (4 distinct neutral grays)
    { name: "Graphite", value: "#41424C" },
    { name: "Slate", value: "#708090" },
    { name: "Silver", value: "#C0C0C0" },
    { name: "Pearl", value: "#EAE0C8" },

        { name: "Turquoise", value: "#10d5b0" },
    { name: "Hot Pink", value: "#d9519b" },
    { name: "Peach", value: "#f8d7b7" },
    { name: "Lavender", value: "#ac86f1" },
    { name: "Forest", value: "#35ba34" },
    { name: "Sunshine", value: "#f7b827" },
    { name: "Aqua", value: "#75ebd1" },
    { name: "Magenta", value: "#EC3B83" },

  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleColorClick = (color) => {
    onColorSelect(color.value);
    setOpen(false);
  };

  return (
    <div className="color-dropdown-box" ref={rootRef}>
       {React.cloneElement(trigger, { onClick: () => setOpen(!open) })}
      {open && (
          <div className="colors-box">
            {colors.map((color, idx) => (
              <div
                key={idx}
                className={`color-circle ${currentColor === color.value ? 'selected' : ''}`}
                style={{ backgroundColor: color.value }}
                onClick={() => handleColorClick(color)}
                title={color.name}
              />
            ))}
      
        </div>
      )}
     
    </div>
  );
};

export default ColorDropdown;