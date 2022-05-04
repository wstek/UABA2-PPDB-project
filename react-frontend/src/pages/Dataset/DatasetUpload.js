import React, {useState} from 'react';
import axios from "axios";
import Papa from "papaparse";


export default function DatasetUpload() {
    const [files, setFiles] = useState([]);
    const [datasetColumnNames, setDatasetColumnNames] = useState([]);

    function handleChange(event) {
        let datasets = event.target.files;
        setFiles(datasets);

        let newDatasetColumnNames = [];

        for (let i = 0; i < datasets.length; i++) {
            Papa.parse(datasets[i], {
                // multithreaded
                worker: true,
                // includes header in the data
                header: true,
                skipEmptyLines: true,
                // reads only first row (column names) from the data stream
                preview: 1,
                complete: function (results) {
                    const columnNames = [];
                    // get column names
                    results.data.map((d) => {
                        return columnNames.push(Object.keys(d));
                    });

                    newDatasetColumnNames.push(columnNames[0]);
                    setDatasetColumnNames(newDatasetColumnNames)
                },
            });

            // Papa.parse(datasets[i], {
            //     worker: true,
            //     header: true,
            //     skipEmptyLines: true,
            //     step: function (results, parser) {
            //
            //         //DO MY THING HERE
            //         // get column names
            //         results.data.map((d) => {
            //             rowsArray.push(Object.keys(d));
            //         });
            //
            //         parser.abort();
            //         results = null;   //Attempting to clear the results from memory
            //     }, complete: function (results) {
            //         results = null;   //Attempting to clear the results from memory
            //     }
            // });
        }


        // console.log(rowsArray);
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

    function displayDatasetColumnNames(props) {
        return (
            <div>
                {props.map((items, index) => {
                    return (
                        <ul>
                            {items.map((subItems, sIndex) => {
                                return <li> {subItems} </li>;
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
            {displayDatasetColumnNames(datasetColumnNames)}
        </div>
    );
}




