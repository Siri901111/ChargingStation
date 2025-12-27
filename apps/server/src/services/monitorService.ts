import Station from '../models/Station.js';
import Pile from '../models/Pile.js';
import Order from '../models/Order.js';

// 获取充电桩实时监控列表
export async function getCurrentListService() {
  // 获取所有充电站
  const stations = await Station.findAll({
    order: [['id', 'ASC']]
  });

  // 为每个充电站获取其充电桩列表
  const result = await Promise.all(
    stations.map(async (station: any) => {
      // 获取该站点的所有充电桩
      const piles = await Pile.findAll({
        where: {
          station_id: station.id
        },
        order: [['id', 'ASC']]
      });

      // 格式化充电桩数据
      const pileList = await Promise.all(
        piles.map(async (pile: any) => {
          // 获取该充电桩的使用记录（最近6条）
          // equipment_no 对应充电桩ID
          const records = await Order.findAll({
            where: {
              equipment_no: String(pile.id)
            },
            order: [['date', 'DESC']],
            limit: 6
          });

          // 格式化使用记录
          const recordList = records.map((order: any) => ({
            time: order.date ? new Date(order.date).toLocaleTimeString('zh-CN', { hour12: false }) : '',
            msg: `充电${order.money ? Number(order.money).toFixed(0) : 0}度，消费${order.money ? Number(order.money).toFixed(0) : 0}元`
          }));

          return {
            id: String(pile.id),
            voltage: pile.voltage ? `${pile.voltage}V` : '0V',
            current: pile.current ? `${pile.current}A` : '0A',
            power: pile.power ? `${pile.power}KW` : '0KW',
            tem: pile.temperature ? `${pile.temperature}°c` : '0°c',
            status: pile.status || 1,
            percent: pile.status === 2 && pile.percent ? `${pile.percent}%` : undefined, // 仅在充电中时显示
            record: recordList.length > 0 ? recordList : undefined // 有记录时才返回
          };
        })
      );

      return {
        id: String(station.id),
        name: station.name,
        list: pileList
      };
    })
  );

  return result;
}

