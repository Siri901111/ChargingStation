"use strict";
const common_vendor = require("../../common/vendor.js");
const store_modules_location = require("../../store/modules/location.js");
const api_station = require("../../api/station.js");
const utils_index = require("../../utils/index.js");
const constants_index = require("../../constants/index.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const locationStore = store_modules_location.useLocationStore();
    const statusBarHeight = common_vendor.ref(0);
    const keyword = common_vendor.ref("");
    const currentFilter = common_vendor.ref("all");
    const mapScale = common_vendor.ref(14);
    const showStationList = common_vendor.ref(false);
    const stationList = common_vendor.ref([]);
    const selectedStation = common_vendor.ref(null);
    const mapCenter = common_vendor.ref({
      latitude: 39.908823,
      longitude: 116.39747
    });
    const filterOptions = [
      { label: "全部", value: "all" },
      { label: "快充", value: "fast" },
      { label: "慢充", value: "slow" },
      { label: "空闲", value: "free" }
    ];
    const markers = common_vendor.computed(() => {
      return stationList.value.map((station, index) => ({
        id: station.id,
        latitude: station.latitude,
        longitude: station.longitude,
        width: 40,
        height: 50,
        iconPath: getMarkerIcon(station),
        callout: {
          content: station.name,
          color: "#333333",
          fontSize: 12,
          borderRadius: 4,
          padding: 6,
          display: "BYCLICK",
          bgColor: "#FFFFFF"
        }
      }));
    });
    function getMarkerIcon(station) {
      const hasFree = station.fastFree > 0 || station.slowFree > 0;
      return hasFree ? "/static/marker/marker-green.png" : "/static/marker/marker-gray.png";
    }
    common_vendor.onMounted(() => {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      statusBarHeight.value = systemInfo.statusBarHeight || 0;
      initLocation();
    });
    common_vendor.onShow(() => {
      if (locationStore.currentLocation) {
        fetchNearbyStations();
      }
    });
    async function initLocation() {
      const location = await locationStore.getCurrentLocation();
      if (location) {
        mapCenter.value = {
          latitude: location.latitude,
          longitude: location.longitude
        };
        fetchNearbyStations();
      }
    }
    async function fetchNearbyStations() {
      if (!locationStore.currentLocation) return;
      try {
        const { latitude, longitude } = locationStore.currentLocation;
        const res = await api_station.stationApi.getNearbyStations({
          latitude,
          longitude,
          radius: 1e4,
          type: currentFilter.value === "all" ? void 0 : currentFilter.value,
          pageSize: 50
        });
        stationList.value = res.list;
      } catch (error) {
        console.error("获取站点失败", error);
      }
    }
    function handleSearch() {
      if (!keyword.value.trim()) return;
    }
    function clearSearch() {
      keyword.value = "";
      fetchNearbyStations();
    }
    function handleFilterChange(value) {
      currentFilter.value = value;
      fetchNearbyStations();
    }
    async function relocate() {
      const location = await locationStore.getCurrentLocation();
      if (location) {
        mapCenter.value = {
          latitude: location.latitude,
          longitude: location.longitude
        };
        mapScale.value = 14;
      }
    }
    function handleMarkerTap(e) {
      const station = stationList.value.find((s) => s.id === e.markerId);
      if (station) {
        selectedStation.value = station;
        mapCenter.value = {
          latitude: station.latitude,
          longitude: station.longitude
        };
      }
    }
    function handleRegionChange(e) {
      if (e.type === "end") ;
    }
    function toggleStationList() {
      showStationList.value = !showStationList.value;
      if (showStationList.value) {
        selectedStation.value = null;
      }
    }
    function closeStationCard() {
      selectedStation.value = null;
    }
    function handleNavigation(station) {
      utils_index.openNavigation(station.latitude, station.longitude, station.name, station.address);
    }
    function goToStationDetail(station) {
      common_vendor.index.navigateTo({ url: `${constants_index.PAGE_PATH.STATION_DETAIL}?id=${station.id}` });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(handleSearch, "f7"),
        b: keyword.value,
        c: common_vendor.o(($event) => keyword.value = $event.detail.value, "16"),
        d: keyword.value
      }, keyword.value ? {
        e: common_vendor.o(clearSearch, "43")
      } : {}, {
        f: common_vendor.f(filterOptions, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.label),
            b: item.value,
            c: common_vendor.n({
              active: currentFilter.value === item.value
            }),
            d: common_vendor.o(($event) => handleFilterChange(item.value), item.value)
          };
        }),
        g: statusBarHeight.value + "px",
        h: mapCenter.value.latitude,
        i: mapCenter.value.longitude,
        j: mapScale.value,
        k: markers.value,
        l: common_vendor.o(handleMarkerTap, "80"),
        m: common_vendor.o(handleRegionChange, "1a"),
        n: common_vendor.o(relocate, "d6"),
        o: common_vendor.t(stationList.value.length),
        p: common_vendor.o(toggleStationList, "c1"),
        q: common_vendor.f(stationList.value, (station, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(station.name),
            b: common_vendor.t(station.address || station.city),
            c: common_vendor.t(station.fastFree),
            d: common_vendor.t(station.fast),
            e: common_vendor.t(station.slowFree),
            f: common_vendor.t(station.slow),
            g: station.distance
          }, station.distance ? {
            h: common_vendor.t(common_vendor.unref(utils_index.formatDistance)(station.distance))
          } : {}, {
            i: common_vendor.o(($event) => handleNavigation(station), station.id),
            j: station.id,
            k: common_vendor.o(($event) => goToStationDetail(station), station.id)
          });
        }),
        r: common_vendor.n({
          show: showStationList.value
        }),
        s: selectedStation.value
      }, selectedStation.value ? common_vendor.e({
        t: common_vendor.t(selectedStation.value.name),
        v: common_vendor.o(closeStationCard, "07"),
        w: common_vendor.t(selectedStation.value.address || selectedStation.value.city),
        x: common_vendor.t(selectedStation.value.fastFree),
        y: common_vendor.t(selectedStation.value.fast),
        z: common_vendor.t(selectedStation.value.slowFree),
        A: common_vendor.t(selectedStation.value.slow),
        B: selectedStation.value.price
      }, selectedStation.value.price ? {
        C: common_vendor.t(selectedStation.value.price)
      } : {}, {
        D: common_vendor.o(($event) => handleNavigation(selectedStation.value), "e0"),
        E: common_vendor.o(($event) => goToStationDetail(selectedStation.value), "de"),
        F: common_vendor.o(($event) => goToStationDetail(selectedStation.value), "6d")
      }) : {});
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-ebfe0c06"]]);
wx.createPage(MiniProgramPage);
