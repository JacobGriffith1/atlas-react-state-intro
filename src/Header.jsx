import logo from "./assets/logo.png";
import { useEnrollment } from "./context/EnrollmentContext.jsx";

export default function Header() {
  const { count } = useEnrollment();
  return (
    <div className="header">
      <img src={logo} alt="logo" className="logo" />
      <div className="enrollment">Classes Enrolled: {count}</div>
    </div>
  );
}
