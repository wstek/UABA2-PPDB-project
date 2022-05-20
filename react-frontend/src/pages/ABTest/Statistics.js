import AlgorithmsOverview from "../../components/AlgorithmsOverview";
import LineChart from "../../components/chart/LineChart";
import {ColoredLine} from '../../components/ColoredLine';
import {useEffect, useReducer, useState} from "react";
import InputSelector from "../../components/InputSelector";
import {fetchData} from "../../utils/fetchAndExecuteWithData";
import DateSlider from "../../components/DateSlider";
import {Route, Switch, useHistory, useParams} from "react-router-dom";
import * as PropTypes from "prop-types";
import NotFound from "../NotFound";
import React from 'react';
import BootstrapTable from "../../components/table/BootstrapTable";
import {PurpleSpinner} from "../../components/PurpleSpinner";
import {TopKPerAlgorithmTable} from "../../components/table/ReactTable";

const reducer = (state, action) => {
    return {...state, [action.field]: action.value};
}
const initialValue = {
    input_algorithms: null,
    active_user_over_time: null,
    purchases_over_time: null,
    click_through_rate_over_time: null,
    attribution_rate_over_time: null,
    abtest_data: null,
    selected_start_date: null,
    selected_end_date: null,
    not_found: null
}


function ABTestOverview({abtest_information}) {
    const columns = React.useMemo(() => [{
        Header: 'ABTest-ID', accessor: 'abtest-id',
    }, {
        Header: 'Dataset', accessor: 'dataset-name',
    }, {
        Header: 'Created on', accessor: 'created-on',
    }, {
        Header: 'Start', accessor: 'start_date',
    }, {
        Header: 'End', accessor: 'end_date',
    }, {
        Header: 'StepSize', accessor: 'stepsize',
    }, {
        Header: 'Top-K', accessor: 'top-k',
    }], [])

    if (!abtest_information) return <PurpleSpinner/>
    return (<BootstrapTable columns={columns} data={[abtest_information]}/>)
}

ABTestOverview.propTypes = {input_algorithms: PropTypes.any};

function StatisticsInformation() {
    const history = useHistory();
    const [state, setState] = useReducer(reducer, initialValue);

    let {abtest_id} = useParams();
    const setInputAlgorithms = (data) => setState({field: 'input_algorithms', value: data})
    // const setSelectedABTest = (data) => setState({field: 'selected_abtest', value: data})
    const setActiveUsersOverTime = (data) => setState({field: 'active_user_over_time', value: data})
    const setPurchasesOverTime = (data) => setState({field: 'purchases_over_time', value: data})
    const setClickThroughRate = (data) => setState({field: 'click_through_rate_over_time', value: data})
    const setABTestData = (data) => {
        setState({
            field: 'abtest_data', value: data
        })
    }
    const setAttributionRate = (data) => setState({field: 'attribution_rate_over_time', value: data})
    const setSelectedStart = (data) => {
        if (state.selected_start_date !== data) {
            setState({field: 'selected_start_date', value: data})
        }
    }

    const onNotFound = () => {
        setState({field: 'not_found', value: true})
    }
    const setSelectedEnd = (data) => {
        if (state.selected_end_date !== data) {
            setState({field: 'selected_end_date', value: data})
        }
    }


    function fetchABTestData(abortCont) {
        setABTestData(null)
        let url = '/api/abtest/statistics/' + abtest_id + '/ABTest_information'
        fetchData(url, setABTestData, abortCont, {}, onNotFound)
    }

    function fetchInputParameters(abortCont) {
        setInputAlgorithms(null)

        let url = '/api/abtest/statistics/' + abtest_id + '/algorithm_information'
        fetchData(url, (data) => {
            setInputAlgorithms(data);
        }, abortCont, {}, onNotFound)

    }

    function fetchInputActiveUsersOverTime(abortCont) {
        setActiveUsersOverTime(null)
        fetchData('/api/abtest/statistics/' + abtest_id + '/active_users_over_time', setActiveUsersOverTime, abortCont, {}, onNotFound)
    }

    function fetchInputPurchasesOverTime(abortCont) {
        setPurchasesOverTime(null)
        fetchData('/api/abtest/statistics/' + abtest_id + '/purchases_over_time', setPurchasesOverTime, abortCont, {}, onNotFound)
    }

    function fetchCTROverTime(abortCont) {
        setClickThroughRate(null)
        fetchData('/api/abtest/statistics/' + abtest_id + '/CTR_over_time', setClickThroughRate, abortCont, {}, onNotFound)
    }

    function fetchAttRateOverTime(abortCont) {
        setAttributionRate(null)
        fetchData('/api/abtest/statistics/' + abtest_id + '/AttrRate_over_time', setAttributionRate, abortCont, {}, onNotFound)
    }

    useEffect(() => {
        const abortCont = new AbortController();
        state.not_found = false
        if (!abtest_id.error) {
            fetchABTestData(abortCont)
            fetchInputParameters(abortCont);
            fetchInputActiveUsersOverTime(abortCont);
            fetchInputPurchasesOverTime(abortCont)
            fetchCTROverTime(abortCont)
            fetchAttRateOverTime(abortCont)
        }

        return () => abortCont.abort();

    }, [abtest_id],);

    function handleDeleteABTest() {
        let api = '/api/abtest/delete/' + abtest_id + '/'
        if (!window.confirm("Are you sure you want to delete the ABTest?")) {
            return
        }
        fetch(api, {
            method: 'DELETE', credentials: 'include',
        }).then(res => {
            return res.json()
        }).then(data => {
        }).catch(err => {
        })
        history.push('/ABTest/Statistics/');
    }

    if (state.not_found) return <NotFound linkTo={<></>} message={"This ABTest does not exist"}/>

    return <>
        <div className="row text-center align-items-end">
            <div>
                <button className={"red-hover button-purple"}
                        onClick={() => handleDeleteABTest()}>
                    Remove ABTest
                </button>
            </div>
        </div>
        <div className="row text-center align-content-center justify-content-center">
            <h1>ABTest Parameters</h1>
            <ABTestOverview abtest_information={state.abtest_data}/>
        </div>
        <div className="row text-center align-content-center justify-content-center">
            <h1>Used algorithms information</h1>
            <AlgorithmsOverview input_algorithms={state.input_algorithms}/>
        </div>
            <DateSlider dates={state.abtest_data && state.abtest_data.dates} setStartIndex={setSelectedStart}
                        setEndIndex={setSelectedEnd}>
            </DateSlider>
        <div className="row text-center align-content-center mt-5 justify-content-center">
            <h1>Charts</h1>
        </div>
        <div className="row text-center align-content-center justify-content-center">
            <div className="col-12 col-lg-6 col-xl-6 col-xxl-6" style={{height: "400px"}}>
                <LineChart chart_id={1} title="Active Users" xMin={state.selected_start_date}
                           xMax={state.selected_end_date}
                           XFnY={state.active_user_over_time}/>
            </div>
            <div className="col-12 col-lg-6 col-xl-6 col-xxl-6" style={{height: "400px"}}>
                <LineChart chart_id={2} title={"Purchases"} xMin={state.selected_start_date}
                           xMax={state.selected_end_date} XFnY={state.purchases_over_time}/>
            </div>
        </div>
        <div className="row text-center align-content-center justify-content-center">
            <div className="col-12 col-lg-6 col-xl-6 col-xxl-6 " style={{height: "400px"}}>
                <LineChart chart_id={3} title="Click Through Rate" xMin={state.selected_start_date}
                           xMax={state.selected_end_date}
                           XFnY={state.click_through_rate_over_time}/>
            </div>
            <div className="col-12 col-lg-6 col-xl-6 col-xxl-6" style={{height: "400px"}}>
                <LineChart chart_id={2} title={"Attribution Rate"} xMin={state.selected_start_date}
                           xMax={state.selected_end_date}
                           XFnY={state.attribution_rate_over_time}/>
            </div>
        </div>
        <TopKPerAlgorithmTable abtest_id={abtest_id}/>
        <ColoredLine color={"purple"}/>
    </>;
}

function Statistics() {
    const [personal_abtests, setPersonalAbTests] = useState(null)
    const history = useHistory();

    function fetchCurrentUserABTestIDs() {
        let url = '/api/abtest/statistics/'
        fetchData(url, (data) => setPersonalAbTests(data.personal_abtestids))
    }

    useEffect(fetchCurrentUserABTestIDs, [])


    // setSelectedABTest(null)

    return (<div className="container-fluid">
        <div className="row text-center align-items-center pt-4 mb-3">
            <InputSelector inputs={personal_abtests}
                           onClick={fetchCurrentUserABTestIDs}
                           onChange={(selected_abtest_id) => {
                               history.push('/ABTest/' + selected_abtest_id + '/Statistics/');
                           }}
                           header={"Select AB-Test"}
            />
        </div>
        <Switch>
            <Route exact path="/ABTest/:abtest_id/Statistics/" children={<StatisticsInformation/>}/>
        </Switch>
    </div>);
}
export default Statistics;