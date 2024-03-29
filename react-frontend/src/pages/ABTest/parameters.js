import React from 'react';

const RealNumberField = (id, label, placeholder) => {
    return (
        <div key={id} className="row text-center justify-content-center align-items-center mb-1">
            <div className="col-7 text-center">
                <label htmlFor={id}>{label}</label>
                <input type="number" className="form-control" id={id} min={1} placeholder={placeholder} required/>
            </div>
        </div>
    );
};

const BoolField = (id, label) => {
    return (
        <div key={id} className="row text-center justify-content-center align-items-center mb-1">
            <div className="col-7 text-center">
                <label htmlFor={id}>{label}</label>
                <input type="checkbox" className="form-check-input" key={id} id={id} required/>
            </div>
        </div>
    );
};

const TextField = (id, label,defaultname) => {
    return (
        <div key={id} className="row text-center justify-content-center align-items-center mb-1">
            <div className="col-7 text-center">
                <label htmlFor={id}>{label}</label>
                <input type="text" className="form-control" key={id} defaultValue={defaultname} id={id}/>
            </div>
        </div>
    );
};
export const NameField = (id) => {
    return TextField("AlgorithmName"+id, "Algorithm Custom Name","Algorithm_"+id )
};

export const LookBackWindow = (id) => {
    return RealNumberField("LookBackWindow" + id, "Look Back X-days Window:", "Enter X");
};

export const KNearest = (id) => {
    return RealNumberField("KNearest" + id, "Look at K Nearest:", "Enter K");
};

export const Normalize = (id) => {
    return BoolField("Normalize" + id, "Normalization of the vector: ")
};
export const RetrainInterval = (id) => {
    return RealNumberField("RetrainInterval" + id, "Retrain every Y days:", "Enter Y");
};