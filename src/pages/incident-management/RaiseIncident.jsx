import React, { useState } from 'react';
import Layout from '../../components/Layout';
import '../../styles/incident.css';

import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import { FaFileExport, FaTimes } from 'react-icons/fa';
import { useEffect } from 'react';
import API from '../../api/api';


function RaiseIncident() {
  const [age, setAge] = useState('');

  const handleReset = () => {
    setAge('');
    setForm({
      phone: form.phone,
      description: '',
      resolution: ''
    });
  };


  useEffect(() => {
    const username = localStorage.getItem('username');

    if (!username) return;

    const fetchUser = async () => {
      try {
        const res = await API.get(`/users/username/${username}`);

        setForm(prev => ({
          ...prev,
          phone: res.data.phone || ''
        }));
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
  }, []);

  const [form, setForm] = useState({
    phone: '',
    description: '',
    resolution: ''
  });

  const handleChange = (event) => {
    setAge(event.target.value);
  };
  return (
    <Layout>
      <div className="container-fluid projectAccounting">
        <div className="incident-card">
          <h2 className="page-title">
            Raise New Incident

            <button
              type="button"
              className="back-btn"
              onClick={() => window.history.back()}
            >
              <i className="bi bi-chevron-double-left"></i> Back
            </button>
          </h2>

          <div className="row incident-row">

            <div className="col-md-3 mb-3">
              <label className="form-label">
                Age <span className="required">*</span>
              </label>


              <FormControl fullWidth>
                <Select
                  id="demo-simple-select"
                  value={age}
                  displayEmpty
                  onChange={handleChange}
                >
                  <MenuItem value="" disabled>
                    Select Age
                  </MenuItem>

                  <MenuItem value={10}>Ten</MenuItem>
                  <MenuItem value={20}>Twenty</MenuItem>
                  <MenuItem value={30}>Thirty</MenuItem>
                </Select>
              </FormControl>

            </div>



            <div className="col-md-3 mb-3">
              <label className="form-label">
                Age <span className="required">*</span>
              </label>

              <FormControl fullWidth>
                <Select
                  id="demo-simple-select"
                  value={age}
                  displayEmpty
                  onChange={handleChange}
                >
                  <MenuItem value="" disabled>
                    Select Age
                  </MenuItem>

                  <MenuItem value={10}>Ten</MenuItem>
                  <MenuItem value={20}>Twenty</MenuItem>
                  <MenuItem value={30}>Thirty</MenuItem>
                </Select>
              </FormControl>

            </div>



            <div className="col-md-3 mb-3">
              <label className="form-label">
                Age <span className="required">*</span>
              </label>

              <FormControl fullWidth>
                <Select
                  id="demo-simple-select"
                  value={age}
                  displayEmpty
                  onChange={handleChange}
                >
                  <MenuItem value="" disabled>
                    Select Age
                  </MenuItem>

                  <MenuItem value={10}>Ten</MenuItem>
                  <MenuItem value={20}>Twenty</MenuItem>
                  <MenuItem value={30}>Thirty</MenuItem>
                </Select>
              </FormControl>

            </div>



            <div className="col-md-3 mb-3">
              <label className="form-label">
                Age <span className="required">*</span>
              </label>

              <FormControl fullWidth>
                <Select
                  id="demo-simple-select"
                  value={age}
                  displayEmpty
                  onChange={handleChange}
                >
                  <MenuItem value="" disabled>
                    Select Age
                  </MenuItem>

                  <MenuItem value={10}>Ten</MenuItem>
                  <MenuItem value={20}>Twenty</MenuItem>
                  <MenuItem value={30}>Thirty</MenuItem>
                </Select>
              </FormControl>

            </div>



            <div className="col-md-3 mb-3">
              <label className="form-label">
                Cubicle Number  <span className="required">*</span>
              </label>

              <input
                type="tel"
                className="form-control"

              />
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">
                Contact Number <span className="required">*</span>
              </label>

              <input
                type="tel"
                className="form-control"
                value={form.phone || ''}
                readOnly
              />
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">
                Extension Number
              </label>

              <input
                type="tel"
                className="form-control"

              />
            </div>


            <div className="col-md-6 mb-3">
              <label className="form-label">
                Symptom  <span className="required">*</span>
              </label>

              <textarea
                className="form-control"
                rows="4"
                maxLength={500}
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value
                  })
                }
              />

              <div className="char-count">
                {(form.description || '').length}/500
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">
                Description <span className="required">*</span>
              </label>

              <textarea
                className="form-control"
                rows="4"
                maxLength={500}
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value
                  })
                }
              />

              <div className="char-count">
                {(form.description || '').length}/500
              </div>
            </div>



            <div className="incidentbtn-area">
              <button
                type="button"
                className="incidentreset-btn"
                onClick={handleReset}
              >
                <FaTimes className="btn-icon" />
                Cancel
              </button>

              <button type="submit" className="incidentsubmit-btn">
                <FaFileExport className="btn-icon" />
                Submit
              </button>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}

export default RaiseIncident;