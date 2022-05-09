import React, {useState} from 'react';
import axios from "axios";
import Papa from "papaparse";
import {PurpleSpinner} from "../../components/PurpleSpinner"


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

    function handleChange(event) {
        let datasets = event.target.files;
        setFiles(datasets);
        parseDatasets(datasets);
    }

    function handleSubmit(event) {
        event.preventDefault();

        let column_select_data = {};

        // get selected columndata
        const purchaseTime = document.getElementById('timeSelect');
        const purchasePrice = document.getElementById('priceSelect');
        const purchaseArticleId = document.getElementById('article idSelect');
        const purchaseCustomerId = document.getElementById('customer idSelect');

        // todo check if all fields were selected
        if (!purchaseTime || !purchasePrice || !purchaseArticleId || !purchaseCustomerId) {
            console.log("Please fill in all input fields.");
        }

        column_select_data["purchaseData"] = {
            "time": datasetColumnNames2[purchaseTime.value],
            "price": datasetColumnNames2[purchasePrice.value],
            "article_id": datasetColumnNames2[purchaseArticleId.value],
            "customer_id": datasetColumnNames2[purchaseCustomerId.value],
        }

        column_select_data["generate_article_metadata"] = generateArticleMetadata;
        if (!generateArticleMetadata) {
            const metadataArticleId = document.getElementById('metadata article idSelect');

            column_select_data["articleMetadata"] = {
                "article_id": datasetColumnNames2[metadataArticleId.value]
            }
        }

        column_select_data["generate_customer_metadata"] = generateCustomerMetadata;
        if (!generateCustomerMetadata) {
            const metadataCustomerId = document.getElementById('metadata customer idSelect');

            column_select_data["customerMetadata"] = {
                "customer_id": datasetColumnNames2[metadataCustomerId.value]
            }
        }

        console.log(JSON.stringify(column_select_data));

        const url = '/api/upload_datasets';

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
                        // console.log(e.target.checked)
                    }}/>
                    {label}
                </label>
            </div>
        )
    }

    const handleAddArticleMetadataAttribute = () => {

    }

    const handleAddCustomerMetadataAttribute = () => {

    }

    const displayArticleMetadataSelections = () => {

    }

    const displayCustomerMetadataSelections = () => {

    }

    return (
        <div className="App" style={{textAlign: "center"}}>
            <h1>Dataset Upload</h1>
            <input type="file" name="csv_file" form={'DatasetUploadForm'} multiple onChange={handleChange} accept=".csv"
                   style={{display: "block", margin: "10px auto"}}/>
            <form id="DatasetUploadForm" onSubmit={handleSubmit}>
                <button type="submit" style={{display: "block", margin: "10px auto"}}>Upload</button>
            </form>
            <button style={{display: "block", margin: "10px auto"}} onClick={handleReset}>Reset</button>
            {parseProgress && PurpleSpinner()}

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
            {displayArticleMetadataSelections}

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
            {displayCustomerMetadataSelections}
        </div>
    );
}




