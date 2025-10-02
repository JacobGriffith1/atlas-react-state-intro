import Header from "./header.jsx";
import SchoolCatalog from "./SchoolCatalog.jsx";
import ClassSchedule from "./ClassSchedule.jsx";
import { EnrollmentProvider } from "./context/EnrollmentContext.jsx";

export default function App() {
  return (
    <EnrollmentProvider>
      <Header />
      <div
        className="content"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        <section>
          <SchoolCatalog />
        </section>
        <section>
          <ClassSchedule />
        </section>
      </div>
    </EnrollmentProvider>
  );
}
