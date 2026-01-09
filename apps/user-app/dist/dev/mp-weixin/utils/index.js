"use strict";
const common_vendor = require("../common/vendor.js");
function formatDate(date, format = "YYYY-MM-DD HH:mm:ss") {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  return format.replace("YYYY", String(year)).replace("MM", month).replace("DD", day).replace("HH", hours).replace("mm", minutes).replace("ss", seconds);
}
function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}小时${m}分${s}秒`;
  }
  if (m > 0) {
    return `${m}分${s}秒`;
  }
  return `${s}秒`;
}
function formatDistance(meters) {
  if (meters < 1e3) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1e3).toFixed(1)}km`;
}
function maskPhone(phone) {
  if (!phone || phone.length !== 11) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
}
function copyToClipboard(text) {
  return new Promise((resolve, reject) => {
    common_vendor.index.setClipboardData({
      data: text,
      success: () => {
        common_vendor.index.showToast({ title: "复制成功", icon: "success" });
        resolve();
      },
      fail: reject
    });
  });
}
function makePhoneCall(phoneNumber) {
  common_vendor.index.makePhoneCall({
    phoneNumber,
    fail: () => {
      common_vendor.index.showToast({ title: "拨打失败", icon: "none" });
    }
  });
}
function openNavigation(latitude, longitude, name, address) {
  common_vendor.index.openLocation({
    latitude,
    longitude,
    name,
    address: address || name,
    fail: () => {
      common_vendor.index.showToast({ title: "打开地图失败", icon: "none" });
    }
  });
}
exports.copyToClipboard = copyToClipboard;
exports.formatDate = formatDate;
exports.formatDistance = formatDistance;
exports.formatDuration = formatDuration;
exports.makePhoneCall = makePhoneCall;
exports.maskPhone = maskPhone;
exports.openNavigation = openNavigation;
