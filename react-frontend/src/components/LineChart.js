import {Chart} from "react-google-charts";
import {Spinner} from "react-bootstrap";

function LineChart({XFnY, title}) {
    const options = {
        title: title,
        curveType: 'function',
        legend: {position: 'bottom'}
    };
    return (
        <div className="container-fluid ">
            <div className="row text-center  align-content-center mb-3 justify-content-center">
                <div className="container">
                    {XFnY && XFnY.graphdata.length > 1 ? <Chart
                        chartType="LineChart"
                        width="100%"
                        height="400px"
                        data={XFnY.graphdata}
                        options={options}
                    />
                    :
                    <Spinner animation="border" className="purple-color" variant="danger" />
                    }
                </div>
            </div>
        </div>
    )
}

export default LineChart;