import React, {useState} from 'react';
import axios from "axios";
import Papa from "papaparse";


export default function DatasetUpload() {
    const [files, setFiles] = useState([]);
    const [datasetColumnNames, setDatasetColumnNames] = useState([]);

    const parseDatasets = (datasets) => {
        const newDatasetColumnNames = [];

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

                newDatasetColumnNames.push(columnNames[0]);
                // newDatasetColumnNames.push(result)
            })
            // now since .then() excutes after all promises are resolved, filesData contains all the parsed files.
            setDatasetColumnNames(newDatasetColumnNames);
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

    return (
        <div className="App">
            <form id="DatasetUpload" onSubmit={handleSubmit}>
                <input type="file" name="csv_file" multiple onChange={handleChange} accept=".csv"
                       style={{display: "block", margin: "10px auto"}}/>
                <button type="submit" style={{display: "block", margin: "10px auto"}}>Upload</button>
            </form>
            <button style={{display: "block", margin: "10px auto"}} onClick={handleReset}>Reset</button>
            {/*{datasetColumnNames}*/}
            {displayDatasetColumnNames(datasetColumnNames)}
        </div>
    );
}




