import InputList from "./inputList";
import {useState} from "react";
import  './parameters'
import {KNearest, LookBackWindow, Normalize, RetrainInterval} from "./parameters";

function InputPage() {
    const [abs_algorithms, setAlgorithms] = useState(
        [
            {name:'Recency', parameters:['RetrainInterval'], inputFields: [RetrainInterval] },
            {name:'Popularity', parameters:['RetrainInterval', 'LookBackWindow'], inputFields: [RetrainInterval,LookBackWindow] },
            {name:'ItemKNN', parameters:['RetrainInterval', 'KNearest', 'LookBackWindow', 'Normalize'], inputFields: [RetrainInterval, KNearest, LookBackWindow,Normalize] }
        ]
    )
  return (
  <InputList abs_algorithms={abs_algorithms} />
  );
}

export default InputPage;
