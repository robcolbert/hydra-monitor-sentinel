// hydra-monitor-sentinel.js
// Copyright (C) Rob Colbert <rob.colbert@openplatform.us>
// License: MIT

'use strict';

const os = require('os');
const v8 = require('v8');
const diskusage = require('diskusage');

class HydraMonitorSentinel {

  constructor (hydra) {
    var self = this;
    if (!hydra || !hydra.app || !hydra.config) {
      throw new Error('invalid HYDRA module passed to hydra-monitor-sentinel');
    }

    self.hydra = hydra;
    self.app = hydra.app;
    self.log = hydra.app.locals.log;
    self.redis = hydra.app.locals.redis;
    self.config = hydra.config;

    self.router = self.hydra.express.Router();
    self.router.get('/', self.onMonitorRequest.bind(self));
    self.app.use('/hydra-monitor', self.router);

    self.status = 'attached';
    self.log.debug('hydra-monitor-sentinel', { status: self.status });

    self.stats = { };
  }

  onMonitorRequest (req, res, next) {
    var self = this;

    self.log.debug('monitor request');
    self.stats.cpuUsage = process.cpuUsage(self.stats.cpuUsage);

    var viewModel = {
      success: true,
      os: {
        arch: os.arch(),
        cpus: os.cpus(),
        freemem: os.freemem(),
        hostname: os.hostname(),
        loadavg: os.loadavg(),
        networkInterfaces: os.networkInterfaces(),
        platform: os.platform(),
        release: os.release(),
        totalmem: os.totalmem(),
        type: os.type(),
        uptime: os.uptime(),
        userInfo: os.userInfo()
      },
      disks: { },
      v8: {
        HeapSpaceStatistics: v8.getHeapSpaceStatistics(),
        HeapStatistics: v8.getHeapStatistics()
      },
      process: {
        cpuUsage: self.stats.cpuUsage,
        memoryUsage: process.memoryUsage(),
        pid: process.pid,
        platform: process.platform,
        ppid: process.ppid,
        release: process.release,
        title: process.title,
        uptime: process.uptime(),
        version: process.version,
        versions: process.versions
      },
      package: self.hydra.pkg
    };

    var jobs = [ ];
    if (self.config.monitor.disks && self.config.monitor.disks.length) {
      self.config.monitor.disks.forEach((pathname) => {
        jobs.push(
          diskusage
          .check(pathname)
          .then((result) => {
            result.pathname = pathname;
            return Promise.resolve(result);
          })
        );
      });
    }
    Promise
    .all(jobs)
    .then((results) => {
      viewModel.disks = results;
      res.status(200).json(viewModel);
    })
    .catch((error) => {
      res.status(500).json({ error: error });
    });
  }

}

module.exports = (hydra) => {
  if (!hydra) {
    throw new Error('Must pass main HYDRA module to hydra-monitor-sentinel');
  }
  var sentinel = new HydraMonitorSentinel(hydra);
  return sentinel;
};