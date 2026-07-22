
import CloseIcon from '@mui/icons-material/Close';
import { Typography } from '@mui/material';



import API from '../api/api';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';


import { Link, useNavigate } from 'react-router-dom';
import {
    useEffect,
    useState,
    useCallback
} from 'react';
import { formatFullName, formatName } from '../utils/formatters';
import { publicAsset } from '../utils/publicAsset';

import '../styles/navbar.css';





/* =========================================
   THEMES
========================================= */

const themes = {

    aqua: 'Aqua Theme',

    misty: 'Misty Mountains Theme',

    mustang: 'Mustang Theme'
};

function Navbar() {

    const navigate = useNavigate();

    /* =========================================
       STATES
    ========================================= */

    const [username, setUsername] =
        useState('Account');

    const [currentTheme, setCurrentTheme] =
        useState('mustang');


    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);




    const [drawerOpen, setDrawerOpen] = useState(false);
    const [openMenus, setOpenMenus] = useState({});

    const [drawerSearchTerm, setDrawerSearchTerm] = useState('');
    const [drawerSuggestions, setDrawerSuggestions] = useState([]);







    const handleMenuToggle = (menu) => {
        setOpenMenus((prev) => ({
            ...prev,
            [menu]: !prev[menu]
        }));
    };
    /* =========================================
       APPLY THEME
    ========================================= */

    const applyTheme = useCallback((theme) => {

        const key =
            (theme || 'mustang')
                .trim()
                .toLowerCase();

        const validTheme =
            themes[key]
                ? key
                : 'mustang';

        /* SAVE STATE */

        setCurrentTheme(validTheme);

        /* REMOVE OLD THEMES */

        document.body.classList.remove(
            'aqua',
            'misty',
            'mustang'
        );

        /* ADD NEW THEME */

        document.body.classList.add(
            validTheme
        );

        /* SAVE TO HTML */

        document.documentElement.setAttribute(
            'data-theme',
            validTheme
        );

        /* SAVE LOCAL STORAGE */

        localStorage.setItem(
            'theme',
            validTheme
        );

        /* NOTIFY OTHER COMPONENTS */
        const themeEvent = new CustomEvent('themeChange', {
            detail: validTheme
        });

        window.dispatchEvent(themeEvent);
        document.dispatchEvent(themeEvent);

    }, []);

    /* =========================================
       LOAD USER + THEME
    ========================================= */

    useEffect(() => {

        /* USERNAME */

        const storedUsername =
            localStorage.getItem('username');

        if (storedUsername) {
            const formattedUsername = formatName(storedUsername);

            setUsername(formattedUsername);
        }

        /* LOAD SAVED THEME */

        let savedTheme =
            localStorage.getItem('theme');

        if (!savedTheme) {

            savedTheme = 'mustang';

            localStorage.setItem(
                'theme',
                savedTheme
            );
        }

        applyTheme(savedTheme);

    }, [applyTheme]);



    // const fetchUsers = async (value) => {

    //     if (value.trim().length < 3) {
    //         setSuggestions([]);
    //         return;
    //     }

    //     try {
    //         const res = await fetch(
    //             `http://localhost:8080/users/search?keyword=${encodeURIComponent(value)}`
    //         );

    //         const data = await res.json();

    //         setSuggestions(data || []);

    //     } catch (error) {
    //         console.error("Search error:", error);
    //         setSuggestions([]);
    //     }
    // };

    const fetchUsers = async (value) => {

    if (value.trim().length < 3) {
        setSuggestions([]);
        return;
    }

    try {

        const res = await API.get(
            `/users/search?keyword=${encodeURIComponent(value)}`
        );

        console.log("Navbar Search Response:", res.data);

        setSuggestions(res.data || []);

    } catch (error) {

        console.error("Search error:", error);
        setSuggestions([]);
    }
};

    const handleSearchChange = (e) => {
        const value = e.target.value;

        setSearchTerm(value);

        // If less than 3 chars, hide suggestions
        if (value.trim().length < 3) {
            setSuggestions([]);
        }
    };

    const handleSearch = () => {
        if (searchTerm.trim().length < 3) {
            setSuggestions([]);
            return;
        }

        fetchUsers(searchTerm);
    };


    useEffect(() => {
        const handlePopState = () => {
            setDrawerOpen(false);
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);






    /* =========================================
       LOGOUT
    ========================================= */

    const logout = () => {

        localStorage.removeItem('username');

        localStorage.removeItem('token');

        navigate('/');
    };






    const menuOptions = {

        'Asset Management': [
            { label: 'My Asset', path: '/asset-management/myasset' }
        ],

        ELM: [
            { label: 'Initiate Resignation', path: '/elm/initiateresignation' },
            { label: 'Approve Resignation', path: '/elm/approveresignation' },
            { label: 'Revoke Resignation Approval', path: '/elm/revokeresignation' },
            { label: 'My Team Project', path: '/elm/myteamproject' },
            { label: 'Pending Manager Approval', path: '/elm/pendingmanagerapproval' },
            { label: 'Movement Approval', path: '/elm/movementapproval' }
        ],

        'Core HR': [
            { label: 'Employee Dashboard', path: '/core-hr/employeedashboard' }
        ],


        'Covid Vaccination': [
            { label: 'Covid Vaccination', path: '/covid-vaccination/covidvaccination' }
        ],

        Expense: [
            { label: 'Create Expense', path: '/expense/createexpense' },
            { label: 'My Expense', path: '/expense/myexpense' },
            { label: 'Pending Expenses', path: '/expense/pendingexpenses' }
        ],


        'Incident Management': [
            { label: 'Raise Incident', path: '/incident-management/raiseincident' },
            { label: 'My Incidents', path: '/incident-management/myincidents' }
        ],



        'Information Security': [
            {
                label: 'Security Awareness & Training',
                path: '/information-security/securityawarenesstraining'
            }
        ],
        Leave: [
            { label: 'Apply For Leave', path: '/leave/applyleave' },
            { label: 'Leave Balance Summary', path: '/leave/leavebalance' },
            { label: 'My Team Leave', path: '/leave/myteamleave' }
        ],

        MIS: [
            { label: 'MIS View', path: '/mis/misview' }
        ],
        Procurement: [
            {
                label: 'Purchase Request for Approvals',
                path: '/procurement/purchaserequestforapprovals'
            }
        ],


        Project: [
            { label: 'Movement Approval', path: '/project/movementapproval' },
            { label: 'My Project Approval', path: '/project/myprojectapproval' },
            { label: 'Pending Bulk Movement List', path: '/project/pendingbulkmovementlist' },
            { label: 'Pending Project Requests', path: '/project/pendingprojectrequests' }
        ],
        Recruitment: [
            { label: 'My Pending Feedback', path: '/recruitment/mypendingfeedback' }
        ],



        'Skill Pack': [
            { label: 'My Team Skills', path: '/skill-pack/myteamskills' },
            { label: 'Update Skills', path: '/skill-pack/updateskills' },
            { label: 'Upload Resume', path: '/skill-pack/uploadresume' }
        ],
        Rootz: [
            { label: 'My Rootz', path: '/rootz/myrootz' }
        ],

        Timesheet: [
            { label: 'My Timesheet', path: '/timesheet/mytimesheet' },
            { label: 'My Team Timesheet', path: '/timesheet/myteamtimesheet' }
        ],

        Travel: [
            { label: 'Travel Request', path: '/travel/travelrequest' },
            { label: 'Pending Request', path: '/travel/pendingrequest' },
            { label: 'My Travel Request', path: '/travel/mytravelrequest' }
        ],
        'Service Management': [
            { label: 'Raise Service Request', path: '/service-management/raiseservicerequest' },
            { label: 'My Service Request', path: '/service-management/myservicerequest' },
            { label: 'Pending Service Request', path: '/service-management/pendingservicerequest' }
        ],
        Visa: [
            { label: 'Visa Request', path: '/visa/visarequest' },
            { label: 'Pending Visa', path: '/visa/pendingvisa' },
            { label: 'My Visa List', path: '/visa/myvisalist' }
        ],
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




    const handleDrawerSearchChange = (e) => {
        const value = e.target.value;

        setDrawerSearchTerm(value);

        if (!value.trim()) {
            setDrawerSuggestions([]);
            return;
        }

        const searchValue = value.toLowerCase();

        const results = [];
        const addedPaths = new Set();

        Object.entries(menuOptions).forEach(([menuName, menuItems]) => {

            menuItems.forEach((item) => {

                if (
                    menuName.toLowerCase().includes(searchValue) ||
                    item.label.toLowerCase().includes(searchValue)
                ) {
                    if (!addedPaths.has(item.path)) {

                        addedPaths.add(item.path);

                        results.push({
                            menuName,
                            label: item.label,
                            path: item.path
                        });
                    }
                }
            });

        });

        setDrawerSuggestions(results);
    };


    useEffect(() => {
        if (!drawerOpen) {
            setDrawerSearchTerm('');
            setDrawerSuggestions([]);
        }
    }, [drawerOpen]);

    const drawerList = (


        
        <Box sx={{ width: 300 }} role="presentation">
              <ListItem disablePadding>


                    <ListItemButton onClick={() => {
                        setDrawerOpen(false);
                        navigate('/home');
                    }}>


                        <i className="fa-solid fa-house-user drawer-fa-icon"></i>


                        <ListItemText primary="Home" />
                    </ListItemButton>
                </ListItem>

            {/* Search Section */}
            <Box sx={{ p: 2 }}>
                <div className="drawer-search-wrapper">

                    <input
                        type="search"
                        className="drawer-search-box"
                        placeholder="Search Menu"
                        value={drawerSearchTerm}
                        onChange={handleDrawerSearchChange}
                    />

                    <button
                        type="button"
                        className="drawer-search-icon"
                    >
                        {/* <i className="bi bi-search"></i> */}
                    </button>

                    {drawerSuggestions.length > 0 && (
                        <ul className="drawer-search-suggestions">
                            {drawerSuggestions.map((item, index) => (
                                <li
                                    key={index}
                                    onClick={() => {
                                        setDrawerOpen(false);
                                        navigate(item.path);

                                        setDrawerSearchTerm('');
                                        setDrawerSuggestions([]);
                                    }}
                                >
                                    <strong>{item.menuName}</strong>
                                    {' > '}
                                    {item.label}
                                </li>
                            ))}
                        </ul>
                    )}

                    {drawerSearchTerm.trim() !== '' &&
                        drawerSuggestions.length === 0 && (
                            <div className="drawer-no-results">
                                No menu found
                            </div>
                        )
                    }

                </div>

            </Box>

            <List>

              
                {/* 
                <ListItem disablePadding>
                    <ListItemButton onClick={() => {
                        setDrawerOpen(false);
                        navigate('/profile');
                    }}>
                        <ListItemText primary="Profile" />
                    </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton onClick={() => {
                        setDrawerOpen(false);
                        navigate('/reports');
                    }}>
                        <ListItemText primary="Reports" />
                    </ListItemButton>
                </ListItem> */}

                {drawerSearchTerm.trim() === '' &&
                    Object.entries(menuOptions).map(([menuName, menuItems]) => (
                        <div key={menuName}>

                            <ListItem disablePadding>


                                <ListItemButton onClick={() => handleMenuToggle(menuName)}>

                                    {/* ✅ ICON */}
                                    {menuIcons[menuName] && (
                                        <img
                                            src={publicAsset(menuIcons[menuName])}
                                            alt={menuName}
                                            className="drawer-menu-icon"
                                        />
                                    )}

                                    <ListItemText primary={menuName} />

                                    {openMenus[menuName] ? <ExpandLess /> : <ExpandMore />}
                                </ListItemButton>
                            </ListItem>

                            <Collapse
                                in={openMenus[menuName]}
                                timeout="auto"
                                unmountOnExit
                            >
                                <List component="div" disablePadding>

                                    {menuItems.map((item, index) => (
                                        <ListItem
                                            key={index}
                                            disablePadding
                                            sx={{ pl: 3 }}
                                        >
                                            <ListItemButton
                                                onClick={() => {
                                                    setDrawerOpen(false);
                                                    navigate(item.path);
                                                }}
                                            >
                                                {/* <ListItemText primary={`> ${item.label}`} /> */}
                                                {/* <ListItemText primary={`• ${item.label}`} /> */}

                                                <Typography sx={{ mr: 1, color: 'orange', fontSize: 18 }}>
                                                    •
                                                </Typography>

                                                <ListItemText primary={item.label} />

                                            </ListItemButton>
                                        </ListItem>
                                    ))}

                                </List>
                            </Collapse>

                        </div>
                    ))}

                <ListItem disablePadding>
                    <ListItemButton
                        onClick={() => {
                            setDrawerOpen(false);
                            logout();
                        }}
                    >
                        <ListItemText primary="Logout" />
                    </ListItemButton>
                </ListItem>

            </List>
        </Box>
    );
    return (



        <nav className="navbar navbar-expand-lg custom-navbar">

            <div className="container-fluid px-4">

                {/* =========================================
                    LOGO
                ========================================= */}

                <Link
                    className="navbar-brand d-flex align-items-center"
                    to="/home"
                >

                    <img
                        src={publicAsset('Logo-white.png')}
                        alt="Logo"
                        className="logo"
                    />

                </Link>

                {/* =========================================
                    RIGHT SECTION
                ========================================= */}

                <div className="navbar-right">

                    {/* SEARCH */}
                    <div className="search-wrapper">

                        <input
                            type="search"
                            className="search-box"
                            placeholder="Search Employee Profile"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSearch();
                                }
                            }}
                        />

                        {/* <span
                            className="search-icon"
                            onClick={handleSearch}
                            style={{ cursor: 'pointer' }}
                        >
                            <i className="bi bi-search"></i>
                        </span> */}
                        <button
                            type="button"
                            className="search-icon"
                            onClick={handleSearch}
                        >
                            <i className="bi bi-search"></i>
                        </button>

                        {/* ✅ MOVE HERE */}
                        {suggestions.length > 0 && (
                            <ul className="search-suggestions">
                                {suggestions.map(user => (
                                    <li
                                        key={user.id}
                                        onClick={() => {
                                            navigate(`/profile/${user.id}`);
                                            setSearchTerm('');
                                            setSuggestions([]);
                                        }}
                                    >
                                        {formatFullName(user.firstname, user.lastname)}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>



                    {/* USER */}

                    <div className="dropdown">

                        <button
                            className="user-btn dropdown-toggle"
                            type="button"
                            data-bs-toggle="dropdown"
                        >

                            <i className="bi bi-person-fill"></i>

                            <span className="username-text">

                                {username}

                            </span>

                        </button>

                        <ul className="dropdown-menu dropdown-menu-end">

                            <li>

                                <Link
                                    className="dropdown-item"
                                    to="/profile"
                                >

                                    <i className="bi bi-person-fill"></i>

                                    <span>
                                        Profile
                                    </span>

                                </Link>

                            </li>

                            <li>

                                <Link
                                    className="dropdown-item"
                                    to="/reports"
                                >

                                    <i className="bi bi-file-earmark-bar-graph"></i>

                                    <span>
                                        BizX Reports
                                    </span>

                                </Link>

                            </li>

                            <li>

                                <button
                                    className="dropdown-item"
                                    onClick={logout}
                                >

                                    <i className="bi bi-box-arrow-right"></i>

                                    <span>
                                        Logout
                                    </span>

                                </button>

                            </li>

                        </ul>

                    </div>



                    <div className="dropdown">

                        <button
                            className="icon-btn"
                            type="button"

                            data-bs-toggle="dropdown"
                            title="Help | Support"
                        >
                            <span className="material-icons">support</span>
                        </button>

                        <ul className="dropdown-menu dropdown-menu-end support-dropdown">

                            <li className="dropdown-item d-flex align-items-center gap-2">
                                <i className="bi bi-envelope" style={{ color: "#f5a623" }}></i>
                                <span>BizX-Support@infinite.com</span>
                            </li>

                            <li className="dropdown-item d-flex align-items-center gap-2">
                                <i className="bi bi-telephone" style={{ color: "#f5a623" }}></i>
                                <span>USA VoIP # : (001) 347 778 0864</span>
                            </li>

                        </ul>

                    </div>

                    {/* =========================================
                        THEME DROPDOWN
                    ========================================= */}

                    <div className="dropdown">

                        <button
                            className="icon-btn"
                            type="button"
                            data-bs-toggle="dropdown"
                            title="Select Theme"
                        >

                            <span className="material-icons">
                                format_color_fill
                            </span>
                        </button>

                        <ul className="dropdown-menu dropdown-menu-end theme-dropdown">




                            {/* AQUA */}

                            <li>

                                <button
                                    className={`dropdown-item theme-item ${currentTheme === 'aqua'
                                        ? 'active-theme'
                                        : ''
                                        }`}
                                    onClick={() =>
                                        applyTheme('aqua')
                                    }
                                >

                                    <span className="theme-dot aqua-dot"></span>

                                    Aqua Theme

                                </button>

                            </li>

                            {/* MISTY */}

                            <li>

                                <button
                                    className={`dropdown-item theme-item ${currentTheme === 'misty'
                                        ? 'active-theme'
                                        : ''
                                        }`}
                                    onClick={() =>
                                        applyTheme('misty')
                                    }
                                >

                                    <span className="theme-dot misty-dot"></span>

                                    Misty Mountains Theme

                                </button>

                            </li>

                            {/* MUSTANG */}

                            <li>

                                <button
                                    className={`dropdown-item theme-item ${currentTheme === 'mustang'
                                        ? 'active-theme'
                                        : ''
                                        }`}
                                    onClick={() =>
                                        applyTheme('mustang')
                                    }
                                >

                                    <span className="theme-dot mustang-dot"></span>

                                    Mustang Theme

                                </button>

                            </li>

                        </ul>

                    </div>


                    {/* MENU */}

                    {/* <button className="icon-btn" title="Menu">
                        <span className="material-icons">menu</span>
                    // </button> */}

                    {/* // <button
                    //     className="icon-btn"
                    //     title="Menu"
                    //     onClick={toggleDrawer(true)}
                    // >
                    //     <span className="material-icons">menu</span>
                    // </button> */}


                    <button
                        className="icon-btn"
                        title="Menu"
                        onClick={() => setDrawerOpen(!drawerOpen)}
                    >
                        {drawerOpen ? (
                            <CloseIcon />
                        ) : (
                            <span className="material-icons">menu</span>
                        )}
                    </button>
                    {/* <Drawer
                        anchor="right"
                        open={drawerOpen}
                        onClose={toggleDrawer(false)}
                    >
                        {drawerList}
                    </Drawer> */}
                    <Drawer
                        anchor="right"
                        open={drawerOpen}
                        onClose={() => setDrawerOpen(false)}
                    >
                        {drawerList}
                    </Drawer>
                    <>

                    </>

                </div>

            </div>

        </nav>
    );
}

export default Navbar;