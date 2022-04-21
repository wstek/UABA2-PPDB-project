import {useState, useEffect} from 'react';
import { useHistory } from 'react-router-dom';
import {ColoredLine} from "./coloredLine";
import { Normalize } from './parameters';

const InputList = ({abs_algorithms}) => {
    const [id, setId] = useState(1);
    const [isPending, setIsPending] = useState(false);
    const history = useHistory();
    const [con_algorithms, setConAlgorithm] = useState(
        []
    )

    const handleAddAlgorithm = () => {
        const algorithmname = document.getElementById('algorithmname').value;
        const algorithm = abs_algorithms.filter(algorithm => algorithm.name === algorithmname)[0];
        const inputFieldsArray = algorithm.inputFields;
        const parametersArray = algorithm.parameters;
        const temp = con_algorithms.slice();
        var newAlgorithm = {id: id, name: algorithmname, fields: inputFieldsArray, parameters: parametersArray};
        temp.push(newAlgorithm);
        setConAlgorithm(temp);
        setId(id+1);
    }

    const handleRemoveAlgorithm = (id) => {
        const newAlgorithms = con_algorithms.filter(alg => alg.id !== id);
        setConAlgorithm(newAlgorithms)
    }
    useEffect(() => {
        resetInput()
    }, []);

    const resetInput = () => {
        setId(0);
        setConAlgorithm([])
        document.getElementById('stepsize').value = ''
        document.getElementById('interval').value = ''
        document.getElementById('topk').value = ''
        document.getElementById('start').value = ''
        document.getElementById('end').value = ''
    }

    const renderFields = () => {
        return (
            <div className="algorithms">
                {con_algorithms.map((algorithm) => (
                    <div className="row text-center justify-content-center align-items-center mt-5 mb-2"
                         key={"algorithm" + algorithm.id}>

                        {<ColoredLine color="purple"/>}
                        {<h4>{algorithm.name} - Algorithm {algorithm.id} </h4>}
                        {algorithm.fields.map((field) => (
                            field(algorithm.id)
                        ))}
                    </div>
                ))}
                {<ColoredLine color="purple"/>}
            </div>
        )
    }
    const handleStart = async () => {
        var algorithms_parameters = [];
        for (let i = 0; i < con_algorithms.length; i++) {
            var algorithmParams = {};
            for (let k = 0; k < con_algorithms[i].parameters.length; k++) {
                const val = document.getElementById(con_algorithms[i].parameters[k] + con_algorithms[i].id).value;
                if (!val) {
                    throw Error('Please fill in all the fields')
                }
                algorithmParams[con_algorithms[i].parameters[k]] = val;
            }
            algorithms_parameters.push(algorithmParams);
        }
        const start = document.getElementById('start').value;
        const end = document.getElementById('end').value;
        const topk = document.getElementById('topk').value;
        const interval = document.getElementById('interval').value;
        const stepsize = document.getElementById('stepsize').value;
        if (!start || !end || !topk || !interval || !stepsize) {
          throw Error('Please fill in all the fields');
        } else {
          const abtest_setup = { start, end, topk, interval, stepsize, algorithms_parameters};
          setIsPending(true);
          const jdata = await JSON.stringify(abtest_setup);
          await fetch('http://127.0.0.1:5000/api/abtest_setup', {
            method: 'POST',
            headers: { "Content-Type": "application/json", 'Accept': 'application/json' },
            credentials: 'include',
            body: jdata
          }).then((res) => res.json())
          .then((data) => {
            // if (data.error) {
            //     throw Error(data.error);
            // }
            // history.go(-1);
            setIsPending(false);
            // setError(null);
            history.push('/dashboard');
          })
          .catch((err) => {
            setIsPending(false);
            // setError(err.message);
            console.log(err.message);
          })
          }
    }
    return (
        <div className="container-fluid pt-5 pb-5 pl-5 pr-5" id='algorithms'>
            <div className="row text-center align-items-center">

                <div className="col-6 text-end">
                    <button className="btn-lg button-purple red_onhover" type="reset" onClick={resetInput}>Reset</button>
                </div>
                <div className="col-6 text-start">
                    <button className="btn-lg button-purple green_onhover" type="submit" onClick={handleStart}>Start</button>
                </div>
            </div>
            { isPending && <p>Setting up...</p>}
            <div className="row text-center align-items-center">


                <div className="col-6">
                    <label htmlFor="start">Start:</label>
                    <input type="date" className="form-control datefield" id="start"/>
                </div>
                <div className="col-6">
                    <label htmlFor="end">End:</label>
                    <input type="date" className="form-control datefield" id="end"/>
                </div>
            </div>
            <div className="row text-center align-items-center mb-5">
                <div className="col-4">
                    <label htmlFor="topk">Top-K:</label>
                    <input type="number" className="form-control" id="topk" min="1"
                           placeholder="Enter trainings-interval"/>
                </div>
                <div className="col-4">
                    <label htmlFor="interval">Interval:</label>
                    <input type="number" className="form-control" id="interval" placeholder="Enter interval"/>
                </div>
                <div className="col-4 ">
                    <label htmlFor="stepsize">Step size:</label>
                    <input type="number" className="form-control" id="stepsize" min="1"
                           placeholder="Enter stepsize"/>
                </div>
            </div>
            {renderFields()}
            <div className="row text-center justify-content-center align-items-center mt-5 mb-2">
                <div className="col-6">
                    <select className="selector form-control" id="algorithmname">
                        {abs_algorithms.map((algorithm) => (
                            <option key={algorithm.name}>{algorithm.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="row text-center justify-content-center align-items-center mb-5">
                <div>
                <button id="addRow" type="submit" onClick={() => handleAddAlgorithm()}
                        className="button-purple btn-lg">Add
                    Algorithm
                </button>
            </div>
            </div>
        </div>
    );
}


export default InputList
