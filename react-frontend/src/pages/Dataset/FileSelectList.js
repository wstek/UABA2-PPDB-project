import React from "react";
import FileSeperatorEditor from "./FileSeperatorEditor";
import Papa from "papaparse";

export default function FileSelectList(props) {
    function parseDatasetColumnNames(datasetFiles) {
        // todo: rework this, so that it uses javascript filereader
        // setParseProgress(true);

        console.log(datasetFiles);

        Promise.all([...datasetFiles].map((datasetFile) => new Promise((resolve, reject) => Papa.parse(datasetFile, {
            // multithreaded
            worker: true, // includes header in the data
            header: true, skipEmptyLines: true, // reads only the 5 first rows from the data stream
            preview: 5, complete: resolve,
        }))),).then((results) => {
            let first_column_names = true;
            let previous_column_names = null;
            results.forEach((result, index) => {
                const column_names = result.meta['fields'];
                if (!first_column_names) {
                    for (let i = 0; i < column_names.length; ++i) {
                        if (column_names[i] !== previous_column_names[i]) {
                            alert("selected files contain different columns");
                            return;
                        }
                    }

                } else {
                    first_column_names = false;
                }
                previous_column_names = column_names;

                console.log(column_names);
            })

            // set states
            props.onChangeColumnNames(previous_column_names);

            // setParseProgress(false);
        }).catch((err) => console.log('Something went wrong:', err))
    }

    const handleFileselect = (event) => {
        let datasetFiles = [];
        Array.from(event.target.files).forEach(datasetFile => datasetFiles.push({file: datasetFile, seperator: ","}));
        props.onChangeFiles(datasetFiles);

        parseDatasetColumnNames(event.target.files);
    }

    const handleFileChange = (fileName, seperator) => {
        props.onChangeFiles(oldFiles => oldFiles.map(list_file => list_file.file.name === fileName ?
            {...list_file, seperator: seperator} : list_file));
    }

    return (
        <div>
            <input type="file" name="csv_file" className={"bg-purple"} multiple
                   onChange={handleFileselect} accept=".csv"/>

            {props.files.map((file, index) => (
                <div>
                    <FileSeperatorEditor
                        key={index}
                        fileName={file.file.name}
                        onChange={handleFileChange}
                    />
                </div>
            ))}
        </div>
    )
}