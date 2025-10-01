export default function SchoolCatalog() {
  return (
    <div className="school-catalog">
      <h1>School Catalog</h1>
      <input type="text" placeholder="Search" />
      <table>
        <thead>
          <tr>
            <th>Trimester</th>
            <th>Course Number</th>
            <th>Courses Name</th>
            <th>Semester Credits</th>
            <th>Total Clock Hours</th>
            <th>Enroll</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>PP1000</td>
            <td>Beginning Procedural Programming</td>
            <td>2</td>
            <td>30</td>
            <td>
              <button>Enroll</button>
            </td>
          </tr>
          <tr>
            <td>1</td>
            <td>PP1100</td>
            <td>Basic Procedural Programming</td>
            <td>4</td>
            <td>50</td>
            <td>
              <button>Enroll</button>
            </td>
          </tr>
          <tr>
            <td>1</td>
            <td>OS1000</td>
            <td>Fundamentals of Open Source Operating Systems</td>
            <td>2.5</td>
            <td>37.5</td>
            <td>
              <button>Enroll</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div className="pagination">
        <button>Previous</button>
        <button>Next</button>
      </div>
    </div>
  );
}
