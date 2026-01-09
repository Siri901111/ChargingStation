"use strict";
const utils_http = require("../utils/http.js");
const stationApi = {
  /**
   * 获取附近站点
   */
  getNearbyStations(params) {
    return utils_http.http.get("/station/nearby", params);
  },
  /**
   * 搜索站点
   */
  searchStations(params) {
    return utils_http.http.get("/station/search", params);
  },
  /**
   * 获取站点详情
   */
  getStationDetail(id) {
    return utils_http.http.get(`/station/${id}`);
  },
  /**
   * 获取站点充电桩列表
   */
  getStationPiles(stationId) {
    return utils_http.http.get(`/station/${stationId}/piles`);
  },
  /**
   * 获取充电桩详情
   */
  getPileDetail(pileId) {
    return utils_http.http.get(`/pile/${pileId}`);
  },
  /**
   * 获取热门站点
   */
  getHotStations(params) {
    return utils_http.http.get("/station/hot", params);
  },
  /**
   * 收藏站点
   */
  favoriteStation(stationId) {
    return utils_http.http.post("/station/favorite", { stationId });
  },
  /**
   * 取消收藏
   */
  unfavoriteStation(stationId) {
    return utils_http.http.delete(`/station/favorite/${stationId}`);
  },
  /**
   * 获取收藏列表
   */
  getFavoriteStations() {
    return utils_http.http.get("/station/favorites");
  }
};
exports.stationApi = stationApi;
