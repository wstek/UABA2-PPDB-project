import {post} from "axios";
import React from "react";


export default function UploadDataset() {

    let datasets = [];
    const onGo = (dataset, finish) => {
        if (finish) {
            const url = "/api/read_csv";
            const aret = post(url, dataset, {withCredentials: true}).then(response => console.log("response:", response));
            datasets = [];
            return aret;
        }
    }
    const onChange = (e, field_id) => {
        console.log(document.getElementById(field_id).value)
        let files = e.target.files;
        for (let i = 0; i < files.length; i++) {
            let reader = new FileReader();
            reader.readAsDataURL(files[i]);
            reader.onload = (e) => {
                const url = "/api/read_cvs";
                var file1 = e.target.result;
                const formData = {
                    dataset_name: document.getElementById(field_id).files[i].name,
                    file: file1.split("base64,").pop()
                }
                datasets.push(formData);
                return onGo(datasets, i === (files.length - 1));
                // return post(url, formData, {withCredentials: true}).then(response => console.log("response:", response));
            }
        }
    }

    function submitDataSet() {
        console.log("aaaa")
    }

    return (
        <div className="container my-auto">
            <div className="row justify-content-center">
                <div
                    className="col-12 col-lg-12 col-sm-12 col-md-12 col-xl-10 col-xxl-10 bg-purple pt-3 mt-5 pb-5 text-center border border-dark rounded-3">
                    <div className="container-fluid">
                        <div
                            className="row text-center pt-md-2 pt-0 pt-sm-0 pt-lg-3 pt-xl-3 pt-xxl-3 justify-content-center">
                            <h1>Upload A Dataset</h1>
                        </div>
                        <div className="row pt-5 text-center justify-content-center">
                            <div className="col-12 col-sm-12 col-md-12 col-lg-10 col-xl-10 col-xxl-10">
                                <h4>Customers</h4>
                                <input type="file" id="uploaded_customers" className="form-control"
                                       onChange={(e) => onChange(e, "uploaded_customers")}
                                       data-show-upload="false" data-show-caption="true"/>
                            </div>
                        </div>
                        <div className="row pt-5 text-center justify-content-center">
                            <div className="col-12 col-sm-12 col-md-12 col-lg-10 col-xl-10 col-xxl-10">
                                <h4>Purchases</h4>
                                <input type="file" id="uploaded_purchases" className="form-control"
                                       onChange={(e) => onChange(e, "uploaded_purchases")}
                                       data-show-upload="false" data-show-caption="true"/>
                            </div>
                        </div>

                        <div className="row pt-5 text-center justify-content-center">
                            <div className="col-12 col-sm-12 col-md-12 col-lg-10 col-xl-10 col-xxl-10">
                                <h4>Articles</h4>
                                <input id="uploaded_articles" name="uploaded_articles" type="file"
                                       className="form-control"
                                       onChange={(e) => onChange(e, "uploaded_articles")}
                                       data-show-upload="false" data-show-caption="true"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}




