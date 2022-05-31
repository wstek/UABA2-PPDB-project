import AlgorithmsOverview from "../../components/AlgorithmsOverview";
import LineChart from "../../components/chart/LineChart";
import React, {useContext, useEffect, useReducer, useState} from "react";
import InputSelector from "../../components/InputSelector";
import {fetchData} from "../../utils/fetchAndExecuteWithData";
import DateSlider from "../../components/DateSlider";
import {Link, Route, Switch, useHistory, useParams} from "react-router-dom";
import * as PropTypes from "prop-types";
import NotFound from "../NotFound";
import BootstrapTable from "../../components/table/BootstrapTable";
import {PurpleSpinner} from "../../components/PurpleSpinner";
import CustomerOverview from "../../components/table/StatisticsCustomerTable";
import {ABTestContext} from "../../utils/Contexts.js";
import {TopKPerAlgorithmTable, TopKPurchasedTable} from "../../components/table/ReactTable";

const reducer = (state, action) => {
    return {...state, [action.field]: action.value};
}
const initialValue = {
    input_algorithms: null,
    active_user_over_time: null,
    purchases_over_time: null,
    click_through_rate_over_time: null,
    attribution_rate_over_time: null,
    selected_start_date: null,
    selected_end_date: null,
    not_found: null,
    abtest_data: null
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

function GeneralABTestInformation({abtest_data, input_algorithms}) {
    return <div className="row text-center align-content-center justify-content-center">
        <div className={"col-auto my-auto"}>
            <h1>ABTest Parameters</h1>
            <ABTestOverview abtest_information={abtest_data}/>
        </div>
        <div className={"col-auto"}>
            <h1>Used algorithms information</h1>
            <AlgorithmsOverview input_algorithms={input_algorithms}/>
        </div>
    </div>;
}

function ABTestCharts({graphdata}) {
    const {
        active_user_over_time, purchases_over_time, click_through_rate_over_time, attribution_rate_over_time
    } = graphdata

    const {end_date_index, start_date_index} = useContext(ABTestContext);
    return (<>
        <div className="row text-center align-content-center justify-content-center g-0 ">
            <div className="col-12 col-lg-12 col-xl-6 col-xxl-6 " style={{minHeight: "400px"}}>
                <LineChart chart_id={1} title="Active Users" xMin={start_date_index}
                           xMax={end_date_index}
                           XFnY={active_user_over_time}/>
            </div>
            <div className="col-12 col-lg-12 col-xl-6 col-xxl-6" style={{minHeight: "400px"}}>
                <LineChart chart_id={2} title={"Purchases"} xMin={start_date_index}
                           xMax={end_date_index} XFnY={purchases_over_time}/>
            </div>
        </div>
        <div className="row text-center align-content-center justify-content-center g-0">
            <div className="col-12 col-lg-12 col-xl-6 col-xxl-6 " style={{minHeight: "400px"}}>
                <LineChart chart_id={3} title="Click Through Rate" xMin={start_date_index}
                           xMax={end_date_index}
                           XFnY={click_through_rate_over_time} ex_options={{
                    vAxis: {
                        format: '#.######%'
                    }

                }}
                           formatters={[{
                               type: "NumberFormat", column: 1, options: {
                                   pattern: '#.######%',
                               }
                           }]}
                />
            </div>
            <div className="col-12 col-lg-12 col-xl-6 col-xxl-6 " style={{minHeight: "400px"}}>
                <LineChart chart_id={2} title={"Attribution Rate"} ex_options={{
                    vAxis: {
                        format: '#.######%'
                    }
                }} xMin={start_date_index}
                           xMax={end_date_index}
                           XFnY={attribution_rate_over_time}
                           formatters={[{
                               type: "NumberFormat", column: 1, options: {
                                   pattern: '#.######%',
                               }
                           }]}
                />
            </div>
        </div>
    </>);
}


function TopK() {
    const {abtest_id, start_date, end_date, start_date_index, end_date_index} = useContext(ABTestContext);
    console.log(start_date, end_date)
    return (<>
        <div className="col-auto " style={{minHeight: "400px"}}>
            <TopKPerAlgorithmTable abtest_id={abtest_id}
                                   start_date={start_date}
                                   end_date={end_date}/> :

        </div>
        <div className="col-auto my-auto" style={{minHeight: "400px"}}>
            <TopKPurchasedTable start_date={start_date_index} end_date={end_date_index}
                                abtest_id={abtest_id}/>
        </div>
    </>);
}


function StatisticsInformation() {
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
    const setAttributionRate = (data) => {

        // if (data) {
        //     console.log(data)
        //     data.graphdata[0][0]= { type:'date' , Date: data.graphdata[0][0]}
        //     // for (let ent in data.graphdata) {
        //     //
        //     //     let d = new Date(data.graphdata[ent][0])
        //     //     if ( !isNaN(d) ) {
        //     //
        //     //         data.graphdata[ent][0] = d
        //     //     }
        //     //     data.graphdata[ent].type = 'date'
        //     // }
        // }
        // console.log(data)
        setState({field: 'attribution_rate_over_time', value: data})
    }
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
        let url = `/api/statistics/abtest/${abtest_id}/ABTest_information`
        fetchData(url, setABTestData, abortCont, {}, onNotFound)
    }

    function fetchInputParameters(abortCont) {
        setInputAlgorithms(null)

        let url = `/api/statistics/abtest/${abtest_id}/algorithm_information`
        fetchData(url, (data) => {
            setInputAlgorithms(data);
        }, abortCont, {}, onNotFound)

    }

    function fetchInputActiveUsersOverTime(abortCont) {
        setActiveUsersOverTime(null)
        fetchData(`/api/statistics/abtest/${abtest_id}/active_users_over_time`, setActiveUsersOverTime, abortCont, {}, onNotFound)
    }

    function fetchInputPurchasesOverTime(abortCont) {
        setPurchasesOverTime(null)
        fetchData(`/api/statistics/abtest/${abtest_id}/purchases_over_time`, setPurchasesOverTime, abortCont, {}, onNotFound)
    }

    function fetchCTROverTime(abortCont) {
        setClickThroughRate(null)
        fetchData(`/api/statistics/abtest/${abtest_id}/CTR_over_time`, setClickThroughRate, abortCont, {}, onNotFound)
    }

    function fetchAttRateOverTime(abortCont) {
        setAttributionRate(null)
        fetchData(`/api/statistics/abtest/${abtest_id}/AttrRate_over_time`, setAttributionRate, abortCont, {}, onNotFound)
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

    if (state.not_found) return <NotFound linkTo={<></>} message={"This ABTest does not exist"}/>
    if (!state || !state.abtest_data) return <PurpleSpinner/>

    return <ABTestContext.Provider value={{
        abtest_id,
        start_date_index: state.selected_start_date,
        start_date: state.abtest_data.dates[state.selected_start_date],
        end_date_index: state.selected_end_date,
        end_date: state.abtest_data.dates[state.selected_end_date],
        setSelectedStart,
        setSelectedEnd
    }}>
        <DateSlider dates={state.abtest_data && state.abtest_data.dates} style={{minHeight: "200px"}}/>

        <div className="row text-center align-content-center justify-content-center mx-auto mt-3">

            <Switch>
                <Route exact path="/Statistics/ABTest/:abtest_id/GeneralInfo"
                       children={<GeneralABTestInformation abtest_data={state.abtest_data}
                                                           input_algorithms={state.input_algorithms}/>}/>
                <Route exact path="/Statistics/ABTest/:abtest_id/Graphs"
                       children={<ABTestCharts graphdata={state}/>}/>
                <Route exact path="/Statistics/ABTest/:abtest_id/TopK"
                       children={<TopK/>}/>
                <Route exact path="/Statistics/ABTest/:abtest_id/Customers"
                       children={<CustomerOverview/>}/>

            </Switch>
        </div>
    </ ABTestContext.Provider>
}

function DeleteABTestButton() {
    const history = useHistory()
    let {abtest_id} = useParams();

    function handleDeleteABTest() {
        let api = `/api/abtest/${abtest_id}/delete/`
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
        history.push('/Statistics/ABTest/');
    }

    return (<div className={"mt-2"}>
        <button className={"red-hover button-purple"}
                onClick={() => handleDeleteABTest()}>
            Remove ABTest
        </button>
    </div>);
}

function InputTabs({inputs, selected_input, linkTo}) {


    return <ul className="nav nav-pills justify-content-center">
        {inputs.map((input) => {
            let active = false
            if (input === selected_input) active = true
            return <li key={input} className={'nav-item ' + (active ? 'purple-active' : 'bg-purple')}>
                <Link className={"nav-link "} style={active ? {color: 'white'} : {color: "black"}} aria-current="page"
                      to={linkTo(input)}>{input}</Link>
            </li>
        })}
    </ul>;
}

function Statistics() {
    const [personal_abtests, setPersonalAbTests] = useState(null)
    const history = useHistory();
    const {abtest_id, statistics} = useParams()


    function fetchCurrentUserABTestIDs() {
        let url = '/api/statistics/'
        fetchData(url, (data) => setPersonalAbTests(data.personal_abtestids))
    }

    useEffect(fetchCurrentUserABTestIDs, [])

    function updateABTest(selected_abtest_id) {
        let link = `/Statistics/ABTest/${selected_abtest_id}`
        if (statistics) link += `/${statistics}`
        history.push(link);
    }

    return (<div className="container-fluid g-0">
        <div className="row text-center align-items-center">
            <div className="col">

                <InputSelector inputs={personal_abtests}
                               onClick={fetchCurrentUserABTestIDs}
                               onChange={updateABTest}
                               header={"Select AB-Test"}
                               selected_input={parseInt(abtest_id)}
                />
                <Route path="/Statistics/ABTest/:abtest_id/" children={<DeleteABTestButton/>}/>
            </div>
            {abtest_id && <div className="col">
                <InputTabs selected_input={statistics} inputs={["GeneralInfo", "Graphs", "TopK", "Customers"]}
                           header={"Select View"}
                           linkTo={(selected_stat) => `/Statistics/ABTest/${abtest_id}/${selected_stat}`}/>
            </div>}

        </div>
        <Switch>
            <Route path="/Statistics/ABTest/:abtest_id/" children={<StatisticsInformation/>}/>
        </Switch>
    </div>);
}


export default Statistics;