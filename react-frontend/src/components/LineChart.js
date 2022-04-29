import {Chart} from "react-google-charts";
import React from "react";

function LineChart({XFnY, title}) {
    const options = {
        title: title,
        curveType: 'function',
        legend: {position: 'bottom'}
    };
    return (
        <div className="container-fluid ">
            <div className="row text-center align-content-center mb-3 justify-content-center">
                <div className="container">
                    {XFnY && <Chart
                        chartType="LineChart"
                        width="100%"
                        height="400px"
                        data={XFnY.graphdata}
                        options={options}
                    />}
                </div>
            </div>
        </div>
    )
}

export default LineChart;