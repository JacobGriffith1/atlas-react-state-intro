import { useEnrollment } from "./context/EnrollmentContext.jsx";

export default function ClassSchedule() {
  const { enrolled, drop } = useEnrollment();

  return (
    <div className="class-schedule">
      <h1>Class Schedule</h1>
      <table>
        <thead>
          <tr>
            <th>Course Number</th>
            <th>Course Name</th>
            <th>Drop</th>
          </tr>
        </thead>
        <tbody>
          {enrolled.length === 0 ? (
            <tr>
              <td colSpan={3} style={{ textAlign: "center" }}>
                No classes enrolled yet.
              </td>
            </tr>
          ) : (
            enrolled.map((c, idx) => (
              <tr key={c.id ?? `${c.courseNumber}-${idx}`}>
                <td>{c.courseNumber ?? ""}</td>
                <td>{c.courseName ?? ""}</td>
                <td>
                  <button type="button" onClick={() => drop(c.courseNumber)}>
                    Drop
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
