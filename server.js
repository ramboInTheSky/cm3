const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('./webpack.config');
const path = require('path');
const express = require('express');
const fs = require('fs');
const os = require('os');

// run the webpack-dev-server with a proxy for /s/* to goto the mock express server (defined below)
new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: false,
  historyApiFallback: true,

  // proxy all backend requests to "mockBackend" express app below
  proxy: {
    "/collateralmanager/s/*": {
      target: "http://localtest:3001"
      // target: "http://localtest:9031"
    },
    "/collateralmanager/ws/*": {
      target: "ws://localtest:3001",
      // target: "ws://localtest:9031",
      ws: true
    },
    "/collateralmanager/r/*": {
      target: "http://localtest:3000/collateralmanager",
      pathRewrite: {
        "^/collateralmanager/r/.*": "/"
      }

    }
  }

// }).listen(3000, '0.0.0.0', function (err, result) {
}).listen(3000, 'localtest', function (err, result) {
  if (err) {
    console.log(err);
  }

  console.log('Listening at localtest:3000');
});

// setup a separate express server for serving up mock endpoints.
// this makes life easier to serve static files and to mock out mutations (POST/PUT/DELETE/PATCH)
//
// also, introduces the ability to add some latency to requests to better represent real-world speed

// delay constant (millis)
const DELAY = 250;
// const DELAY = 2000;
// const DELAY = 60000;

// handler which explicitly sets Content-Type: application/json
const jsoned = function (handler) {
  return function (req, res, next) {
    res.set('Content-Type', 'application/json');
    handler(req, res, next);
  }
};

// handler which takes a delay in millis, waits for that long, then invokes a wrapped handler
const delayed = function (delay, handler) {
  return function (req, res, next) {
    setTimeout(function () {
      handler(req, res, next);
    }, delay);
  }
};

// mock backend
const mockBackend = express();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

//
// START: specifically coded mock endpoints
//

mockBackend.get('/collateralmanager/s/ampreports', delayed(DELAY, jsoned(function (req, res, next) {
  fs.readFile('./mock/ampreports/list.json', function (err, data) {
    res.send(data.toString());
  });
})));

mockBackend.get('/collateralmanager/s/organization', delayed(DELAY, jsoned(function (req, res, next) {
  fs.readFile('./mock/organization/list.json', function (err, data) {
    res.send(data.toString());
  });
})));

mockBackend.post('/collateralmanager/s/runreport/:id', delayed(DELAY, function (req, res, next) {
  const id = req.params.id;
  fs.readFile('./mock/runreport/test.csv', function (err, data) {
    res.set('Content-Type', 'text/csv');
    res.set('Content-Disposition', 'attachment; filename="test.csv"');
    res.status(200).send(data);
  });
}));

//
// END: specifically coded mock endpoints
//


// static mock files, this must be last, so that it's considered as the last option, since it dynamically 
// serves static files based on the requested URI
//
// uses a delayed handler
var staticHandler = mockBackend.use('/collateralmanager/s', delayed(DELAY, jsoned(express.static(path.join(__dirname, 'mock')))));

mockBackend.use(function (err, req, res, next) {
  console.log('err');
  res.status(404).send();
});

// startup mock backend
mockBackend.listen(3001);