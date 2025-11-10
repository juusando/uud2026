import "../../styles/atom.scss";
import SvgIcn from "../../data/IconCompo";

const Title = ({ iconName, children, className = "ds_title" }) => {
  return (
    <div className={className}>
      {iconName && <SvgIcn Name={iconName} />}
      {children}
    </div>
  );
};

export default Title;
