import {Container} from "react-bootstrap";
import Overview from "../../components/Overview";
import LineChart from "../../components/LineChart";
import useGoogleCharts from '../../components/useGoogleCharts';
import {ColoredLine} from '../../components/ColoredLine';
import React from 'react'
import {useEffect,useState} from "react";

function Statistics() {
    const [input_algorithms, setInputAlgorithms] = useState([{}]);

    // popularity retrain look back
    // recency retrain
    // itemknn k,window, normalize retrain
    const algoritmdict = [{Algorithm: "recency", retrain: 10, name: "algorithmLin"},
        {Algorithm: "popularity", retrain: 3, window: 30, name: "algorithmidExp"},
        // {Algorithm: "itemknn",
        // retrain: 40, window: 9, K: 70, Normalize: 1, name: "algorithm3"}
    ]

    const matrix = [[1, 2, 3, 4, 5], [[{value: 1}, {value: 1}], [{value: 2}, {value: 4}], [{value: 3}, {value: 9}], [{value: 4}, {value: 16}], [{value: 5}, {value: 25}]]]

    useEffect(
        () => {
            fetch('/api/abtest/statistics/1/algorithm_information', {
                method: 'GET',
                credentials: 'include'
            }).then(res => {
                return res.json()
            }).then(data => {
                setInputAlgorithms(data)
            }).catch()
        },
        [],
    );

    const google = useGoogleCharts();
    const algorithms = algoritmdict.map(algorithmentry => {
        // return input_algorithms[key].name
        return algorithmentry.name
    })

    return (
        <div className="container-fluid  p-0 my-auto">
            <div className="row text-center">
                <h1>Used algorithms information</h1>
                <Overview input_algorithms={input_algorithms}/>
            </div>
            <div className="row text-center mt-5 align-content-center justify-content-center">
                <h1>Charts</h1>
            </div>
            <div className="row text-center align-content-center justify-content-center">
                <h4>Purchases</h4>
                <LineChart chart_id={1} title="Purchases" google={google} algorithms={algorithms} matrix={matrix}/>
            </div>
            <div className="row text-center mt-5 align-content-center justify-content-center">
                <h4>Active Users</h4>
                <LineChart chart_id={2} title={"Active Users"} google={google} algorithms={algorithms} matrix={matrix}/>
            </div>
            <div className="row text-center mt-5 align-content-center justify-content-center">
                <h4>Click Through Rate</h4>
                <LineChart chart_id={3} title={"CTR"} google={google} algorithms={algorithms} matrix={matrix}/>
            </div>
            <div className="row text-center mt-5 align-content-center justify-content-center">
                <h4>Attribution Rate</h4>
                <LineChart chart_id={4} title={"AR@D"} google={google} algorithms={algorithms} matrix={matrix}/>
            </div>
            <div className="row text-center mt-5 mb-5 align-content-center justify-content-center">
                <h4>Average Revenue Per User</h4>
                <LineChart chart_id={5} title={"ARPU@D"} google={google} algorithms={algorithms} matrix={matrix}/>
            </div>
            <ColoredLine/>
        </div>
    );
}

export default Statistics;