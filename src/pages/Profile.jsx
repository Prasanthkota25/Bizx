import { useParams } from "react-router-dom";
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../api/api';
import { toTitleCase, formatName } from '../utils/formatters';
import '../styles/profile.css';


function Profile() {
const { id } = useParams();
  const [user, setUser] = useState({
    id: '',
    firstname: '',
    lastname: '',
    email: '',
    bu: '',
    sbu: '',
    buHead: '',
    sbuHead: '',
    manager: '',
    phone: '',
    extension: '',
    location: '',
    designation: '',
    status: '',
    cubical: ''
  });

  useEffect(() => {

  const fetchUser = async () => {

    try {

      if (id) {
        // ✅ when coming from search
        const res = await API.get(`/users/id/${id}`);
        setUser(res.data);
      } else {
        // ✅ when clicking "Profile" menu
        const username = localStorage.getItem('username');
        const res = await API.get(`/users/username/${username}`);
        setUser(res.data);
      }

    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  fetchUser();

}, [id]);

  return (
    <Layout>

      <div className="container-fluid projectAccounting profile-page">

        <div className="profile-container bizx-page-card">

          {/* HEADER */}
          <div className="profile-header">
            <h2>PROFILE</h2>
          </div>

          {/* PROFILE CARD */}
          <div className="profile-card">

            {/* LEFT */}
            <div className="profile-left">

              <div className="profile-image">
                <i className="bi bi-person-fill" ></i>
              </div>

              <h3>
                {toTitleCase(user.firstname)} {toTitleCase(user.lastname)}
              </h3>

            </div>

            {/* RIGHT */}
            <div className="profile-right">

              <div className="profile-grid">

                <div className="profile-item">
                  <label>Employee No</label>
                  <p>{user.id || '-'}</p>
                </div>

                <div className="profile-item">
                  <label>Full Name</label>
                  <p>
                    {toTitleCase(user.firstname)} {toTitleCase(user.lastname)}
                  </p>
                </div>

                <div className="profile-item">
                  <label>Office Email Id</label>
                  <p>{user.email || '-'}</p>
                </div>

                <div className="profile-item">
                  <label>BU</label>
                  <p>{toTitleCase(user.bu)}</p>
                </div>

                <div className="profile-item">
                  <label>SBU</label>
                  <p>{toTitleCase(user.sbu)}</p>
                </div>

                <div className="profile-item">
                  <label>BU Head Name</label>
                  <p>{toTitleCase(user.buHead)}</p>
                </div>

                <div className="profile-item">
                  <label>SBU Head Name</label>
                  <p>{toTitleCase(user.sbuHead)}</p>
                </div>

                <div className="profile-item">
                  <label>Reporting Manager</label>
                  <p>{formatName(user.manager)}</p>
                </div>

                <div className="profile-item">
                  <label>Phone Number</label>
                  <p>{user.phone || '-'}</p>
                </div>

                <div className="profile-item">
                  <label>Extension Number</label>
                  <p>{user.extension || '-'}</p>
                </div>

                <div className="profile-item">
                  <label>Physical Location</label>
                  <p>{toTitleCase(user.location)}</p>
                </div>

                <div className="profile-item">
                  <label>Designation</label>
                  <p>{toTitleCase(user.designation)}</p>
                </div>

                <div className="profile-item">
                  <label>Employee Status</label>
                  <p
                    className={
                      user.status?.trim().toLowerCase() === 'active'
                        ? 'active-status'
                        : ''
                    }
                  >
                   {toTitleCase(user.status)}
                  </p>
                </div>

                <div className="profile-item">
                  <label>Cubical Number</label>
                  <p>{user.cubical || '-'}</p>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </Layout>
  );
}

export default Profile;