"use strict";
const common_vendor = require("../../common/vendor.js");
const constants_index = require("../../constants/index.js");
const utils_storage = require("../../utils/storage.js");
const useLocationStore = common_vendor.defineStore("location", () => {
  const currentLocation = common_vendor.ref(null);
  const isLocating = common_vendor.ref(false);
  const locationError = common_vendor.ref("");
  const hasLocation = common_vendor.computed(() => !!currentLocation.value);
  const locationText = common_vendor.computed(() => {
    if (!currentLocation.value) return "定位中...";
    return currentLocation.value.address || currentLocation.value.city || "未知位置";
  });
  async function getCurrentLocation() {
    isLocating.value = true;
    locationError.value = "";
    try {
      const cached = utils_storage.getStorage(constants_index.STORAGE_KEYS.LOCATION);
      if (cached) {
        currentLocation.value = cached;
      }
      const res = await new Promise((resolve, reject) => {
        common_vendor.index.getLocation({
          type: "gcj02",
          isHighAccuracy: true,
          success: resolve,
          fail: reject
        });
      });
      const location = {
        latitude: res.latitude,
        longitude: res.longitude
      };
      try {
        const addressInfo = await reverseGeocode(res.latitude, res.longitude);
        location.address = addressInfo.address;
        location.city = addressInfo.city;
      } catch {
        console.error("逆地理编码失败");
      }
      currentLocation.value = location;
      utils_storage.setStorage(constants_index.STORAGE_KEYS.LOCATION, location);
      return location;
    } catch (error) {
      locationError.value = "定位失败，请检查定位权限";
      common_vendor.index.showToast({
        title: "定位失败，请检查权限",
        icon: "none"
      });
      return null;
    } finally {
      isLocating.value = false;
    }
  }
  async function reverseGeocode(latitude, longitude) {
    return new Promise((resolve, reject) => {
      var _a, _b;
      const qqmapsdk = (_b = (_a = common_vendor.index).requireNativePlugin) == null ? void 0 : _b.call(_a, "qqmap-wx-jssdk");
      if (qqmapsdk) {
        qqmapsdk.reverseGeocoder({
          location: { latitude, longitude },
          success: (res) => {
            resolve({
              address: res.result.address,
              city: res.result.ad_info.city
            });
          },
          fail: reject
        });
      } else {
        resolve({ address: "", city: "" });
      }
    });
  }
  function openLocationSetting() {
    common_vendor.index.openSetting({
      success: (res) => {
        if (res.authSetting["scope.userLocation"]) {
          getCurrentLocation();
        }
      }
    });
  }
  return {
    // State
    currentLocation,
    isLocating,
    locationError,
    // Getters
    hasLocation,
    locationText,
    // Actions
    getCurrentLocation,
    reverseGeocode,
    openLocationSetting
  };
});
exports.useLocationStore = useLocationStore;
