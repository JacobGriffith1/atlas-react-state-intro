import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const EnrollmentContext = createContext(null);

export function EnrollmentProvider({ children }) {
  const [byId, setById] = useState(() => new Map());

  const enroll = useCallback((course) => {
    const id = course?.courseNumber;
    if (!id) return;
    setById((prev) => {
      if (prev.has(id)) return prev; // ignore duplicates
      const next = new Map(prev);
      next.set(id, course);
      return next;
    });
  }, []);

  const drop = useCallback((courseNumber) => {
    if (!courseNumber) return;
    setById((prev) => {
      if (!prev.has(courseNumber)) return prev;
      const next = new Map(prev);
      next.delete(courseNumber);
      return next;
    });
  }, []);

  const isEnrolled = useCallback(
    (courseNumber) => (courseNumber ? byId.has(courseNumber) : false),
    [byId]
  );

  const value = useMemo(() => {
    const enrolled = Array.from(byId.values());
    return { enroll, drop, isEnrolled, enrolled, count: enrolled.length };
  }, [byId, enroll, drop, isEnrolled]);

  return (
    <EnrollmentContext.Provider value={value}>
      {children}
    </EnrollmentContext.Provider>
  );
}

export function useEnrollment() {
  const ctx = useContext(EnrollmentContext);
  if (!ctx)
    throw new Error("useEnrollment must be used within <EnrollmentProvider>");
  return ctx;
}
