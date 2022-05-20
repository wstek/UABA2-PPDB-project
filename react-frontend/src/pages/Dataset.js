import InputSelector from "../components/InputSelector";
import {useEffect, useState} from "react";
import {fetchData} from "../utils/fetchAndExecuteWithData";
import {PurpleSpinner} from "../components/PurpleSpinner";
import {Route, Switch, useParams, Redirect, useHistory} from "react-router-dom";
import HistogramChart from "../components/chart/HistogramChart";

export function DatasetStatistics() {
    let {dataset_name} = useParams();

    const [dataset_information, setDatasetInformation] = useState(null)
    const fetchDatasetInformation = () => {
        setDatasetInformation(null)
        let url = '/api/get_datasets_information/' + dataset_name
        fetchData(url, (data) => {
            console.log(data)
            setDatasetInformation(data)
        })
    }
    useEffect(fetchDatasetInformation, [],)

    if (! dataset_information) return <PurpleSpinner />
    // console.log(dataset_information)
    return (<>
            <div className="row text-center align-items-center pt-4 mb-3">
                <h1>User Count: {dataset_information.user_count}</h1>
            </div>
            <div className="row text-center align-items-center pt-4 mb-3">
                <h1>Item Count: {dataset_information.item_count}</h1>
            </div>
            <div className="row text-center align-items-center pt-4 mb-3">
                <h1>Interaction Count: {dataset_information.purchase_count}</h1>
            </div>
            <div className="row text-center align-items-center pt-4 mb-3">
                <HistogramChart data={dataset_information.prices}/>
            </div>
        </>
    )
}

export default function DatasetPage() {
    const history = useHistory();

    const [dataset_names, setDataSetNames] = useState(null)

    const fetchDatasets = () => {
        let url = '/api/get_datasets'
        fetchData(url, (data) => {
            setDataSetNames(data);
        })
    }


    useEffect(fetchDatasets, [],);
    return (
        <div className="container-fluid">
            <div className="row text-center align-items-center pt-4 mb-3">
                <InputSelector inputs={dataset_names && dataset_names.all_datasets}
                               onChange={(selected_dataset) => history.push('dataset/' + selected_dataset)}
                    // setSelectedInput={setSelectedDataset}
                    // selected_input={selected_dataset}
                               header={"Select Dataset"}
                />
            </div>
            {/*{selected_dataset && <Redirect to={'dataset/'+selected_dataset}></Redirect> }*/}
            {/*{selected_dataset && <DatasetStatistics selected_dataset={selected_dataset}></DatasetStatistics>}*/}

        </div>
    );
}