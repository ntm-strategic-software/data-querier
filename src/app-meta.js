/* eslint no-alert: 0 */

import fs from 'fs-extra';
import path from 'path';
import Teeny from 'teeny-conf';

const config = new Teeny('dq-config.json');

import { constants } from './constants';

/**
* Constructs an AppMeta Object
* @constructor
*/
const AppMeta = {
    /**
     * Make sure locale and app version are set
     * @param userOsLocale
     * @returns {Promise<any>}
     */
    initialize(userOsLocale) {
        return new Promise((resolve, reject) => {
            try {
                const { appMetaLocale, appMetaAppVersion } = constants;

                const getLanguageFromLocale = locale => {
                    return locale.split('-')[0].split('_')[0];
                };

                // Locale
                let locale = config.get(appMetaLocale);
                if (!locale) {
                    locale = getLanguageFromLocale(userOsLocale);
                    config.set(appMetaLocale, locale);
                }

                // App Version
                const packageJSONContents = this.getPackageJSON();
                const appVersion = packageJSONContents.version;
                if (appVersion !== config.get(appMetaAppVersion)) {
                    config.set(appMetaAppVersion, appVersion);
                }

                resolve();
            } catch(err) {
                reject(err);
            }
        });
    },

    /**
    * Gets the data from package.json
    * @method
    * @return {Object}
    */
    getPackageJSON() {
        // have to use __dirname instead of '.' or else this fails when running the .app built by electron-builder.
        const filePath = path.join(__dirname, 'package.json');
        let packageJSON;

        try {
            packageJSON = fs.readJsonSync(filePath, { encoding: 'utf8' });
        } catch(err) {
            console.error(err);
            alert(err.message);
        }

        return packageJSON;
    },

    /**
    * Gets all application meta data
    * @method
    * @return {Object}
    */
    getAll() {
        //return Object.keys(config).reduce((obj, k) => { return { ...obj, [k]: config.get(k)}; }, {});
        return config.get();
    },

    /**
    * Gets a specific meta data property
    * @method
    * @param {string} key - the property to get
    * @return {String|Number}
    */
    get(key) {
        const val = config.get(key);
        return val === null ? '' : val;
    },

    /**
    * Sets a specific meta data property (other than id or version, those are read-only) and returns the new meta data object
    * @method
    * @param {string} key - The property to set
    * @param {string|number} val - The new value
    * @return {Object}
    */
    set(key, val) {
        if (key !== constants.appMetaAppVersion) {     // don't allow changing the appVersion - we get that from package.json.
            config.set(key, val);
            config.save();
        }
    },

    removeItem(key) {
        config.delete(key);
        config.save();
    },

    clearAll() {
        config.clear();
        config.save();
    }
};

AppMeta.initialize = AppMeta.initialize.bind(AppMeta);

export default AppMeta;
