import Overview from "../../components/Overview";
import LineChart from "../../components/LineChart";
import {ColoredLine} from '../../components/ColoredLine';
import {useEffect, useReducer, useState} from "react";
import ABTestPicker from "../../components/ABTestpicker";
import {fetchData} from "../../utils/fetchAndExecuteWithData";
import DateSlider from "../../components/DateSlider";

const reducer = (state, action) => {
    return {...state, [action.field]: action.value};
}
const initialValue = {
    selected_abtest: null,
    input_algorithms: null,
    personal_abtests: null,
    active_user_over_time: null,
    purchases_over_time: null,
    click_through_rate_over_time: null,
    attribution_rate_over_time: null,
    abtest_data: null,
    selected_start_date: null,
    selected_end_date: null
}

function Statistics() {
    const [state, setState] = useReducer(reducer, initialValue);

    const setPersonalABTests = (data) => setState({field: 'personal_abtests', value: data})
    const setInputAlgorithms = (data) => setState({field: 'input_algorithms', value: data})
    const setSelectedABTest = (data) => setState({field: 'selected_abtest', value: data})
    const setActiveUsersOverTime = (data) => setState({field: 'active_user_over_time', value: data})
    const setPurchasesOverTime = (data) => setState({field: 'purchases_over_time', value: data})
    const setClickThroughRate = (data) => setState({field: 'click_through_rate_over_time', value: data})
    const setABTestData = (data) => setState({field: 'abtest_data', value: data})
    const setAttributionRate = (data) => setState({field: 'attribution_rate_over_time', value: data})
    const setSelectedStart = (data) => {
        if (state.selected_start_date !== data){
            setState({field: 'selected_start_date', value: data})
        }
    }
    const setSelectedEnd = (data) => {
        if (state.selected_end_date !== data) {
            setState({field: 'selected_end_date', value: data})
        }
    }


    function fetchCurrentUserABTestIDs() {
        let url = '/api/abtest/statistics/'
        fetchData(url, setPersonalABTests)
    }

    function fetchABTestData(abortCont) {
        setABTestData(null)
        let url = '/api/abtest/statistics/' + state.selected_abtest + '/ABTest_information'
        fetchData(url, setABTestData, abortCont)
    }

    function fetchInputParameters(abortCont) {
        setInputAlgorithms(null)

        let url = '/api/abtest/statistics/' + state.selected_abtest + '/algorithm_information'
        fetchData(url, setInputAlgorithms, abortCont)

    }

    function fetchInputActiveUsersOverTime(abortCont) {
        setActiveUsersOverTime(null)
        fetchData('/api/abtest/statistics/' + state.selected_abtest + '/active_users_over_time', setActiveUsersOverTime, abortCont)
    }

    function fetchInputPurchasesOverTime(abortCont) {
        setPurchasesOverTime(null)
        fetchData('/api/abtest/statistics/' + state.selected_abtest + '/purchases_over_time', setPurchasesOverTime, abortCont)
    }

    function fetchCTROverTime(abortCont) {
        setClickThroughRate(null)
        fetchData('/api/abtest/statistics/' + state.selected_abtest + '/CTR_over_time', setClickThroughRate, abortCont)
    }

    function fetchAttRateOverTime(abortCont) {
        setAttributionRate(null)
        fetchData('/api/abtest/statistics/' + state.selected_abtest + '/AttrRate_over_time', setAttributionRate, abortCont)
    }

    useEffect(fetchCurrentUserABTestIDs, [],);
    useEffect(() => {
        const abortCont = new AbortController();

        if (state.selected_abtest) {
            fetchABTestData(abortCont)
            fetchInputParameters(abortCont);
            fetchInputActiveUsersOverTime(abortCont);
            fetchInputPurchasesOverTime(abortCont)
            fetchCTROverTime(abortCont)
            fetchAttRateOverTime(abortCont)

        }

        return () => abortCont.abort();

    }, [state.selected_abtest],);

    function handleDeleteABTest() {
        let api = '/api/abtest/delete/' + state.selected_abtest + '/'
        fetch(api, {
            method: 'DELETE',
            credentials: 'include',
        }).then(res => {
            return res.json()

        }).then(data => {
            // fetchCurrentUserABTestIDs()
        }).catch(err => {
            }
        )
        let temp = {...state.personal_abtests}
        temp.personal_abtestids = state.personal_abtests.personal_abtestids.filter((item) =>
            item !== parseInt(state.selected_abtest))
        setPersonalABTests(temp)
        setSelectedABTest(null)
    }
    // console.log(state)
    return (
        <div className="container-fluid">
            <div className="row text-center align-items-center pt-4 mb-3">
                <ABTestPicker personal_abtests={state.personal_abtests}
                              setSelectedABTest={setSelectedABTest}
                              selected_abtest={state.selected_abtest}/>
            </div>
            {state.selected_abtest && <>

                <div className="row text-center align-items-end">
                    <div>
                        <button className={"red-hover button-purple"}
                                onClick={() => handleDeleteABTest()}>
                            Remove ABTest
                        </button>
                    </div>
                </div>
            </>
            }
            {state.selected_abtest && <>
                <div className="row text-center align-content-center justify-content-center">
                    <h1>Used algorithms information</h1>
                    <Overview input_algorithms={state.input_algorithms}/>
                </div>
                <div className="row text-center align-content-center justify-content-center pt-5">
                    <DateSlider dates={state.abtest_data && state.abtest_data.dates} setStartIndex={setSelectedStart}
                                setEndIndex={setSelectedEnd}>
                    </DateSlider>
                </div>
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
                        <LineChart chart_id={3} title="Click Through Rate" xMin={state.selected_start_date} xMax={state.selected_end_date}
                                   XFnY={state.click_through_rate_over_time}/>
                    </div>
                    <div className="col-12 col-lg-6 col-xl-6 col-xxl-6" style={{height: "400px"}}>
                        <LineChart chart_id={2} title={"Attribution Rate"} xMin={state.selected_start_date} xMax={state.selected_end_date}
                                   XFnY={state.attribution_rate_over_time}/>
                    </div>
                </div>
                <ColoredLine color={"purple"}/>
            </>}
        </div>
    );
}

export default Statistics;