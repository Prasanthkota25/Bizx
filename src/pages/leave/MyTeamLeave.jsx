
import { Snackbar, Alert, Button } from '@mui/material';
import * as XLSX from "xlsx";


import TableSortLabel from '@mui/material/TableSortLabel';

// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";


import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import API from '../../api/api';
import { formatName } from '../../utils/formatters';
import '../../styles/leave.css';


function MyTeamLeave() {
  const [leaves, setLeaves] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [remarksMap, setRemarksMap] = useState({});



  const [searchInput, setSearchInput] = useState('');

  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('');

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
    action: null
  });

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (!username) {
      setLoading(false);
      return;
    }

    //Data Fetching Logic....
    const fetchData = async () => {
      try {
        const userResponse = await API.get(`/users/username/${username}`);
        const user = userResponse.data;

        
console.log("User:", user);
console.log("Role:", user.role);


        if (!user) {
          setLoading(false);
          return;
        }

        if (user.role && user.role.trim().toUpperCase() === 'MANAGER') {
          setIsManager(true);
          // const leaveResponse = await API.get(`/leave/team/${user.id}`);
          const leaveResponse = await API.get('/leave/team', {
  headers: {
    managerId: user.id
  }
});


          setLeaves(leaveResponse.data || []);
          setFiltered(leaveResponse.data || []);
        } else {
          setLeaves([]);
          setFiltered([]);
          setIsManager(false);
        }
      } catch (error) {
        console.error('Error loading team leaves', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let data = [...leaves];

    //Filtering Logic....
    if (statusFilter) {
      if (statusFilter === 'PENDING') {
        data = data.filter((leave) => normalizeStatus(leave) === 'Applied');
      } else {
        data = data.filter((leave) => leave.status === statusFilter);
      }
    }



    if (search.trim().length >= 3) {
      const q = search.toLowerCase();
      data = data.filter(
        (leave) =>
          String(leave.userId ?? '').toLowerCase().includes(q) ||
          leave.username?.toLowerCase().includes(q) ||
          leave.leaveType?.toLowerCase().includes(q) ||
          leave.reason?.toLowerCase().includes(q)
      );
    }

    // setFiltered(data);
    setFiltered(
      data.sort((a, b) => {
        const dateA = a.appliedOn ? new Date(a.appliedOn).getTime() : 0;
        const dateB = b.appliedOn ? new Date(b.appliedOn).getTime() : 0;
        return dateB - dateA;
      })
    );

    setCurrentPage(1);
  }, [statusFilter, search, leaves]);


  useEffect(() => {
    const newTotalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

    if (currentPage > newTotalPages) {
      setCurrentPage(1);
    }
  }, [filtered, pageSize, currentPage]);


  const handleCancelDecision = async (id, action) => {
    const remarks = remarksMap[id];

    if (!remarks) {
      showSnackbar("Please enter remarks", "error");
      return;
    }

    showSnackbar(
      "Are you sure?",
      "warning",
      <>
        <Button
          color="inherit"
          size="small"
          onClick={async () => {
            handleSnackbarClose();

            try {
              await API.put(`/leave/cancel-decision/${id}/${action}`, { remarks });

              setLeaves(prev =>
                prev.map(l =>
                  l.id === id
                    ? {
                      ...l,
                      status: action === 'APPROVE' ? 'CANCELLED' : 'APPROVED',
                      approverRemarks: remarks
                    }
                    : l
                )
              );

              showSnackbar(
                action === 'APPROVE'
                  ? "Leave cancellation approved"
                  : "Leave cancellation rejected",
                "success"
              );

            } catch {
              showSnackbar("Failed to process cancel", "error");
            }
          }}
        >
          YES
        </Button>

        <Button color="inherit" size="small" onClick={handleSnackbarClose}>
          NO
        </Button>
      </>
    );
  };



  const handleApprove = async (id) => {
    const remarks = remarksMap[id];

    if (!remarks) {
      showSnackbar("Please enter remarks before approving", "error");
      return;
    }

    showSnackbar(
      "Approve this leave?",
      "warning",
      <>
        <Button
          color="inherit"
          size="small"
          onClick={async () => {
            handleSnackbarClose();

            try {
              await API.put(`/leave/approve/${id}`, { remarks });

              setLeaves(prev =>
                prev.map(l =>
                  l.id === id
                    ? { ...l, status: 'APPROVED', approverRemarks: remarks }
                    : l
                )
              );

              showSnackbar("Leave approved successfully", "success");

            } catch {
              showSnackbar("Failed to approve leave", "error");
            }
          }}
        >
          YES
        </Button>

        <Button color="inherit" size="small" onClick={handleSnackbarClose}>
          NO
        </Button>
      </>
    );
  };


  const handleReject = async (id) => {
    const remarks = remarksMap[id];

    if (!remarks) {
      showSnackbar("Please enter rejection reason", "error");
      return;
    }

    showSnackbar(
      "Reject this leave?",
      "warning",
      <>
        <Button
          color="inherit"
          size="small"
          onClick={async () => {
            handleSnackbarClose();

            try {
              await API.put(`/leave/reject/${id}`, { remarks });

              setLeaves(prev =>
                prev.map(l =>
                  l.id === id
                    ? { ...l, status: 'REJECTED', approverRemarks: remarks }
                    : l
                )
              );

              // showSnackbar("Leave rejected successfully", "success");
              showSnackbar("Leave rejected successfully", "error");


            } catch {
              showSnackbar("Failed to reject leave", "error");
            }
          }}
        >
          YES
        </Button>

        <Button color="inherit" size="small" onClick={handleSnackbarClose}>
          NO
        </Button>
      </>
    );
  };
  const formatDate = (value) => {
    if (!value) return '-';

    const date = new Date(value);

    const day = String(date.getDate()).padStart(2, '0');

    const month = date.toLocaleString('en-US', {
      month: 'short'
    });

    const year = String(date.getFullYear()).slice(-4);

    return `${day}-${month}-${year}`;
  };

  // const getStatusClass = (status) => {
  //   const normalized = normalizeStatus(status);
  //   if (normalized === 'APPROVED') return 'status-approved';
  //   if (normalized === 'REJECTED') return 'status-rejected';
  //   if (normalized === 'CANCELLED') return 'status-cancelled';
  //   return 'status-pending';
  // };
  const getStatusClass = (status) => {
    const s = (status || '').toUpperCase();

    if (s === 'APPROVED' || s === 'CANCELLED') {
      return 'status-approved';
    }

    if (s === 'REJECTED') {
      return 'status-rejected';
    }

    return 'status-pending';
  };


  // const normalizeStatus = (status) => {
  //   if (!status || status === 'PENDING') {
  //     return 'Applied';
  //   }
  //   return status;
  // };
  const normalizeStatus = (item) => {
    const status = item?.status;

    if (!status || status === 'PENDING') {
      return 'Applied';
    }

    if (status === 'CANCEL_REQUESTED') {
      return 'CANCEL_REQUESTED';
    }

    return status;
  };

  const isActionAllowed = (item) => {
    const status = normalizeStatus(item);
    return status === 'Applied' || status === 'CANCEL_REQUESTED';
  };

  // const formatStatus = (status) => {
  //   if (!status) return '';

  //   return status
  //     .toLowerCase()
  //     .replace(/_/g, ' ')
  //     .replace(/\b\w/g, char => char.toUpperCase());
  // };



  const formatStatus = (status) => {
    if (!status) return '';

    if (status === 'Applied') return 'Applied';
    if (status === 'CANCEL_REQUESTED') return 'Cancel Requested';

    return status
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  };

  // const getRequestType = (item) => {
  //   const normalized = normalizeStatus(item);
  //     if (normalized === 'CANCELLED' || normalized === 'CANCEL_REQUESTED') {
  //       return 'Cancel Application';
  //     }
  //     return 'Leave Application';
  //   };
  const getRequestType = (item) => {
    if (item.status === 'CANCEL_REQUESTED') {
      return 'Cancel Application';
    }
    return 'Leave Application';
  };

  const [expandedRows, setExpandedRows] = useState({});
  const toggleReason = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };



  // const handleDownloadPDF = async () => {
  //   const input = document.getElementById("leave-table");

  //   if (!input) {
  //     showSnackbar("Table not found", "error");
  //     return;
  //   }

  //   const canvas = await html2canvas(input, {
  //     scale: 2
  //   });

  //   const imgData = canvas.toDataURL("image/png");

  //   const pdf = new jsPDF("p", "mm", "a4");

  //   const imgWidth = 190;
  //   const imgHeight = (canvas.height * imgWidth) / canvas.width;

  //   let position = 10;

  //   pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
  //   pdf.save("MyTeamLeave.pdf");
  // };

  const handleDownloadExcel = () => {
    if (!filtered || filtered.length === 0) {
      showSnackbar("No data to export", "error");
      return;
    }

    const excelData = paginatedData.map(item => ({
      "Employee No": item.userId || "-",
      "Employee Name": formatName(item.username) || "-",
      "Applied On": formatDate(item.appliedOn),
      "Leave Type": item.leaveType || "-",
      "From Date": formatDate(item.fromDate),
      "To Date": formatDate(item.toDate),
      "No. of Days": item.days || 0,
      "Status": formatStatus(normalizeStatus(item)),
      "Request Type": getRequestType(item),
      "Contact Number": item.phone || "-",
      "Reason": item.reason || "-",
      "Approver Remarks": item.approverRemarks || "-"
    }));


    /// Excel Export Logic...
    const worksheet = XLSX.utils.json_to_sheet(excelData);


    const colWidths = Object.keys(excelData[0]).map(key => ({
      wch: key.length + 5
    }));
    worksheet["!cols"] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Team Leave");

    // XLSX.writeFile(workbook, "MyTeamLeave.xlsx");
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
XLSX.writeFile(workbook, `Leave_${randomNumber}.xlsx`);
  };


  const showSnackbar = (message, severity = 'success', action = null) => {
    setSnackbar({
      open: true,
      message,
      severity,
      action
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';

    setOrder(newOrder);
    setOrderBy(property);

    let data = [...leaves]; // ✅ always start from original

    // ✅ APPLY FILTER
    if (statusFilter) {
      if (statusFilter === 'PENDING') {
        data = data.filter((leave) => normalizeStatus(leave) === 'Applied');
      } else {
        data = data.filter((leave) => leave.status === statusFilter);
      }
    }

    // ✅ APPLY SEARCH
    if (search.trim().length >= 3) {
      const q = search.toLowerCase();
      data = data.filter(
        (leave) =>
          String(leave.userId ?? '').toLowerCase().includes(q) ||
          leave.username?.toLowerCase().includes(q) ||
          leave.leaveType?.toLowerCase().includes(q) ||
          leave.reason?.toLowerCase().includes(q)
      );
    }

    // ✅ APPLY SORT
    data.sort((a, b) => {
      let valA;
      let valB;

      switch (property) {
        case 'employee':
          valA = formatName(a.username || '').toLowerCase();
          valB = formatName(b.username || '').toLowerCase();
          break;

        case 'userId':
          valA = parseInt(a.userId) || 0;
          valB = parseInt(b.userId) || 0;
          break;

        case 'requestType':
          valA = (getRequestType(a) || '').toLowerCase();
          valB = (getRequestType(b) || '').toLowerCase();
          break;

        case 'phone':
          valA = parseInt((a.phone || '').replace(/\D/g, '')) || 0;
          valB = parseInt((b.phone || '').replace(/\D/g, '')) || 0;
          break;

        case 'appliedOn':
          valA = a.appliedOn ? new Date(a.appliedOn).getTime() : 0;
          valB = b.appliedOn ? new Date(b.appliedOn).getTime() : 0;
          break;

        case 'leaveType':
          valA = (a.leaveType || '').toLowerCase();
          valB = (b.leaveType || '').toLowerCase();
          break;

        case 'fromDate':
          valA = a.fromDate ? new Date(a.fromDate).getTime() : 0;
          valB = b.fromDate ? new Date(b.fromDate).getTime() : 0;
          break;

        case 'toDate':
          valA = a.toDate ? new Date(a.toDate).getTime() : 0;
          valB = b.toDate ? new Date(b.toDate).getTime() : 0;
          break;

        case 'days':
          valA = Number(a.days || 0);
          valB = Number(b.days || 0);
          break;

        case 'status':
          valA = (a.status || '').toLowerCase();
          valB = (b.status || '').toLowerCase();
          break;

        case 'reason':
          valA = (a.reason || '').toLowerCase();
          valB = (b.reason || '').toLowerCase();
          break;

        case 'approverRemarks':
          valA = (a.approverRemarks || '').toLowerCase();
          valB = (b.approverRemarks || '').toLowerCase();
          break;

        default:
          valA = a[property];
          valB = b[property];
      }

      if (valA < valB) return newOrder === 'asc' ? -1 : 1;
      if (valA > valB) return newOrder === 'asc' ? 1 : -1;

      // return (b.id || 0) - (a.id || 0); // tie-break
      return 0;
    });


    setFiltered(data);
  };



  //Pagination Logic...
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  const paginatedData = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );




  //   useEffect(() => {
  //   if (currentPage > totalPages) {
  //     setCurrentPage(1);
  //   }
  // }, [currentPage, totalPages]);


  // useEffect(() => {
  //   setCurrentPage(1);
  // }, [filtered.length]);

  console.log("Total rows:", filtered.length);
  console.log("Page size:", pageSize);
  console.log("Total pages:", totalPages);



console.log("Leaves:", leaves);
console.log("Filtered:", filtered);
console.log("Paginated Data:", paginatedData);

  return (
    <Layout>
      <div className="container-fluid projectAccounting leave-page">
        <div className="leave-card">

          <div className="page-header">
            <h2>My Team Leave</h2>
            <button
              type="button"
              className="back-btn"
              onClick={() => window.history.back()}
            >
              <i className="bi bi-chevron-double-left"></i> Back
            </button>
          </div>


          <div className="tableListViewHeader myteam-toolbar">

            {/* LEFT */}
            <div className="toolbar-left">
              {/* <button className="paginator-btn">
                <i className="bi bi-chevron-left"></i>
              </button> */}
              <button
                className="paginator-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              >


                <i className="bi bi-chevron-left"></i>
              </button>


              <select
                className="form-select page-size-dropdown"
                value={pageSize}
                // onChange={(e) => setPageSize(Number(e.target.value))}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>

              {/* <button className="paginator-btn">
                <i className="bi bi-chevron-right"></i>
              </button> */}
              <button
                className="paginator-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              >

                <i className="bi bi-chevron-right"></i>
              </button>

              {/* ✅ PAGE TEXT IS NEXT TO DROPDOWN */}

              <span className="page-indicator-box">
                Current Page: {currentPage}
              </span>

            </div>

            {/* RIGHT */}
            <div className="toolbar-right">
              <select
                className="form-select status-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {/* <option value="">Select Status</option> */}

                <option value="" disabled hidden>
                  Select Status
                </option>

                <option value="PENDING">Applied</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              

              <input
                type="text"
                className="form-control search-input"
                placeholder="Type min 3 characters"
                value={searchInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchInput(value);

                  if (value.trim().length < 3) {
                    setSearch('');
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();

                    if (searchInput.trim().length >= 3) {
                      setSearch(searchInput.trim());
                    }
                  }
                }}
              />

              <button
                type="button"
                className="toolbar-icon-btn"
                onClick={() => {
                  if (searchInput.trim().length >= 3) {
                    setSearch(searchInput.trim());
                  }
                }}
              >
                <i className="bi bi-search"></i>
              </button>
              {/* <button
                className="toolbar-icon-btn file-download-btn"
                onClick={handleDownloadPDF}
                title="Download PDF"
              >
                <i className="bi bi-file-earmark-x"></i>
              </button> */}

              <button
                className="toolbar-icon-btn file-download-btn"
                onClick={handleDownloadExcel}
                title="Download Excel"
              >
                <i className="bi bi-file-earmark-excel"></i>
              </button>

            </div>

          </div>

          <div className="table-responsive" id="leave-table">
            <table className="table custom-table bizx-table myteam-table">
              {/* <thead>
                <tr>
                  <th>Employee No.</th>
                  <th>Employee Name</th>
                  <th>Applied On</th>
                  <th>Leave Type</th>
                  <th>From Date</th>
                  <th>To Date</th>
                  <th>No. of Days</th>
                  <th>Status</th>
                  <th>Request Type</th>
                  <th>Contact Number</th>
                  <th>Reason</th>
                  <th>Approver Remarks</th>
                  <th>Action</th>
                </tr>
              </thead> */}

              <thead>
                <tr>

                  <th>
                    <TableSortLabel
                      active={orderBy === 'userId'}
                      direction={orderBy === 'userId' ? order : 'asc'}
                      onClick={() => handleRequestSort('userId')}
                    >
                      Employee No.
                    </TableSortLabel>
                  </th>

                  <th>
                    <TableSortLabel
                      active={orderBy === 'employee'}
                      direction={orderBy === 'employee' ? order : 'asc'}
                      onClick={() => handleRequestSort('employee')}
                    >
                      Employee Name
                    </TableSortLabel>
                  </th>

                  <th>
                    <TableSortLabel
                      active={orderBy === 'appliedOn'}
                      direction={orderBy === 'appliedOn' ? order : 'asc'}
                      onClick={() => handleRequestSort('appliedOn')}
                    >
                      Applied On
                    </TableSortLabel>
                  </th>

                  <th>
                    <TableSortLabel
                      active={orderBy === 'leaveType'}
                      direction={orderBy === 'leaveType' ? order : 'asc'}
                      onClick={() => handleRequestSort('leaveType')}
                    >
                      Leave Type
                    </TableSortLabel>
                  </th>

                  <th>
                    <TableSortLabel
                      active={orderBy === 'fromDate'}
                      direction={orderBy === 'fromDate' ? order : 'asc'}
                      onClick={() => handleRequestSort('fromDate')}
                    >
                      From Date
                    </TableSortLabel>
                  </th>

                  <th>
                    <TableSortLabel
                      active={orderBy === 'toDate'}
                      direction={orderBy === 'toDate' ? order : 'asc'}
                      onClick={() => handleRequestSort('toDate')}
                    >
                      To Date
                    </TableSortLabel>
                  </th>

                  <th>
                    <TableSortLabel
                      active={orderBy === 'days'}
                      direction={orderBy === 'days' ? order : 'asc'}
                      onClick={() => handleRequestSort('days')}
                    >
                      No. of Days
                    </TableSortLabel>
                  </th>

                  <th>
                    <TableSortLabel
                      active={orderBy === 'status'}
                      direction={orderBy === 'status' ? order : 'asc'}
                      onClick={() => handleRequestSort('status')}
                    >
                      Status
                    </TableSortLabel>
                  </th>

                  <th>
                    <TableSortLabel
                      active={orderBy === 'requestType'}
                      direction={orderBy === 'requestType' ? order : 'asc'}
                      onClick={() => handleRequestSort('requestType')}
                    >
                      Request Type
                    </TableSortLabel>
                  </th>

                  <th>
                    <TableSortLabel
                      active={orderBy === 'phone'}
                      direction={orderBy === 'phone' ? order : 'asc'}
                      onClick={() => handleRequestSort('phone')}
                    >
                      Contact Number
                    </TableSortLabel>
                  </th>

                  <th>
                    <TableSortLabel
                      active={orderBy === 'reason'}
                      direction={orderBy === 'reason' ? order : 'asc'}
                      onClick={() => handleRequestSort('reason')}
                    >
                      Reason
                    </TableSortLabel>
                  </th>

                  <th>
                    <TableSortLabel
                      active={orderBy === 'approverRemarks'}
                      direction={orderBy === 'approverRemarks' ? order : 'asc'}
                      onClick={() => handleRequestSort('approverRemarks')}
                    >
                      Approver Remarks
                    </TableSortLabel>
                  </th>

                  <th>Action</th>

                </tr>
              </thead>



              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="13" className="text-center">Loading</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="13" className="no-data">No Data Found</td>
                  </tr>
                ) : (
                  paginatedData.map((item) => {

                    console.log(item);

                    return (
                      <tr key={item.id}>
                        <td>{item.userId || '-'}</td>

                        <td>{formatName(item.username) || '-'}</td>

                        <td>{formatDate(item.appliedOn)}</td>

                        <td>{item.leaveType}</td>

                        <td>{formatDate(item.fromDate)}</td>

                        <td>{formatDate(item.toDate)}</td>

                        <td>{item.days}</td>

                        {/* <td>
                          <span className={getStatusClass(item.status)}>
                            {normalizeStatus(item.status)}
                          </span>
                        </td> */}
                        <td>
                          <span className={getStatusClass(item.status)}>
                            {formatStatus(normalizeStatus(item))}
                          </span>
                        </td>

                        <td>{getRequestType(item)}</td>
                        <td>{item.phone || '-'}</td>


                        <td>
                          {item.reason ? (
                            <>
                              {expandedRows[item.id]
                                ? item.reason
                                : item.reason.length > 50
                                  ? item.reason.substring(0, 50) + '...'
                                  : item.reason
                              }

                              {item.reason.length > 50 && (
                                <span
                                  className="ms-2 toggle-icon-circle"
                                  onClick={() => toggleReason(item.id)}
                                >
                                  {expandedRows[item.id] ? (
                                    <i className="bi bi-chevron-up"></i>
                                  ) : (
                                    <i className="bi bi-chevron-down"></i>
                                  )}
                                </span>
                              )}
                            </>
                          ) : '-'}
                        </td>

                        {/* <td>{item.approverRemarks || '-'}</td> */}
                        {/* <td>
{(normalizeStatus(item) === 'Applied' || normalizeStatus(item) === 'CANCEL_REQUESTED') && isManager ? (                            <input
                              type="text"
                              className="form-control"
                              placeholder="Remarks"
                              value={remarksMap[item.id] || ''}
                              onChange={(e) =>
                                setRemarksMap(prev => ({
                                  ...prev,
                                  [item.id]: e.target.value
                                }))
                              }
                            />
                          ) : (
                            item.approverRemarks || '-'
                          )}
                        </td> */}

                        <td>
                          {isActionAllowed(item) && isManager ? (
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Remarks"
                              value={remarksMap[item.id] || ''}
                              onChange={(e) =>
                                setRemarksMap(prev => ({
                                  ...prev,
                                  [item.id]: e.target.value
                                }))
                              }
                            />
                          ) : (
                            item.approverRemarks || '-'
                          )}
                        </td>




                        <td>
                          {isManager && (
                            <div className="action-icons">

                              {/* APPROVE */}
                              <button
                                className={`icon-btn ${isActionAllowed(item) ? '' : 'disabled-btn'}`}
                                disabled={!isActionAllowed(item)}
                                onClick={() => {
                                  const status = normalizeStatus(item);

                                  if (status === 'Applied') {
                                    handleApprove(item.id);
                                  } else if (status === 'CANCEL_REQUESTED') {
                                    handleCancelDecision(item.id, 'APPROVE');
                                  }
                                }}
                                title="Approve"
                              >
                                <i className="bi bi-check"></i>
                              </button>

                              {/* REJECT */}
                              <button
                                className={`icon-btn ${isActionAllowed(item) ? '' : 'disabled-btn'}`}
                                disabled={!isActionAllowed(item)}
                                onClick={() => {
                                  const status = normalizeStatus(item);

                                  if (status === 'Applied') {
                                    handleReject(item.id);
                                  } else if (status === 'CANCEL_REQUESTED') {
                                    handleCancelDecision(item.id, 'REJECT');
                                  }
                                }}
                                title="Reject"
                              >
                                <i className="bi bi-x"></i>
                              </button>

                            </div>
                          )}
                        </td>


                      </tr>

                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.action ? null : 10000}
        onClose={(event, reason) => {
          if (reason === 'clickaway') return;
          handleSnackbarClose();
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={handleSnackbarClose}>
          {snackbar.message}
          {snackbar.action}
        </Alert>
      </Snackbar>

    </Layout>
  );
}

export default MyTeamLeave;
