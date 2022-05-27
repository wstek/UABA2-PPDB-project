import {useEffect, useState} from 'react';
import {PurpleSpinner} from "./PurpleSpinner"

export default function AlgorithmPicker({setSelectedAlgorithm, personal_algorithms,selected_algorithm}) {
    const [personal_idtests_id_components, setPersonalABTestsElements] = useState([])
    let value = selected_algorithm
    if (!value) value = 0


    function personalAlgorithms() {
        var a = personal_algorithms
        let temp_personal_idtests_id_components = []
        if (personal_algorithms) {
            let ids = personal_algorithms.personal_algorithms
            let id
            for (let ab_test_id in ids) {
                id = ids[ab_test_id]
                temp_personal_idtests_id_components.push(
                    <option value={id} key={id}>{id}</option>
                )
            }
        }
        setPersonalABTestsElements(temp_personal_idtests_id_components)
    }
    useEffect(personalAlgorithms, [personal_algorithms],);
    function handleChange(e) {
        setSelectedAlgorithm(e.target.value)
    }

    if ( ! personal_algorithms ) return <PurpleSpinner />
    return (
            <div className={"col-auto mx-auto"}>
                <h1>Select Algorithm</h1>
                <select id="abtestIds" value={value} name="abtestIds" className="custom-select bg-purple form-select-lg" onChange={handleChange}>
                    <option disabled value={0}> -- select an option -- </option>
                    {personal_idtests_id_components.length && personal_idtests_id_components}
                </select>
            </div>
    )
}