import {Chart} from "react-google-charts";
import {PurpleSpinner} from "../PurpleSpinner"
import {useEffect, useState} from "react";

function LineChart({XFnY, title, xMin = null, xMax = null, ex_options = {}, formatters = []}) {
    const [options, setOptions] = useState(null);
    const [chartData, setChartData] = useState(null)
    const setDates = () => {
        let graphdata = null;
        if (XFnY && XFnY.graphdata) {
            let sum = 0;
            let total_sum = 0;
            graphdata = structuredClone(XFnY.graphdata)
            let algorithm_count = graphdata[0].length-1
            let daily_average = graphdata[0].length>=3;
            graphdata[0][0] = {label: graphdata[0][0], type: 'date'}
            // if more than 2 algorithms
            if (daily_average){
                graphdata[0].push('DailyAverage')
            }
            graphdata[0].push('Average')
            for (let index = 1; index < graphdata.length; index++) {
                //convert strings to dates
                graphdata[index][0] = new Date(graphdata[index][0])
                sum = 0
                for (let index_2 = 1; index_2 < graphdata[index].length; index_2++){
                    sum += graphdata[index][index_2]
                }
                if (daily_average) {
                    graphdata[index].push(sum/(graphdata[index].length-1))
                }
                total_sum+=sum
            }
            for (let index = 1; index < graphdata.length; index++) {
                graphdata[index].push(total_sum/((graphdata.length-1)*(algorithm_count)))
            }

        }

        setChartData(graphdata)
    };

    useEffect(
        setDates, [XFnY])
    useEffect(() => {
        setOptions({
                title: title,
            animation:{
    duration: 1000,
    easing: 'out',
  },
                // chartArea: {'min-width': '80%', 'height': 'auto'},
                curveType: 'function',
                pointSize: 3,
                smoothline: 'true',

                legend: {position: 'bottom'},
                hAxis: {
                    viewWindow: {
                        min: new Date(xMin),
                        max: new Date(xMax)
                    },
                    type: 'date'
                },
                ...ex_options

            }
        );

    }, [setOptions, xMin, xMax, title])
    if (!chartData) return <> <h3>{title}</h3><PurpleSpinner/></>
    else if (chartData.length <= 1) return <><h3>{title}</h3><h5>No Data Points Provided</h5></>
    return (
        <>
            <Chart
                chartType="LineChart"
                width="100%"
                height="100%"
                data={chartData}
                options={options}
                formatters={formatters}
            />

        </>
    )
}

export default LineChart;