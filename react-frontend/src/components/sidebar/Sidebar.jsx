import "./sidebar.css"
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import AutoAwesomeMotionIcon from '@mui/icons-material/AutoAwesomeMotion';
import SsidChartIcon from '@mui/icons-material/SsidChart';
import HomeIcon from '@mui/icons-material/Home';
import BiotechIcon from '@mui/icons-material/Biotech';
import {Link, useParams} from "react-router-dom"
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import DataObjectIcon from '@mui/icons-material/DataObject';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import PreviewIcon from '@mui/icons-material/Preview';
import PersonIcon from '@mui/icons-material/Person';
import InfoIcon from '@mui/icons-material/Info';
import TimelineIcon from '@mui/icons-material/Timeline';
import logOut from '../../utils/logOut'
import {UserContext} from '../../utils/UserContext'
import {useContext} from "react";

const Sidebar = () => {
// const queryParams = new URLSearchParams(window.location.search);
// const id = queryParams.get('abtest_id');
//     console.log(path)
    let {abtest_id} = useParams()
    const {user, updateUser} = useContext(UserContext);
    // console.log(id); // 55 test null

    return (<div
        className="d-flex flex-column col-auto col-md-3 col-xl-2 px-sm-2 px-0 bg-purple border-dark-purple sticky-sidebar">
        <div
            className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-90">
            <Link to="/"
                  className="d-flex align-items-center pb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                <span className="fs-5 d-none d-sm-inline">Menu</span>
            </Link>
            <ul className="nav nav-pills flex-column mb-sm-auto mb-5 align-items-center align-items-sm-start text-nowrap"
                id="menu">
                <li className="nav-item">
                    <Link to="/" className="nav-link align-middle px-0">
                        <HomeIcon className="icon"/>
                        <span
                            className="ms-1 d-none d-sm-inline">Home</span>
                    </Link>
                </li>
                <li className="nav-item">
                    <Link to="/dashboard" className="nav-link align-middle px-0">
                        <DashboardIcon/>
                        <span
                            className="ms-1 d-none d-sm-inline">Dashboard</span>
                    </Link>
                </li>
                <li>
                    <Link to="#abtest_menu" data-bs-toggle="collapse" className="nav-link px-0 align-middle">
                        <BiotechIcon/> <span
                        className="ms-1 d-none d-sm-inline">AB-Test</span> </Link>
                    <ul className="collapse nav flex-column ms-1" id="abtest_menu" data-bs-parent="#menu">
                        <li className="w-100">
                            <Link to="/abtest/setup" className="nav-link px-3"> <HourglassEmptyIcon/> <span
                                className="d-none d-sm-inline">Setup</span></Link>
                        </li>
                        <li>
                            <Link to="#statistics_menu" data-bs-toggle="collapse"
                                  className="nav-link px-3 align-middle"><SsidChartIcon/> <span
                                className="d-none d-sm-inline">Statistics</span></Link>
                        </li>
                        <ul className="collapse nav flex-column ms-1" id="statistics_menu"
                            data-bs-parent="#abtest_menu">
                            <li className="w-100">
                                <Link to={() => {
                                    if (abtest_id)
                                        return `/Statistics/ABTest/${abtest_id}/GeneralInfo`
                                    return `/Statistics/`
                                }
                                } className="nav-link px-4"> <InfoIcon/>
                                    <span
                                        className="d-none d-sm-inline"> Info</span></Link>
                            </li>
                            <li className="w-100">
                                <Link to={() => {
                                    if (abtest_id)
                                        return `/Statistics/ABTest/${abtest_id}/Graphs`
                                    return `/Statistics/`
                                }
                                } className="nav-link px-4"> <TimelineIcon/>
                                    <span
                                        className="d-none d-sm-inline"> Graphs</span></Link>
                            </li>
                        </ul>
                    </ul>

                </li>
                <li>
                    <Link to="#dataset_menu" data-bs-toggle="collapse"
                          className="nav-link px-0 align-middle"><DataObjectIcon/> <span
                        className="d-none d-sm-inline">Dataset</span></Link>
                </li>
                <ul className="collapse nav flex-column ms-1" id="dataset_menu"
                    data-bs-parent="#menu">
                    {user.admin && <li className="w-100">
                        <Link to="/dataset-upload" className="nav-link px-3"> <FileUploadIcon/> <span
                            className="d-none d-sm-inline"> Upload</span></Link>
                    </li>}
                    <li className="w-100">
                        <Link to="/dataset" className="nav-link px-3"> <PreviewIcon/> <span
                            className="d-none d-sm-inline">View</span></Link>
                    </li>
                </ul>

            </ul>
            <hr/>
            <div className="dropdown pb-5">
                <Link to="#"
                      className="d-flex align-items-center text-white text-decoration-none dropdown-toggle"
                      id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
                    <PersonIcon/>
                    <span className="d-none d-sm-inline mx-1">{user.first_name + ' ' + user.last_name}</span>
                </Link>
                <ul className="dropdown-menu dropdown-menu-dark text-small shadow"
                    aria-labelledby="dropdownUser1">
                    <li><Link className="dropdown-item" to="#">New project...</Link></li>
                    <li><Link className="dropdown-item" to="#">Settings</Link></li>
                    <li><Link className="dropdown-item" to="#">Profile</Link></li>
                    <li>
                        <hr className="dropdown-divider"/>
                    </li>
                    <li>
                        <button className="dropdown-item" to="/sign_in" onClick={() => logOut(updateUser)}>Sign out
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    </div>)
    return (<div className="row flex-nowrap">
        <div className="col-auto col-md-3 col-xl-2 px-sm-2 px-0">
            {/* <div className="top">
                <Link to="/account">
                <img
                    src="https://images.pexels.com/photos/941693/pexels-photo-941693.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"
                    alt=""
                    className="logo" />
                </Link>
            </div> */}
            {/* <hr className="sidebar-hr" /> */}
            <div className="center">
                <ul className="sidebar-ul">

                    <p className="title">MAIN</p>

                    <Link to="/dashboard" style={{textDecoration: "none"}}>
                        <li className="sidebar-li">
                            <DashboardIcon className="icon"/>
                            <span className="sidebar-span">Abtest</span>
                        </li>
                    </Link>

                    <p className="title">LISTS</p>

                    <Link to="/stats" style={{textDecoration: "none"}}>
                        <li className="sidebar-li">
                            <SsidChartIcon className="icon"/>
                            <span className="sidebar-span">Stats</span>
                        </li>
                    </Link>

                    <Link to="/users" style={{textDecoration: "none"}}>
                        <li className="sidebar-li">
                            <PersonOutlineOutlinedIcon className="icon"/>
                            <span className="sidebar-span">Users</span>
                        </li>
                    </Link>

                    <Link to="/items" style={{textDecoration: "none"}}>
                        <li className="sidebar-li">
                            <AutoAwesomeMotionIcon className="icon"/>
                            <span className="sidebar-span"> Items</span>
                        </li>
                    </Link>
                </ul>
            </div>
            <div className="bottom">
                <div className="colorOption"></div>
                <div className="colorOption"></div>
            </div>
        </div>
    </div>);
}

export default Sidebar;