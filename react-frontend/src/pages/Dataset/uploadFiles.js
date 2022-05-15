import axios from "axios";


export default function uploadFiles(files) {
        const url = '/api/upload_dataset';

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