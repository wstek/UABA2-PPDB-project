import { useState } from "react";
import { Spinner } from "react-bootstrap";
import React from 'react'

function LineChart({ google, matrix, algorithms, chart_id, title }) {
    const [chart, setChart] = useState(null);
    const [chartdata, setChartdata] = useState(null)
    var options = {
        title: title,
        curveType: 'function',
        legend: { position: 'bottom' }
    };

    function nextStep() {
        var data = ""

        if (google) {
            if (!chart) {
                data = new google.visualization.DataTable();
                data.addColumn('number', "Year")
                console.log(algorithms.length)
                for (let i = 0, len = algorithms.length; i < len; i++) {
                    data.addColumn('number', algorithms[i])
                }
            } else {
                data = chartdata
            }
            let matrix2 = []
            for (let i = 0; i < matrix[0].length; i++) {
                let row = []
                let x = matrix[0][i]

                row.push(x)
                for (let j = 0; j < matrix[1][i].length; j++) {
                    let y = matrix[1][i][j].value
                    row.push(y)
                }
                matrix2.push(row)
            }
            console.log(matrix2)

            data.addRows(matrix2)
            setChartdata(data)

            const newChart = new google.visualization.LineChart(document.getElementById('curve_chart' + chart_id));
            newChart.draw(data, options);

            setChart(newChart);
            window.addEventListener('resize', drawChart, false);

        }
    }

    function drawChart() {
        var data = chartdata
        if (data) {
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
                    {!google && <Spinner />}
                    <div id={"curve_chart" + chart_id} className={!google ? 'd-none' : ''} />
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