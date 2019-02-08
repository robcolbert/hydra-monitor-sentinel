# hydra-monitor-sentinel

HYDRA Monitor Sentinel (Node.js remote monitoring) for the HYDRA platform.

## Overview

The HYDRA Monitor Sentinel will bind an ExpressJS server to a configured IP address and TCP port number on which a /hydra-monitor endpoint will be offered. Per GET request received, the sentinel will collect various information about the system and respond with a JSON document detailing information about the host back to the caller.

It is recommended to only run the HYDRA Monitor Sentinel on a private interface that does not receive inbound public traffic.

## Installing The Module

Install with NPM:

    npm install hydra-monitor-sentinel

Install with Yarn:

    yarn add hydra-monitor-sentinel

## Integrating With Your HYDRA Application

    const hydraMonitorSentinel = require('hydra-monitor-sentinel')(app, config);

## Configuration

The `config` object passed to hydra-monitor-sentinel must include a `monitor` object.

    {
      'monitor': {
        bind: '###.###.###.###',
        port: 3002,
        disks: ['/', '/tmp', '/var/log']
      }
    }

### bind: String IP Address

The `bind` option specifies which local IP address the sentinel will bind it's embedded ExpressJS server. Use `'0.0.0.0'` to allow requests on all local interfaces (strongly discouraged in production environments).

### port: TCP Port Number

Specifies the TCP port number to which the HYDRA Monitor Sentinel will bind it's embedded ExpressJS server. The number chosen must be unique on the host and unused. Port 3002 is used by default.

## How It Works

When you require('hydra-monitor-sentinel'), a function is returned. You pass that function your main HYDRA module, and it:

1. Creates an ExpressJS server configured and bound per options specified in `hydra.config.monitor`
1. Establishes the GET /hydra-monitor route on that server
1. Responds to GET /hydra-monitor with a JSON document

The sentinel uses the Node.js `os`, `v8`, `process`, and `diskusage` modules to resolve host information back to the caller.

## What About MongoDB and Redis?

Separate projects, hydra-monitor-mongodb and hydra-monitor-redis will be offered that implement HYDRA-specific monitoring of those services. HYDRA will then integrate data service monitoring through those modules which will be their in their own runtime sandbox or can be integrated into any HYDRA worker in more advanced setups.