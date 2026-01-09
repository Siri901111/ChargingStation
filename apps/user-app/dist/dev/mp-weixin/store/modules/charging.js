"use strict";
const common_vendor = require("../../common/vendor.js");
const api_charging = require("../../api/charging.js");
const config_index = require("../../config/index.js");
const useChargingStore = common_vendor.defineStore("charging", () => {
  const isCharging = common_vendor.ref(false);
  const chargingStatus = common_vendor.ref(null);
  const wsConnection = common_vendor.ref(null);
  const currentOrderId = common_vendor.computed(() => {
    var _a;
    return (_a = chargingStatus.value) == null ? void 0 : _a.orderId;
  });
  const chargingDuration = common_vendor.computed(() => {
    var _a;
    return ((_a = chargingStatus.value) == null ? void 0 : _a.duration) ?? 0;
  });
  const chargingPower = common_vendor.computed(() => {
    var _a;
    return ((_a = chargingStatus.value) == null ? void 0 : _a.power) ?? 0;
  });
  const chargingAmount = common_vendor.computed(() => {
    var _a;
    return ((_a = chargingStatus.value) == null ? void 0 : _a.amount) ?? 0;
  });
  async function startCharging(pileId) {
    const result = await api_charging.chargingApi.startCharging({ pileId });
    isCharging.value = true;
    chargingStatus.value = result;
    connectWebSocket(result.orderId);
    return result;
  }
  async function stopCharging() {
    var _a;
    if (!((_a = chargingStatus.value) == null ? void 0 : _a.orderId)) return;
    const result = await api_charging.chargingApi.stopCharging({
      orderId: chargingStatus.value.orderId
    });
    isCharging.value = false;
    disconnectWebSocket();
    return result;
  }
  async function fetchChargingStatus() {
    const status = await api_charging.chargingApi.getChargingStatus();
    if (status) {
      isCharging.value = true;
      chargingStatus.value = status;
      connectWebSocket(status.orderId);
    } else {
      isCharging.value = false;
      chargingStatus.value = null;
    }
    return status;
  }
  function connectWebSocket(orderId) {
    if (wsConnection.value) {
      disconnectWebSocket();
    }
    const token = common_vendor.index.getStorageSync("user_token");
    wsConnection.value = common_vendor.index.connectSocket({
      url: `${config_index.config.wsUrl}/charging/${orderId}?token=${token}`,
      success: () => {
        console.log("WebSocket 连接成功");
      }
    });
    common_vendor.index.onSocketMessage((res) => {
      try {
        const data = JSON.parse(res.data);
        if (data.type === "charging_status") {
          chargingStatus.value = {
            ...chargingStatus.value,
            ...data.payload
          };
        } else if (data.type === "charging_complete") {
          isCharging.value = false;
          common_vendor.index.showModal({
            title: "充电完成",
            content: `本次充电 ${data.payload.electricity.toFixed(2)} kWh，费用 ¥${data.payload.amount.toFixed(2)}`,
            showCancel: false
          });
        }
      } catch (e) {
        console.error("WebSocket 消息解析失败", e);
      }
    });
    common_vendor.index.onSocketClose(() => {
      console.log("WebSocket 连接关闭");
      wsConnection.value = null;
    });
    common_vendor.index.onSocketError(() => {
      console.error("WebSocket 连接错误");
      wsConnection.value = null;
    });
  }
  function disconnectWebSocket() {
    if (wsConnection.value) {
      common_vendor.index.closeSocket();
      wsConnection.value = null;
    }
  }
  function reset() {
    isCharging.value = false;
    chargingStatus.value = null;
    disconnectWebSocket();
  }
  return {
    // State
    isCharging,
    chargingStatus,
    // Getters
    currentOrderId,
    chargingDuration,
    chargingPower,
    chargingAmount,
    // Actions
    startCharging,
    stopCharging,
    fetchChargingStatus,
    connectWebSocket,
    disconnectWebSocket,
    reset
  };
});
exports.useChargingStore = useChargingStore;
