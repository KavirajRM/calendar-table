import { useEffect, useState } from "react";
import "./App.css";
import Activate from "./assets/Activate.png";
import Cloud from "./assets/Cloud.png";
import Deactivate from "./assets/Deactivate.png";
import Device from "./assets/Device.png";
import EllipseA from "./assets/EllipseA.png";
import EllipseOther from "./assets/EllipseOther.png";
import Location from "./assets/Location.png";
import logo from "./assets/Logo.svg";
import NoEllipse from "./assets/NoEllipse.png";
import Status from "./assets/rss_feed.png";
import SearchIcon from "./assets/search.png";
import Table from "./components/Table";
import Toast from "./components/Toast";
import { getData, putData } from "./services/APIService";

function App() {
  const [cameraData, setCameraData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [locations, setLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statuses, setStatuses] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");

  const showToast = (message, type) => {
    setToastMessage(message);
    setToastType(type);
  };

  const headers = [
    {
      label: "NAME",
      key: "name",
      render: (value, row) => {
        const statusClass = row.current_status === "Online" ? "green" : "red";
        return (
          <div className="name-with-status">
            <div>
              <div className="flex">
                <div className={`status-circle ${statusClass}`}></div>
                <div>{row.name}</div>
              </div>
              <div className="user-account">dummymail@wobot.ai</div>
            </div>
            <div>
              {row.hasWarning && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="warning-icon"
                  fill="none"
                  stroke="#FF7E17"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="12" y1="18" x2="12" y2="18" />
                </svg>
              )}
            </div>
          </div>
        );
      },
    },
    {
      label: "HEALTH",
      key: "health",
      render: (value, row) => {
        let imageSrc;
        let deviceSrc;

        if (row?.health?.cloud === "A") {
          imageSrc = EllipseA;
        } else if (!row?.health?.cloud) {
          imageSrc = NoEllipse;
        } else {
          imageSrc = EllipseOther;
        }

        if (row?.health?.device === "A") {
          deviceSrc = EllipseA;
        } else if (!row?.health?.cloud) {
          deviceSrc = NoEllipse;
        } else {
          deviceSrc = EllipseOther;
        }

        return (
          <div className="flex gap-8">
            <div className="flex gap-2">
              {row.health.cloud && (
                <div className="flex-center">
                  <img src={Cloud} />
                </div>
              )}
              <div className="ellipse">
                <img
                  src={imageSrc}
                  alt="Ellipse Background"
                  className="ellipse-bg"
                />
                <span className="ellipse-text">{row?.health?.cloud}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {row.health.device && (
                <div className="flex-center">
                  <img src={Device} />
                </div>
              )}
              <div className="ellipse">
                <img
                  src={deviceSrc}
                  alt="Ellipse Background"
                  className="ellipse-bg"
                />
                <span className="ellipse-text">{row?.health?.device}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    { label: "LOCATION", key: "location" },
    {
      label: "RECORDER",
      key: "recorder",
      render: (value, row) => {
        return <div>{row.recorder ? row?.recorder : "N/A"}</div>;
      },
    },
    {
      label: "TASKS",
      key: "tasks",
      render: (value, row) => {
        const tasks = Number(row.tasks);
        let displayText =
          tasks === 1 ? "1 task" : tasks > 1 ? `${tasks} tasks` : "N/A";
        return <div>{displayText}</div>;
      },
    },
    {
      label: "STATUS",
      key: "status",
      render: (value, row) => (
        <div
          className={
            row.status === "Active" ? "statusActive" : "statusInactive"
          }
        >
          {row.status}
        </div>
      ),
    },
    {
      label: "ACTIONS",
      key: "action",
      render: (value, row) => {
        const handleStatusChange = async () => {
          try {
            const newStatus = row.status === "Active" ? "Inactive" : "Active";
            const payload = { id: row.id, status: newStatus };
            await putData("update/camera/status", payload);
            fetchCameraData();
            showToast(`Camera status updated to ${newStatus}.`, "success");
          } catch (error) {
            console.error("Failed to update status:", error);
            showToast(
              "Failed to update camera status. Please try again.",
              "error"
            );
          }
        };

        const handleDelete = (id) => {
          const updatedData = cameraData.filter((camera) => camera.id !== id);
          setCameraData(updatedData);
          setFilteredData(updatedData);
          showToast("Camera deleted successfully.", "success");
        };

        return (
          <div className="flex-between gap-8">
            <div className="flex-center">
              <img
                src={row.status === "Active" ? Deactivate : Activate}
                alt="change-status"
                className="action-icon"
                onClick={handleStatusChange}
                style={{ cursor: "pointer" }}
              />
            </div>
            <button
              onClick={() => handleDelete(row.id)}
              className="delete-button"
            >
              Delete
            </button>
          </div>
        );
      },
    },
  ];

  const fetchCameraData = async () => {
    try {
      const response = await getData("fetch/cameras");
      const allData = response.data;
      setCameraData(allData);
      setFilteredData(allData);
      setTotalRecords(allData.length);

      // Extract unique locations and statuses
      const uniqueLocations = [
        ...new Set(allData.map((camera) => camera.location)),
      ];
      const uniqueStatuses = [
        ...new Set(allData.map((camera) => camera.status)),
      ];

      setLocations(uniqueLocations);
      setStatuses(uniqueStatuses);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchCameraData();
  }, []);

  useEffect(() => {
    localStorage.setItem("token", "4ApVMIn5sTxeW7GQ5VWeWiy");
  }, []);

  useEffect(() => {
    let filtered = cameraData;
    if (selectedLocation) {
      filtered = filtered.filter(
        (camera) => camera.location === selectedLocation
      );
    }
    if (selectedStatus) {
      filtered = filtered.filter((camera) => camera.status === selectedStatus);
    }
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (camera) =>
          camera.name.toLowerCase().includes(lowerCaseSearch) ||
          camera.location.toLowerCase().includes(lowerCaseSearch) ||
          camera.recorder.toLowerCase().includes(lowerCaseSearch)
      );
    }
    setFilteredData(filtered);
    setTotalRecords(filtered.length);
    setCurrentPage(1);
  }, [selectedLocation, selectedStatus, cameraData, searchTerm]);

  return (
    <div className="App">
      <div className="flex-center">
        <img src={logo} alt="Logo" className="logo" />
      </div>
      <div className="header">
        <div className="header-text">
          <div className="title">Cameras</div>
          <div className="description">Manage your cameras here.</div>
        </div>
        <div className="searchBar">
          <input
            className=""
            placeholder="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <img src={SearchIcon} />
        </div>
      </div>

      <div className="table-filters">
        <div className="flex">
          <div className="location">
            <select
              name="location"
              className="location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="">Location</option>
              {locations.map((location, index) => (
                <option key={index} value={location}>
                  {location}
                </option>
              ))}
            </select>
            <img src={Location} />
          </div>
          <div className="status">
            <select
              name="status"
              className="status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Status</option>
              {statuses.map((status, index) => (
                <option key={index} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <img src={Status} />
          </div>
        </div>
      </div>

      <div className="table-container">
        <Table
          headers={headers}
          data={filteredData}
          currentPage={currentPage}
          recordsPerPage={recordsPerPage}
          totalRecords={totalRecords}
          onPageChange={setCurrentPage}
          onRecordsPerPageChange={setRecordsPerPage}
        />
      </div>
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage("")}
        />
      )}
    </div>
  );
}

export default App;
