import React, {useState} from 'react';
import axios from 'axios';
import csv from 'react-fast-csv'
import {parseStream} from 'fast-csv';


export default function DatasetUpload() {
    const [files, setFiles] = useState([]);
    // const [fileUploadProgress, setFileUploadProgress] = useState(false)
    // const [fileUploadResponse, setFileUploadResponse] = useState(null)

    // console.log(files.length);

    function parseDatasets(datasets) {

        for (let i = 0; i < datasets.length; i++) {
            let row_counter = 0;

            let dataset_stream = datasets[i].stream();

            csv
                .fromStream(dataset_stream, {headers: true})
                .on("data", function (data) {
                    row_counter += 1;
                })
                .on("end", function () {
                    console.log("done, counted " + row_counter + " rows");
                });

            // let CSV_STRING = 'a,b\n' +
            //     'a1,b1\n' +
            //     'a2,b2\n';
            //
            // csv
            //     .fromString(CSV_STRING, {headers: true})
            //     .on("data", function (data) {
            //         console.log(data);
            //     })
            //     .on("end", function () {
            //         console.log("done");
            //     });
        }
    }

    function handleChange(event) {
        let datasets = event.target.files;

        // check file extension
        for (let i = 0; i < datasets.length; i++) {
            // console.log(datasets[i].name.split('.').pop())
            if (datasets[i].name.split('.').pop() !== 'csv') {
                alert('invalid file "' + datasets[i].name + '"');
                // reset form
                document.getElementById("DatasetUpload").reset();
                return;
            }
        }

        setFiles(event.target.files);
        // console.log()
        parseDatasets(datasets)
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

    return (
        <div className="App">
            <form id="DatasetUpload" onSubmit={handleSubmit}>
                <h1>React File Upload</h1>
                <input type="file" name="csv_file" multiple onChange={handleChange}/>
                <button type="submit">Upload</button>
            </form>
        </div>
    );
}




