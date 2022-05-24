import "./single.css"
import Sidebar from "../../components/sidebar/Sidebar"
import Chartx from "../../components/chart/Chartx"
import Tablex from "../../components/table/Tablex"

const Single = () => {
    return (
        <div className="single">
            <div className="singleContainer">
                <div className="top">
                    <div className="left">
                        <h1 className="title">User information</h1>
                        <div className="item">
                            <img src="https://m.media-amazon.com/images/I/81hH5vK-MCL._AC_UY327_FMwebp_QL65_.jpg" alt=""
                                 className="itemImg"/>
                            <div className="details">
                                <h1 className="itemTitle">Jane Doe</h1>
                                <div className="detailItem">
                                    <span className="itemKey">Email:</span>
                                    <span className="itemValue">Email:janedoe@gmail.com</span>
                                </div>
                                <div className="detailItem">
                                    <span className="itemKey">Phone:</span>
                                    <span className="itemValue">048493992388</span>
                                </div>
                                <div className="detailItem">
                                    <span className="itemKey">Address:</span>
                                    <span className="itemValue">Boomsesteenweg</span>
                                </div>
                                <div className="detailItem">
                                    <span className="itemKey">Country:</span>
                                    <span className="itemValue">Belgium</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="right">
                        <Chartx title="History over time"/>
                    </div>
                </div>
                <div className="bottom">
                    <h1 className="title">Last transactions</h1>
                    <Tablex/>
                </div>
            </div>
        </div>
    );
}

export default Single;