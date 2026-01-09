"use strict";
const common_vendor = require("../common/vendor.js");
const pinia = common_vendor.createPinia();
function setupStore(app) {
  app.use(pinia);
}
exports.setupStore = setupStore;
