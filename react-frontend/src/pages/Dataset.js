import InputSelector from "../components/InputSelector";
import {useEffect, useState} from "react";
import {fetchData} from "../utils/fetchAndExecuteWithData";
import {PurpleSpinner} from "../components/PurpleSpinner";
import {useHistory, useParams} from "react-router-dom";
import HistogramChart from "../components/chart/HistogramChart";

export function DatasetStatistics() {
    let {dataset_name} = useParams();

    const [dataset_information, setDatasetInformation] = useState(null)
    const fetchDatasetInformation = () => {
        setDatasetInformation(null)
        let url = '/api/get_dataset_information/' + dataset_name
        fetchData(url, (data) => {
            setDatasetInformation(data)
        })
    }
    useEffect(fetchDatasetInformation, [],)

    if (!dataset_information) return <PurpleSpinner/>
    // console.log(dataset_information)
    return (<>
            <div className="row row-cols-1 row-cols-lg-3 g-4 text-center mx-auto align-content-center">
                <div className={"col-12 col-4-lg"}>
                    <div className="card h-100">
                        <div className="card-body">
                            <h4 className="card-title">#Customers: {dataset_information.user_count}</h4>
                            <p className="card-text">Unique customers present in this dataset.</p>
                            <a href="/users" className="orange-hover button-purple">View all customers</a>
                        </div>
                    </div>
                </div>
                <div className={"col-12  col-4-lg"}>
                    <div className="card h-100">
                        <div className="card-body">
                            <h4 className="card-title">#Interactions: {dataset_information.purchase_count}</h4>
                            <p className="card-text">Unique purchases made in this dataset.</p>
                        </div>
                    </div>
                </div>
                <div className={"col-12 col-4-lg"}>
                    <div className="card h-100">
                        <div className="card-body">
                            <h4 className="card-title">#Articles: {dataset_information.purchase_count}</h4>
                            <p className="card-text">Unique articles present in this dataset.</p>
                            <a href="/items" className="orange-hover button-purple">View all articles</a>
                        </div>
                    </div>
                </div>
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