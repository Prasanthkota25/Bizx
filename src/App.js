import { HashRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import Profile from './pages/Profile';

/* Leave */
import ApplyLeave from './pages/leave/ApplyLeave';
import LeaveBalance from './pages/leave/LeaveBalance';
import MyTeamLeave from './pages/leave/MyTeamLeave';

/* ELM */
import InitiateResignation from './pages/elm/InitiateResignation';
import ApproveResignation from './pages/elm/ApproveResignation';
import RevokeResignation from './pages/elm/RevokeResignation';
import MyTeamProject from './pages/elm/MyTeamProject';
import PendingManagerApproval from './pages/elm/PendingManagerApproval';
import ElmMovementApproval from './pages/elm/MovementApproval';

/* Timesheet */
import MyTimesheet from './pages/timesheet/MyTimesheet';
import MyTeamTimesheet from './pages/timesheet/MyTeamTimesheet';

/* Travel */
import TravelRequest from './pages/travel/TravelRequest';
import PendingRequest from './pages/travel/PendingRequest';
import MyTravelRequest from './pages/travel/MyTravelRequest';

/* Expense */
import CreateExpense from './pages/expense/CreateExpense';
import MyExpense from './pages/expense/MyExpense';
import PendingExpenses from './pages/expense/PendingExpenses';

/* Service Management */
import RaiseServiceRequest from './pages/service-management/RaiseServiceRequest';
import MyServiceRequest from './pages/service-management/MyServiceRequest';
import PendingServiceRequest from './pages/service-management/PendingServiceRequest';

/* Incident Management */
import RaiseIncident from './pages/incident-management/RaiseIncident';
import MyIncidents from './pages/incident-management/MyIncidents';

/* Core HR */
import EmployeeDashboard from './pages/core-hr/EmployeeDashboard';

/* Asset Management */
import MyAsset from './pages/asset-management/MyAsset';

/* Rootz */
import MyRootz from './pages/rootz/MyRootz';

/* Skill Pack */
import MyTeamSkills from './pages/skill-pack/MyTeamSkills';
import UpdateSkills from './pages/skill-pack/UpdateSkills';
import UploadResume from './pages/skill-pack/UploadResume';

/* Recruitment */
import MyPendingFeedback from './pages/recruitment/MyPendingFeedback';

/* Visa */
import VisaRequest from './pages/visa/VisaRequest';
import PendingVisa from './pages/visa/PendingVisa';
import MyVisaList from './pages/visa/MyVisaList';

/* Project */
import ProjectMovementApproval from './pages/project/MovementApproval';
import MyProjectApproval from './pages/project/MyProjectApproval';
import PendingBulkMovementList from './pages/project/PendingBulkMovementList';
import PendingProjectRequests from './pages/project/PendingProjectRequests';

/* Information Security */
import SecurityAwarenessTraining from './pages/information-security/SecurityAwarenessTraining';

/* MIS */
import MisView from './pages/mis/MisView';

/* Procurement */
import PurchaseRequestForApprovals from './pages/procurement/PurchaseRequestForApprovals';

/* Covid Vaccination */
import CovidVaccination from './pages/covid-vaccination/CovidVaccination';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/home' element={<Home />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/profile/:id' element={<Profile />} />

        {/* Leave */}
        <Route path='/leave/applyleave' element={<ApplyLeave />} />
        <Route path='/leave/leavebalance' element={<LeaveBalance />} />
        <Route path='/leave/myteamleave' element={<MyTeamLeave />} />

        {/* ELM */}
        <Route path='/elm/initiateresignation' element={<InitiateResignation />} />
        <Route path='/elm/approveresignation' element={<ApproveResignation />} />
        <Route path='/elm/revokeresignation' element={<RevokeResignation />} />
        <Route path='/elm/myteamproject' element={<MyTeamProject />} />
        <Route path='/elm/pendingmanagerapproval' element={<PendingManagerApproval />} />
        <Route path='/elm/movementapproval' element={<ElmMovementApproval />} />

        {/* Timesheet */}
        <Route path='/timesheet/mytimesheet' element={<MyTimesheet />} />
        <Route path='/timesheet/myteamtimesheet' element={<MyTeamTimesheet />} />

        {/* Travel */}
        <Route path='/travel/travelrequest' element={<TravelRequest />} />
        <Route path='/travel/pendingrequest' element={<PendingRequest />} />
        <Route path='/travel/mytravelrequest' element={<MyTravelRequest />} />

        {/* Expense */}
        <Route path='/expense/createexpense' element={<CreateExpense />} />
        <Route path='/expense/myexpense' element={<MyExpense />} />
        <Route path='/expense/pendingexpenses' element={<PendingExpenses />} />

        {/* Service Management */}
        <Route path='/service-management/raiseservicerequest' element={<RaiseServiceRequest />} />
        <Route path='/service-management/myservicerequest' element={<MyServiceRequest />} />
        <Route path='/service-management/pendingservicerequest' element={<PendingServiceRequest />} />

        {/* Incident Management */}
        <Route path='/incident-management/raiseincident' element={<RaiseIncident />} />
        <Route path='/incident-management/myincidents' element={<MyIncidents />} />

        {/* Core HR */}
        <Route path='/core-hr/employeedashboard' element={<EmployeeDashboard />} />

        {/* Asset Management */}
        <Route path='/asset-management/myasset' element={<MyAsset />} />

        {/* Rootz */}
        <Route path='/rootz/myrootz' element={<MyRootz />} />

        {/* Skill Pack */}
        <Route path='/skill-pack/myteamskills' element={<MyTeamSkills />} />
        <Route path='/skill-pack/updateskills' element={<UpdateSkills />} />
        <Route path='/skill-pack/uploadresume' element={<UploadResume />} />

        {/* Recruitment */}
        <Route path='/recruitment/mypendingfeedback' element={<MyPendingFeedback />} />

        {/* Visa */}
        <Route path='/visa/visarequest' element={<VisaRequest />} />
        <Route path='/visa/pendingvisa' element={<PendingVisa />} />
        <Route path='/visa/myvisalist' element={<MyVisaList />} />

        {/* Project */}
        <Route path='/project/movementapproval' element={<ProjectMovementApproval />} />
        <Route path='/project/myprojectapproval' element={<MyProjectApproval />} />
        <Route path='/project/pendingbulkmovementlist' element={<PendingBulkMovementList />} />
        <Route path='/project/pendingprojectrequests' element={<PendingProjectRequests />} />

        {/* Information Security */}
        <Route path='/information-security/securityawarenesstraining' element={<SecurityAwarenessTraining />} />

        {/* MIS */}
        <Route path='/mis/misview' element={<MisView />} />

        {/* Procurement */}
        <Route path='/procurement/purchaserequestforapprovals' element={<PurchaseRequestForApprovals />} />

        {/* Covid Vaccination */}
        <Route path='/covid-vaccination/covidvaccination' element={<CovidVaccination />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
