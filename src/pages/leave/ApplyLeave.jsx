
import dayjs from "dayjs";

import { useState, useEffect, useCallback } from 'react';
import TableSortLabel from '@mui/material/TableSortLabel';
import Box from '@mui/material/Box';
import { visuallyHidden } from '@mui/utils';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { Snackbar, Alert, Button } from '@mui/material';
import { FaUndo, FaPaperPlane } from "react-icons/fa";
import { FaRegCalendarDays } from "react-icons/fa6";

import Layout from '../../components/Layout';
import API from '../../api/api';
import { formatFullName, formatName } from '../../utils/formatters';
import '../../styles/leave.css';
import { useLeaveConfig } from '../../hooks/useLeaveConfig';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import Select from "react-select";





function calculateAdoptionLeaveDays(from, to, holidays) {
  if (!from || !to) return 0;

  const holidaySet = new Set(holidays);

  const start = new Date(from);
  const end = new Date(to);

  let count = 0;
  let cur = new Date(start);

  while (cur <= end) {
    const day = cur.getDay();
    const dateStr = cur.toISOString().split("T")[0];

    // Count holidays
    if (holidaySet.has(dateStr)) {
      count++;
    }
    // Count Mon-Fri
    else if (day !== 0 && day !== 6) {
      count++;
    }

    cur.setDate(cur.getDate() + 1);
  }

  return count;
}

//Leave Days Calculation Logic....
function calculateDays(from, to, session, holidays) {
  if (!from || !to) return 0;

  const start = new Date(from);

  const end = new Date(to);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  if (start > end) return 0;

  const holidaySet = new Set(holidays);

  let count = 0;
  let cur = new Date(start);

  while (cur <= end) {
    const d = cur.getDay();
    const dateStr = cur.toISOString().split('T')[0];

    if (d !== 0 && d !== 6 && !holidaySet.has(dateStr)) {
      count++;
    }
    cur.setDate(cur.getDate() + 1);
  }

  if (count === 1 && (session === 'FIRST_HALF' || session === 'SECOND_HALF')) {
    return 0.5;
  }

  return count;
}

// LOP logic ....

function applyLOPPolicy(from, to, workingDays, holidays) {
  if (!from || !to) return workingDays;

  const holidaySet = new Set(holidays);
  let totalDays = workingDays;

  const start = new Date(from);
  const end = new Date(to);

  const isSameDay = start.getTime() === end.getTime();


  //  Friday Rule....
  if (isSameDay && workingDays === 1) {
    const day = start.getDay();

    if (day === 5) {
      return 2;
    }
  }


  let cur = new Date(start);
  let weekMap = {};
  let leaveDates = new Set();

  while (cur <= end) {
    const dateStr = cur.toISOString().split('T')[0];
    leaveDates.add(dateStr);
    cur.setDate(cur.getDate() + 1);
  }

  cur = new Date(start);

  while (cur <= end) {
    const d = cur.getDay();
    const dateStr = cur.toISOString().split('T')[0];
    const weekKey = `${cur.getFullYear()}-${cur.getMonth()}-${Math.floor(cur.getDate() / 7)}`;

    if (d !== 0 && d !== 6 && !holidaySet.has(dateStr)) {
      weekMap[weekKey] = (weekMap[weekKey] || 0) + 1;
    }
    cur.setDate(cur.getDate() + 1);
  }


  //Weekly Rule.....
  Object.values(weekMap).forEach((count) => {
    if (count >= 4) {
      totalDays += 2;
    } else if (count >= 2 && count <= 3) {
      totalDays += 1;
    }
  });

  let check = new Date(start);

  while (check <= end) {
    const day = check.getDay();

    if (day === 0) {
      const fri = new Date(check);
      fri.setDate(check.getDate() - 2);

      const mon = new Date(check);
      mon.setDate(check.getDate() + 1);

      const friStr = fri.toISOString().split('T')[0];
      const monStr = mon.toISOString().split('T')[0];

      //Sandwich Rule  ....
      if (leaveDates.has(friStr) && leaveDates.has(monStr)) {
        totalDays += 1;
      }

    }
    check.setDate(check.getDate() + 1);
  }


  // 16+ Days Rule .....
  if (totalDays >= 16) {
    let cur2 = new Date(start);
    while (cur2 <= end) {
      const dateStr = cur2.toISOString().split('T')[0];
      if (holidaySet.has(dateStr)) {
        totalDays++;
      }
      cur2.setDate(cur2.getDate() + 1);
    }
  }

  return totalDays;
}
const safeCreatedTime = (value) => {
  if (!value) return 0;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? 0 : t;
};

//Sorting Logic fifo
const compareNewestFirst = (a, b) => {
  const ta = safeCreatedTime(a.createdAt);
  const tb = safeCreatedTime(b.createdAt);

  if (ta !== tb) return tb - ta;

  const ida = Number(a.sortId ?? a.id) || 0;
  const idb = Number(b.sortId ?? b.id) || 0;
  return idb - ida;
};

const sortByLatest = (data) => {
  return [...data].sort(compareNewestFirst);
};


function ApplyLeave() {

  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);


  const [isCancelMode, setIsCancelMode] = useState(false);
  const [cancelLeaveId, setCancelLeaveId] = useState(null);

  const isFormLocked = isCancelMode;


  const getRequestType = (item) => {
    return item.requestType === 'CANCEL'
      ? 'Cancel Request'
      : 'Leave Request';
  };

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
    action: null
  });

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


  const [ccSearch, setCcSearch] = useState('');
  const [ccSuggestions, setCcSuggestions] = useState([]);
  const [selectedCC, setSelectedCC] = useState([]);

  const [leaveType, setLeaveType] = useState('');
  const [history, setHistory] = useState([]);
  const [days, setDays] = useState(0);



  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";

    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };


  const { leaveTypes, holidays, balances } = useLeaveConfig();
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    fromDate: '',
    toDate: '',
    address: '',
    reason: '',
    session: 'FULL',


    adoptionDate: '',
    childAgeInMonths: '',
    adoptionDocument: ''

  });

  const [user, setUser] = useState({
    username: '',
    manager: '',
    phone: '',
    gender: ''
  });





  useEffect(() => {
    const username = localStorage.getItem('username');
    if (!username) return;

    const fetchData = async () => {
      try {
        const userRes = await API.get(`/users/username/${username}`);
        console.log("USER API RESPONSE ", userRes.data);
        const histRes = await API.get(`/leave/my/${username}`);
        console.log("Leave History", histRes.data);

        setUser(userRes.data);

        const historyData = sortByLatest(
          (histRes.data || []).flatMap(item => {

            const base = {
              ...item,
              leaveType: (item.leaveType || "").trim(),
              fromDate: item.fromDate || "",
              toDate: item.toDate || "",
              reason: item.reason || "",
              address: item.address || "",
              dayType: item.dayType || "FULL",
              days: Number(item.days || 0),
              createdAt: item.createdAt || null,
              sortId: Number(item.id) || 0,
              approverRemarks: item.approverRemarks
            };

            // Leave Applied
            if (item.status === "APPLIED" || item.status === "PENDING") {
              return [
                {
                  ...base,
                  requestType: "LEAVE",
                  displayStatus: "Applied"
                }
              ];
            }

            // Employee requested cancellation
            if (item.status === "CANCEL_REQUESTED") {
              return [

                {
                  ...base,
                  id: `${item.id}-leave`,
                  requestType: "LEAVE",
                  displayStatus: "Cancelled"
                },

                {
                  ...base,
                  id: `${item.id}-cancel`,
                  requestType: "CANCEL",
                  displayStatus: "Applied"
                }

              ];
            }

            // Manager approved cancellation
            if (item.status === "CANCELLED") {
              return [
                {
                  ...base,
                  requestType: "CANCEL",
                  displayStatus: "Approved"
                }
              ];
            }

            // Approved Leave
            if (item.status === "APPROVED") {
              return [
                {
                  ...base,
                  requestType: "LEAVE",
                  displayStatus: "Approved"
                }
              ];
            }

            // Rejected Leave
            if (item.status === "REJECTED") {
              return [
                {
                  ...base,
                  requestType: "LEAVE",
                  displayStatus: "Rejected"
                }
              ];
            }

            return [
              {
                ...base,
                requestType: "LEAVE",
                displayStatus: normalizeStatus(item.status)
              }
            ];

          })
        );

        setHistory(historyData);


        // setHistory(historyData);


      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);


  //Working Days Calculation ....

  const getWorkingDaysCount = useCallback((from, to) => {
    if (!from || !to) return 0;

    const start = new Date(from);
    const end = new Date(to);
    if (start > end) return 0;

    const holidaySet = new Set(holidays);
    let count = 0;
    let current = new Date(start);

    while (current <= end) {
      const d = current.getDay();
      const dateStr = current.toISOString().split('T')[0];

      if (d !== 0 && d !== 6 && !holidaySet.has(dateStr)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }, [holidays]);


  //Used Leaves Calculation ....

  const getUsedLeaves = (type) => {
    if (!type) return 0;

    return history
      .filter(l =>
        l.leaveType === type &&
        ['APPROVED', 'PENDING', 'APPLIED'].includes(l.status)
      )
      .reduce((sum, l) => sum + Number(l.days || 0), 0);
  };


  // Session enabled only for one working day
  const isSingleWorkingDay =
    getWorkingDaysCount(
      form.fromDate,
      form.toDate
    ) === 1;


  useEffect(() => {
    let calculatedDays = 0;

    if (leaveType === 'LOP') {
      const workingDays = getWorkingDaysCount(form.fromDate, form.toDate);

      calculatedDays = applyLOPPolicy(
        form.fromDate,
        form.toDate,
        workingDays,
        holidays
      );

      if (calculatedDays >= 16) {
        console.log('Public holidays will be counted as LOP');
      }
    }
    else if (leaveType === 'Maternity Leave') {

      calculatedDays = getTotalDays(
        form.fromDate,
        form.toDate
      );

    }
    else if (leaveType === 'Adoption Leave') {

      calculatedDays = calculateAdoptionLeaveDays(
        form.fromDate,
        form.toDate,
        holidays
      );

    }

    else {
      calculatedDays = calculateDays(
        form.fromDate,
        form.toDate,
        form.session,
        holidays
      );
    }

    setDays(calculatedDays);

    const workingDays = getWorkingDaysCount(form.fromDate, form.toDate);

    if (workingDays !== 1 && form.session !== 'FULL') {
      setForm(prev => ({ ...prev, session: 'FULL' }));
    }


  }, [form.fromDate, form.toDate, form.session, leaveType, holidays, getWorkingDaysCount]);




  //Leave Balance Logic ....
  const getLeaveBalance = () => {
    if (!leaveType) return 0;

    if (leaveType === "Adoption Leave") {
      const gender = (user.gender || "").toUpperCase();

      const openingBalance =
        gender === "MALE"
          ? 5
          : gender === "FEMALE"
            ? 84
            : 0;

      const used = getUsedLeaves("Adoption Leave");

      return Math.max(0, openingBalance - used);
    }

    let opening = balances[leaveType] ?? 0;
    const used = getUsedLeaves(leaveType);

    return Math.max(0, opening - used);
  };

  const currentBalance = getLeaveBalance();

  useEffect(() => {
    if (!leaveType || days <= 0) return;

    if (
      !['LOP', 'Maternity Leave', 'Adoption Leave'].includes(leaveType) &&
      days > currentBalance
    ) {
      showSnackbar(
        `Insufficient ${leaveType} balance. Available: ${currentBalance}`,
        'error'
      );
    }

  }, [days, leaveType, currentBalance]);

  // ── Normalize status display ──────
  const normalizeStatus = (status) => {
    switch (status) {
      case "PENDING":
      case "APPLIED":
      case "CANCEL_REQUESTED":
        return "Applied";

      case "APPROVED":
        return "Approved";

      case "REJECTED":
        return "Rejected";

      case "CANCELLED":
        return "Cancelled";

      default:
        return status
          ?.toLowerCase()
          .split("_")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
    }
  };


  const handleSubmit = async (e) => {



    e.preventDefault();




    let newErrors = {};

    if (!leaveType) newErrors.leaveType = true;
    if (!form.fromDate) newErrors.fromDate = true;
    if (!form.toDate) newErrors.toDate = true;
    if (!form.address) newErrors.address = true;
    if (!form.reason) newErrors.reason = true;

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      showSnackbar('Please fill all required fields', 'error');
      return;
    }

    const isOnNoticePeriod = false;

    if (isOnNoticePeriod && leaveType !== 'LOP') {
      showSnackbar('Leave not allowed during notice period', 'error');
      return;
    }



    const hasPendingCancellation = history.some(item =>
      item.fromDate === form.fromDate &&
      item.toDate === form.toDate &&
      item.status === 'CANCEL_REQUESTED'
    );

    if (hasPendingCancellation) {
      showSnackbar(
        'You have already applied for leave cancellation on the selected date',
        'error'
      );
      return;
    }

    if (isCancelMode) {
      showSnackbar(
        "Are you sure you want to cancel this leave?",
        "warning",
        <>
          <Button
            color="inherit"
            size="small"
            onClick={async () => {
              handleSnackbarClose();

              try {
                await API.put(`/leave/request-cancel/${cancelLeaveId}`);

                // setHistory(prev =>
                //   prev.map(item =>
                //     item.id === cancelLeaveId
                //       ? { ...item, status: 'CANCEL_REQUESTED' }
                //       : item
                //   )
                // );


                setHistory(prev => {
                  const original = prev.find(item => item.id === cancelLeaveId);

                  if (!original) return prev;

                  const cancelRow = {
                    ...original,
                    id: `${original.id}-cancel-${Date.now()}`,
                    status: 'CANCEL_REQUESTED',
                    requestType: 'CANCEL',
                    createdAt: new Date().toISOString(),
                    sortId: Date.now()
                  };
                  return sortByLatest([
                    cancelRow,
                    ...prev
                  ]);
                });


                showSnackbar('Cancellation Request Sent', "success");

                // Reset everything
                setIsCancelMode(false);
                setCancelLeaveId(null);
                handleReset();

              } catch {
                showSnackbar('Failed to cancel leave', "error");
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

      return;
    }


    const isDuplicate = history.some(item =>
      item.leaveType === leaveType &&
      item.fromDate === form.fromDate &&
      item.toDate === form.toDate &&
      [
        'PENDING',
        'APPLIED',
        'APPROVED',
        'CANCEL_REQUESTED'
      ].includes(item.status)
    );

    if (isDuplicate) {
      showSnackbar(
        'You already applied leave for the same date range.',
        'warning'
      );
      return;
    }
    if (leaveType !== 'LOP' && days === 0) {
      showSnackbar('Selected dates fall on weekends or holidays.', "warning");
      return;
    }

    const currentBal = getLeaveBalance();

    if (!['LOP', 'Maternity Leave', 'Adoption Leave'].includes(leaveType) && days > currentBal) {
      showSnackbar(`Insufficient ${leaveType} balance. Available: ${currentBal}`, "error");
      return;
    }

    //  LOP Max 365 days validation
    if (leaveType === 'LOP' && days > 365) {
      showSnackbar('LOP cannot exceed 365 days in a single application', 'error');
      return;
    }


    const totalDays = getTotalDays(form.fromDate, form.toDate);

    if (leaveType === 'LOP' && totalDays > 365) {
      showSnackbar('Date range cannot exceed 365 days for LOP', 'error');
      return;
    }


    //  Paternity Leave rules
    if (leaveType === 'Paternity Leave') {
      if (form.session !== 'FULL') {
        showSnackbar('Paternity leave cannot be half-day', 'error');
        return;
      }

      //  must be within 90 days from child birth
      const birthDate = user.childBirthDate;

      if (birthDate) {
        const diffDays = dayjs(form.fromDate).diff(dayjs(birthDate), 'day');

        if (diffDays > 90) {
          showSnackbar('Paternity leave must be taken within 90 days from child birth', 'error');
          return;
        }
      }
    }


    // Adoption Leave Rules
    if (leaveType === 'Adoption Leave') {

      const gender =
        (user.gender || '').toUpperCase();

      const adoptionDays = calculateAdoptionLeaveDays(
        form.fromDate,
        form.toDate,
        holidays
      );

      if (gender === 'MALE') {

        if (adoptionDays > 5) {
          showSnackbar(
            'Maximum 5 working days allowed',
            'error'
          );
          return;
        }
      }

      if (gender === 'FEMALE') {

        if (adoptionDays > 84) {
          showSnackbar(
            'Maximum 84 days allowed',
            'error'
          );
          return;
        }
      }
    }
    //  Bereavement Leave rules
    if (leaveType === 'Bereavement Leave') {
      if (days > 3) {
        showSnackbar('Bereavement leave cannot exceed 3 days', 'error');
        return;
      }
    }

    // Sick Leave rule
    if (leaveType === 'Casual / Sick Leave' && days > 3) {
      showSnackbar('Medical certificate required for more than 3 days', 'warning');
    }
    // Maternity leave rukles 
    if (leaveType === 'Maternity Leave') {

      if (form.session !== 'FULL') {
        showSnackbar('Maternity leave cannot be half-day', 'error');
        return;
      }


      if (totalDays > 182) {
        showSnackbar('Maternity leave cannot exceed 182 days', 'error');
        return;
      }

      if (totalDays < 1) {
        showSnackbar('Invalid maternity leave duration', 'error');
        return;
      }

      const alreadyApplied = history.some(item =>
        item.leaveType === 'Maternity Leave' &&
        ['PENDING', 'APPROVED', 'APPLIED'].includes(item.status)
      );

      if (alreadyApplied) {
        showSnackbar('Maternity leave already applied', 'error');
        return;
      }

      const childrenCount = user.childrenCount || 0;

      if (childrenCount >= 2 && totalDays > 84) {
        showSnackbar('Max 12 weeks allowed if you have 2 or more children', 'error');
        return;
      }



      if (user.joiningDate) {
        const daysWorked = dayjs(form.fromDate).diff(dayjs(user.joiningDate), 'day');

        if (daysWorked < 80) {
          showSnackbar('You must complete 80 days of service', 'error');
          return;
        }
      }

      if (user.expectedDeliveryDate) {
        const diff = dayjs(user.expectedDeliveryDate).diff(dayjs(form.fromDate), 'day');

        if (diff > 56) {
          showSnackbar('Pre-natal leave cannot exceed 8 weeks', 'error');
          return;
        }
      }

      // if (!form.medicalDocUploaded) {
      //   showSnackbar('Please upload medical documents', 'error');
      //   return;
      // }
    }

    const isOverlap = history.some(item => {
      if (
        ![
          'PENDING',
          'APPROVED',
          'APPLIED',
          'CANCEL_REQUESTED'
        ].includes(item.status)
      ) {
        return false;
      }

      if (!item.fromDate || !item.toDate) return false;

      const existingStart = new Date(item.fromDate);
      const existingEnd = new Date(item.toDate);
      const newStart = new Date(form.fromDate);
      const newEnd = new Date(form.toDate);

      return newStart <= existingEnd && newEnd >= existingStart;
    });

    if (isOverlap) {
      showSnackbar(
        'You already have a PENDING/APPROVED leave in this date range.',
        "warning"
      );
      return;
    }

    //  CONFIRM SNACKBAR
    showSnackbar(
      "Are you sure you want to apply leave?",
      "warning",
      <>
        <Button
          color="inherit"
          size="small"
          onClick={async () => {
            handleSnackbarClose();

            try {
              await API.post('/leave/apply', {
                username: user.username,
                leaveType,
                fromDate: form.fromDate,
                toDate: form.toDate,
                reason: form.reason,
                address: form.address,
                dayType: form.session,
                days: days,

                // adoptionDate: form.adoptionDate,
                // childAgeInMonths: form.childAgeInMonths,
                // adoptionDocument: form.adoptionDocument,

                ccUsers: selectedCC.map(u => u.id)
              });

              showSnackbar('Leave Applied Successfully', "success");

              setLeaveType('');
              setForm({
                fromDate: '',
                toDate: '',
                address: '',
                reason: '',
                session: 'FULL',
                // adoptionDate: '',
                // childAgeInMonths: '',
                // adoptionDocument: ''

              });
              setDays(0);
              setSelectedCC([]);
              setCcSearch('');
              setCcSuggestions([]);
              setExpandedRows({});

              const res = await API.get(`/leave/my/${user.username}`);
              console.log("After Apply", res.data);

              const fetched = res.data || [];



              const newHistory = fetched.flatMap(item => {


                const base = {
                  ...item,
                  leaveType: (item.leaveType || '').trim(),
                  fromDate: item.fromDate || '',
                  toDate: item.toDate || '',
                  status: item.status || '',
                  reason: item.reason || '',
                  address: item.address || '',
                  dayType: item.dayType || 'FULL',
                  days: Number(item.days || 0),
                  createdAt: item.createdAt || null,
                  sortId: Number(item.id) || 0
                };




                if (item.status === "CANCEL_REQUESTED") {
                  return [
                    {
                      ...base,
                      id: `${item.id}-leave`,
                      requestType: "LEAVE",
                      displayStatus: "Applied"
                    },
                    {
                      ...base,
                      id: `${item.id}-cancel`,
                      requestType: "CANCEL",
                      displayStatus: "Applied"
                    }
                  ];
                }

                if (item.status === "CANCELLED") {
                  return [
                    {
                      ...base,
                      id: `${item.id}-leave`,
                      requestType: "LEAVE",
                      displayStatus: "Cancelled"
                    }
                  ];
                }

                return [
                  {
                    ...base,
                    requestType: 'LEAVE'
                  }
                ];
              });

              setHistory(sortByLatest(newHistory));

            } catch (error) {
              console.error("Apply Leave Error:", error);
              console.error("Response:", error?.response?.data);

              showSnackbar(
                error?.response?.data?.message ||
                error?.response?.data ||
                'Failed to apply leave',
                'error'
              );
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

    return;
  };

  // ── Reset ──────────────────────────────────────────────────
  const handleReset = () => {
    setLeaveType('');
    setForm({
      fromDate: '', toDate: '', address: '', reason: '', session: 'FULL',
      // adoptionDate: '',
      // childAgeInMonths: '',
      // adoptionDocument: ''
    });
    setDays(0);

    setCcSearch('');
    setCcSuggestions([]);
    setSelectedCC([]);
    setExpandedRows({});


    setIsCancelMode(false);
    setCancelLeaveId(null);


  };




  const handleCancel = (item) => {

    // Fill form with selected leave data
    setLeaveType(item.leaveType);


    setForm({
      fromDate: item.fromDate,
      toDate: item.toDate,
      address: item.address ?? '',
      reason: item.reason ?? '',
      session: item.dayType || 'FULL',

      // adoptionDate: item.adoptionDate || '',
      // childAgeInMonths: item.childAgeInMonths || '',
      // adoptionDocument: item.adoptionDocument || ''

    });



    setDays(item.days || 0)

    setIsCancelMode(true);
    setCancelLeaveId(item.id);


    window.scrollTo({ top: 0, behavior: 'smooth' });

    // showSnackbar('Edit details and confirm cancel', 'info');
  };

  const formatDate = (value) => {
    if (!value) return '-';

    const date = new Date(value);

    const day = date.getDate().toString().padStart(2, '0');   // 01-31
    const year = date.getFullYear().toString().slice(-4);     // 26

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const month = monthNames[date.getMonth()];

    return `${day}-${month}-${year}`; // 10-Jun-26
  };



  const fetchCCUsers = async (value) => {
    if (value.trim().length < 3) {
      setCcSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8080/users/search?keyword=${encodeURIComponent(value)}`
      );

      const data = await res.json();

      setCcSuggestions(data || []);
    } catch (error) {
      console.error("CC Search error:", error);
      setCcSuggestions([]);
    }
  };

  // const handleCCChange = (e) => {
  //   const value = e.target.value;


  //   setCcSearch(value);

  //   if (value.trim().length < 3) {
  //     setCcSuggestions([]);
  //   }
  // };
  const handleCCChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");

    setCcSearch(value);

    if (value.trim().length < 3) {
      setCcSuggestions([]);
    }
  };

  const handleCCSearch = () => {
    if (ccSearch.trim().length < 3) {
      setCcSuggestions([]);
      return;
    }

    fetchCCUsers(ccSearch);
  };

  // Avoid duplicates
  const handleSelectCC = (user) => {
    if (isCancelMode) return;

    if (selectedCC.some(u => u.id === user.id)) return;

    setSelectedCC([...selectedCC, user]);
    setCcSearch('');
    setCcSuggestions([]);
  };

  const removeCC = (id) => {
    if (isCancelMode) return;

    setSelectedCC(selectedCC.filter(u => u.id !== id));
  };



  const [expandedRows, setExpandedRows] = useState({});
  const toggleReason = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };




  const gender = (user.gender || "").toUpperCase();


  // leave Options based on Gender  nd leave types ....
  const leaveOptions = leaveTypes
    .filter((lt) => {
      if (lt.name === "Maternity Leave") {
        return gender === "FEMALE";
      }

      if (lt.name === "Paternity Leave") {
        return gender === "MALE";
      }

      return true;
    })
    .map((lt) => ({
      value: lt.name,
      label: lt.name
    }));







  const CustomOption = (props) => {
    const { data, isSelected, isFocused } = props;






    return (
      <div
        {...props.innerProps}
        style={{
          padding: "12px 15px",
          backgroundColor: isSelected
            ? "#cfcfcf"
            : isFocused
              ? "#e6e6e6"
              : "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "11px"
        }}
      >
        <span style={{ color: isSelected ? "#3f51b5" : "#000" }}>
          {data.label}
        </span>

        {isSelected && (
          <span style={{ color: "#3f51b5", fontSize: "18px" }}>✔</span>
        )}
      </div>
    );
  };




  const getApproverRemarks = (item) => {


    if (item.status === 'PENDING' || item.status === 'APPLIED') {
      return '';
    }

    if (item.status === 'CANCEL_REQUESTED') {
      return '';
    }

    if (item.status === 'APPROVED' || item.status === 'REJECTED' || item.status === 'CANCELLED') {
      return item.approverRemarks || '-';
    }

    return '-';
  };





  const shouldDisableToDate = (date) => {
    if (!date || !form.fromDate) return false;

    return date.isBefore(dayjs(form.fromDate), "day");
  };

  //half-day is  not allowed for this leave types ....
  const isHalfDayAllowed =
    isSingleWorkingDay &&
    !['Paternity Leave', 'Bereavement Leave', 'LOP', 'Maternity Leave', 'Adoption Leave'].includes(leaveType);


  // Total Days ....
  function getTotalDays(from, to) {
    if (!from || !to) return 0;

    const start = new Date(from);
    const end = new Date(to);

    let count = 0;
    let cur = new Date(start);

    while (cur <= end) {
      count++;
      cur.setDate(cur.getDate() + 1);
    }

    return count;
  }


  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      fontSize: '11px',   //  input font size
    }),
    singleValue: (provided) => ({
      ...provided,
      fontSize: '11px',   //  selected value text
    }),
    option: (provided) => ({
      ...provided,
      fontSize: '11px',   //  dropdown option text
    }),
    menu: (provided) => ({
      ...provided,
      fontSize: '11px',   //  dropdown menu
    })
  };


  const toTitleCase = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };


  const totalPages = Math.ceil(history.length / pageSize) || 1;


  //table Sorting Logic
  const sortedHistory = [...history].sort((a, b) => {
    let valA;
    let valB;

    switch (orderBy) {
      case "leaveType":
        valA = (a.leaveType || "").toLowerCase();
        valB = (b.leaveType || "").toLowerCase();
        break;

      case "fromDate":
        valA = safeCreatedTime(a.fromDate);
        valB = safeCreatedTime(b.fromDate);
        break;

      case "toDate":
        valA = safeCreatedTime(a.toDate);
        valB = safeCreatedTime(b.toDate);
        break;
      case "status":
        valA = (a.status || "").toLowerCase();
        valB = (b.status || "").toLowerCase();
        break;

      case "requestType":
        valA = (getRequestType(a) || "").toLowerCase();
        valB = (getRequestType(b) || "").toLowerCase();
        break;

      case "days":
        valA = Number(a.days || 0);
        valB = Number(b.days || 0);
        break;

      case "reason":
        valA = (a.reason || "").toLowerCase();
        valB = (b.reason || "").toLowerCase();
        break;

      case "createdAt":
      default:
        if (order === 'asc') {
          return -compareNewestFirst(a, b);
        }
        return compareNewestFirst(a, b);
    }

    if (valA < valB) return order === "asc" ? -1 : 1;
    if (valA > valB) return order === "asc" ? 1 : -1;

    // Tie-break: newest always first
    return compareNewestFirst(a, b);
  });
  const paginatedHistory = sortedHistory.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(history.length / pageSize));

    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [history, pageSize, currentPage]);




  const isCancelAlreadyRequested = (item) => {
    if (item.requestType === 'CANCEL') return false;
    return history.some(h =>
      h.requestType === 'CANCEL' &&
      h.fromDate === item.fromDate &&
      h.toDate === item.toDate &&
      h.leaveType === item.leaveType
    );
  };




  const showSession =
    isSingleWorkingDay &&
    ![
      'Paternity Leave',
      'Bereavement Leave',
      'LOP',
      'Maternity Leave',
      'Adoption Leave'
    ].includes(leaveType);

  return (
    <Layout>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className="container-fluid projectAccounting leave-page">
          <div className="leave-card">

            <div className="page-header">
              <h2>Apply Leave</h2>
              <button type="button" className="back-btn" onClick={() => window.history.back()}>
                <i className="bi bi-chevron-double-left"></i> Back
              </button>
            </div>

            <form onSubmit={handleSubmit} className="form cust-from">
              <div className="row">

                <div className="col-md-3 mb-3">
                  <label className="form-label">Employee Name <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    // value={formatName(user.username)}
                    value={`${toTitleCase(user.firstname)} ${toTitleCase(user.lastname)}`}

                    readOnly
                  />
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label">Leave Type <span className="required">*</span></label>


                  <Select
                    isDisabled={isFormLocked}
                    options={leaveOptions}
                    value={leaveOptions.find(o => o.value === leaveType) || null}
                    placeholder="Select"
                    onChange={(option) => {
                      const selectedLeave = option?.value || "";

                      setLeaveType(selectedLeave);

                      //  RESET form when leave type changes
                      setForm({
                        fromDate: '',
                        toDate: '',
                        address: '',
                        reason: '',
                        session: 'FULL',
                        // adoptionDate: '',
                        // childAgeInMonths: '',
                        // adoptionDocument: ''

                      });

                      setDays(0);

                      // clear errors
                      setErrors({});

                      // optional: clear CC
                      setSelectedCC([]);
                      setCcSearch('');
                      setCcSuggestions([]);
                    }}
                    components={{ Option: CustomOption }}
                    styles={{
                      ...customSelectStyles,
                      control: (provided) => ({
                        ...provided,
                        borderColor: errors.leaveType ? 'red' : provided.borderColor,
                      })
                    }}
                  />

                </div>



                {leaveType !== 'LOP' && (
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Leave Balance (in Days)</label>
                    {/* <input
                        type="text"
                        className="form-control"
                        // value={getLeaveBalance()}
                        value={getLeaveBalance() || ''}
                        placeholder=" Leave Balance"
                        readOnly
                      /> */}
                    <input
                      type="text"
                      className="form-control"
                      value={leaveType ? getLeaveBalance() : ''}
                      placeholder="Leave Balance"
                      readOnly
                    />
                  </div>
                )}




                <div className="col-md-3 mb-3">
                  <label className="form-label">From Date <span className="required">*</span></label>

                  <DatePicker
                    disabled={isFormLocked}
                    key={`from-${leaveType}-${form.fromDate}`}

                    format="DD-MM-YYYY"
                    value={form.fromDate ? dayjs(form.fromDate) : null}

                    onChange={(newValue) => {
                      setErrors(prev => ({ ...prev, fromDate: false }));

                      setForm(prev => ({
                        ...prev,
                        fromDate:
                          newValue && newValue.isValid()
                            ? newValue.format("YYYY-MM-DD")
                            : "",
                        toDate: ""
                      }));

                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        placeholder: "Select a Date",
                        error: !!errors.fromDate
                      }
                    }}
                  />
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label">To Date <span className="required">*</span></label>


                  <DatePicker
                    disabled={isFormLocked}
                    key={`to-${leaveType}-${form.toDate}`}

                    format="DD-MM-YYYY"
                    value={form.toDate ? dayjs(form.toDate) : null}
                    shouldDisableDate={shouldDisableToDate}
                    onChange={(newValue) => {
                      setErrors(prev => ({ ...prev, toDate: false }));
                      if (!leaveType) {
                        showSnackbar("Please select Leave Type first", "warning");
                        return;
                      }

                      setForm(prev => ({
                        ...prev,
                        toDate:
                          newValue && newValue.isValid()
                            ? newValue.format("YYYY-MM-DD")
                            : ""
                      }));
                    }}

                    slotProps={{
                      textField: {
                        fullWidth: true,
                        placeholder: "Select a Date",
                        error: !!errors.toDate
                      }
                    }}
                  />


                </div>

                {/*  Session — only enabled when exactly 1 working day */}
                {/* <div className="col-md-3 mb-3">
                  <label className="form-label">
                    Session
                    {!isSingleWorkingDay && form.fromDate && form.toDate && (
                      <small className="text-muted ms-2">(only for single day)</small>
                    )}
                  </label>
                  <select
                    className="form-select"
                    value={form.session}
                    // disabled={!isSingleWorkingDay}
                    disabled={!isHalfDayAllowed}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        session: e.target.value
                      })
                    }
                  >
                    <option value="FULL">Full Day</option>

                    {/* {isSingleWorkingDay && ( *
                    {isHalfDayAllowed && (
                      <>
                        <option value="FIRST_HALF">First Half</option>
                        <option value="SECOND_HALF">Second Half</option>
                      </>
                    )}
                  </select>
                </div> */}

                {showSession && (
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Session</label>

                    <select
                      className="form-select"
                      value={form.session}
                      disabled={isFormLocked}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          session: e.target.value
                        })
                      }
                    >
                      <option value="FULL">Full Day</option>

                      {isHalfDayAllowed && (
                        <>
                          <option value="FIRST_HALF">First Half</option>
                          <option value="SECOND_HALF">Second Half</option>
                        </>
                      )}
                    </select>
                  </div>
                )}


                {/*  Days — shows 0 with warning if only weekends selected */}
                <div className="col-md-3 mb-3">
                  <label className="form-label">Days of Leave <span className="required">*</span></label>
                  <input
                    type="number"
                    className="form-control"
                    // value={days}
                    value={days || ''}
                    placeholder="Days of Leave "
                    readOnly
                  />
                  {days === 0 && form.fromDate && form.toDate && (
                    <small className="text-danger">
                      Selected dates are weekends/holidays
                    </small>
                  )}
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label">Approver <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    value={formatName(user.manager)}
                    readOnly
                  />
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label">Contact Address <span className="required">*</span></label>
                  {/* <textarea
                    disabled={isFormLocked}
                    className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                    value={form.address}
                    onChange={(e) => {
                      setForm({ ...form, address: e.target.value });
                      setErrors(prev => ({ ...prev, address: false }));
                    }}
                  /> */}
                  <textarea
                    disabled={isFormLocked}
                    maxLength={500}
                    className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                    value={form.address}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        address: e.target.value
                      });

                      setErrors(prev => ({
                        ...prev,
                        address: false
                      }));
                    }}
                  />
                  <div className="char-count">
                    <span className="max-label">Max 500 characters</span>
                    {(form.address || "").length}/500
                  </div>
                </div>

                <div className="col-md-3 mb-3" >
                  <label className="form-label" >Contact Number <span className="required">*</span></label>
                  <input
                    type="tel"
                    className="form-control"
                    value={user.phone}
                    readOnly
                  />
                </div>


                <div className="col-md-3 mb-3">
                  <label className="form-label">CC To</label>

                  <div className="cc-wrapper">

                    <div className="search-box-area">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Type min 3 characters"
                        value={ccSearch}
                        maxLength={10}
                        disabled={isFormLocked}
                        onChange={handleCCChange}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleCCSearch();
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="cc-search-btn"
                        onClick={handleCCSearch}
                      >
                        <i className="bi bi-search"></i>
                      </button>
                    </div>

                    {selectedCC.length > 0 && (
                      <div className="cc-selected-list">
                        {selectedCC.map(user => (
                          <span key={user.id} className="cc-chip">
                            {formatFullName(user.firstname, user.lastname)}
                            <i
                              className="bi bi-x"
                              onClick={() => removeCC(user.id)}
                            ></i>
                          </span>
                        ))}
                      </div>
                    )}

                    {ccSuggestions.length > 0 && (
                      <ul className="cc-suggestions">
                        {ccSuggestions.map(user => (
                          <li
                            key={user.id}
                            onClick={() => handleSelectCC(user)}
                          >
                            {formatFullName(user.firstname, user.lastname)} - {user.id}
                          </li>
                        ))}
                      </ul>
                    )}

                  </div>
                </div>
                {/* 
                {leaveType === "Adoption Leave" && (
                  <>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">
                        Adoption Date <span className="required">*</span>
                      </label>

                      <DatePicker
                        format="DD-MM-YYYY"
                        value={
                          form.adoptionDate
                            ? dayjs(form.adoptionDate)
                            : null
                        }
                        onChange={(newValue) =>
                          setForm({
                            ...form,
                            adoptionDate: newValue
                              ? newValue.format("YYYY-MM-DD")
                              : ""
                          })
                        }
                        slotProps={{
                          textField: {
                            fullWidth: true
                          }
                        }}
                      />
                    </div>

                    <div className="col-md-3 mb-3">
                      <label className="form-label">
                        Child Age (Months)
                        <span className="required">*</span>
                      </label>

                      <input
                        type="number"
                        className="form-control"
                        value={form.childAgeInMonths}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            childAgeInMonths: e.target.value
                          })
                        }
                      />
                    </div>

                    <div className="col-md-3 mb-3">
                      <label className="form-label">
                        Adoption Document
                        <span className="required">*</span>
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        value={form.adoptionDocument}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            adoptionDocument: e.target.value
                          })
                        }
                        placeholder="Enter document reference"
                      />
                    </div>
                  </>
                )} */}

                <div className="col-md-3 mb-3" >

                  <label className="form-label">Reason to Apply Leave <span className="required">*</span></label>

                  {/* <textarea
                    disabled={isFormLocked}
                    className={`form-control ${errors.reason ? 'is-invalid' : ''}`}
                    value={form.reason}
                    onChange={(e) => {
                      setForm({ ...form, reason: e.target.value });
                      setErrors(prev => ({ ...prev, reason: false }));
                    }}
                  /> */}
                  <textarea
                    disabled={isFormLocked}
                    maxLength={250}
                    className={`form-control ${errors.reason ? 'is-invalid' : ''}`}
                    value={form.reason}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        reason: e.target.value
                      });

                      setErrors(prev => ({
                        ...prev,
                        reason: false
                      }));
                    }}
                  />
                  <div className="char-count">
                    <span className="max-label">Max 250 characters</span>
                    {(form.reason || "").length}/250
                  </div>
                </div>

              </div>

              <div className="btn-area">
                <button
                  type="button"
                  className="reset-btn"
                  onClick={handleReset}
                >
                  <FaUndo className="btn-icon" />
                  Reset
                </button>


                <button type="submit" className="submit-btn">
                  {isCancelMode ? (
                    <>
                      <FaUndo className="btn-icon" />
                      Leave Cancel
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="btn-icon" />
                      Submit
                    </>
                  )}
                </button>
              </div>
            </form>




            <div className="history-title">
              <FaRegCalendarDays className="history-icon me-2" />
              Leave History
            </div>





            <div className="applyLeavePaginator">
              <div className="toolbar-left">

                <button
                  type="button"
                  className="paginator-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>

                <select
                  className="form-select"
                  value={pageSize}
                  style={{ width: '70px' }}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>

                <button
                  type="button"
                  className="paginator-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                  <i className="bi bi-chevron-right"></i>
                </button>

                <span className="page-indicator">
                  Current Page: {currentPage}
                </span>

              </div>
            </div>

            <div className="table-responsive">

              <table className="table custom-table bizx-table applyleave-table">
                {/* 
                  <thead>
                    <tr>
                      <th>Leave Type</th>
                      <th>From Date</th>
                      <th>To Date</th>
                      <th>Status</th>
                      <th>Request Type</th>
                      <th>No. of Days</th>
                      <th>Reason</th>
                      <th>Approver Remarks</th>
                      <th>Action</th>
                    </tr>
                  </thead> */}


                <thead>
                  <tr>
                    <th>
                      <TableSortLabel
                        active={orderBy === 'leaveType'}
                        direction={orderBy === 'leaveType' ? order : 'asc'}
                        onClick={() => handleRequestSort('leaveType')}
                      >
                        Leave Type
                        {orderBy === 'leaveType' && (
                          <Box component="span" sx={visuallyHidden}>
                            {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                          </Box>
                        )}
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
                        active={orderBy === 'days'}
                        direction={orderBy === 'days' ? order : 'asc'}
                        onClick={() => handleRequestSort('days')}
                      >
                        No. of Days
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

                    {/* ❌ NO ARROWS */}
                    <th>Approver Remarks</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {history.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center no-data">
                        No Data Found
                      </td>
                    </tr>
                  ) : (
                    // history.map((item) => (
                    paginatedHistory.map((item) => (
                      <tr key={item.id}>

                        <td>{item.leaveType}</td>

                        <td>{formatDate(item.fromDate)}</td>

                        <td>{formatDate(item.toDate)}</td>

                        <td>
                          <td>
                            <span
                              className={
                                (item.displayStatus || normalizeStatus(item.status)) === "Approved"
                                  ? "status-approved"
                                  : (item.displayStatus || normalizeStatus(item.status)) === "Rejected"
                                    ? "status-rejected"
                                    : (item.displayStatus || normalizeStatus(item.status)) === "Cancelled"
                                      ? "status-cancelled"
                                      : "status-pending"
                              }
                            >
                              {item.displayStatus || normalizeStatus(item.status)}
                            </span>
                          </td>
                        </td>



                        <td>{getRequestType(item)}</td>
                        <td>{item.days}</td>

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



                        <td>
                          {getApproverRemarks(item)}
                        </td>



                        <td>
                          <button
                            type="button"
                            className={`action-cancel-btn ${['CANCELLED', 'REJECTED', 'CANCEL_REQUESTED'].includes(item.status)
                              || isCancelAlreadyRequested(item)
                              ? 'disabled-btn'
                              : ''
                              }`}

                            disabled={
                              ['CANCELLED', 'REJECTED', 'CANCEL_REQUESTED'].includes(item.status)
                              || isCancelAlreadyRequested(item)
                            }


                            // disabled={['CANCELLED', 'REJECTED', 'CANCEL_REQUESTED'].includes(item.status)}
                            onClick={() => {
                              if (!['CANCELLED', 'REJECTED', 'CANCEL_REQUESTED'].includes(item.status)) {
                                // handleCancel(item.id);
                                handleCancel(item);
                              }
                            }}
                            title={
                              isCancelAlreadyRequested(item)
                                ? 'Cancel already requested'
                                : item.status === 'CANCEL_REQUESTED'
                                  ? 'Cancel request row'
                                  : ['CANCELLED', 'REJECTED'].includes(item.status)
                                    ? 'Action not available'
                                    : 'Cancel leave'
                            }
                          >
                            <i className="bi bi-x-circle"></i>
                          </button>
                        </td>

                      </tr>
                    ))
                  )}

                </tbody>

              </table>
            </div>
          </div>

          <Snackbar
            open={snackbar.open}

            autoHideDuration={snackbar.action ? null : 3000}

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
        </div >
      </LocalizationProvider>
    </Layout >
  );
}

export default ApplyLeave;  