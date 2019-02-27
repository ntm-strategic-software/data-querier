import React, { useState } from 'react';
import propTypes from 'prop-types';

// todo: change columnWidths to columnInfo and have the value be an object { width: number, position: number }
//  to specify display order for columns (use negative numbers to count from right).
const JsonAsTable = ({ jsonData, columnWidths, tableHeight }) => {
    const [sortCol, setSortCol] = useState(Object.keys(jsonData[0])[0]);    // default to sort by the first key in the first object
    const [sortOrder, setSortOrder] = useState(1);  // 1 = ascending, -1 = descending

    const sortedJson = jsonData.sort((a, b) => (a[sortCol] > b[sortCol] ? sortOrder : a[sortCol] < b[sortCol] ? -sortOrder : 0));
    const styles = {
        scrollable: {
            height: 'auto',
            maxHeight: tableHeight,
            overflowX: 'hidden'
        }
    };

    const defaultColWidth = 100;

    const headerClick = e => {
        // sort by the header clicked
        const headerText = e.target.dataset.header;

        if (headerText === sortCol) {
            setSortOrder(-sortOrder);
        } else {
            setSortCol(headerText);
            setSortOrder(1);
        }
    };

    const dataRow = (data, classes, onClick) => {
        const dataCell = ([colHeaderText, cellValue], colNum) => {
            const cellWidth = columnWidths[colHeaderText] || defaultColWidth;
            const style = {
                width: cellWidth
            };

            const sortIcon = cellValue === sortCol ? (sortOrder === 1 ? <i className="fa fa-caret-up" /> : <i className="fa fa-caret-down" />) : '';
            return <span key={`${colNum} ${cellValue}`} style={style} data-header={colHeaderText} onClick={onClick}>{cellValue} {sortIcon}</span>;
        };

        return <div key={JSON.stringify(data)} className={`row ml-2 ${classes}`}>{Object.entries(data).map((c, i) => dataCell(c, i))}</div>;
    };

    const header = () => {
        // Create an object that has every key represented, and the value for each set to be identical to its key.
        //  We can pass that to dataRow and it will create our header, with the appropriate spacing.
        const headerData = jsonData
            .reduce((obj, d) => {
                const newKeys = Object
                    .keys(d)
                    .reduce((newObj, k) => { return { ...newObj, [k]: k }; }, {});
                return { ...obj, ...newKeys };
            }, {});

        return dataRow(headerData, 'font-weight-bold', headerClick);
    };

    const rows = () => {
        return sortedJson.map((d, i) => {
            const classes = i % 2 === 1 ? 'bg-light' : '';
            return dataRow(d, classes);
        });
    };

    return (
        <div className="container-fluid p-0">
            {header()}
            <div style={styles.scrollable}>
                {rows()}
            </div>
        </div>
    );
};

JsonAsTable.propTypes = {
    jsonData: propTypes.array,
    columnWidths: propTypes.object,  // { 'column name': width , ... }
    tableHeight: propTypes.string,  //  '400px'
};

export default JsonAsTable;
