import {Chart} from "react-google-charts";
import {PurpleSpinner} from "./PurpleSpinner"

function LineChart({XFnY, title}) {
    const options = {
        title: title,
        curveType: 'function',
        legend: {position: 'bottom'}
    };
    if ( ! XFnY) return            <> <h3>{title}</h3><PurpleSpinner/></>
    else if (XFnY.graphdata.length <= 1) return <><h3>{title}</h3><h5>No Data Points Provided</h5></>



    return (
        <div className="container-fluid ">

            <div className="row text-center  align-content-center mb-3 justify-content-center">
                <div className="container">
                    {XFnY && XFnY.graphdata.length > 1 && <Chart
                        chartType="LineChart"
                        width="100%"
                        height="400px"
                        data={XFnY.graphdata}
                        options={options}
                    />

                    }
                </div>
            </div>
        </div>
    )
}

export default LineChart;