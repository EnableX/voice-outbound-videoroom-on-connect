// core modules
const { request } = require('https');
// modules installed from npm
const btoa = require('btoa');
require('dotenv').config();
// application modules
const logger = require('./logger');

// EnableX server REST API call default options
const httpOptions = {
  host: 'api-qa.enablex.io',
  port: 443,
  headers: {
    Authorization: `Basic ${btoa(`${process.env.ENABLEX_APP_ID}:${process.env.ENABLEX_APP_KEY}`)}`,
    'Content-Type': 'application/json',
  },
};

// To initiate Rest API Call to EnableX Server API
const connectEnablexServer = (data, callback) => {
  logger.info(`REQ URI:- ${httpOptions.method} ${httpOptions.host}:${httpOptions.port}${httpOptions.path}`);
  logger.info(`REQ PARAM:- ${data}`);

  const req = request(httpOptions, (res) => {
    let body = '';
    res.on('data', (response) => {
      body += response;
    });

    res.on('end', () => {
      callback(body);
    });

    res.on('error', (e) => {
      logger.info(`Got error: ${e.message}`);
    });
  });

  if (data == null) {
    req.end();
  } else {
    req.end(data);
  }
};

// Voice API call to hangup the call
function hangupCall(callVoiceId, callback) {
  httpOptions.path = `/voice/v1/call/${callVoiceId}`;
  httpOptions.method = 'DELETE';
  connectEnablexServer('', (response) => {
    logger.info(`RESPONSE:- ${response}`);
    callback(response);
  });
}

// Voice API call to make an outbound call
function makeOutboundCall(reqDetails, callback) {
  httpOptions.path = '/voice/v1/call';
  httpOptions.method = 'POST';
  const postData = JSON.stringify({
    name: 'TEST_APP',
    owner_ref: 'XYZ',
    to: reqDetails.to,
    from: reqDetails.from,
    action_on_connect: {
      room: {
        room_id : `${process.env.ROOMID}`
      },
    },
    event_url: `${process.env.PUBLIC_WEBHOOK_URL}/event`,
  });

  connectEnablexServer(postData, (response) => {
    logger.info(`RESPONSE:- ${response}`);
    callback(response);
  });
}

module.exports = {
  makeOutboundCall,
  hangupCall,
};
