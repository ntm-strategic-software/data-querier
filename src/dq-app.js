import React from 'react';
import ReactDOM from 'react-dom';
import Swal from 'sweetalert2';
import { ipcRenderer } from 'electron';

import DqApp from './components/dq-app';
import localize from './localize';

ipcRenderer.on('readyToShow', (e, { locale }) => {
    const Localize = new localize(locale);

    const handleError = err => {
        console.error(err);
        Swal({
            title: Localize.text('Oops', 'universal'),
            text: err.message,
            type: 'error',
            confirmButtonText: Localize.text('OK', 'universal'),
        });
    };

    try {
        ReactDOM.render(
            <DqApp Localize={Localize} />,
            document.getElementById('js-dq-app')
        );
    } catch (err) {
        handleError(err);
    }
});
