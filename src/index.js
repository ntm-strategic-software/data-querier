import { app, BrowserWindow, ipcMain } from 'electron';
import osLocale from 'os-locale';

import localize from './localize';
import AppMeta from './app-meta';
import { constants } from './constants';

app.on('ready', async () => {
    try {
        // ***************************
        // Set up AppMeta and Localize
        // ***************************
        const { appMetaLocale } = constants;
        const defaultLocale = await osLocale();
        await AppMeta.initialize(defaultLocale);
        let Localize = new localize(AppMeta.get(appMetaLocale));

        // ***************************
        // Main window for the app
        // ***************************
        const appWindow = new BrowserWindow({
            show: false,
            width: 1010,
            height: 700,
            minWidth: 500,
            minHeight: 300,
            title: Localize.text('DataQuerier', 'DqApp'),
            webPreferences: {
                nodeIntegration: true,
            }
        });

        appWindow.once('ready-to-show', () => {
            //appWindow.maximize();   // on Windows, can't maximize before ready-to-show is called, or ready-to-show never gets called.
            const locale = Localize.locale();
            appWindow.send('readyToShow', locale);
            appWindow.show();
        });

        appWindow.on('closed', () => {
            // if we closed the main window, quit the app (this closes all the other windows, too).
            app.quit();
        });

        await appWindow.loadURL(`file://${__dirname}/dq-app.html`);

        // So we can log stuff from renderer on the main console, for when we can't get to the renderer console,
        //  Such as when the window won't render at all, or when we want to log data in a function that closes a window.
        ipcMain.on('logOnMain', (e, data) => console.log(data));
    } catch (err) {
        console.error(err);
    }
});
