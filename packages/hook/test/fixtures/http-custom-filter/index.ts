import { RunUtil } from '../../RunUtil';
import * as assert from 'assert';
import * as url from 'url';
import { HttpServerPatcher } from '../../../src/patch/HttpServer';

const httpServerPatcher = new HttpServerPatcher({
  requestFilter: function(req) {
    const urlParsed = url.parse(req.url, true);
    return urlParsed.pathname.indexOf('ignore') > -1;
  }
});

RunUtil.run(function(done) {
  httpServerPatcher.run();
  const http = require('http');
  const urllib = require('urllib');

  process.on(<any> 'PANDORA_PROCESS_MESSAGE_TRACE', (report: any) => {
    assert(report.name === 'HTTP-GET:/');
    assert(report.spans.length === 1);

    done();
  });

  const server = http.createServer((req, res) => {

    res.end('hello');
  });

  server.listen(0, () => {
    const port = server.address().port;

    setTimeout(function() {
      // should be ignore
      urllib.request(`http://localhost:${port}/ignore`);
    }, 500);

    setTimeout(function() {
      urllib.request(`http://localhost:${port}`);
    }, 1000);
  });
});
