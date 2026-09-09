import { useState, useEffect } from 'react';
import API from '../api/api';  

export function useLeaveConfig() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [holidays,   setHolidays]   = useState([]);
  const [balances,   setBalances]   = useState({});
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  useEffect(() => {
    const year = new Date().getFullYear();
    Promise.all([
      API.get('/api/leave-types'),          
      API.get(`/api/holidays/dates?year=${year}`) 
    ])
    .then(([ltRes, hdRes]) => {
      const types = ltRes.data;
      const bal   = {};
      types.forEach(lt => { bal[lt.name] = lt.defaultDays; });
      setLeaveTypes(types);
      setHolidays(hdRes.data);
      setBalances(bal);
    })
    .catch(err => setError(err.message))
    .finally(() => setLoading(false));
  }, []);

  return { leaveTypes, holidays, balances, loading, error };
}