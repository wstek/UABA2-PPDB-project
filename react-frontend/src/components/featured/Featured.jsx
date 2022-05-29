import "./featured.css"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import {buildStyles, CircularProgressbar} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

import {easeQuadInOut} from "d3-ease";
import AnimatedProgressProvider from "../AnimatedProgressProvider";

const Featured = ({progress}) => {

    return (<div className="featured">
            <div className="top">
                <h1 className="title">Simulation</h1>
            </div>
            <div className="bottom">

                <div className="featuredChart">
                    <AnimatedProgressProvider
                        valueStart={progress.start}
                        valueEnd={progress.end}
                        duration={1.4}
                        easingFunction={easeQuadInOut}
                    >
                        {value => {
                            const roundedValue = Math.round(value);
                            return (
                                <CircularProgressbar
                                    strokeWidth={3}
                                    value={value}
                                    text={`${roundedValue}%`}
                                    styles={buildStyles({pathTransition: "none"})}
                                />
                            );
                        }}
                    </AnimatedProgressProvider>
                </div>
            </div>
        </div>
    );
}

export default Featured;