const Logger = require('./logger.js')
const Pool = require('pg').Pool

const pool =  new Pool({
    user :     process.env.PG_USER,
    host :     process.env.PG_HOST,
    database:  process.env.PG_DATABASE,
    password : process.env.PG_PASSWORD,
    port:      process.env.PG_PORT,
})


const getEvents = (request, response) => {
    try {

        pool.query('SELECT * FROM events ORDER BY id ASC', (error, results) => {
            if (error) {
                throw error
            }

            response.status(200).json(results.rows)
        })

    } catch (err) {
        Logger.error(err)
        response.status(500).send(err.message)

    }
}


const postEvents = (name, accountId, meetingId, response) => {

    pool.query('INSERT INTO events (name, accountid, meetingid) VALUES ($1, $2, $3)', [name, accountId, meetingId], (error, results) => {
        if (error){
            throw error
        }
        response.status(200);
        Logger.info('Event added');
    })
}


module.exports = {
    getEvents,
    postEvents,
}