import fs from 'fs-extra';
import path from 'path';
import _ from 'lodash';

/**
 * Constructs a Localize object
 * @constructor
 * @param {string} locale - the application locale (e.g. 'en')
 */

class Localize {
    constructor(locale = 'en') {
        let localeFile;
        // have to use __dirname instead of '.' or else this fails when running the .app built by electron-builder.
        const localesFolder = path.join(__dirname, 'locales');
        const allLocaleFiles = fs.readdirSync(localesFolder);

        let languageToUse = locale;

        if (_.includes(allLocaleFiles, `${languageToUse}.json`)) {
            localeFile = path.join(localesFolder, `${languageToUse}.json`);
        } else {
            console.error(`Locale ${languageToUse} is not available.`);
            localeFile = path.join(localesFolder, 'en.json');
            languageToUse = 'en';
        }

        this._intlData = fs.readJsonSync(localeFile, 'utf8');
        this._languageToUse = languageToUse;

        _.bindAll(['text', 'locale']);
    }

    /**
     * Localizes a text string based on its context
     * @method
     * @param {string} key - the text to be localized (e.g. 'Ok')
     * @param {string} context - the context of the text (e.g. 'ProjectPage')
     * @param {object} replacers - key/value pairs (replace each key with its value)
     * @return {string} - the localized text
     */
    text(key, context, replacers = {}) {
        const { _intlData } = this;
        if (_.isString(key) && _.isString(context) && _.has(_intlData, [key, context])) {
            // real code
            return Object
                .keys(replacers)
                // str.replace only replaces the first occurance, so it is unacceptable.  Use the split/join idiom instead.
                //.reduce((str, key1) => str.replace(`{{${key1}}}`, replacers[key1]), _intlData[key][context].val);
                .reduce((str, key1) => str.split(`{{${key1}}}`).join(replacers[key1]), _intlData[key][context].val);

            // code for testing to make sure everything is translated:
            //  double asterisks around text
            // return Object
            //     .keys(replacers)
            //     .reduce((str, key1) => str.split(`{{${key1}}}`).join(replacers[key1]), `**${_intlData[key][context].val}**`);

            // replace text with "i"
            //return 'i';
        } else {
            return key;
        }
    }

    locale() {
        return this._languageToUse;
    }
}

export default Localize;
