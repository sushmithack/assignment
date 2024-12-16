import { useEffect, useState } from "react";
import Loader from "./components/loader/Loader";
import "./App.css";

const App = () => {
  const [projects, setProjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null); // State to track errors
  const [loading, setLoading] = useState(true); // State to track loading

  const recordsPerPage = 5;

  // useEffect(() => {
  //   const fetchProjects = async () => {
  //     try {
  //       const response = await fetch(
  //         "https://raw.githubusercontent.com/saaslabsco/frontend-assignment/master/frontend-assignment.json"
  //       );

  //       if (!response.ok) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }

  //       const data = await response.json();

  //       if (Array.isArray(data)) {
  //         setProjects(data);
  //       } else {
  //         console.error("Error: API response is not an array");
  //       }
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     }
  //   };

  //   fetchProjects();
  // }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/saaslabsco/frontend-assignment/master/frontend-assignment.json"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setProjects(data);
        } else {
          throw new Error("API response is not an array");
        }
      } catch (error) {
        setError("Failed to fetch projects. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);
  const totalPages = Math.ceil(projects.length / recordsPerPage) || 0;

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = projects.slice(indexOfFirstRecord, indexOfLastRecord);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="container">
      <h1>{"Kickstarter Projects"}</h1>
      <main>
        {loading ? (
          <Loader />
        ) : error ? (
          <div role="alert">{error}</div>
        ) : (
          <>
            <div class="table-container">
              <table aria-label="List of Kickstarter Projects">
                <thead>
                  <tr>
                    <th scope="col">S.No.</th>
                    <th scope="col">Percentage Funded</th>
                    <th scope="col">Amount Pledged</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((project, index) => (
                    <tr key={index}>
                      <td>{project["s.no"]}</td>
                      <td>{project["percentage.funded"]}</td>
                      <td>{project["amt.pledged"]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <nav
              aria-label="Pagination Navigation"
              className="pagination"
              style={{ marginTop: "20px", textAlign: "center" }}
            >
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-disabled={currentPage === 1}
                aria-label="Go to previous page"
              >
                Previous
              </button>
              <span
                aria-live="polite"
                aria-atomic="true"
                style={{ margin: "0 10px" }}
              >
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-disabled={currentPage === totalPages}
                aria-label="Go to next page"
              >
                Next
              </button>
            </nav>
          </>
        )}
      </main>
    </div>
  );
};

export default App;
