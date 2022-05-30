import PurchaseSelect from "./PurchaseSelect";
import MetaSelect from "./MetaSelect";
import React, {useRef, useState} from "react";
import axios from "axios";

export default function DatasetUpload() {
    const datasetNameRef = useRef("")

    const [purchaseFiles, setPurchaseFiles] = useState([]);

    const [purchaseTimeColumnName, setpurchaseTimeColumnName] = useState("");
    const [purchasePriceColumnName, setpurchasePriceColumnName] = useState("");
    const [purchaseArticleIdColumnName, setpurchaseArticleIdColumnName] = useState("");
    const [purchaseCustomerIdColumnName, setpurchaseCustomerIdColumnName] = useState("");

    const [purchaseArticleAttributes, setPurchaseArticleAttributes] = useState({});
    const [purchaseCustomerAttributes, setPurchaseCustomerAttributes] = useState({});

    const [addArticleMetaDataFile, setAddArticleMetaDataFile] = useState(false);
    const [addCustomerMetaDataFile, setAddCustomerMetaDataFile] = useState(false);


    const [articleMetaFiles, setArticleMetaFiles] = useState([]);
    const [articleMetaIdColumnName, setArticleMetaIdColumnName] = useState("")
    const [articleMetaAttributes, setArticleMetaAttributes] = useState({});

    const [customerMetaFiles, setCustomerMetaFiles] = useState([]);
    const [customerMetaIdColumnName, setCustomerMetaIdColumnName] = useState("")
    const [customerMetaAttributes, setCustomerMetaAttributes] = useState({});

    const getFileSeperatorsData = () => {
        let fileSeperatorData = {};

        [purchaseFiles, articleMetaFiles, customerMetaFiles].forEach((fileState) => {
            fileState.forEach(fileInfo => {
                fileSeperatorData[fileInfo.file.name] = fileInfo.seperator;
            })
        })

        return fileSeperatorData;
    }

    const getFileColumnDataTypesData = () => {
        let fileColumnDataTypesData = {};

        purchaseFiles.forEach((fileInfo) => {
            let column_data_types = {};

            column_data_types[purchaseTimeColumnName] = "date";
            column_data_types[purchasePriceColumnName] = "float";
            column_data_types[purchaseArticleIdColumnName] = "Int64";
            column_data_types[purchaseCustomerIdColumnName] = "Int64";

            fileColumnDataTypesData[fileInfo.file.name] = column_data_types;
        });

        articleMetaFiles.forEach((fileInfo) => {
            let column_data_types = {};
            column_data_types[articleMetaIdColumnName] = "Int64"
            fileColumnDataTypesData[fileInfo.file.name] = column_data_types;
        })

        customerMetaFiles.forEach((fileInfo) => {
            let column_data_types = {};
            column_data_types[customerMetaIdColumnName] = "Int64"
            fileColumnDataTypesData[fileInfo.file.name] = column_data_types;
        })

        return fileColumnDataTypesData;
    }

    const getFilenamesData = (files) => {
        let filenames = [];
        files.forEach(fileInfo => filenames.push(fileInfo.file.name));
        return filenames;
    }

    const getAttributesData = (attributes) => {
        let attributesData = [];

        for (let attributeId in attributes) {
            attributesData.push(attributes[attributeId]);
        }

        return attributesData;
    }

    const getPurchaseData = () => {
        let purchaseData = {};

        purchaseData.filenames = getFilenamesData(purchaseFiles);

        purchaseData.column_name_bought_on = purchaseTimeColumnName;
        purchaseData.column_name_price = purchasePriceColumnName;
        purchaseData.column_name_article_id = purchaseArticleIdColumnName;
        purchaseData.column_name_customer_id = purchaseCustomerIdColumnName;

        purchaseData.article_metadata_attributes = getAttributesData(purchaseArticleAttributes);
        purchaseData.customer_metadata_attributes = getAttributesData(purchaseCustomerAttributes);

        return purchaseData;
    }

    const getArticleMetaData = () => {
        let articleMetaData = {};

        articleMetaData.filenames = getFilenamesData(articleMetaFiles);
        articleMetaData.column_name_id = articleMetaIdColumnName;
        articleMetaData.attributes = getAttributesData(articleMetaAttributes);

        return articleMetaData;
    }

    const getCustomerMetaData = () => {
        let customerMetaData = {};

        customerMetaData.filenames = getFilenamesData(customerMetaFiles);
        customerMetaData.column_name_id = customerMetaIdColumnName;
        customerMetaData.attributes = getAttributesData(customerMetaAttributes);

        return customerMetaData;
    }

    const checkAttributeData = (attributeData) => {
        for (let attributeId in attributeData) {
            if (
                attributeData[attributeId].name === "" ||
                attributeData[attributeId].column_name === "" ||
                attributeData[attributeId].type === ""
            ) {
                alert("Please fill in all the attribute fields")
                return false;
            }
        }
        return true;
    }

    const checkSelectData = () => {
        // check dataset name
        if (datasetNameRef.current === "") {
            alert("Please provide a dataset name");
            return false;
        }

        // check files
        if (purchaseFiles.length === 0) {
            alert("Please select purchase csv files");
            return false;
        }

        if (addArticleMetaDataFile && articleMetaFiles.length === 0) {
            alert("Please select article meta data csv files");
            return false;
        }

        if (addCustomerMetaDataFile && customerMetaFiles.length === 0) {
            alert("Please select customer meta data csv files");
            return false;
        }

        // check purchase data
        if (
            purchaseTimeColumnName === "" ||
            purchasePriceColumnName === "" ||
            purchaseArticleIdColumnName === "" ||
            purchaseCustomerIdColumnName === ""
        ) {
            alert("Please select a column for every purchase data field");
            return false;
        }

        // check purchase article attributes
        if (!checkAttributeData(purchaseArticleAttributes)) return false;

        // check purchase customer attributes
        if (!checkAttributeData(purchaseCustomerAttributes)) return false;

        // check article meta id data
        if (addArticleMetaDataFile) {
            if (articleMetaIdColumnName === "") {
                alert("Please select a column for article meta data id")
                return false;
            }

            // check article meta attributes
            if (!checkAttributeData(articleMetaAttributes)) return;
        }

        if (addCustomerMetaDataFile) {
            // check customer meta id data
            if (customerMetaIdColumnName === "") {
                alert("Please select a column for customer meta data id")
                return false;
            }

            // check customer meta attributes
            if (!checkAttributeData(customerMetaAttributes)) return;
        }

        return true;
    }

    const getSelectData = () => {
        let selectData = {};

        // name
        selectData.dataset_name = datasetNameRef.current;

        // file seperators
        selectData.file_seperators = getFileSeperatorsData();

        // file column data types
        selectData.file_column_data_types = getFileColumnDataTypesData();

        // purchase data
        selectData.purchase_data = getPurchaseData();

        // article meta data
        selectData.article_metadata = [];
        if (addArticleMetaDataFile) {
            selectData.article_metadata.push(getArticleMetaData());
        }

        // customer mata data
        selectData.customer_metadata = [];
        if (addCustomerMetaDataFile) {
            selectData.customer_metadata.push(getCustomerMetaData());
        }

        return selectData;
    }


    const handleUpload = () => {
        const formData = new FormData();

        if (!checkSelectData()) return;

        [purchaseFiles, articleMetaFiles, customerMetaFiles].forEach((fileState) => {
            fileState.forEach(fileInfo => {
                formData.append('files', fileInfo.file);
                console.log(fileInfo.file.name);
            })
        })

        console.log(JSON.stringify(getSelectData()))
        formData.append('data', JSON.stringify(getSelectData()))

        const config = {
            headers: {
                'content-type': 'multipart/form-data',
            },
        };

        axios.post("/api/upload_dataset", formData, config).then((response) => {
            console.log(response.data);
        });
    }

    const handleReset = () => {
        // todo reset everything
        setPurchaseFiles([]);

        setpurchaseTimeColumnName("");
        setpurchasePriceColumnName("");
        setpurchaseArticleIdColumnName("");
        setpurchaseCustomerIdColumnName("");

        setPurchaseArticleAttributes({});
        setPurchaseCustomerAttributes({});

        setAddArticleMetaDataFile(false);
        setAddCustomerMetaDataFile(false);

        setArticleMetaFiles([])
        setArticleMetaIdColumnName([])
        setArticleMetaAttributes({})

        setCustomerMetaFiles([])
        setCustomerMetaIdColumnName([])
        setCustomerMetaAttributes({})
    }

    return (
        <div style={{textAlign: "center"}}>
            <div>
                <h1>Upload dataset</h1>

                <input onChange={event => {
                    datasetNameRef.current = event.target.value;
                }} placeholder={"Dataset name"} style={{width: "150px"}}/>

                <button onClick={handleUpload}>
                    Upload
                </button>

                <button onClick={handleReset}>
                    Reset
                </button>
            </div>

            <br/>

            <PurchaseSelect
                files={purchaseFiles}
                onChangeFiles={setPurchaseFiles}

                onChangeTimeColumn={setpurchaseTimeColumnName}
                onChangePriceColumn={setpurchasePriceColumnName}
                onChangeArticleIdColumn={setpurchaseArticleIdColumnName}
                onChangeCustomerIdColumn={setpurchaseCustomerIdColumnName}

                articleAttributes={purchaseArticleAttributes}
                onChangeArticleAttributes={setPurchaseArticleAttributes}

                customerAttributes={purchaseCustomerAttributes}
                onChangeCustomerAttributes={setPurchaseCustomerAttributes}
            />

            <br/>

            <div>
                <button onClick={() => {
                    setAddArticleMetaDataFile(!addArticleMetaDataFile)
                }}>
                    {addArticleMetaDataFile ? "Remove article metadata file" : "Add article metadata file"}
                </button>

                {
                    addArticleMetaDataFile &&
                    <MetaSelect
                        type={"article"}

                        files={articleMetaFiles}
                        onChangeFiles={setArticleMetaFiles}

                        onChangeIdColumn={setArticleMetaIdColumnName}

                        attributes={articleMetaAttributes}
                        onChangeAttributes={setArticleMetaAttributes}
                    />
                }
            </div>

            <br/>

            <div>
                <button onClick={() => {
                    setAddCustomerMetaDataFile(!addCustomerMetaDataFile)
                }}>
                    {addCustomerMetaDataFile ? "Remove customer metadata file" : "Add customer metadata file"}
                </button>

                {
                    addCustomerMetaDataFile &&
                    <MetaSelect
                        type={"customer"}

                        files={customerMetaFiles}
                        onChangeFiles={setCustomerMetaFiles}

                        onChangeIdColumn={setCustomerMetaIdColumnName}

                        attributes={customerMetaAttributes}
                        onChangeAttributes={setCustomerMetaAttributes}
                    />
                }
            </div>


        </div>
    );
}
