// src/SchoolCatalog.jsx
import { useEffect, useMemo, useState } from "react";

export default function SchoolCatalog() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sorting
  const [sortKey, setSortKey] = useState(null); // 'trimester'|'number'|'name'|'credits'|'hours'|null
  const [sortDir, setSortDir] = useState("asc"); // 'asc' | 'desc'

  // Search
  const [query, setQuery] = useState("");

  // Pagination
  const PAGE_SIZE = 5;
  const [page, setPage] = useState(0); // zero-based

  useEffect(() => {
    const ctrl = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/courses.json", { signal: ctrl.signal });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);

        const data = await res.json();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.courses)
            ? data.courses
            : [];

        setCourses(list);
      } catch (err) {
        if (err?.name !== "AbortError")
          setError(err?.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => ctrl.abort();
  }, []);

  const rows = useMemo(() => {
    return courses.map((c, idx) => {
      const trimester = c.trimester ?? "";
      const number = c.courseNumber ?? "";
      const name = c.courseName ?? "";
      const credits = c.semesterCredits ?? "";
      const hours = c.totalClockHours ?? "";
      const key = c.id ?? `${String(number)}-${String(trimester)}-${idx}`;
      return { key, trimester, number, name, credits, hours, _i: idx };
    });
  }, [courses]);

  // Live, case-insensitive filtering by Course Number + Course Name only
  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const num = String(r.number).toLowerCase();
      const nm = String(r.name).toLowerCase();
      return num.includes(q) || nm.includes(q);
    });
  }, [rows, query]);

  // Compare helper
  function cmpValues(a, b, numeric) {
    const isNil = (v) => v === null || v === undefined || v === "";
    const an = isNil(a);
    const bn = isNil(b);
    if (an && bn) return 0;
    if (an) return 1; // null/empty last
    if (bn) return -1;

    if (numeric) {
      const na =
        typeof a === "number" ? a : Number(String(a).replace(/[^\d.-]/g, ""));
      const nb =
        typeof b === "number" ? b : Number(String(b).replace(/[^\d.-]/g, ""));
      const aNum = Number.isNaN(na) ? Number.NEGATIVE_INFINITY : na;
      const bNum = Number.isNaN(nb) ? Number.NEGATIVE_INFINITY : nb;
      return aNum === bNum ? 0 : aNum < bNum ? -1 : 1;
    }

    return String(a).localeCompare(String(b), undefined, {
      numeric: true,
      sensitivity: "base",
    });
  }

  // Sort AFTER filtering
  const sortedRows = useMemo(() => {
    if (!sortKey) return filteredRows;
    const numericCols = new Set(["credits", "hours"]);
    const dirMul = sortDir === "asc" ? 1 : -1;

    return [...filteredRows].sort((a, b) => {
      const primary = cmpValues(
        a[sortKey],
        b[sortKey],
        numericCols.has(sortKey)
      );
      if (primary !== 0) return primary * dirMul;
      return (a._i - b._i) * dirMul;
    });
  }, [filteredRows, sortKey, sortDir]);

  // Pagination derived values
  const totalPages = Math.ceil(sortedRows.length / PAGE_SIZE);
  const lastPage = Math.max(0, totalPages - 1);

  // Clamp page if results shrink (e.g., search filter) and reset on new search
  useEffect(() => {
    setPage(0);
  }, [query]);

  useEffect(() => {
    if (page > lastPage) setPage(lastPage);
  }, [page, lastPage]);

  const start = page * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageRows = sortedRows.slice(start, end);

  function handleSort(col) {
    if (sortKey === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(col);
      setSortDir("asc");
    }
  }

  function headerProps(col) {
    const active = sortKey === col;
    const ariaSort = active
      ? sortDir === "asc"
        ? "ascending"
        : "descending"
      : "none";
    const arrow = !active ? "↕" : sortDir === "asc" ? "↑" : "↓";
    return { ariaSort, arrow };
  }

  const onPrev = () => setPage((p) => Math.max(0, p - 1));
  const onNext = () => setPage((p) => Math.min(lastPage, p + 1));

  const prevDisabled = page === 0 || totalPages === 0;
  const nextDisabled = page >= lastPage || totalPages === 0;

  return (
    <section className="catalog">
      <h1>School Catalog</h1>

      {/* Search input: filters by Course Number + Course Name */}
      <div style={{ margin: "0 0 0.75rem 0" }}>
        <label>
          <span style={{ marginRight: 8 }}>Search:</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. WD1100 or Intermediate Web Development"
            aria-label="Search by course number or course name"
          />
        </label>
      </div>

      <table>
        <thead>
          <tr>
            <SortableTH
              label="Trimester"
              col="trimester"
              onSort={handleSort}
              headerProps={headerProps}
            />
            <SortableTH
              label="Course Number"
              col="number"
              onSort={handleSort}
              headerProps={headerProps}
            />
            <SortableTH
              label="Course Name"
              col="name"
              onSort={handleSort}
              headerProps={headerProps}
            />
            <SortableTH
              label="Semester Credits"
              col="credits"
              onSort={handleSort}
              headerProps={headerProps}
            />
            <SortableTH
              label="Total Clock Hours"
              col="hours"
              onSort={handleSort}
              headerProps={headerProps}
            />
            <th>Enroll</th>
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td colSpan={6} style={{ textAlign: "center" }}>
                Loading…
              </td>
            </tr>
          )}

          {error && !loading && (
            <tr>
              <td colSpan={6} style={{ color: "crimson", textAlign: "center" }}>
                Failed to load courses: {error}
              </td>
            </tr>
          )}

          {!loading && !error && sortedRows.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: "center" }}>
                No courses found.
              </td>
            </tr>
          )}

          {!loading &&
            !error &&
            pageRows.map((r) => (
              <tr key={r.key}>
                <td>{r.trimester}</td>
                <td>{r.number}</td>
                <td>{r.name}</td>
                <td>{r.credits}</td>
                <td>{r.hours}</td>
                <td>
                  <button type="button" disabled>
                    Enroll
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* Pagination controls */}
      <div
        style={{
          marginTop: "0.75rem",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <button
          type="button"
          onClick={onPrev}
          disabled={prevDisabled}
          aria-label="Previous page"
        >
          Previous
        </button>
        <span aria-live="polite">
          Page {totalPages === 0 ? 0 : page + 1} of {totalPages || 0}
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </section>
  );
}

function SortableTH({ label, col, onSort, headerProps }) {
  const { ariaSort, arrow } = headerProps(col);
  return (
    <th aria-sort={ariaSort}>
      <button
        type="button"
        onClick={() => onSort(col)}
        style={{ all: "unset", cursor: "pointer" }}
        aria-label={`Sort by ${label} ${ariaSort === "ascending" ? "descending" : "ascending"}`}
      >
        {label} <span aria-hidden="true">{arrow}</span>
      </button>
    </th>
  );
}
