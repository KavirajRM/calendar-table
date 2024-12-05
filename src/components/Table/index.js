import React, { useEffect, useState } from "react";
import ArrowLeft from "../../assets/ArrowLeft.png";
import ArrowLeftLeft from "../../assets/ArrowLeftLeft.png";
import ArrowRight from "../../assets/ArrowRight.png";
import ArrowRightRight from "../../assets/ArrowRightRight.png";
import "./style.css";

const Table = ({
  headers,
  data,
  currentPage,
  recordsPerPage,
  totalRecords,
  onPageChange,
  onRecordsPerPageChange,
}) => {
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const paginatedData = data.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  // State for tracking selected rows
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Handle select/unselect individual rows
  const handleRowSelect = (id) => {
    setSelectedRows((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((rowId) => rowId !== id); // Unselect if already selected
      } else {
        return [...prevSelected, id]; // Select if not selected
      }
    });
  };

  // Handle select/unselect all rows
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]); // Unselect all
    } else {
      const allRowIds = paginatedData.map((item) => item.id);
      setSelectedRows(allRowIds); // Select all in the current page
    }
    setSelectAll(!selectAll);
  };

  useEffect(() => {
    // Sync selectAll checkbox with the selected rows
    if (paginatedData.length === selectedRows.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedRows, paginatedData]);

  return (
    <div>
      <table className="camera-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
              />
            </th>
            {headers.map((header, index) => (
              <th key={index}>{header.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length > 0 ? (
            paginatedData.map((item) => (
              <tr key={item.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(item.id)}
                    onChange={() => handleRowSelect(item.id)}
                  />
                </td>
                {headers.map((header, index) => (
                  <td key={index}>
                    {header.render
                      ? header.render(item[header.key], item)
                      : item[header.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length + 1}>No records found</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="pagination">
        <div></div>
        <div className="pagination-controls">
          <select
            value={recordsPerPage}
            onChange={(e) => onRecordsPerPageChange(Number(e.target.value))}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="30">30</option>
          </select>
          <span>
            {Math.min(recordsPerPage * (currentPage - 1) + 1, totalRecords)}-
            {Math.min(recordsPerPage * currentPage, totalRecords)} of{" "}
            {totalRecords}
          </span>

          <div className="gap-8 flex">
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
            >
              <img src={ArrowLeftLeft} />
            </button>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <img src={ArrowLeft} />
            </button>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <img src={ArrowRight} />
            </button>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              <img src={ArrowRightRight} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table;
