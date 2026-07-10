import { HashRouter, Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import ApplyLeave from './pages/ApplyLeave';
import LeaveBalance from './pages/LeaveBalance';
import MyTeamLeave from './pages/MyTeamLeave';
import Profile from './pages/Profile';


function App() {
  return (
    // <BrowserRouter>
    //   <Routes>
    //     <Route path='/' element={<Login />} />
    //     <Route path='/register' element={<Register />} />
    //     <Route path='/forgot-password' element={<ForgotPassword />} />

    //     <Route path='/home' element={<Home />} />
    //     <Route path='/applyleave' element={<ApplyLeave />} />
    //     <Route path='/leavebalance' element={<LeaveBalance />} />
    //     <Route path='/myteamleave' element={<MyTeamLeave />} />
    //     <Route path='/profile' element={<Profile />} />
    //   </Routes>
    // </BrowserRouter>

    <HashRouter>
  <Routes>
    <Route path='/' element={<Login />} />
    <Route path='/register' element={<Register />} />
    <Route path='/forgot-password' element={<ForgotPassword />} />

    <Route path='/home' element={<Home />} />
    
    <Route path='/leave/applyleave' element={<ApplyLeave />} />
    <Route path='/leave/leavebalance' element={<LeaveBalance />} />
    <Route path='/leave/myteamleave' element={<MyTeamLeave />} />

    <Route path='/profile' element={<Profile />} />
    <Route path='/profile/:id' element={<Profile />} />

  </Routes>
</HashRouter>
  );
}

export default App;