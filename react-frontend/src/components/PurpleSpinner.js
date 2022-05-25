import {Spinner} from "react-bootstrap";

export function PurpleSpinner() {
    return (
        <div className={"row mx-auto justify-content-center w-100 h-100"}>
            <Spinner animation="border" className="my-auto purple-color" variant="danger"/>
        </div>
    )
}