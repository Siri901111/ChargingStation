"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const store_modules_user = require("./store/modules/user.js");
const store_index = require("./store/index.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/map/index.js";
  "./pages/scan/index.js";
  "./pages/charging/index.js";
  "./pages/order/index.js";
  "./pages/order/detail.js";
  "./pages/mine/index.js";
  "./pages/station/detail.js";
  "./pages/wallet/index.js";
  "./pages/wallet/recharge.js";
  "./pages-sub/auth/login.js";
  "./pages-sub/auth/bindPhone.js";
  "./pages-sub/settings/index.js";
  "./pages-sub/settings/about.js";
  "./pages-sub/settings/feedback.js";
  "./pages-sub/settings/agreement.js";
  "./pages-sub/settings/privacy.js";
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "App",
  setup(__props) {
    common_vendor.onLaunch(() => {
      console.log("App Launch");
      const userStore = store_modules_user.useUserStore();
      userStore.checkLoginStatus();
    });
    common_vendor.onShow(() => {
      console.log("App Show");
    });
    common_vendor.onHide(() => {
      console.log("App Hide");
    });
    return () => {
    };
  }
});
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  store_index.setupStore(app);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
