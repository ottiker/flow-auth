// cookie handling
var SID = {

    get: function (name) {
        // credentials: https://developer.mozilla.org/en-US/docs/Web/API/Document.cookie
        return document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + name.replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1') || null;
    },

    set: function (name, value) {
        document.cookie = name + '=' + value + ';path=/';
    },

    rm: function (name) {
        document.cookie = name + '=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
};

// data validation (should be a separate module)
exports.validate = function (data, stream, schema) {

    for (var prop in schema) {
        if (typeof data[prop] !== schema[prop]) {
            stream.write(new Error('schema validate: Invalid type"' + prop + '"'));
            return null;
        }
    }

    return data;
};

// set or remove cookie session
exports.session = function (data, stream, options) {

    options = options || {
        sid: this._config.cookie || 'sid'
    };
    
    // set session
    if (!options.remove && data && data[options.sid]) {
        SID.set(options.sid, data[options.sid]);

    // remove session
    } else {
        SID.rm(options.sid);
    }
    
    return data;
};

// change url without triggering the popstate event (should be part of the route module)
exports.navigate = function (data, stream, url) {
    history.pushState(null, null, (data && data.url) || url);
};
