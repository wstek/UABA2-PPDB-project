import React, {useEffect, useReducer, useState} from "react";
import InputSelector from "../../components/InputSelector";
import {fetchData} from "../../utils/fetchAndExecuteWithData";
import DateSlider from "../../components/DateSlider";
import {Link, Route, Switch, useHistory, useParams} from "react-router-dom";
import NotFound from "../NotFound";
import {PurpleSpinner} from "../../components/PurpleSpinner";
import CustomerOverview from "../../components/table/StatisticsCustomerTable";
import {ABTestContext} from "../../utils/Contexts.js";
import CustomerList from "../list/CustomerList";
import ItemList from "../list/ItemList";
import TopK from './TopK'
import GeneralABTestInformation from "./GeneralABTestOverview";
import ABTestCharts from "./ABTestCharts";

const reducer = (state, action) => {
    return {...state, [action.field]: action.value};
}
const initialValue = {
    input_algorithms: null,
    active_user_over_time: null,
    purchases_over_time: null,
    click_through_rate_over_time: null,
    attribution_rate7_over_time: null,
    attribution_rate30_over_time: null,
    selected_start_date: null,
    selected_end_date: null,
    not_found: null,
    abtest_data: null,
    arpu_7: null,
    arpu_30: null
}


function StatisticsInformation() {
    const [state, setState] = useReducer(reducer, initialValue);

    let {abtest_id} = useParams();
    const setInputAlgorithms = (data) => setState({field: 'input_algorithms', value: data})
    // const setSelectedABTest = (data) => setState({field: 'selected_abtest', value: data})
    const setActiveUsersOverTime = (data) => setState({field: 'active_user_over_time', value: data})
    const setPurchasesOverTime = (data) => {
        setState({field: 'purchases_over_time', value: data})
    }
    const setClickThroughRate = (data) => setState({field: 'click_through_rate_over_time', value: data})
    const setABTestData = (data) => {
        setState({
            field: 'abtest_data', value: data
        })
    }
    const setAttributionRate30 = (data) => {
        setState({field: 'attribution_rate30_over_time', value: data})
    }
    const setARPU30 = (data) => {
        setState({field: 'arpu_30', value: data})
    }
    const setARPU7 = (data) => {
        setState({field: 'arpu_7', value: data})
    }
    const setAttributionRate7 = (data) => {
        setState({field: 'attribution_rate7_over_time', value: data})
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
        fetchData(`/api/statistics/abtest/${abtest_id}/active_users_over_time`, setActiveUsersOverTime, abortCont, {}, onNotFound)
    }

    function fetchInputPurchasesOverTime(abortCont) {
        fetchData(`/api/statistics/abtest/${abtest_id}/purchases_over_time`, setPurchasesOverTime, abortCont, {}, onNotFound)
    }

    function fetchCTROverTime(abortCont) {
        fetchData(`/api/statistics/abtest/${abtest_id}/CTR_over_time`, setClickThroughRate, abortCont, {}, onNotFound)
    }

    function fetchAttRate7OverTime(abortCont) {
        fetchData(`/api/statistics/abtest/${abtest_id}/AttrRate7_over_time`, setAttributionRate7, abortCont, {}, onNotFound)
    }
    function fetchARPU7OverTime(abortCont) {
        fetchData(`/api/statistics/abtest/${abtest_id}/ARPU7_over_time`, setARPU7, abortCont, {}, onNotFound)
    }
    function fetchARPU30OverTime(abortCont) {
        fetchData(`/api/statistics/abtest/${abtest_id}/ARPU30_over_time`, setARPU30, abortCont, {}, onNotFound)
    }
    function fetchAttRate30OverTime(abortCont) {
        fetchData(`/api/statistics/abtest/${abtest_id}/AttrRate30_over_time`, setAttributionRate30, abortCont, {}, onNotFound)
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
            fetchAttRate7OverTime(abortCont)
            fetchAttRate30OverTime(abortCont)
            fetchARPU7OverTime(abortCont)
            fetchARPU30OverTime(abortCont)
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

        <div className="row text-center align-content-center justify-content-center mx-auto mt-5">

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
                <Route children={<CustomerList/>}
                       exact path={"/Statistics/ABTest/:abtest_id/Customer/:customer_id"}/>
                <Route children={<ItemList/>}
                       exact path={"/Statistics/ABTest/:abtest_id/Item/:item_id"}/>

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
        <div className="row justify-content-center mb-3 text-center center align-items-center">
            <div className="col-auto">

                <InputSelector inputs={personal_abtests}
                               onClick={fetchCurrentUserABTestIDs}
                               onChange={updateABTest}
                               header={"Select AB-Test"}
                               selected_input={parseInt(abtest_id)}
                />
                <Route path="/Statistics/ABTest/:abtest_id/" children={<DeleteABTestButton/>}/>
            </div>
            {abtest_id && <div className="col-auto">
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