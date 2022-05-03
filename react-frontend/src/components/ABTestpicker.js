import {useEffect, useState} from 'react';
import {PurpleSpinner} from "./PurpleSpinner"

export default function ABTestPicker({setSelectedABTest, personal_abtests,selected_abtest}) {
    const [personal_idtests_id_components, setPersonalABTestsElements] = useState([])
    let value = selected_abtest
    if (!value) value = 0


    function personalABTests() {
        let temp_personal_idtests_id_components = []
        if (personal_abtests) {
            let ids = personal_abtests.personal_abtestids
            let id
            for (let ab_test_id in ids) {
                id = ids[ab_test_id]
                temp_personal_idtests_id_components.push(
                    <option value={id} key={id}>{id}</option>
                )
            }
        }
        setPersonalABTestsElements(temp_personal_idtests_id_components)
        // else {
        //     var selector = document.getElementById("abtestIds");
        //     selector.options.namedItem("0").selected = true;
        // }
    }
    useEffect(personalABTests, [personal_abtests],);
    function handleChange(e) {
        setSelectedABTest(e.target.value)
    }

    if ( ! personal_abtests ) return <PurpleSpinner />
    return (
        <>
            <h1>Select AB-Test</h1>
            <div>
                <select id="abtestIds" defaultValue={0} value={value} name="abtestIds" className="custom-select bg-purple form-select-lg" onChange={handleChange}>
                    <option disabled value={0}> -- select an option -- </option>
                    {personal_idtests_id_components.length && personal_idtests_id_components}
                </select>
            </div>
        </>
    )
}

