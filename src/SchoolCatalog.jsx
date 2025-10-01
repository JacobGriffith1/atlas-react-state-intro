import { useEffect, useState } from "react";

/**
 * SchoolCatalog
 *
 * Loads course data from `/api/courses.json`
 * on first render, then renders one row per course.
 * AbortController avoids setting state after unmount.
 */
export default function SchoolCatalog() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ctrl = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/courses.json", { signal: ctrl.signal });
        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }

        const data = await res.json();

        // Accept either { courses: [...] } or [...] for convenience.
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.courses)
            ? data.courses
            : [];

        setCourses(list);
      } catch (err) {
        // Ignore cancellations; report other errors.
        if (err?.name !== "AbortError") {
          setError(err?.message ?? "Unknown error");
        }
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => ctrl.abort(); // Prevent state updates after
  }, []);

  return (
    <section className="catalog">
      <h1>School Catalog</h1>

      <table>
        <thead>
          <tr>
            <th>Trimester</th>
            <th>Course Number</th>
            <th>Course Name</th>
            <th>Semester</th>
            <th>Credits</th>
            <th>Total Clock Hours</th>
            <th>Enroll</th>
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td colSpan={7} style={{ textAlign: "center" }}>
                Loading…
              </td>
            </tr>
          )}

          {error && !loading && (
            <tr>
              <td colSpan={7} style={{ color: "crimson", textAlign: "center" }}>
                Failed to load courses: {error}
              </td>
            </tr>
          )}

          {!loading && !error && courses.length === 0 && (
            <tr>
              <td colSpan={7} style={{ textAlign: "center" }}>
                No courses found.
              </td>
            </tr>
          )}

          {!loading &&
            !error &&
            courses.map((c, idx) => {
              // Support common naming variations in seed JSON.
              const trimester = c.trimester ?? c.term ?? "";
              const courseNumber = c.courseNumber ?? c.number ?? c.code ?? "";
              const courseName = c.courseName ?? c.name ?? c.title ?? "";
              const semester = c.semester ?? ""; // Shown if present.
              const credits = c.credits ?? c.creditHours ?? "";
              const hours = c.totalClockHours ?? c.clockHours ?? c.hours ?? "";

              const key =
                c.id ?? `${String(courseNumber)}-${String(trimester)}-${idx}`;

              return (
                <tr key={key}>
                  <td>{trimester}</td>
                  <td>{courseNumber}</td>
                  <td>{courseName}</td>
                  <td>{semester}</td>
                  <td>{credits}</td>
                  <td>{hours}</td>
                  <td>
                    <button type="button" disabled>
                      Enroll
                    </button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </section>
  );
}
