export const isSearchReady = (value) => {
  return (value || '').trim().length >= 3;
};

export const searchLeaveRecords = (records = [], value = '') => {
  if (!isSearchReady(value)) {
    return records;
  }

  const query = value.toLowerCase();

  return records.filter((leave) => {
    return [
      String(leave.userId ?? ''),
      leave.username,
      leave.leaveType,
      leave.reason,
      leave.email,
      leave.phone
    ]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(query));
  });
};
