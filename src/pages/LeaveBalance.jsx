import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import API from '../api/api';
import '../styles/leave.css';
import { useLeaveConfig } from '../hooks/useLeaveConfig';

function LeaveBalance() {


  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [history, setHistory] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { leaveTypes, balances } = useLeaveConfig();
  const [user, setUser] = useState({
    username: '',
    employeeId: ''
  });




  useEffect(() => {
    const username = localStorage.getItem('username');
    if (!username) return;


    const fetchHistory = async () => {
      try {
        const histRes = await API.get(`/leave/my/${username}`);
        setHistory(histRes.data || []);

        // ✅ NEW: fetch user details
        const userRes = await API.get(`/users/username/${username}`);
        console.log("USER DATA:", userRes.data);
        setUser(userRes.data);

      } catch (err) {
        console.error(err);
      }
    };


    fetchHistory();
  }, []);

  const getStats = (leaveType) => {
    const currentYear = new Date().getFullYear();

    if (Number(year) !== currentYear) {
      return {
        opening: balances?.[leaveType] ?? 0,
        earned: 0,
        applied: 0,
        approved: 0,
        cancelled: 0,
        available: 0
      };
    }

    const filtered = (history || []).filter((l) => {
      if (!l.fromDate) return false;
      const leaveYear = new Date(l.fromDate).getFullYear();
      return l.leaveType === leaveType && leaveYear === currentYear;
    });

    const getDays = (l) => Number(l.days || 0);

    const approved = filtered
  .filter((l) => l.status === 'APPROVED')
  .reduce((sum, l) => sum + getDays(l), 0);

const applied = filtered
  .filter((l) => ['PENDING', 'APPROVED', 'APPLIED'].includes(l.status))
  .reduce((sum, l) => sum + getDays(l), 0);

const cancelled = filtered
  .filter((l) => l.status === 'CANCELLED')
  .reduce((sum, l) => sum + getDays(l), 0);

let opening;

// ✅ Same Adoption Leave logic as ApplyLeave
if (leaveType === 'Adoption Leave') {
  const gender = (user.gender || '').toUpperCase();

  opening =
    gender === 'MALE'
      ? 5
      : gender === 'FEMALE'
      ? 84
      : 0;
} else {
  opening = balances?.[leaveType] ?? 0;
}

const earned = opening;

// ✅ Same used calculation as ApplyLeave
const used = filtered
  .filter((l) =>
    ['APPROVED', 'PENDING', 'APPLIED'].includes(l.status)
  )
  .reduce((sum, l) => sum + getDays(l), 0);

const available =
  leaveType === 'LOP'
    ? '365'
    : Math.max(0, opening - used);

return {
  opening,
  earned,
  applied,
  approved,
  cancelled,
  available
};
  }
  // const leaveTypes = Object.keys(DEFAULT_BALANCES);

  const filteredHistory = history.filter((item) => {
    if (!selectedType) return false;

    const leaveYear = item.fromDate
      ? new Date(item.fromDate).getFullYear()
      : null;

    return (
      item.leaveType === selectedType &&
      String(leaveYear) === String(year)
    );
  });

  const formatDate = (value) => {
    if (!value) return '-';

    const date = new Date(value);

    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const month = monthNames[date.getMonth()];

    return `${day}-${month}-${year}`;
  };




  const [expandedRows, setExpandedRows] = useState({});

  const toggleReason = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };





  const gender = (user.gender || "").toUpperCase();

  const filteredLeaveTypes = leaveTypes.filter((lt) => {
    if (lt.name === "Maternity Leave") {
      return gender === "FEMALE";
    }

    if (lt.name === "Paternity Leave") {
      return gender === "MALE";
    }

    return true;
  });




  const formatName = (name = '') => {
    return name
      .toLowerCase()
      .split(' ')
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Layout>
      <div className="container-fluid projectAccounting leave-page">
        <div className="leave-card">

          <h2 className="page-title">Leave Balance Summary</h2>

          <div className="year-select">
            <label>Select Year</label>
            <select
              className="form-select year-dropdown"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              {[2026, 2025, 2024].map((y) => (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="table-responsive">
            <table className="table custom-table leave-balance-table bizx-table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Opening Balance</th>
                  <th>Earned</th>
                  <th>Applied</th>
                  <th>Approved</th>
                  <th>Cancelled</th>
                  <th>Available Leave Balance</th>
                </tr>
              </thead>

              <tbody>
                {/* {leaveTypes.map((type) => {
                  const { opening, earned, applied, approved, cancelled, available } =
                    getStats(type);

                  return (
                    <tr key={type}>
                      {/* <td><span className="leave-type-link">{type}</span></td> *
                      <td>
                        <span
                          className="leave-type-link"
                          style={{ cursor: 'pointer', color: '#007bff' }}
                          onClick={() => {
                            setSelectedType(type);
                            setShowModal(true);
                          }}
                        >
                          {type}
                        </span>
                      </td>
                      <td>{opening}</td>
                      <td><span className="earned-value">{earned}</span></td>
                      <td>{applied}</td>
                      <td>{approved}</td>
                      <td>{cancelled}</td>
                      <td><strong>{available}</strong></td>
                    </tr>
                  );
                })} */}

                {filteredLeaveTypes.map((lt) => {
                  const type = lt.name;   //  extract name
                  const { opening, earned, applied, approved, cancelled, available } = getStats(type);

                  return (
                    <tr key={type}>
                      <td>
                        <span
                          className="leave-type-link"
                          style={{ cursor: 'pointer', color: '#007bff' }}
                          onClick={() => {
                            setSelectedType(type);
                            setShowModal(true);
                          }}
                        >
                          {type}
                        </span>
                      </td>
                      <td>{opening}</td>
                      <td><span className="earned-value">{earned}</span></td>
                      <td>{applied}</td>
                      <td>{approved}</td>
                      <td>{cancelled}</td>
                      <td><strong>{available}</strong></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">

            <div className="modal-header">
              <h4>Leave Summary Details</h4>
              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ✖
              </button>
            </div>

            <div className="modal-info">
              <div>
                <strong>Employee Number</strong> : {user.id || '-'}

              </div>
              <div>
                <strong>Employee Name</strong> : {formatName(localStorage.getItem('username'))}
              </div>
            </div>


            <div className="table-responsive">
              <table className="table custom-table bizx-table">
                <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>From Date</th>
                    <th>To Date</th>
                    <th>No. of Days</th>
                    <th>Status</th>
                    <th>Remarks</th>
                    <th>Applied On</th>
                    <th>Approval Remarks</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center no-data">
                        No data found...
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((item) => (
                      <tr key={item.id}>

                        <td>{item.leaveType}</td>
                        <td>{formatDate(item.fromDate)}</td>
                        <td>{formatDate(item.toDate)}</td>

                        <td>{item.days}</td>

                        <td>
                          <span className={
                            item.status === 'APPROVED' ? 'status-approved'
                              : item.status === 'REJECTED' ? 'status-rejected'
                                : item.status === 'CANCELLED' ? 'status-cancelled'
                                  : 'status-pending'
                          }>
                            {item.status === 'PENDING'
                              ? 'Applied'
                              : item.status === 'CANCEL_REQUESTED'
                                ? 'Cancel Requested'
                                : item.status.charAt(0) + item.status.slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td>
                          {item.reason ? (
                            <>
                              {expandedRows[item.id]
                                ? item.reason
                                : item.reason.length > 50
                                  ? item.reason.substring(0, 50) + '...'
                                  : item.reason}

                              {item.reason.length > 50 && (
                                <span
                                  className="ms-2 toggle-icon-circle"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => toggleReason(item.id)}
                                >
                                  {expandedRows[item.id] ? '▲' : '▼'}
                                </span>
                              )}
                            </>
                          ) : '-'}
                        </td>

                        <td>
                          {item.appliedOn
                            ? new Date(item.appliedOn).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: '2-digit'
                            })
                            : '-'}
                        </td>

                        {/* ✅ Approval Remarks */}
                        <td>{item.approverRemarks || '-'}</td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}
    </Layout>
  );
}

export default LeaveBalance;
