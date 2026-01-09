"use strict";
const common_vendor = require("../../common/vendor.js");
const store_modules_location = require("../../store/modules/location.js");
const store_modules_charging = require("../../store/modules/charging.js");
const store_modules_user = require("../../store/modules/user.js");
const api_station = require("../../api/station.js");
const utils_index = require("../../utils/index.js");
const constants_index = require("../../constants/index.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const locationStore = store_modules_location.useLocationStore();
    const chargingStore = store_modules_charging.useChargingStore();
    const userStore = store_modules_user.useUserStore();
    const statusBarHeight = common_vendor.ref(0);
    const navBarHeight = common_vendor.ref(0);
    const loading = common_vendor.ref(false);
    const refreshing = common_vendor.ref(false);
    const nearbyStations = common_vendor.ref([]);
    common_vendor.onMounted(() => {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      statusBarHeight.value = systemInfo.statusBarHeight || 0;
      navBarHeight.value = statusBarHeight.value + 44;
      initData();
    });
    common_vendor.onShow(() => {
      if (userStore.isLoggedIn) {
        chargingStore.fetchChargingStatus();
      }
    });
    async function initData() {
      loading.value = true;
      try {
        await locationStore.getCurrentLocation();
        await fetchNearbyStations();
      } finally {
        loading.value = false;
      }
    }
    async function fetchNearbyStations() {
      if (!locationStore.currentLocation) return;
      try {
        const { latitude, longitude } = locationStore.currentLocation;
        const res = await api_station.stationApi.getNearbyStations({
          latitude,
          longitude,
          radius: 5e3,
          pageSize: 5
        });
        nearbyStations.value = res.list;
      } catch (error) {
        console.error("获取附近站点失败", error);
      }
    }
    async function onRefresh() {
      refreshing.value = true;
      await initData();
      refreshing.value = false;
    }
    function handleLocationClick() {
      locationStore.getCurrentLocation();
    }
    function handleSearchClick() {
      common_vendor.index.navigateTo({ url: "/pages/map/index?search=1" });
    }
    function handleScan() {
      if (!userStore.checkLoginAndNavigate()) return;
      common_vendor.index.scanCode({
        onlyFromCamera: true,
        success: (res) => {
          common_vendor.index.navigateTo({
            url: `/pages/scan/index?code=${encodeURIComponent(res.result)}`
          });
        }
      });
    }
    function goToMap() {
      common_vendor.index.switchTab({ url: constants_index.PAGE_PATH.MAP });
    }
    function goToOrders() {
      if (!userStore.checkLoginAndNavigate()) return;
      common_vendor.index.switchTab({ url: constants_index.PAGE_PATH.ORDER });
    }
    function goToWallet() {
      if (!userStore.checkLoginAndNavigate()) return;
      common_vendor.index.navigateTo({ url: constants_index.PAGE_PATH.WALLET });
    }
    function goToMine() {
      common_vendor.index.switchTab({ url: constants_index.PAGE_PATH.MINE });
    }
    function goToCharging() {
      common_vendor.index.navigateTo({ url: constants_index.PAGE_PATH.CHARGING });
    }
    function goToStationDetail(id) {
      common_vendor.index.navigateTo({ url: `${constants_index.PAGE_PATH.STATION_DETAIL}?id=${id}` });
    }
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e;
      return common_vendor.e({
        a: common_vendor.t(common_vendor.unref(locationStore).locationText),
        b: common_vendor.o(handleLocationClick, "13"),
        c: common_vendor.o(handleSearchClick, "05"),
        d: statusBarHeight.value + "px",
        e: common_vendor.unref(chargingStore).isCharging
      }, common_vendor.unref(chargingStore).isCharging ? {
        f: common_vendor.t((_a = common_vendor.unref(chargingStore).chargingStatus) == null ? void 0 : _a.stationName),
        g: common_vendor.t(((_c = (_b = common_vendor.unref(chargingStore).chargingStatus) == null ? void 0 : _b.electricity) == null ? void 0 : _c.toFixed(1)) || "0.0"),
        h: common_vendor.t(common_vendor.unref(chargingStore).chargingAmount.toFixed(2)),
        i: common_vendor.o(goToCharging, "a7")
      } : {}, {
        j: common_vendor.o(handleScan, "d8"),
        k: common_vendor.o(goToMap, "c7"),
        l: common_vendor.o(goToOrders, "7f"),
        m: common_vendor.o(goToWallet, "36"),
        n: common_vendor.unref(userStore).isLoggedIn
      }, common_vendor.unref(userStore).isLoggedIn ? {
        o: ((_d = common_vendor.unref(userStore).userInfo) == null ? void 0 : _d.avatar) || "/static/avatar/default.png",
        p: common_vendor.t(common_vendor.unref(userStore).displayName),
        q: common_vendor.t(((_e = common_vendor.unref(userStore).userInfo) == null ? void 0 : _e.cardType) || "普通会员"),
        r: common_vendor.t(common_vendor.unref(userStore).balance.toFixed(2)),
        s: common_vendor.o(goToMine, "bf")
      } : {}, {
        t: common_vendor.o(goToMap, "5f"),
        v: loading.value
      }, loading.value ? {} : nearbyStations.value.length === 0 ? {} : {
        x: common_vendor.f(nearbyStations.value, (station, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(station.name),
            b: station.distance
          }, station.distance ? {
            c: common_vendor.t(common_vendor.unref(utils_index.formatDistance)(station.distance))
          } : {}, {
            d: common_vendor.t(station.address || station.city),
            e: station.fastFree > 0
          }, station.fastFree > 0 ? {
            f: common_vendor.t(station.fastFree)
          } : {}, {
            g: station.slowFree > 0
          }, station.slowFree > 0 ? {
            h: common_vendor.t(station.slowFree)
          } : {}, {
            i: station.price
          }, station.price ? {
            j: common_vendor.t(station.price)
          } : {}, {
            k: station.id,
            l: `${index * 80}ms`,
            m: common_vendor.o(($event) => goToStationDetail(station.id), station.id)
          });
        })
      }, {
        w: nearbyStations.value.length === 0,
        y: refreshing.value,
        z: common_vendor.o(onRefresh, "c5"),
        A: navBarHeight.value + "px"
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-83a5a03c"]]);
wx.createPage(MiniProgramPage);
