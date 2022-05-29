import React, {useState} from "react";
import AttributeList from "./AttributeList";
import FileSelectList from "./FileSelectList";
import SelectBox from "./SelectBox";


export default function PurchaseSelect(props) {
    const [fileColumnNames, setFileColumnNames] = useState([]);

    return (
        <div>
            <h3>Purchase data</h3>

            <FileSelectList
                files={props.files}
                onChangeFiles={props.onChangeFiles}
                onChangeColumnNames={setFileColumnNames}
            />

            <br/>

            <div>
                <label style={{display: "block"}}>Time</label>
                <SelectBox placeholder={"Time"} onChange={event => props.onChangeTimeColumn(event.target.value)}
                           options={fileColumnNames}
                           width={"150px"}/>
            </div>

            <div>
                <label style={{display: "block"}}>Price</label>
                <SelectBox placeholder={"Price"} onChange={event => props.onChangePriceColumn(event.target.value)}
                           options={fileColumnNames}
                           width={"150px"}/>
            </div>

            <div>
                <label style={{display: "block"}}>Article id</label>
                <SelectBox placeholder={"Article id"}
                           onChange={event => props.onChangeArticleIdColumn(event.target.value)}
                           options={fileColumnNames}
                           width={"150px"}/>
            </div>

            <div>
                <label style={{display: "block"}}>Customer id</label>
                <SelectBox placeholder={"Customer id"}
                           onChange={event => props.onChangeCustomerIdColumn(event.target.value)}
                           options={fileColumnNames}
                           width={"150px"}/>
            </div>

            <br/>

            <h5>Article meta data columns</h5>
            <AttributeList
                attributes={props.articleAttributes}
                onChangeAttributes={props.onChangeArticleAttributes}
                columnNames={fileColumnNames}
            />
            <h5>Customer meta data columns</h5>
            <AttributeList
                attributes={props.customerAttributes}
                onChangeAttributes={props.onChangeCustomerAttributes}
                columnNames={fileColumnNames}
            />
        </div>
    )
}