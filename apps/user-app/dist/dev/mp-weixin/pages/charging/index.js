"use strict";
const common_vendor = require("../../common/vendor.js");
const store_modules_charging = require("../../store/modules/charging.js");
const constants_index = require("../../constants/index.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const chargingStore = store_modules_charging.useChargingStore();
    const statusBarHeight = common_vendor.ref(0);
    let durationTimer = null;
    common_vendor.onMounted(() => {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      statusBarHeight.value = systemInfo.statusBarHeight || 0;
      chargingStore.fetchChargingStatus();
      durationTimer = setInterval(() => {
        if (chargingStore.chargingStatus) {
          const start = new Date(chargingStore.chargingStatus.startTime).getTime();
          const now = Date.now();
          const duration = Math.floor((now - start) / 1e3);
          if (chargingStore.chargingStatus) {
            chargingStore.chargingStatus.duration = duration;
          }
        }
      }, 1e3);
    });
    common_vendor.onUnmounted(() => {
      if (durationTimer) {
        clearInterval(durationTimer);
      }
    });
    function formatDuration(seconds) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor(seconds % 3600 / 60);
      const s = seconds % 60;
      const hStr = String(h).padStart(2, "0");
      const mStr = String(m).padStart(2, "0");
      const sStr = String(s).padStart(2, "0");
      return `${hStr}:${mStr}:${sStr}`;
    }
    function handleBack() {
      common_vendor.index.switchTab({ url: constants_index.PAGE_PATH.INDEX });
    }
    function handleStopCharging() {
      common_vendor.index.showModal({
        title: "确认停止充电",
        content: "是否确认停止当前充电？",
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({ title: "正在停止..." });
              const result = await chargingStore.stopCharging();
              common_vendor.index.hideLoading();
              if (result) {
                common_vendor.index.showModal({
                  title: "充电完成",
                  content: `本次充电 ${result.electricity.toFixed(2)} kWh
费用 ¥${result.amount.toFixed(2)}`,
                  showCancel: false,
                  success: () => {
                    common_vendor.index.redirectTo({
                      url: `${constants_index.PAGE_PATH.ORDER_DETAIL}?orderNo=${result.orderId}`
                    });
                  }
                });
              }
            } catch (error) {
              common_vendor.index.hideLoading();
              common_vendor.index.showToast({
                title: "停止失败，请重试",
                icon: "none"
              });
            }
          }
        }
      });
    }
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i;
      return {
        a: common_vendor.o(handleBack, "63"),
        b: common_vendor.t(((_a = common_vendor.unref(chargingStore).chargingStatus) == null ? void 0 : _a.percent) || 0),
        c: common_vendor.t((_b = common_vendor.unref(chargingStore).chargingStatus) == null ? void 0 : _b.stationName),
        d: common_vendor.t((_c = common_vendor.unref(chargingStore).chargingStatus) == null ? void 0 : _c.pileName),
        e: statusBarHeight.value + "px",
        f: common_vendor.t(formatDuration(common_vendor.unref(chargingStore).chargingDuration)),
        g: common_vendor.t(((_e = (_d = common_vendor.unref(chargingStore).chargingStatus) == null ? void 0 : _d.electricity) == null ? void 0 : _e.toFixed(2)) || "0.00"),
        h: common_vendor.t(common_vendor.unref(chargingStore).chargingAmount.toFixed(2)),
        i: common_vendor.t(((_g = (_f = common_vendor.unref(chargingStore).chargingStatus) == null ? void 0 : _f.voltage) == null ? void 0 : _g.toFixed(1)) || "--"),
        j: common_vendor.t(((_i = (_h = common_vendor.unref(chargingStore).chargingStatus) == null ? void 0 : _h.current) == null ? void 0 : _i.toFixed(1)) || "--"),
        k: common_vendor.t(common_vendor.unref(chargingStore).chargingPower.toFixed(1)),
        l: common_vendor.o(handleStopCharging, "14")
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0979a525"]]);
wx.createPage(MiniProgramPage);
