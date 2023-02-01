require("dotenv-safe").config();

const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const Logger = require("./logger.js");
const { postEvents, getEvents } = require("./queries.js");

const PORT = process.env.PORT || 3000;

const app = express();

//
//  Middleware
//

app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

//
//  Routing
//

app.get("/", (req, res) => {
  res.send("My Webhook only app");
});

app.get("/events", getEvents);

app.post("/webhook", (req, res) => {
  let response;
  // Construct the message string
  const message = `v0:${req.headers["x-zm-request-timestamp"]}:${JSON.stringify(
    req.body
  )}`;

 // Hash the message string with your Webhook Secret Token and prepend the version semantic
  const hashForVerify = crypto
    .createHmac("sha256", process.env.ZOOM_WEBHOOK_SECRET_TOKEN)
    .update(message)
    .digest("hex");
 
  const signature = `v0=${hashForVerify}`;

  if (req.headers["x-zm-signature"] === signature) {
    // Zoom validating you control the webhook endpoint https://marketplace.zoom.us/docs/api-reference/webhook-reference#validate-webhook-endpoint
    if (req.body.event === "endpoint.url_validation") {
      const hashForValidate = crypto
        .createHmac("sha256", process.env.ZOOM_WEBHOOK_SECRET_TOKEN)
        .update(req.body.payload.plainToken)
        .digest("hex");

      response = {
        message: {
          plainToken: req.body.payload.plainToken,
          encryptedToken: hashForValidate,
        },
        status: 200,
      };

      Logger.info(`Event Notification Endpoint URL Validation successful`);

      res.status(response.status);
      res.json(response.message);
    } else {
      let body = req.body;
      response = {
        message: "Authorized request to Webhook-to-Postgres Sample App.",
        status: 200,
      };

      Logger.info(response.message);

      res.status(response.status);
      res.json(response);

      const name = body.event;
      const accountId = body.payload.account_id;
      const meetingId = body.payload.object.id;

      return postEvents(name, accountId, meetingId, res);
    }
  } else {
    const message =
      "Unauthorized request: webook x-zm-signature header did not match the generated signature";
    Logger.error(message);
    return res.status(401).send(message);
  }
});

//
//  Server instance
//

app.listen(PORT, () => {
  Logger.info(`My app listening on port https://localhost:${PORT}!`);
});
