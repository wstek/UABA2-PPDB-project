import {Chart} from "react-google-charts";
import {PurpleSpinner} from "../PurpleSpinner"
import {useEffect, useState} from "react";

function LineChart({XFnY, title, xMin = 0, xMax = 10, ex_options ={}}) {
    const [options, setOptions] = useState(null);
    useEffect(() => {
        setOptions({
                title: title,
                // chartArea: {'min-width': '80%', 'height': 'auto'},
                curveType: '',
                legend: {position: 'bottom'},
                hAxis: {
                    viewWindow: {
                        min: xMin,
                        max: xMax
                    },
                },

            ...ex_options

            }
        );
    }, [setOptions, xMin, xMax, title])

    if (!XFnY) return <> <h3>{title}</h3><PurpleSpinner/></>
    else if (XFnY.graphdata.length <= 1) return <><h3>{title}</h3><h5>No Data Points Provided</h5></>


    return (
        <>
            {XFnY && XFnY.graphdata.length > 1 && <Chart
                chartType="LineChart"
                width="100%"
                height="100%"
                data={XFnY.graphdata}
                options={options}
            />
            }
        </>
    )
}

export default LineChart;