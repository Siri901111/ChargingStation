"use strict";
const common_vendor = require("../common/vendor.js");
function useCountdown(initialSeconds = 60) {
  const count = common_vendor.ref(0);
  const isCounting = common_vendor.ref(false);
  let timer = null;
  const start = (seconds = initialSeconds) => {
    if (isCounting.value) return;
    count.value = seconds;
    isCounting.value = true;
    timer = setInterval(() => {
      count.value--;
      if (count.value <= 0) {
        stop();
      }
    }, 1e3);
  };
  const stop = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    isCounting.value = false;
    count.value = 0;
  };
  common_vendor.onUnmounted(() => {
    stop();
  });
  return {
    count,
    isCounting,
    start,
    stop
  };
}
exports.useCountdown = useCountdown;
