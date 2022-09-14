const winston = require('winston');
const dayjs = require('dayjs');

// NOTE: article on configuring winston.js:
//  https://coralogix.com/blog/complete-winston-logger-guide-with-hands-on-examples/

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
};

const isProduction = process.env.NODE_ENV === 'production'

const level = !isProduction ? 'debug' : 'warn';

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'brightCyan',
    http: 'green',
    verbose: 'white',
    debug: 'yellow',
    silly: 'magenta',
};

winston.addColors(colors);

const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
);

const fileDate = dayjs().format('YYYY-MM-DD');

const transports = [
    new winston.transports.File({
        filename: `logs/${fileDate}.errors.log`,
        level: 'error',
    }),
];

const Logger = winston.createLogger({
    defaultMeta: { service: 'user-service' },
    format,
    levels,
    transports,
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (!isProduction) {

    // NOTE: in production, we do not want to log debug data that may reveal
    //  sensitive information, for that we will initialize a debug logger that
    //  should only run in non-production environments
    Logger.add(
        new winston.transports.File({
            level: 'debug',
            filename: `logs/${fileDate}.debug.log`,
        })
    )

    // add a console logger for ease of use
    Logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),
            ),
        })
    );
}

module.exports = Logger;