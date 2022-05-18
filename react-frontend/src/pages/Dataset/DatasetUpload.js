import React, {useState} from 'react';
import Papa from "papaparse";
import {PurpleSpinner} from "../../components/PurpleSpinner"
import axios from "axios";

// todo: limit selection to not selected columns and columns from the same csv file
// todo: don't upload and process csv files that are not used

export default function DatasetUpload() {
    console.log("hi")
    // dataset files
    const [files, setFiles] = useState([]);

    // dictionary that maps dataset file to columnnames
    const [datasetColumnNames, setDatasetColumnNames] = useState({});
    // dictionary that maps "dataset file + columname" to [dataset file, columname]
    const [datasetColumnNames2, setDatasetColumnNames2] = useState({});

    // dataset files parsing progress
    const [parseProgress, setParseProgress] = useState(false);

    // checkboxes for generating metadata
    const [generateArticleMetadata, setGenerateArticleMetadata] = useState(false);
    const [generateCustomerMetadata, setGenerateCustomerMetadata] = useState(false);

    const parseDatasets = (datasets) => {
        // todo: rework this, so that it uses javascript filereader
        const newDatasetColumnNames = {};
        const newDatasetColumnNames2 = {};
        setParseProgress(true);

        Promise.all([...datasets].map((dataset) => new Promise((resolve, reject) => Papa.parse(dataset, {
            // multithreaded
            worker: true, // includes header in the data
            header: true, skipEmptyLines: true, // reads only the 5 first rows from the data stream
            preview: 5, complete: resolve,
        }))),).then((results) => {
            results.forEach((result, index) => {
                const column_names = result.meta['fields'];
                const dataset_name = datasets[index].name;
                newDatasetColumnNames[dataset_name] = column_names;

                for (let i = 0; i < column_names.length; i++) {
                    const column_name = column_names[i];
                    newDatasetColumnNames2[dataset_name + column_name] = [dataset_name, column_name];
                }
            })

            // set states
            setDatasetColumnNames(newDatasetColumnNames);
            setDatasetColumnNames2(newDatasetColumnNames2);

            setParseProgress(false);
        }).catch((err) => console.log('Something went wrong:', err))
    }

    function getColumnSelectData() {
        let column_select_data = {};

        // get dataset name
        const datasetName = document.getElementById('datasetName').value;

        // get selected columndata
        const purchaseTime = document.getElementById('timeSelect').value;
        const purchasePrice = document.getElementById('priceSelect').value;
        const purchaseArticleId = document.getElementById('article idSelect').value;
        const purchaseCustomerId = document.getElementById('customer idSelect').value;

        // todo check if all fields were selected
        if (!datasetName || !purchaseTime || !purchasePrice || !purchaseArticleId || !purchaseCustomerId) {
            alert("Please fill in all input fields.");
            return {};
        }

        // insert dataset name
        // todo check if dataset name already exists in database
        column_select_data["datasetName"] = datasetName;

        // insert selected purchase data columns
        column_select_data["purchaseData"] = {
            "bought_on": datasetColumnNames2[purchaseTime],
            "price": datasetColumnNames2[purchasePrice],
            "article_id": datasetColumnNames2[purchaseArticleId],
            "customer_id": datasetColumnNames2[purchaseCustomerId],
        }

        // get selected article metadata columns
        column_select_data["generate_article_metadata"] = generateArticleMetadata;
        if (!generateArticleMetadata) {
            const metadataArticleId = document.getElementById('metadata article idSelect').value;

            if (!metadataArticleId) return {};

            column_select_data["articleMetadata"] = {
                "article_id": datasetColumnNames2[metadataArticleId]
            }
        }

        // get selected customer metadata columns
        column_select_data["generate_customer_metadata"] = generateCustomerMetadata;
        if (!generateCustomerMetadata) {
            const metadataCustomerId = document.getElementById('metadata customer idSelect').value;

            if (!metadataCustomerId) return {};

            column_select_data["customerMetadata"] = {
                "customer_id": datasetColumnNames2[metadataCustomerId]
            }
        }

        // debug
        console.log(JSON.stringify(column_select_data));

        return column_select_data;
    }

    function handleFileselect(event) {
        let datasets = event.target.files;
        setFiles(datasets);
        parseDatasets(datasets);
    }


    function handleUpload(event) {
        event.preventDefault();

        const url = '/api/upload_dataset';

        let column_select_data = getColumnSelectData();

        if (Object.keys(column_select_data).length === 0) {
            return;
        }

        // return;

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        formData.append('data', JSON.stringify(column_select_data))

        const config = {
            headers: {
                'content-type': 'multipart/form-data',
            },
        };

        axios.post(url, formData, config).then((response) => {
            console.log(response.data);
        });
    }

    function handleReset() {
        setFiles([])
        setDatasetColumnNames([])
        setParseProgress(false)
        document.getElementById("DatasetUploadForm").reset();
    }

    const handleAddArticleMetadataAttribute = () => {
        // todo
    }

    const handleAddCustomerMetadataAttribute = () => {
        // todo
    }

    const displayColumnSelect = (name) => {
        return (<div>
            <label>
                {name}
                <br></br>
                <select id={name + "Select"} className={"bg-purple"} defaultValue={'DEFAULT'} form={'DatasetUploadForm'}
                        style={{width: "150px"}}>
                    <option value="DEFAULT" className={"bg-purple"} disabled hidden>Select a column</option>
                    {Object.keys(datasetColumnNames).map((datasetName, datasetNameIndex) => {
                        return (<optgroup label={datasetName} key={datasetNameIndex}>
                            {datasetColumnNames[datasetName].map((columnName, columnNameIndex) => {
                                return (<option value={datasetName + columnName} key={columnNameIndex}>
                                    {columnName}
                                </option>)
                            })}
                        </optgroup>)
                    })}
                </select>
            </label>
        </div>)
    }

    const displayGenerateMetadataCheckbox = (label, id, setCheckboxState) => {
        return (<div>
            <label>
                <input id={id} type="checkbox" onChange={(e) => {
                    setCheckboxState(e.target.checked)
                }}/>
                {label}
            </label>
        </div>)
    }

    const displayArticleMetadataSelections = () => {
        // todo
    }

    const displayCustomerMetadataSelections = () => {
        // todo
    }

    return (<>
        <div className="row text-center justify-content-center align-items-center align-content-center">

            <h1>Dataset Upload</h1>
        </div>
        <div className="row text-center justify-content-center align-items-center align-content-center">
            {/*file select*/}
            <div className={"col-auto"}>
                <input type="file" name="csv_file" className={"bg-purple"} form={'DatasetUploadForm'} multiple
                       onChange={handleFileselect}
                       accept=".csv"/>
            </div>
        </div>
        <div className="row text-center justify-content-center align-items-center align-content-center mt-3">
            <div className={"col-auto"}>
                {/*reset button*/}
                <button className={"button-purple red-hover"} onClick={handleReset}>Reset</button>
            </div>
            {/*dataset name textbox*/}
            <div className={"col-auto"}>
                <input type="text" id="datasetName" name="datasetName" className={"bg-purple"}
                       placeholder={"Dataset Name"}/>
            </div>
            <div className={"col-auto"}>

                {/*upload to the server*/}
                <form id="DatasetUploadForm" onSubmit={handleUpload}>
                    <button type="submit" className={"button-purple green-hover"}>Upload</button>
                </form>
            </div>
        </div>

        {/*parse progress*/}
        {parseProgress && (
            <div className="row text-center justify-content-center align-items-center align-content-center">
                <PurpleSpinner/>
            </div>)}

        <div className="row text-center align-content-center mt-4">
            <div className={"col-4"}>

                {/*purchase data*/}
                <h2>Purchase data columns</h2>
                {displayColumnSelect("Time")}
                {displayColumnSelect("Price")}
                {displayColumnSelect("Article ID")}
                {displayColumnSelect("Customer ID")}
            </div>
            <div className={"col-4"}>
                {/*article metadata*/}
                <h2>Article metadata columns</h2>
                {displayGenerateMetadataCheckbox("Generate Metadata?", "GenerateArticleMetadata", setGenerateArticleMetadata)}
                {generateArticleMetadata && displayColumnSelect("metadata article id")}
                {generateArticleMetadata && <button className={"button-purple green-hover mt-3"}
                                                    onClick={handleAddArticleMetadataAttribute}>Add
                    article attribute
                </button>}
                {/*{displayArticleMetadataSelections}*/}
            </div>

            <div className={"col-4"}>
                {/*customer metadata*/}
                <h2>Customer metadata columns</h2>
                {displayGenerateMetadataCheckbox("Generate Metadata?", "GenerateCustomerMetadata", setGenerateCustomerMetadata)}
                {generateCustomerMetadata && displayColumnSelect("metadata customer id")}
                {generateCustomerMetadata && <button className={"button-purple green-hover mt-3"}
                                                     onClick={handleAddCustomerMetadataAttribute}>Add
                    customer attribute
                </button>}
                {/*{displayCustomerMetadataSelections}*/}
            </div>
        </div>
    </>);
}




