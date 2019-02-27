import React from 'react';
import propTypes from 'prop-types';

const ObjInLine = ({ obj }) => {

    const showEntry = ([key, value]) => {
        return (
            <span key={key}><span className="mr-1">{`${key}:`}</span><span className="mr-3 text-info">{value}</span></span>
        );
    };

    return (
        <div className="my-3 font-weight-bold">
            {Object.entries(obj).map(c => showEntry(c))}
        </div>
    );
};

ObjInLine.propTypes = {
    obj: propTypes.object,
};

export default ObjInLine;
