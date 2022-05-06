import React, {useState} from 'react';
import axios from "axios";
import Papa from "papaparse";
import {PurpleSpinner} from "../../components/PurpleSpinner"


export default function DatasetUpload() {
    const [files, setFiles] = useState([]);
    const [datasetColumnNames, setDatasetColumnNames] = useState({});
    const [parseProgress, setParseProgress] = useState(false)

    const parseDatasets = (datasets) => {
        const newDatasetColumnNames = {};
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
                newDatasetColumnNames[datasets[index].name] = result.meta['fields'];
            })
            setDatasetColumnNames(newDatasetColumnNames);
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
        const purchaseTime = document.getElementById('timeSelect').value;
        const purchasePrice = document.getElementById('priceSelect').value;
        const purchaseArticleId = document.getElementById('article_idSelect').value;
        const purchaseCustomerId = document.getElementById('customer_idSelect').value;

        console.log(purchaseTime[4]);

        column_select_data["purchaseData"] = {
            "time": {"column_name": purchaseTime[0], "file_name": purchaseTime[1]},
            "price": {"column_name": purchasePrice[0], "file_name": purchasePrice[1]},
            "article_id": {"column_name": purchaseArticleId[0], "file_name": purchaseArticleId[1]},
            "customer_id": {"column_name": purchaseCustomerId[0], "file_name": purchaseCustomerId[1]},
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
                    <select id={name + "Select"} defaultValue={'DEFAULT'} form={'DatasetUploadForm'}>
                        <option value="DEFAULT" disabled hidden>Select a column</option>
                        {Object.keys(datasetColumnNames).map((datasetName, datasetNameIndex) => {
                            return (
                                <optgroup label={datasetName} key={datasetNameIndex}>
                                    {datasetColumnNames[datasetName].map((columnName, columnNameIndex) => {
                                        return (
                                            <option value={columnName + datasetName} key={columnNameIndex}>
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

    return (
        <div className="App" style={{textAlign: "center"}}>
            <h1>Dataset Upload</h1>
            <input type="file" name="csv_file" form={'DatasetUploadForm'} multiple onChange={handleChange} accept=".csv"
                   style={{display: "block", margin: "10px auto"}}/>
            <form id="DatasetUploadForm" onSubmit={handleSubmit}>
                <button type="submit" style={{display: "block", margin: "10px auto"}}>Upload</button>
            </form>
            <button style={{display: "block", margin: "10px auto"}} onClick={handleReset}>Reset</button>
            <button style={{display: "block", margin: "10px auto"}} onClick={handleReset}>Reset</button>
            {parseProgress && PurpleSpinner()}

            {/*purchase data*/}
            <h2>Purchase data columns</h2>
            {displayColumnSelect("time")}
            {displayColumnSelect("price")}
            {displayColumnSelect("article_id")}
            {displayColumnSelect("customer_id")}

            {/*article metadata*/}
            <h2>Article metadata columns</h2>
            <div>
                <label>
                    <input id={'GenerateArticleMetadata'} type="checkbox"/>
                    Generate Metadata?
                </label>
            </div>
            {displayColumnSelect("article_id")}

            {/*customer metadata*/}
            <h2>Customer metadata columns</h2>
            <div>
                <label>
                    <input id={'GenerateCustomerMetadata'} type="checkbox"/>
                    Generate Metadata?
                </label>
            </div>
            {displayColumnSelect("customer_id")}

            {datasetColumnNames["testfile.csv"]}
        </div>
    );
}




