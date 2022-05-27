import React from "react";
import {Chart} from "react-google-charts";
import {PurpleSpinner} from "../PurpleSpinner";

const options = {
    title: "Price distribution",
    legend: {position: "none"},
    colors: ["#aa12b6"],
    bar: {
        groupWidth: '100%',
    },
    // histogram: {lastBucketPercentile: 5},
    vAxis: {scaleType: "mirrorLog"},
};

export default function HistogramChart({data, title}) {
    if (!data) return <> <h3>{title}</h3><PurpleSpinner/></>
    else if (data.length <= 1) return <><h3>{title}</h3><h5>No Data Points Provided</h5></>

    let graphdata = [["Value", "Purchases"]]
    for (const [key, value] of Object.entries(data)){
        graphdata.push([key,value])
    }
  return (
    <Chart chartType="ColumnChart" width="100%" height="400px" data={graphdata} options={options}/>
  );
}
