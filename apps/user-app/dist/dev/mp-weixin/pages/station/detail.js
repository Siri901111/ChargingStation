"use strict";
const common_vendor = require("../../common/vendor.js");
const api_station = require("../../api/station.js");
const store_modules_user = require("../../store/modules/user.js");
const constants_index = require("../../constants/index.js");
const utils_index = require("../../utils/index.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "detail",
  setup(__props) {
    const userStore = store_modules_user.useUserStore();
    const stationId = common_vendor.ref(0);
    const station = common_vendor.ref(null);
    const piles = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    const pileFilter = common_vendor.ref("all");
    const isFavorite = common_vendor.ref(false);
    const filteredPiles = common_vendor.computed(() => {
      if (pileFilter.value === "all") {
        return piles.value;
      }
      return piles.value.filter((pile) => pile.type === pileFilter.value);
    });
    common_vendor.onLoad((options) => {
      if (options == null ? void 0 : options.id) {
        stationId.value = Number(options.id);
      }
    });
    common_vendor.onMounted(() => {
      if (stationId.value) {
        fetchStationDetail();
        fetchStationPiles();
      }
    });
    async function fetchStationDetail() {
      loading.value = true;
      try {
        station.value = await api_station.stationApi.getStationDetail(stationId.value);
      } catch (error) {
        common_vendor.index.showToast({ title: "获取站点失败", icon: "none" });
      } finally {
        loading.value = false;
      }
    }
    async function fetchStationPiles() {
      try {
        piles.value = await api_station.stationApi.getStationPiles(stationId.value);
      } catch (error) {
        console.error("获取充电桩失败", error);
      }
    }
    function getStatusClass(status) {
      switch (status) {
        case constants_index.PILE_STATUS.FREE:
          return "success";
        case constants_index.PILE_STATUS.CHARGING:
          return "warning";
        case constants_index.PILE_STATUS.FAULT:
        case constants_index.PILE_STATUS.OFFLINE:
          return "danger";
        default:
          return "";
      }
    }
    function getStatusText(status) {
      return constants_index.PILE_STATUS_TEXT[status] || "未知";
    }
    function handleNavigation() {
      if (station.value) {
        utils_index.openNavigation(
          station.value.latitude,
          station.value.longitude,
          station.value.name,
          station.value.address
        );
      }
    }
    function handleCall() {
      var _a;
      if ((_a = station.value) == null ? void 0 : _a.tel) {
        utils_index.makePhoneCall(station.value.tel);
      }
    }
    async function handleFavorite() {
      if (!userStore.checkLoginAndNavigate()) return;
      try {
        if (isFavorite.value) {
          await api_station.stationApi.unfavoriteStation(stationId.value);
          isFavorite.value = false;
          common_vendor.index.showToast({ title: "已取消收藏", icon: "success" });
        } else {
          await api_station.stationApi.favoriteStation(stationId.value);
          isFavorite.value = true;
          common_vendor.index.showToast({ title: "收藏成功", icon: "success" });
        }
      } catch (error) {
        common_vendor.index.showToast({ title: "操作失败", icon: "none" });
      }
    }
    function handleSelectPile(pile) {
      if (pile.status !== constants_index.PILE_STATUS.FREE) {
        common_vendor.index.showToast({ title: "该充电桩不可用", icon: "none" });
        return;
      }
      if (!userStore.checkLoginAndNavigate()) return;
      common_vendor.index.navigateTo({
        url: `${constants_index.PAGE_PATH.SCAN}?pileId=${pile.id}`
      });
    }
    function handleScan() {
      if (!userStore.checkLoginAndNavigate()) return;
      common_vendor.index.scanCode({
        onlyFromCamera: true,
        success: (res) => {
          common_vendor.index.navigateTo({
            url: `${constants_index.PAGE_PATH.SCAN}?code=${encodeURIComponent(res.result)}`
          });
        },
        fail: () => {
          common_vendor.index.showToast({ title: "扫码失败", icon: "none" });
        }
      });
    }
    return (_ctx, _cache) => {
      var _a, _b;
      return common_vendor.e({
        a: loading.value
      }, loading.value ? {} : station.value ? common_vendor.e({
        c: (_a = station.value.images) == null ? void 0 : _a.length
      }, ((_b = station.value.images) == null ? void 0 : _b.length) ? {
        d: common_vendor.f(station.value.images, (img, index, i0) => {
          return {
            a: img,
            b: index
          };
        })
      } : {}, {
        e: common_vendor.t(station.value.name),
        f: station.value.fastFree > 0
      }, station.value.fastFree > 0 ? {} : {}, {
        g: station.value.slowFree > 0
      }, station.value.slowFree > 0 ? {} : {}, {
        h: common_vendor.t(station.value.address || station.value.city),
        i: station.value.distance
      }, station.value.distance ? {
        j: common_vendor.t(common_vendor.unref(utils_index.formatDistance)(station.value.distance))
      } : {}, {
        k: common_vendor.o(handleNavigation, "86"),
        l: station.value.tel
      }, station.value.tel ? {
        m: common_vendor.t(station.value.tel),
        n: common_vendor.o(handleCall, "97")
      } : {}, {
        o: common_vendor.t(station.value.fastFree),
        p: common_vendor.t(station.value.fast),
        q: common_vendor.t(station.value.slowFree),
        r: common_vendor.t(station.value.slow),
        s: common_vendor.n({
          active: pileFilter.value === "all"
        }),
        t: common_vendor.o(($event) => pileFilter.value = "all", "d0"),
        v: common_vendor.n({
          active: pileFilter.value === "fast"
        }),
        w: common_vendor.o(($event) => pileFilter.value = "fast", "e7"),
        x: common_vendor.n({
          active: pileFilter.value === "slow"
        }),
        y: common_vendor.o(($event) => pileFilter.value = "slow", "e1"),
        z: common_vendor.f(filteredPiles.value, (pile, k0, i0) => {
          return {
            a: common_vendor.t(pile.name),
            b: common_vendor.t(pile.type === "fast" ? "快充" : "慢充"),
            c: common_vendor.t(pile.power),
            d: common_vendor.t(getStatusText(pile.status)),
            e: common_vendor.n(getStatusClass(pile.status)),
            f: common_vendor.t(pile.price),
            g: pile.id,
            h: common_vendor.n({
              disabled: pile.status !== common_vendor.unref(constants_index.PILE_STATUS).FREE
            }),
            i: common_vendor.o(($event) => handleSelectPile(pile), pile.id)
          };
        }),
        A: common_vendor.n(isFavorite.value ? "icon-star-filled" : "icon-star"),
        B: common_vendor.o(handleFavorite, "e9"),
        C: common_vendor.o(handleNavigation, "dd"),
        D: common_vendor.o(handleScan, "b7")
      }) : {}, {
        b: station.value
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c08b9dfd"]]);
wx.createPage(MiniProgramPage);
