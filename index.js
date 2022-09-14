require('dotenv-safe').config()

const express = require('express')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const Logger = require('./logger.js')
const { postEvents, getEvents } = require('./queries.js')

const PORT = process.env.PORT || 3000;

const app = express();

//
//  Middleware
//

app.use(bodyParser.json())

app.use(
    bodyParser.urlencoded({
        extended:true,
    })
)


//
//  Routing
//

app.get('/', (req,res)=> {
     res.send("My Webhook only app");
});

app.get('/events', getEvents)

app.post('/webhook', (req, res) => {
    const body = req.body

    if (!body || body === null) {
        const message = 'There must be an error'
        Logger.error(message)
        return res.status(400).send(message);
    }

    const name = body.event
    const accountId = body.payload.account_id
    const meetingId = body.payload.object.id

    // construct the message string
    const message = `v0:${req.headers['x-zm-request-timestamp']}:${JSON.stringify(req.body)}`

    const hashForVerify = crypto.createHmac('sha256', process.env.ZOOM_WEBHOOK_SECRET_TOKEN).update(message).digest('hex')

    // hash the message string with your Webhook Secret Token and prepend the version semantic
    const signature = `v0=${hashForVerify}`

    if(req.headers['x-zm-signature'] !== signature) {
        const message = 'Unauthorized request: webook x-zm-signature header did not match the generated signature'
        Logger.error(message)
        return res.status(401).send(message)        
    }
    return postEvents(name, accountId, meetingId, res)
})


//
//  Server instance
//

app.listen(PORT, () => {
    // console.log(`My app listening on port https://localhost:${PORT}!`)
    Logger.info(`My app listening on port https://localhost:${PORT}!`)
})