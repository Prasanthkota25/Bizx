import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css';

function DashboardCards() {

    const navigate = useNavigate();

    const [selectedMenu, setSelectedMenu] = useState(null);

    /* =========================================
       MENU DATA
    ========================================= */

    const menuOptions = {

        Leave: [
            { label: 'Apply Leave', path: '/applyleave' },
            { label: 'Leave Balance', path: '/leavebalance' },
            { label: 'My Team Leave', path: '/myteamleave' }
        ],

        'Service Management': [
            { label: 'Raise Service Request', path: '/raiseservicerequest' },
            { label: 'My Service Request', path: '/myservicerequest' },
            { label: 'Pending Service Request', path: '/pendingservicerequest' }
        ],

        'Incident Management': [
            { label: 'Raise Incident', path: '/raiseincident' },
            { label: 'My Incidents', path: '/myincidents' }
        ],

        ELM: [
            { label: 'Initiate Resignation', path: '/initiateresignation' },
            { label: 'Approve Resignation', path: '/approveresignation' },
            { label: 'Revoke Resignation Approval', path: '/revokeresignation' },
            { label: 'My Team Project', path: '/myteamproject' },
            { label: 'Pending Manager Approval', path: '/pendingmanagerapproval' },
            { label: 'Movement Approval', path: '/movementapproval' }
        ],

        Timesheet: [
            { label: 'My Timesheet', path: '/mytimesheet' },
            { label: 'My Team Timesheet', path: '/myteamtimesheet' }
        ],

        'Core HR': [
            { label: 'Employee Dashboard', path: '/employeedashboard' }
        ],


        'Asset Management': [
            { label: 'My Asset', path: '/myasset' }
        ],

        Travel: [
            { label: 'Travel Request', path: '/travelrequest' },
            { label: 'Pending Request', path: '/pendingrequest' },
            { label: 'My Travel Request', path: '/mytravelrequest' }
        ],

        Rootz: [
            { label: 'My Rootz', path: '/myrootz' }
        ],

        'Skill Pack': [
            { label: 'My Team Skills', path: '/myteamskills' },
            { label: 'Update Skills', path: '/updateskills' },
            { label: 'Upload Resume', path: '/uploadresume' }
        ],

        Recruitment: [
            { label: 'My Pending Feedback', path: '/mypendingfeedback' }
        ],

        Visa: [
            { label: 'Visa Request', path: '/visarequest' },
            { label: 'Pending Visa', path: '/pendingvisa' },
            { label: 'My Visa List', path: '/myvisalist' }
        ],

        Project: [
            { label: 'Movement Approval', path: '/movementapproval' },
            { label: 'My Project Approval', path: '/myprojectapproval' },
            { label: 'Pending Bulk Movement List', path: '/pendingbulkmovementlist' },
            { label: 'Pending Project Requests', path: '/pendingprojectrequests' }
        ],

        'Information Security': [
            {
                label: 'Security Awareness & Training',
                path: '/securityawarenesstraining'
            }
        ],

        MIS: [
            { label: 'MIS View', path: '/misview' }
        ],

        Procurement: [
            {
                label: 'Purchase Request for Approvals',
                path: '/purchaserequestforapprovals'
            }
        ],

        Expense: [
            { label: 'Create Expense', path: '/createexpense' },
            { label: 'My Expense', path: '/myexpense' },
            { label: 'Pending Expenses', path: '/pendingexpenses' }
        ],

        'Covid Vaccination': [
            { label: 'Covid Vaccination', path: '/covidvaccination' }
        ]
    };

    /* =========================================
       TILE LIST
       data-tile value MUST match home.css
       Aqua color rules exactly
    ========================================= */

    const tiles = [
        { key: 'leave', label: 'Leave', src: '/Leave.png', menu: 'Leave' },
        { key: 'timesheet', label: 'Timesheet', src: '/timesheet.png', menu: 'Timesheet' },
        { key: 'elm', label: 'ELM', src: '/ELM.png', menu: 'ELM' },
        { key: 'core-hr', label: 'Core HR', src: '/Core HR.png', menu: 'Core HR' },
        { key: 'incident-management', label: 'Incident Management', src: '/Incident Management.png', menu: 'Incident Management' },
        { key: 'service-management', label: 'Service Management', src: '/Service Management.png', menu: 'Service Management' },
        { key: 'asset-management', label: 'Asset Management', src: '/Asset Management.png', menu: 'Asset Management' },
        { key: 'travel', label: 'Travel', src: '/Travel.png', menu: 'Travel' },
        { key: 'rootz', label: 'Rootz', src: '/Rootz.png', menu: 'Rootz' },
        { key: 'skill-pack', label: 'Skill Pack', src: '/Skill Pack.png', menu: 'Skill Pack' },
        { key: 'recruitment', label: 'Recruitment', src: '/Recruitment.png', menu: 'Recruitment' },
        { key: 'visa', label: 'Visa', src: '/Visa.png', menu: 'Visa' },
        { key: 'project', label: 'Project', src: '/Project.png', menu: 'Project' },
        { key: 'information-security', label: 'Information Security', src: '/Information Security.png', menu: 'Information Security' },
        { key: 'mis', label: 'MIS', src: '/MIS.png', menu: 'MIS' },
        { key: 'procurement', label: 'Procurement', src: '/Procurement.png', menu: 'Procurement' },
        { key: 'expense', label: 'Expense', src: '/Expense.png', menu: 'Expense' },
        { key: 'covid-vaccination', label: 'Covid Vaccination', src: '/Covid Vaccination.png', menu: 'Covid Vaccination' },


    ];

    /* =========================================
       OPEN / CLOSE PANEL
    ========================================= */

    const openPanel = (menuName) => {
        /* clicking same tile closes panel */
        setSelectedMenu(prev => prev === menuName ? null : menuName);
    };

    return (

        <div className="main-container">

            <div className={`dashboard-layout ${selectedMenu ? 'panel-open' : ''}`}>

                {/* =========================================
                    LEFT PANEL
                ========================================= */}

                <div className="left-panel">

                    {/* HR PARTNER */}
                    <div className="card-box">
                        <div className="section-title">HR Partner</div>
                        <div className="profile-content">
                            <p>HR Partner Name :</p>
                            <h5>Shiva Sharma (1029189)</h5>
                        </div>
                    </div>

                    {/* POPULAR LINKS */}
                    <div className="card-box">
                        <div className="section-title">Popular Links</div>
                        <div className="link-item">Holiday Lists</div>
                        <div className="link-item">Leave Policy</div>
                        <div className="link-item">Rootz</div>
                        <div className="link-item">Create RIN (BrassRing)</div>
                        <div className="link-item">Create RIN (Zyter Employee)</div>
                        <div className="link-item">Employee Referral Portal</div>
                        <div className="link-item">Employee Referral Process</div>
                    </div>

                </div>

                {/* =========================================
                    CENTER AREA
                ========================================= */}

                <div className="home_cont_area">
                    <div className="dashboard-grid">

                        {tiles.map((tile) => (
                            <div
                                key={tile.key}
                                className={`dashboard-tile ${selectedMenu === tile.menu ? 'active-tile' : ''}`}
                                data-tile={tile.key}
                                onClick={() => openPanel(tile.menu)}
                            >
                                <img
                                    src={tile.src}
                                    alt={tile.label}
                                    className="tile-img"
                                />
                                <span>{tile.label}</span>
                            </div>
                        ))}

                    </div>
                </div>

                {/* =========================================
                    RIGHT PANEL
                ========================================= */}

                <div className={`right-panel ${selectedMenu ? 'show-panel' : ''}`}>

                    <div className="card-box right-card">

                        <div className="section-title">
                            {selectedMenu}
                        </div>

                        <div className="right-panel-body">
                            {selectedMenu &&
                                menuOptions[selectedMenu]?.map((item, index) => (
                                    <button
                                        key={index}
                                        className="option-link"
                                        onClick={() => navigate(item.path)}
                                    >
                                        {item.label}
                                    </button>
                                ))
                            }
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default DashboardCards;
