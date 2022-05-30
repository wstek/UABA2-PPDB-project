import React, {useState} from "react";
import DatasetUpload from "./DatasetUpload";
import ProgressBar from "@ramonak/react-progress-bar";

export default function DatasetUploadPage(props) {
    const [showDatasetUpload, setShowDatasetUpload] = useState(false)

    const [showUploadProgress, setShowUploadProgress] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    return (
        <div className="DatasetUploadPage" style={{textAlign: "center"}}>

            <button onClick={() => {
                setShowDatasetUpload(!showDatasetUpload)
            }}>
                {showDatasetUpload ? "Cancel dataset upload" : "Upload dataset"}
            </button>

            {
                showUploadProgress &&
                <div>
                    <h2>uploading files</h2>
                    <ProgressBar completed={uploadProgress} transitionDuration={"0s"}/>
                </div>
            }

            {
                showDatasetUpload &&
                <DatasetUpload
                    handleUploadProgress={(progress) => {
                        setUploadProgress(progress);
                        if (progress === 100) {
                            setShowDatasetUpload(false)
                        }
                    }}

                    handleShowUploadProgress={setShowUploadProgress}
                />
            }
        </div>
    );
}