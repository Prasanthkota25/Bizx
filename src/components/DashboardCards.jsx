import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css';
import { publicAsset } from '../utils/publicAsset';

const getMenuKey = (menu) =>
    menu?.toLowerCase().replace(/\s+/g, '-');

const getActiveTheme = () => {
    if (typeof window === 'undefined') {
        return 'mustang';
    }

    if (document.body.classList.contains('misty')) {
        return 'misty';
    }

    if (document.body.classList.contains('aqua')) {
        return 'aqua';
    }

    if (document.body.classList.contains('mustang')) {
        return 'mustang';
    }

    return null;
};

function DashboardCards() {

    const navigate = useNavigate();

    const [selectedMenu, setSelectedMenu] = useState(null);
    const [currentTheme, setCurrentTheme] = useState(() => {
        if (typeof window === 'undefined') {
            return 'mustang';
        }

        return getActiveTheme() || localStorage.getItem('theme') || 'mustang';
    });

    useEffect(() => {
        const updateTheme = () => {
            const theme = getActiveTheme() || 'mustang';

            setCurrentTheme(theme);
        };

        updateTheme();

        window.addEventListener('themeChange', updateTheme);
        document.addEventListener('themeChange', updateTheme);

        return () => {
            window.removeEventListener('themeChange', updateTheme);
            document.removeEventListener('themeChange', updateTheme);
        };
    }, []);

    /* =========================================
       MENU DATA
    ========================================= */

    const menuOptions = {

        Leave: [
            { label: 'Apply For Leave', path: '/leave/applyleave' },
            { label: 'Leave Balance Summary', path: '/leave/leavebalance' },
            { label: 'My Team Leave', path: '/leave/myteamleave' }
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


    const menuIcons = {
        Leave: '/Leave.png',
        Timesheet: '/Timesheet.png',
        ELM: '/ELM.png',
        Travel: '/Travel.png',
        'Core HR': '/Core HR.png',
        'Asset Management': '/Asset Management.png',
        'Service Management': '/Service Management.png',
        'Incident Management': '/Incident Management.png',
        Expense: '/Expense.png',
        Recruitment: '/Recruitment.png',
        Visa: '/Visa.png',
        Project: '/Project.png',
        Rootz: '/Rootz.png',
        MIS: '/MIS.png',
        Procurement: '/Procurement.png',
        'Skill Pack': '/Skill Pack.png',
        'Information Security': '/Information Security.png',
        'Covid Vaccination': '/Covid Vaccination.png'
    };

    const mistyTileIcons = {
        'asset-management': '/misty themes/Asset Management 1.png',
        elm: '/misty themes/ELM.png',
        'brand-vault': '/misty themes/Brand Vault.png',
        'core-hr': '/misty themes/Core HR.png',
        'covid-vaccination': '/misty themes/Covid Vaccination.png',
        expense: '/misty themes/Expense.png',
        'incident-management': '/misty themes/Incident Management.png',
        'infinite-horizons': '/misty themes/Infinite Horizons.png',
        'information-security': '/misty themes/Information Security.png',
        leave: '/misty themes/Leave.png',
        mis: '/misty themes/MIS.png',
        procurement: '/misty themes/Procurement.png',
        project: '/misty themes/Project.png',
        recruitment: '/misty themes/Recruitment.png',
        'rootz': '/misty themes/Rootz.png',
        'service-management': '/misty themes/Service Management.png',
        'skill-pack': '/misty themes/Skill Pack.png',
        timesheet: '/misty themes/Timesheet.png',
        travel: '/misty themes/Travel.png',
        visa: '/misty themes/Visa.png'
    };

    const getTileSrc = (tile) => {
        const path = currentTheme === 'misty'
            ? mistyTileIcons[tile.key] || tile.src
            : tile.src;

        return publicAsset(path);
    };

    /* =========================================
       TILE LIST
       data-tile value MUST match home.css
       Aqua color rules exactly
    ========================================= */

    const tiles = [
        { key: 'asset-management', label: 'Asset Management', src: '/Asset Management.png', menu: 'Asset Management' },
        { key: 'elm', label: 'ELM', src: '/ELM.png', menu: 'ELM' },
        {
            key: 'brand-vault',
            label: 'Brand Vault',
            src: '/Brand Vault.png',
            externalLink: 'https://infics.sharepoint.com/sites/BrandVault/SitePages/Home.aspx'
        },
        { key: 'core-hr', label: 'Core HR', src: '/Core HR.png', menu: 'Core HR' },
        { key: 'covid-vaccination', label: 'Covid Vaccination', src: '/Covid Vaccination.png', menu: 'Covid Vaccination' },
        { key: 'expense', label: 'Expense', src: '/Expense.png', menu: 'Expense' },
        { key: 'incident-management', label: 'Incident Management', src: '/Incident Management.png', menu: 'Incident Management' },

        {
            key: 'infinite-horizons',
            label: 'Infinite Horizons',
            src: '/Infinite Horizons.png',
            externalLink: 'https://bizx.infinite.com/infinitehorizons/dashboard'
        },
        { key: 'information-security', label: 'Information Security', src: '/Information Security.png', menu: 'Information Security' },


        { key: 'leave', label: 'Leave', src: '/Leave.png', menu: 'Leave' },
        { key: 'mis', label: 'MIS', src: '/MIS.png', menu: 'MIS' },
        { key: 'procurement', label: 'Procurement', src: '/Procurement.png', menu: 'Procurement' },
        { key: 'project', label: 'Project', src: '/Project.png', menu: 'Project' },
        { key: 'recruitment', label: 'Recruitment', src: '/Recruitment.png', menu: 'Recruitment' },
        { key: 'skill-pack', label: 'Skill Pack', src: '/Skill Pack.png', menu: 'Skill Pack' },
        { key: 'rootz', label: 'Rootz', src: '/Rootz.png', menu: 'Rootz' },

        { key: 'timesheet', label: 'Timesheet', src: '/Timesheet.png', menu: 'Timesheet' },
        { key: 'travel', label: 'Travel', src: '/Travel.png', menu: 'Travel' },

        { key: 'visa', label: 'Visa', src: '/Visa.png', menu: 'Visa' },

        { key: 'service-management', label: 'Service Management', src: '/Service Management.png', menu: 'Service Management' },


    ];

    /* =========================================
       OPEN / CLOSE PANEL
    ========================================= */

    const openPanel = (menuName) => {
        /* clicking same tile closes panel */
        setSelectedMenu(prev => prev === menuName ? null : menuName);
    };

    return (

        <div className={`dashboard-layout ${selectedMenu ? 'panel-open' : ''}`}>

            {/* =========================================
                    LEFT PANEL
                ========================================= */}

            <div className="left-panel">


                {/* HR Partner Title */}
                <div className="card-box hr-partner-title">
                    <div className="section-title">HR Partner</div>
                </div>

                {/* HR Partner Content */}
                <div className="card-box hr-partner-content">
                    <div className="profile-content">
                        <p>HR Partner Name :</p>
                        <h5>Shiva Sharma (1029189)</h5>
                    </div>
                </div>

                {/* POPULAR LINKS */}
                {/* <div className="card-box">
                        <div className="section-title">Popular Links</div>
                        <div className="link-item">Holiday Lists</div>
                        <div className="link-item">Leave Policy</div>
                        <div className="link-item">Rootz</div>
                        <div className="link-item">Create RIN (BrassRing)</div>
                        <div className="link-item">Create RIN (Zyter Employee)</div>
                        <div className="link-item">Employee Referral Portal</div>
                        <div className="link-item">Employee Referral Process</div>
                    </div> */}


                {/* Popular Links Title */}
                <div className="card-box popular-links-title">
                    <div className="section-title">Popular Links</div>
                </div>

                {/* Popular Links List */}
                <div className="card-box popular-links-list">
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

                            className={`dashboard-tile ${selectedMenu === tile.menu
                                ? 'active-tile'
                                : ''
                                }`}

                            data-tile={tile.key}
                            title={tile.label}


                            onClick={() => {

                                /* =========================================
                                   OPEN EXTERNAL LINKS
                                ========================================= */

                                if (tile.externalLink) {

                                    window.open(
                                        tile.externalLink,
                                        '_blank'
                                    );

                                    return;
                                }

                                /* =========================================
                                   OPEN RIGHT PANEL
                                ========================================= */

                                openPanel(tile.menu);

                            }}
                        >

                            <img
                                src={getTileSrc(tile)}
                                alt={tile.label}
                                className="tile-img"
                                title={tile.label} 
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

                    {/* <div className="section-title menu-title"> */}
                    <div
                        className="section-title menu-title"
                        data-menu={getMenuKey(selectedMenu)}
                    >


                        {selectedMenu && menuIcons[selectedMenu] && (
                            <img
                                src={publicAsset(menuIcons[selectedMenu])}
                                alt={selectedMenu}
                                className="option-icon"
                            />
                        )}

                        <span>{selectedMenu}</span>

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
    );
}

export default DashboardCards;
