import ItemDatatable from "../../components/datatable/ItemDatatable";
import Sidebar from "../../components/sidebar/Sidebar";
import {useEffect, useState, useSyncExternalStore} from "react";
import "./list.css"
import {fetchData} from "../../utils/fetchAndExecuteWithData";
import ABTestPicker from "../../components/ABTestpicker";
import React from "react";
import AlgorithmPicker from "../../components/Algorithmpicker";

const ItemList = () => {
    const [personal_abtests, setPersonalABTests] = useState(null);
    const [personal_algorithms, setPersonalAlgorithms] = useState(null);
    const [selected_abtest, setSelectedABTest] = useState(null);
    const [selected_algorithm, setSelectedAlgorithm] = useState(null);


    function fetchCurrentUserAlgorithm() {
        if(selected_abtest) {
            let url = '/api/abtest/statistics/' + selected_abtest
            fetchData(url, setPersonalAlgorithms)

        }
    }

    function fetchCurrentUserABTestIDs() {
        let url = '/api/abtest/statistics/'
        fetchData(url, setPersonalABTests)

    }



    useEffect(fetchCurrentUserABTestIDs,  [],);
    useEffect(fetchCurrentUserAlgorithm,  [selected_abtest],);
    useEffect(() => {
        const abortCont = new AbortController();
        return () => abortCont.abort();

    }, [selected_abtest],);

    return (

        <div className="list">
            <Sidebar/>
            {/* {!pending && */}
            <div className="container-fluid my-auto">
                {!selected_abtest &&
                <div className="row text-center align-items-center mb-3">
                    <ABTestPicker personal_abtests={personal_abtests} setSelectedABTest={setSelectedABTest}
                                  selected_abtest={selected_abtest}/>
                </div>}
                {selected_abtest && !selected_algorithm &&
                <div className="row text-center align-items-center mb-3">
                    <AlgorithmPicker personal_algorithms={personal_algorithms} setSelectedAlgorithm={setSelectedAlgorithm}
                                  selected_algorithm={selected_algorithm}/>
                </div>}
                {selected_abtest && selected_algorithm &&
                <div className="listContainer">
                    <ItemDatatable abtest_id={selected_abtest} algorithm_id={selected_algorithm}/>
                </div>}
                {/* } */}
            </div>
            // </div>
    );
}

export default ItemList;