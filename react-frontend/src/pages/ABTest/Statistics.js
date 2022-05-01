import Overview from "../../components/Overview";
import LineChart from "../../components/LineChart";
import {ColoredLine} from '../../components/ColoredLine';
import {useEffect, useState} from "react";
import ABTestPicker from "../../components/ABTestpicker";
import {Spinner} from "react-bootstrap";

function Statistics() {
    // Currently selected ab test id
    const [selected_abtest, setSelectedABTest] = useState(null)
    // The input algorithms and their parameters
    const [input_algorithms, setInputAlgorithms] = useState(null);
    // The ABTests of the current user
    const [personal_abtests, setPersonalABTests] = useState(null);
    // The Active users of the abtest
    const [activeUsersOverTime, setActiveUsersOverTime] = useState(null);
    // The Purchases of the abtest
    const [purchases, setPurchases] = useState(null);
    // The Purchases of the abtest
    const [clickThroughRate, setClickThroughRate] = useState(null);
    // The Purchases of the abtest
    const [attributionRate, setAttributionRate] = useState(null);
    // The Purchases of the abtest
    const [revenuePerUser, setRevenuePerUser] = useState(null);

    //todo garbage remove
    // popularity retrain look back
    // recency retrain
    // itemknn k,window, normalize retrain
    const algoritmdict = [{Algorithm: "recency", retrain: 10, name: "algorithmLin"},
        {Algorithm: "popularity", retrain: 3, window: 30, name: "algorithmidExp"},
        // {Algorithm: "itemknn",
        // retrain: 40, window: 9, K: 70, Normalize: 1, name: "algorithm3"}
    ]
    function fetchCurrentUserABTestIDs() {
        fetch('/api/abtest/statistics/', {
            method: 'GET',
            credentials: 'include'
        }).then(res => {
            return res.json()
        }).then(data => {
            setPersonalABTests(data['personal_abtestids'])
        }).catch()
    }

    function fetchInputParameters() {
        if (!selected_abtest) return setInputAlgorithms([{}])
        fetch('/api/abtest/statistics/' + selected_abtest + '/algorithm_information', {
            method: 'GET',
            credentials: 'include'
        }).then(res => {
            return res.json()
        }).then(data => {
            setInputAlgorithms(data)
        }).catch()
    }
    function fetchInputActiveUsersOverTime() {
        if (!selected_abtest) return
        fetch('/api/abtest/statistics/' + selected_abtest + '/active_users_over_time', {
            method: 'GET',
            credentials: 'include'
        }).then(res => {
            return res.json()
        }).then(data => {
            setActiveUsersOverTime(data)
        }).catch()
    }

    function fetchInputPurchasesOverTime() {
        if (!selected_abtest) return
        fetch('/api/abtest/statistics/' + selected_abtest + '/purchases_over_time', {
            method: 'GET',
            credentials: 'include'
        }).then(res => {
            return res.json()
        }).then(data => {
            setPurchases(data)
        }).catch()
    }

    useEffect(fetchCurrentUserABTestIDs, [],);
    useEffect(() => {fetchInputParameters(); fetchInputActiveUsersOverTime(); fetchInputPurchasesOverTime()}, [selected_abtest],);


    const algorithms = algoritmdict.map(algorithmentry => {
        // return input_algorithms[key].name
        return algorithmentry.name
    })

    return (
        <div className="container-fluid  p-0 my-auto">
            <div className="row text-center">
                <ABTestPicker personal_abtests={personal_abtests} setSelectedABTest={setSelectedABTest}/>
            </div>
            {selected_abtest && <>
                <div className="row text-center">
                    <h1>Used algorithms information</h1>
                    <Overview input_algorithms={input_algorithms}/>
                </div>
                <div className="row text-center mt-5 align-content-center justify-content-center">
                    <h1>Charts</h1>
                </div>
                <div className="row text-center align-content-center justify-content-center">
                    <div className="col-12 col-lg-6 col-xl-5 col-xxl-6">
                    <h4>Active users</h4>
                    <LineChart chart_id={1} title="Active Users" XFnY={ activeUsersOverTime }/>
                </div>
                </div>
                <div className="row text-center mt-5 align-content-center justify-content-center">
                    <h4>Purchases</h4>
                    <LineChart chart_id={2} title={"Purchases"} XFnY={ purchases }/>
                </div>
                {/*<div className="row text-center mt-5 align-content-center justify-content-center">*/}
                {/*    <h4>Click Through Rate</h4>*/}
                {/*    <LineChart chart_id={3} title={"CTR"} google={google} algorithms={algorithms} matrix={matrix}/>*/}
                {/*</div>*/}
                {/*<div className="row text-center mt-5 align-content-center justify-content-center">*/}
                {/*    <h4>Attribution Rate</h4>*/}
                {/*    <LineChart chart_id={4} title={"AR@D"} google={google} algorithms={algorithms} matrix={matrix}/>*/}
                {/*</div>*/}
                {/*<div className="row text-center mt-5 mb-5 align-content-center justify-content-center">*/}
                {/*    <h4>Average Revenue Per User</h4>*/}
                {/*    <LineChart chart_id={5} title={"ARPU@D"} google={google} algorithms={algorithms} matrix={matrix}/>*/}
                {/*</div>*/}
                <ColoredLine/>
            </>}
        </div>
    );
}

export default Statistics;