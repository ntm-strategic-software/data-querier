import React, { useState, useEffect } from 'react';
import propTypes from 'prop-types';
import { remote } from 'electron';
import _ from 'lodash';
import fs from 'fs-extra';
import SplitPane from 'react-split-pane';

import JsonAsTable from './json-as-table';
import ObjInLine from './obj-in-line';

// React Hook to respond to window height changes
const useWindowHeight = () => {
    const [winHeight, setWinHeight] = useState(window.innerHeight);

    useEffect(() => {
        const handleResize = () => setWinHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    });

    return winHeight;
};

const defaultSplitWidth = 250;

const DqApp = ({ Localize }) => {
    const winHeight = useWindowHeight();

    // These all need to be updated at the same time, so put them into a single useState.
    const [source, setSource] = useState({
        dataSource: '',
        data: [],
        products: [],
        selectedProduct: '',
        dataSummary: {},
        dataByOrganization: [],
        dataByLocation: [],
        dataByOS: [],
        dataByLocale: [],
    });

    const [locationSplitSize, setLocationSplitSize] = useState(defaultSplitWidth);
    const [orgSplitSize, setOrgSplitSize] = useState(defaultSplitWidth);
    const [osSplitSize, setOsSplitSize] = useState(defaultSplitWidth);

    const { dataSource, data, products, selectedProduct, dataSummary, dataByOrganization, dataByLocation, dataByOS, dataByLocale} = source;

    useEffect(() => remote.getCurrentWindow().setTitle(`${Localize.text('DataQuerier', 'DqApp')} - ${dataSource}`), [dataSource]);

    const computeData = ({ newDataSource, productSelected }) => {
        const allData = newDataSource ? fs.readJsonSync(newDataSource) : data;
        const validData = [];
        // arrays of strings
        const allProducts = 'All';
        let uniqueProducts = [allProducts];
        let uniqueEmails = [];
        // arrays of objects (see updateUniqueCount)
        let uniqueOrgs = [];
        let uniqueLocations = [];
        let uniqueOSs = [];
        let uniqueLocales = [];

        const emailOk = email => {
            // we used these emails in testing, so don't count them.
            return !['don_pederson@ntm.org',
                'david_burson@gmail.com',
                'david_burson@ntm.org',
                'david.burson@gmail.com',
                'rand_burgett@ntm.org',
                'joe.bloe@gmail.com',
                'dave_mateer@ntm.org',
                'david.smith@gmail.com',
                'rburgett@fmosoft.com',
                'ryan@burgettweb.net'].includes(email);
        };

        const updateUniqueCount = (myArray, key, value) => {
            const idx = myArray.findIndex(i => i[key] === value);

            if (idx >= 0) {
                myArray.splice(idx, 1, { [key]: value, count: myArray[idx].count + 1 });
            } else {
                myArray.push({ [key]: value, count: 1 });
            }

            return myArray;
        };

        const getOS = osData => {
            if (osData.includes('Windows')) return 'Windows';
            if (osData.includes('Darwin')) return 'Mac';
            if (/.*Linux.*Ubuntu.*/.test(osData)) return 'Ubuntu';
            if (/.*Linux.*SMP PREEMPT.*/.test(osData)) return 'openSUSE';
            if (/.*Linux.*fc.*/.test(osData)) return 'Fedora';
            if (osData.includes('Linux')) return 'Linux';
            return osData;
        };

        // create the json's to display
        for (let i = 0; i < allData.length; ++i) {
            const reg = allData[i];
            if (newDataSource) {
                // we are building validData by reading a new dataSource.  Include all products.
                if (!emailOk(reg.email)) continue;
                uniqueProducts = _.union(uniqueProducts, [reg.productName]);    // build list of unique products
            } else {
                // only include registrations for the product we want.
                if (productSelected !== allProducts && reg.productName !== productSelected) continue;
            }

            // this is a valid registration
            validData.push(reg);
            uniqueEmails = _.union(uniqueEmails, [reg.email]);    // build list of unique emails
            uniqueOrgs = updateUniqueCount(uniqueOrgs, 'Organization', reg.organization);
            uniqueLocations = updateUniqueCount(uniqueLocations, 'Country', reg.location);
            uniqueOSs = updateUniqueCount(uniqueOSs, 'OS', getOS(reg.operatingSystem));
            uniqueLocales = updateUniqueCount(uniqueLocales, 'Language', reg.locale);
        }

        const newSummary = {
            'Total Registrations': validData.length,
            'Unique Emails': uniqueEmails.length,
            Countries: uniqueLocations.length,
            Organizations: uniqueOrgs.length,
        };

        const newDataSourceStuff = newDataSource ?  {
            dataSource: newDataSource,
            data: validData,
            products: uniqueProducts,
        } : {};

        setSource(prevSource => {
            return {
                ...prevSource,
                ...newDataSourceStuff,
                selectedProduct: productSelected || allProducts,
                dataSummary: newSummary,
                dataByOrganization: uniqueOrgs,
                dataByLocation: uniqueLocations,
                dataByOS: uniqueOSs,
                dataByLocale: uniqueLocales,
            };
        });
    };

    const dataSourceClick = () => {
        // let user select a json file
        remote.dialog.showOpenDialog(remote.getCurrentWindow(),
            {
                title: Localize.text('DataQuerier', 'DqApp'),
                message: Localize.text('SelectADataSource', 'DqApp'),
                filters: [{ extensions: 'json' }],
                properties: ['openFile', 'createDirectory'],
            }, filePaths => {
                if (!filePaths) return;

                const newDataSource = filePaths[0];

                computeData({ newDataSource });
            });
    };

    const productSelectorClicked = e => {
        const productSelected = e.target.dataset.product;
        computeData({ productSelected });
    };

    const styles = {
        startContainer: {
            height: remote.getCurrentWindow().getContentSize()[1],
        }
    };

    const ProductSelectors = () => {
        return products.map(p => {
            const extraClass = p === selectedProduct ? 'btn-info' : 'btn-outline-info';
            return <button key={p} className={`btn ${extraClass} mx-2`} data-product={p}
                           onClick={productSelectorClicked}>{p}</button>;
        });
    };

    const showData = () => {
        if (!dataSource) return (
            <div className="container-fluid">
                <div className="d-flex justify-content-center align-items-center" style={styles.startContainer}>
                    <button className="btn btn-lg btn-outline-primary"
                            onClick={dataSourceClick}>{Localize.text('SelectADataSource', 'DqApp')}</button>
                </div>
            </div>);

        const topSplitHeight = 100;
        const tableHeight = winHeight - topSplitHeight - 28;
        const minSplitSize = 200;

        return (
            <div className="container-fluid p-0">
                <SplitPane split="horizontal" defaultSize={topSplitHeight} minSize={topSplitHeight} maxSize={topSplitHeight}>
                    <div className="mx-2">
                        {ProductSelectors()}
                        <ObjInLine obj={dataSummary} />
                    </div>
                    <div className="mx-2">
                        <SplitPane split="vertical" defaultSize={defaultSplitWidth} minSize={minSplitSize} onChange={newSize => setLocationSplitSize(newSize)}>
                            <div>
                                <JsonAsTable jsonData={dataByLocation}
                                             columnWidths={{
                                                 Country: locationSplitSize - 110, //140,
                                                 //count: 20,
                                             }}
                                             tableHeight={`${tableHeight}px`} />
                            </div>
                            <SplitPane split="vertical" defaultSize={defaultSplitWidth} minSize={minSplitSize} onChange={newSize => setOrgSplitSize(newSize)}>
                                <div>
                                    <JsonAsTable
                                        jsonData={dataByOrganization}
                                        columnWidths={{
                                            Organization: orgSplitSize - 110,   // 140,
                                            //count: 20,
                                        }}
                                        tableHeight={`${tableHeight}px`}
                                    />
                                </div>
                                <SplitPane split="vertical" defaultSize={defaultSplitWidth} minSize={minSplitSize} onChange={newSize => setOsSplitSize(newSize)}>
                                    <div>
                                        <JsonAsTable jsonData={dataByOS}
                                                     columnWidths={{
                                                         OS: osSplitSize - 110, // 140,
                                                         //count: 20,
                                                     }}
                                                     tableHeight={`${tableHeight}px`} />
                                    </div>
                                    <div>
                                        <JsonAsTable jsonData={dataByLocale}
                                                     columnWidths={{
                                                         Language: 140,
                                                         //count: 20,
                                                     }}
                                                     tableHeight={`${tableHeight}px`} />
                                    </div>
                                </SplitPane>
                            </SplitPane>
                        </SplitPane>
                    </div>
                </SplitPane>
            </div>
        );
    };

    return showData();
};

DqApp.propTypes = {
    Localize: propTypes.object,
};

export default DqApp;
