import React, {useState} from "react";
import AttributeList from "./AttributeList";
import FileSelectList from "./FileSelectList";
import SelectBox from "../../components/SelectBox";

export default function MetaSelect(props) {
    const [fileColumnNames, setFileColumnNames] = useState([]);

    return (
        <>
            <h3>{props.type.charAt(0).toUpperCase() + props.type.slice(1)} meta data</h3>

            <FileSelectList
                files={props.files}
                onChangeFiles={props.onChangeFiles}
                onChangeColumnNames={setFileColumnNames}
            />

            <br/>

            <div>
                <label style={{display: "block"}}>{props.type.charAt(0).toUpperCase() + props.type.slice(1) + " id"}</label>
                <SelectBox placeholder={"Select column"} onChange={event => props.onChangeIdColumn(event.target.value)}
                           options={fileColumnNames}
                           width={"150px"}/>
            </div>

            <br/>

            <AttributeList
                attributes={props.attributes}
                onChangeAttributes={props.onChangeAttributes}
                columnNames={fileColumnNames}
            />
        </>
    )
}