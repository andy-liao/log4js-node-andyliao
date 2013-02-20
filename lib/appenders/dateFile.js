var streams = require('../streams'),
    layouts = require('../layouts'),
    path = require('path'),
    os = require('os'),
    eol = os.EOL || '\n',
    openFiles = [];

//close open files on process exit.
process.on('exit', function() {
    openFiles.forEach(function (file) {
        file.end();
    });
});

/**
 * File appender that rolls files according to a date pattern.
 * @filename base filename.
 * @pattern the format that will be added to the end of filename when rolling,
 *          also used to check when to roll files - defaults to '.yyyy-MM-dd'
 * @layout layout function for log messages - defaults to basicLayout
 */
function appender(filename, pattern, layout,reserveDays) {
    layout = layout || layouts.basicLayout;

    var logFile = new streams.BufferedWriteStream(new streams.DateRollingFileStream(filename, pattern,undefined,undefined,reserveDays));
    openFiles.push(logFile);

    return function(logEvent) {
        logFile.write(layout(logEvent) + eol, "utf8");
    };

}

function configure(config, options) {
    var layout;
    var reserveDays;
    
    if(config.reserveDays === undefined){
    	reserveDays = 7;
    }else{
    	reserveDays = config.reserveDays;
    }

    if (config.layout) {
	layout = layouts.layout(config.layout.type, config.layout);
    }

    if (options && options.cwd && !config.absolute) {
        config.filename = path.join(options.cwd, config.filename);
    }
    

    return appender(config.filename, config.pattern, layout,reserveDays);
}


exports.appender = appender;
exports.configure = configure;
