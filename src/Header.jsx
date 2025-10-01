import logo from "./assets/logo.png";

export default function Header() {
  return (
    <div className="header">
      <img src={logo} alt="logo" className="logo" />
      <div className="enrollment">Classes Enrolled: 1</div>
    </div>
  );
}
