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
    symptom: '',
    description: '',
    resolution: ''
  });




  const [department, setDepartment] = useState('');
  const [workgroup, setWorkgroup] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');


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
                Department <span className="required">*</span>
              </label>


              <FormControl fullWidth>
                <Select
                  value={department}
                  displayEmpty
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <MenuItem value="" disabled>
                    Select
                  </MenuItem>

                  <MenuItem value="IT">IT</MenuItem>
                  <MenuItem value="HR">HR</MenuItem>
                  <MenuItem value="Finance">Finance</MenuItem>
                </Select>
              </FormControl>

            </div>



            <div className="col-md-3 mb-3">
              <label className="form-label">
                Workgroup  <span className="required">*</span>
              </label>

              <FormControl fullWidth>
                <Select
                  value={workgroup}
                  displayEmpty
                  disabled={!department}
                  onChange={(e) => setWorkgroup(e.target.value)}
                >
                  <MenuItem value="" disabled>
                    Select
                  </MenuItem>

                  <MenuItem value="WG1">Workgroup 1</MenuItem>
                  <MenuItem value="WG2">Workgroup 2</MenuItem>
                </Select>
              </FormControl>

            </div>



            <div className="col-md-3 mb-3">
              <label className="form-label">
                Category  <span className="required">*</span>
              </label>

              <FormControl fullWidth>
                <Select
                  value={category}
                  displayEmpty
                  disabled={!workgroup}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <MenuItem value="" disabled>
                    Select
                  </MenuItem>

                  <MenuItem value="Hardware">Hardware</MenuItem>
                  <MenuItem value="Software">Software</MenuItem>
                </Select>
              </FormControl>

            </div>



            <div className="col-md-3 mb-3">
              <label className="form-label">
                Sub Category  <span className="required">*</span>
              </label>

              <FormControl fullWidth>
                <Select
                  value={subCategory}
                  displayEmpty
                  disabled={!category}
                  onChange={(e) => setSubCategory(e.target.value)}
                >
                  <MenuItem value="" disabled>
                    Select
                  </MenuItem>

                  <MenuItem value="Laptop">Laptop</MenuItem>
                  <MenuItem value="Desktop">Desktop</MenuItem>
                </Select>
              </FormControl>

            </div>


            <div className="col-md-3 mb-3">
              <label className="form-label">
                Cubicle Number <span className="required">*</span>
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Type"
                maxLength={15}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
                }}
              />
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">
                Contact Number <span className="required">*</span>
              </label>

              <input
                type="tel"
                className="form-control"
                placeholder="Type"
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
                placeholder="Type"
                maxLength={10}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/\D/g, "");
                }}
              />
            </div>



            <div className="row">
              <div className="col-md-3 mb-3">
                <label className="form-label attachment-label">
                  Upload Attachment 1
                </label>
                <br />
                <input
                  type="file"
                  name="attachment1"
                />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label attachment-label">
                  Upload Attachment 2
                </label>
                <br />
                <input
                  type="file"
                  name="attachment2"
                />
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">
                Symptom <span className="required">*</span>
              </label>

              <textarea
                className="form-control"
                rows="4"
                maxLength={500}
                value={form.symptom}
                onChange={(e) =>
                  setForm({
                    ...form,
                    symptom: e.target.value
                  })
                }
              />

              <div className="char-count">
                {(form.symptom || '').length}/500
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
                onClick={() => window.history.back()}
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