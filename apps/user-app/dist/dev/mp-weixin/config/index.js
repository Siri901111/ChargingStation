"use strict";
const envMap = {
  development: {
    baseUrl: "http://localhost:3001/api/mobile",
    wsUrl: "ws://localhost:3001",
    amapKey: "YOUR_AMAP_KEY",
    debug: true
  },
  production: {
    baseUrl: "https://api.example.com/api/mobile",
    wsUrl: "wss://api.example.com",
    amapKey: "YOUR_AMAP_KEY",
    debug: false
  }
};
const env = "development";
const config = envMap[env] || envMap.development;
exports.config = config;
