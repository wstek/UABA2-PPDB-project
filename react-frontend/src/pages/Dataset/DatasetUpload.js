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
                    // reads only first row (column names) from the data stream
                    preview: 1,
                    complete: resolve,
                })
            )),
        ).then((results) => {
            results.forEach((result, index) => {
                const columnNames = [];
                // get column names
                result.data.map((d) => {
                    return columnNames.push(Object.keys(d));
                });

                newDatasetColumnNames[datasets[index].name] = columnNames[0];
                // newDatasetColumnNames.push(columnNames[0]);
                // newDatasetColumnNames.push(result)
            })
            // now since .then() excutes after all promises are resolved, filesData contains all the parsed files.
            setDatasetColumnNames(newDatasetColumnNames);
            setParseProgress(false);
        }).catch((err) => console.log('Something went wrong:', err))
    }

    function handleChange(event) {
        let datasets = event.target.files;
        setFiles(datasets);
        console.log("parsing datasets...")
        parseDatasets(datasets);
    }

    function handleSubmit(event) {
        event.preventDefault();

        const url = '/api/uploadCSV';

        const formData = new FormData();

        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

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
        setDatasetColumnNames([])
        document.getElementById("DatasetUpload").reset();
    }

    function displayDatasetColumnNames(props) {
        return (
            <div>
                {props.map((items, index) => {
                    return (
                        <ul>
                            {items.map((subItems, sIndex) => {
                                return <li key={sIndex}> {subItems} </li>;
                            })}
                        </ul>
                    );
                })}
            </div>
        );
    }

    const displayColumnSelect = (name) => {
        return (
            <div>
                <label>
                    {name}
                    <br></br>
                    <select>
                        <option value="" disabled selected>Select a column</option>
                        <option value="">column1</option>
                        <option value="">column2</option>
                        <option value="">column3</option>
                        <option value="">column4</option>
                        {Object.keys(datasetColumnNames).map((datasetName, datasetNameIndex) => {
                            {datasetColumnNames[datasetName].map((columnName, columnNameIndex) => {
                                {console.log(columnName)}
                                return <option value="">{columnName}</option>
                            })}
                        })}
                    </select>
                </label>
            </div>
        )
    }

    return (
        <div className="App" style={{textAlign: "center"}}>
            <h1>Dataset Upload</h1>
            <input type="file" name="csv_file" multiple onChange={handleChange} accept=".csv"
                   style={{display: "block", margin: "10px auto"}}/>
            <form id="DatasetUpload" onSubmit={handleSubmit}>
                <button type="submit" style={{display: "block", margin: "10px auto"}}>Upload</button>
            </form>
            <button style={{display: "block", margin: "10px auto"}} onClick={handleReset}>Reset</button>
            {parseProgress && PurpleSpinner()}

            {/*purchase data*/}
            <h3>Purchase data columns</h3>
            {displayColumnSelect("time")}
            {displayColumnSelect("price")}
            {displayColumnSelect("article_id")}
            {displayColumnSelect("customer_id")}

            {/*metadata*/}
            <h2>Metadata</h2>
            <div>
                <label>
                    <input type="checkbox"/>
                    Generate Metadata?
                </label>
            </div>

            {/*article metadata*/}
            <h3>Article metadata columns</h3>
            {displayColumnSelect("article_id")}

            {/*customer metadata*/}
            <h3>Customer metadata columns</h3>
            {displayColumnSelect("customer_id")}

            {datasetColumnNames["testfile.csv"]}
        </div>
    );
}




