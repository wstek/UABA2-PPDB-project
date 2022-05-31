import {Chart} from "react-google-charts";
import {PurpleSpinner} from "../PurpleSpinner"
import {useEffect, useState} from "react";

function LineChart({XFnY, title, xMin = null, xMax = null, ex_options = {}, formatters = []}) {
    const [options, setOptions] = useState(null);
    const [chartData, setChartData] = useState(null)
    console.log(xMin,xMax)
    const setDates = () => {
        let a = null;
        if (XFnY && XFnY.graphdata) {
            let sum = 0;
            let total_sum = 0;
            a = structuredClone(XFnY.graphdata)
            let daily_average = a[0].length>=3;
            a[0][0] = {label: a[0][0], type: 'date'}
            if (daily_average){
                a[0].push('DailyAverage')
            }
            a[0].push('Average')
            for (let index = 1; index < a.length; index++) {
                a[index][0] = new Date(a[index][0])
                sum = 0
                for (let index_2 = 1; index_2 < a[index].length; index_2++){
                    sum += a[index][index_2]
                }
                if (daily_average) {
                    a[index].push(sum/(a[index].length-1))
                }
                total_sum+=sum
            }
            for (let index = 1; index < a.length; index++) {
                a[index].push(total_sum/(a.length-1))
            }

        }
        console.log(a)
        setChartData(a)
    };

    useEffect(
        setDates, [XFnY])
    useEffect(() => {
        setOptions({
                title: title,
                // chartArea: {'min-width': '80%', 'height': 'auto'},
                curveType: '',
                pointSize: 5,

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