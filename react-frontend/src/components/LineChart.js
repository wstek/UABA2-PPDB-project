import {useState} from "react";
import {Spinner} from "react-bootstrap";

function LineChart({google, matrix, algorithms, chart_id, title}) {
    const [chart, setChart] = useState(null);
    const [chartdata, setChartdata] = useState(null)
    var options = {
        title: title,
        curveType: 'function',
        legend: {position: 'bottom'}
    };

    function nextStep() {
        var data = ""

        if (google) {
            if (!chart) {
                data = new google.visualization.DataTable();
                data.addColumn('number', "Year")
                for (let i = 0, len = algorithms.length; i < len; i++) {
                    data.addColumn('number', algorithms[i])
                }
            } else {
                data = chartdata
            }
            // let row = []
            // for (let i = 0, len = algorithms.length + 1; i < len; i++){
            //     let x = list[0]
            //
            // }


            data.addRows(matrix)
            setChartdata(data)

            const newChart = new google.visualization.LineChart(document.getElementById('curve_chart' + chart_id));
            newChart.draw(data, options);

            setChart(newChart);
            window.addEventListener('resize', drawChart, false);

        }
    }

    function drawChart() {
        var data = chartdata
        if ( data){
            // Instantiate and draw our chart, passing in some options.
            const newChart = new google.visualization.LineChart(document.getElementById('curve_chart' + chart_id));
            newChart.draw(data, options);
            setChart(newChart);

            window.addEventListener('resize', drawChart, false);
        }

    }

    window.onresize = drawChart;

    return (
        <div className="container-fluid ">
            <div className="row text-center align-content-center mb-3 justify-content-center">
                <div className="container">
                    {!google && <Spinner/>}
                    <div id={"curve_chart" + chart_id} className={!google ? 'd-none' : ''}/>
                </div>
            </div>
            <div className="row text-center justify-content-center align-items-center">
                <div>
                    <button className="button-purple btn-lg" onClick={nextStep}> Next step</button>
                </div>
            </div>
        </div>
    )
}

export default LineChart;