import React from 'react';
import propTypes from 'prop-types';

const ObjInLine = ({ obj }) => {

    const showEntry = ([key, value]) => {
        return (
            <span key={key} className="mr-3">{`${key}: ${value}`}</span>
        );
    };

    return (
        <div className="my-3">
            {Object.entries(obj).map(c => showEntry(c))}
        </div>
    );
};

ObjInLine.propTypes = {
    obj: propTypes.object,
};

export default ObjInLine;
