"use strict";
const common_vendor = require("../common/vendor.js");
function setStorage(key, value) {
  try {
    common_vendor.index.setStorageSync(key, JSON.stringify(value));
  } catch {
    console.error(`Storage set error: ${key}`);
  }
}
function getStorage(key, defaultValue) {
  try {
    const value = common_vendor.index.getStorageSync(key);
    if (value) {
      return JSON.parse(value);
    }
    return defaultValue;
  } catch {
    return defaultValue;
  }
}
function removeStorage(key) {
  try {
    common_vendor.index.removeStorageSync(key);
  } catch {
    console.error(`Storage remove error: ${key}`);
  }
}
exports.getStorage = getStorage;
exports.removeStorage = removeStorage;
exports.setStorage = setStorage;
