import React, {useEffect, useState} from 'react';
import axios from 'axios';


export default function DatasetUpload() {
    const [files, setFiles] = useState('');
    // const [fileUploadProgress, setFileUploadProgress] = useState(false)
    // const [fileUploadResponse, setFileUploadResponse] = useState(null)

    function handleChange(event) {
        setFiles(event.target.files)

    }

    function handleSubmit(event) {
        event.preventDefault();

        const url = '/api/uploadCSV';

        const formData = new FormData();

        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i])
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
            <form onSubmit={handleSubmit}>
                <h1>React File Upload</h1>
                <input type="file" name="csv_file" multiple onChange={handleChange}/>
                <button type="submit">Upload</button>
            </form>
        </div>
    );
}




