import "./featured.css"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { render } from "react-dom";

// Animation
import { easeQuadInOut } from "d3-ease";
import AnimatedProgressProvider from "../AnimatedProgressProvider";

const Featured = ({ progress }) => {

    return (<div className="featured">
        <div className="top">

            <h1 className="title">Simulation</h1>
            <MoreVertIcon fontSize="small" style={{ fill: 'gray' }} />

        </div>
        <div className="bottom">

            <div className="featuredChart">
                <AnimatedProgressProvider
                    valueStart={progress.start}
                    valueEnd={progress.end}
                    duration={1.4}
                    easingFunction={easeQuadInOut}
                    // repeat
                >
                    {value => {
                        const roundedValue = Math.round(value);
                        return (
                            <CircularProgressbar
                                strokeWidth={3}
                                value={value}
                                text={`${roundedValue}%`}
                                /* This is important to include, because if you're fully managing the
                          animation yourself, you'll want to disable the CSS animation. */
                                styles={buildStyles({ pathTransition: "none" })}
                            />
                        );
                    }}
                </AnimatedProgressProvider>
                {/* <CircularProgressbar value={progress} text={`${progress}%`} strokeWidth={3} styles={buildStyles({ pathTransitionDuration: 0.5 })} /> */}
            </div>

            {/* <p className="title">Tyotal sales made toda</p>
            <p className="amount">$420</p> */}
            { progress.end === 100 ? <p className="desc">Simulation succesfully finished</p> : <p className="desc">Simulation is in progress... (calculating stats, users, items)</p> }

            <div className="summary">

                <div className="item">
                    <div className="itemTitle">Today</div>
                    <div className="itemResult">
                        <ArrowDropUpIcon fontSize="small" style={{ fill: 'green' }} />
                        <div className="resultAmount">12.4k</div>
                    </div>
                </div>

                <div className="item">
                    <div className="itemTitle">Last Week</div>
                    <div className="itemResult">
                        <ArrowDropUpIcon fontSize="small" style={{ fill: 'red' }} />
                        <div className="resultAmount">12.4k</div>
                    </div>
                </div>

                <div className="item">
                    <div className="itemTitle">Last Month</div>
                    <div className="itemResult">
                        <ArrowDropUpIcon fontSize="small" style={{ fill: 'green' }} />
                        <div className="resultAmount">12.4k</div>
                    </div>
                </div>

            </div>
        </div>
    </div>
    );
}

export default Featured;