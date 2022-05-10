import "./chartx.css"
import { Chart } from "react-google-charts"
import { fetchData } from "../../utils/fetchAndExecuteWithData"
import { useState, useEffect } from "react"

const Chartx = ({title}) => {
    const [activeUsersOverTime, setActiveUsersOverTime] = useState(null);
    const [options, setOptions] = useState(null);
    const [pending, setPending] = useState(true);

    useEffect(() => {
        const abortCont = new AbortController();
        fetch('/api/abtest/statistics/2/active_users_over_time', {
            method: 'GET',
            credentials: 'include',
            signal: abortCont.signal
        }).then(res => res.json())
        .then(data => {
            setOptions({
                // title: title,
                curveType: 'function',
                legend: { position: 'bottom' },
                hAxis: {
                    viewWindow: {
                        min: 0,
                        max: data.graphdata.length
                    },
                }
            })
            setActiveUsersOverTime(data)
            setPending(false);
        }).catch(err => {
            if (err.name === 'AbortError') {
                console.log('fetch aborted')
            }
        }
        )
    }, [])

    console.log("pending:", pending)
    console.log("users:", activeUsersOverTime)

    return (
        <div className="chartx">
            <div className="title">{title}</div>
            {pending ? 'none' :
                <Chart
                    chartType="LineChart"
                    width="100%"
                    height="400px"
                    data={activeUsersOverTime.graphdata}
                    options={options}
                />}
        </div>
    );
}

export default Chartx;