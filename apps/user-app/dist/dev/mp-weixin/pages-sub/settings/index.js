"use strict";
const common_vendor = require("../../common/vendor.js");
const store_modules_user = require("../../store/modules/user.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const userStore = store_modules_user.useUserStore();
    const notifications = common_vendor.ref(true);
    const sound = common_vendor.ref(true);
    const vibrate = common_vendor.ref(true);
    const cacheSize = common_vendor.ref("0 KB");
    common_vendor.onMounted(() => {
      calculateCacheSize();
    });
    function calculateCacheSize() {
      try {
        const info = common_vendor.index.getStorageInfoSync();
        const sizeKB = info.currentSize;
        if (sizeKB > 1024) {
          cacheSize.value = `${(sizeKB / 1024).toFixed(1)} MB`;
        } else {
          cacheSize.value = `${sizeKB} KB`;
        }
      } catch {
        cacheSize.value = "0 KB";
      }
    }
    function handleClearCache() {
      common_vendor.index.showModal({
        title: "确认清除",
        content: "确定要清除缓存吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.clearStorageSync();
            cacheSize.value = "0 KB";
            common_vendor.index.showToast({ title: "清除成功", icon: "success" });
          }
        }
      });
    }
    function handleCheckUpdate() {
      common_vendor.index.showToast({ title: "已是最新版本", icon: "success" });
    }
    function goToAbout() {
      common_vendor.index.navigateTo({ url: "/pages-sub/settings/about" });
    }
    function goToAgreement() {
      common_vendor.index.navigateTo({ url: "/pages-sub/settings/agreement" });
    }
    function goToPrivacy() {
      common_vendor.index.navigateTo({ url: "/pages-sub/settings/privacy" });
    }
    function handleLogout() {
      common_vendor.index.showModal({
        title: "确认退出",
        content: "确定要退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            userStore.logout();
            common_vendor.index.showToast({ title: "已退出登录", icon: "success" });
            common_vendor.index.switchTab({ url: "/pages/index/index" });
          }
        }
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: notifications.value,
        b: common_vendor.o(($event) => notifications.value = !notifications.value, "34"),
        c: sound.value,
        d: common_vendor.o(($event) => sound.value = !sound.value, "f0"),
        e: vibrate.value,
        f: common_vendor.o(($event) => vibrate.value = !vibrate.value, "d5"),
        g: common_vendor.t(cacheSize.value),
        h: common_vendor.o(handleClearCache, "6e"),
        i: common_vendor.o(handleCheckUpdate, "43"),
        j: common_vendor.o(goToAbout, "95"),
        k: common_vendor.o(goToAgreement, "42"),
        l: common_vendor.o(goToPrivacy, "c0"),
        m: common_vendor.unref(userStore).isLoggedIn
      }, common_vendor.unref(userStore).isLoggedIn ? {
        n: common_vendor.o(handleLogout, "d1")
      } : {});
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6a2e1045"]]);
wx.createPage(MiniProgramPage);
