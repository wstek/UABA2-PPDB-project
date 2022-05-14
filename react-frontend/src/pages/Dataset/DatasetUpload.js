import React, {useState} from 'react';
import axios from "axios";
import Papa from "papaparse";
import {PurpleSpinner} from "../../components/PurpleSpinner"

// todo: limit selection to not selected columns and columns from the same csv file
// todo: don't upload and process csv files that are not used

export default function DatasetUpload() {
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
        const newDatasetColumnNames = {};
        const newDatasetColumnNames2 = {};
        setParseProgress(true);

        Promise.all([...datasets].map((dataset) =>
            new Promise((resolve, reject) =>
                Papa.parse(dataset, {
                    // multithreaded
                    worker: true,
                    // includes header in the data
                    header: true,
                    skipEmptyLines: true,
                    // reads only the 5 first rows from the data stream
                    preview: 5,
                    complete: resolve,
                })
            )),
        ).then((results) => {
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
        const datasetName = document.getElementById('datasetName');

        // get selected columndata
        const purchaseTime = document.getElementById('timeSelect');
        const purchasePrice = document.getElementById('priceSelect');
        const purchaseArticleId = document.getElementById('article idSelect');
        const purchaseCustomerId = document.getElementById('customer idSelect');

        // todo check if all fields were selected
        if (!datasetName || !purchaseTime || !purchasePrice || !purchaseArticleId || !purchaseCustomerId) {
            alert("Please fill in all input fields.");
        }

        // insert dataset name
        // todo check if dataset name already exists in database
        column_select_data["datasetName"] = datasetName.value;

        // insert selected purchase data columns
        column_select_data["purchaseData"] = {
            "bought_on": datasetColumnNames2[purchaseTime.value],
            "price": datasetColumnNames2[purchasePrice.value],
            "article_id": datasetColumnNames2[purchaseArticleId.value],
            "customer_id": datasetColumnNames2[purchaseCustomerId.value],
        }

        // get selected article metadata columns
        column_select_data["generate_article_metadata"] = generateArticleMetadata;
        if (!generateArticleMetadata) {
            const metadataArticleId = document.getElementById('metadata article idSelect');

            column_select_data["articleMetadata"] = {
                "article_id": datasetColumnNames2[metadataArticleId.value]
            }
        }

        // get selected customer metadata columns
        column_select_data["generate_customer_metadata"] = generateCustomerMetadata;
        if (!generateCustomerMetadata) {
            const metadataCustomerId = document.getElementById('metadata customer idSelect');

            column_select_data["customerMetadata"] = {
                "customer_id": datasetColumnNames2[metadataCustomerId.value]
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
        return (
            <div>
                <label>
                    {name}
                    <br></br>
                    <select id={name + "Select"} defaultValue={'DEFAULT'} form={'DatasetUploadForm'}
                            style={{width: "150px"}}>
                        <option value="DEFAULT" disabled hidden>Select a column</option>
                        {Object.keys(datasetColumnNames).map((datasetName, datasetNameIndex) => {
                            return (
                                <optgroup label={datasetName} key={datasetNameIndex}>
                                    {datasetColumnNames[datasetName].map((columnName, columnNameIndex) => {
                                        return (
                                            <option value={datasetName + columnName} key={columnNameIndex}>
                                                {columnName}
                                            </option>
                                        )
                                    })}
                                </optgroup>
                            )
                        })}
                    </select>
                </label>
            </div>
        )
    }

    const displayGenerateMetadataCheckbox = (label, id, setCheckboxState) => {
        return (
            <div>
                <label>
                    <input id={id} type="checkbox" onChange={(e) => {
                        setCheckboxState(e.target.checked)
                    }}/>
                    {label}
                </label>
            </div>
        )
    }

    const displayArticleMetadataSelections = () => {
        // todo
    }

    const displayCustomerMetadataSelections = () => {
        // todo
    }

    return (
        <div className="App" style={{textAlign: "center"}}>
            <h1>Dataset Upload</h1>

            <input type="file" name="csv_file" form={'DatasetUploadForm'} multiple onChange={handleFileselect}
                   accept=".csv"
                   style={{display: "block", margin: "10px auto"}}/>
            <button style={{display: "block", margin: "10px auto"}} onClick={handleReset}>Reset</button>
            {parseProgress && PurpleSpinner()}

            {/*dataset name*/}
            <input type="text" id="datasetName" name="datasetName"/>

            {/*upload to the server*/}
            <form id="DatasetUploadForm" onSubmit={handleUpload}>
                <button type="submit" style={{display: "block", margin: "10px auto"}}>Upload</button>
            </form>

            {/*purchase data*/}
            <h2>Purchase data columns</h2>
            {displayColumnSelect("time")}
            {displayColumnSelect("price")}
            {displayColumnSelect("article id")}
            {displayColumnSelect("customer id")}

            {/*article metadata*/}
            <h2>Article metadata columns</h2>
            {displayGenerateMetadataCheckbox(
                "Generate Metadata?",
                "GenerateArticleMetadata",
                setGenerateArticleMetadata
            )}
            {!generateArticleMetadata && displayColumnSelect("metadata article id")}
            <button style={{display: "block", margin: "10px auto"}} onClick={handleAddArticleMetadataAttribute}>Add
                article attribute
            </button>
            {/*{displayArticleMetadataSelections}*/}

            {/*customer metadata*/}
            <h2>Customer metadata columns</h2>
            {displayGenerateMetadataCheckbox(
                "Generate Metadata?",
                "GenerateCustomerMetadata",
                setGenerateCustomerMetadata
            )}
            {!generateCustomerMetadata && displayColumnSelect("metadata customer id")}
            <button style={{display: "block", margin: "10px auto"}} onClick={handleAddCustomerMetadataAttribute}>Add
                customer attribute
            </button>
            {/*{displayCustomerMetadataSelections}*/}
        </div>
    );
}




