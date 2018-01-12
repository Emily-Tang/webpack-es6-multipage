const glob = require('glob');
const path = require('path');

function getEntry (globPath, pathDir) {
    let paths = glob.sync(globPath);
    let entries = {},
        dirname = '',
        filename = '';

    paths.map(item => {
        dirname = path.dirname(item);
        filename = dirname.replace(new RegExp(`^${pathDir}`), '');
        entries[filename] = `./${item}`;
    })

    return entries;
}

function getViewEntry (globPath) {
    let paths = glob.sync(globPath);
    let entries = {},
        dirname = '',
        filename = '';

    paths.map(item => {
        dirname = path.dirname(item);
        filename = item.replace(new RegExp(`^${dirname}/`), '').replace(new RegExp('.html'), '');
        entries[filename] = `./${item}`
    })

    return entries;
}

module.exports = {
    getEntry,
    getViewEntry
}
