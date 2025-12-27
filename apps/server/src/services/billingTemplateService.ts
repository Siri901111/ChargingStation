import { Op } from 'sequelize';
import BillingTemplate from '../models/BillingTemplate.js';
import Station from '../models/Station.js';

export interface TimeSlot {
  date1: string; // 开始时间，格式：HH:mm:ss
  date2: string; // 结束时间，格式：HH:mm:ss
  electricity: string; // 电费（元/度）
}

export interface CreateBillingTemplateParams {
  station_id: number;
  name: string;
  service: string; // 服务费
  parking: string; // 停车费
  remarks: string; // 备注
  date: TimeSlot[]; // 时间段数组
}

export interface UpdateBillingTemplateParams extends CreateBillingTemplateParams {
  id: number;
}

// 获取城市列表（用于树形结构）
export async function getCityListService() {
  try {
    const stations = await Station.findAll({
      attributes: ['id', 'name', 'city'],
      where: {
        city: {
          [Op.not]: null,
          [Op.ne]: '',
        },
      },
      order: [['city', 'ASC'], ['name', 'ASC']],
    });

    // 按城市分组
    const cityMap: { [key: string]: any[] } = {};
    stations.forEach((station: any) => {
      const city = station.city || '未分类';
      if (!cityMap[city]) {
        cityMap[city] = [];
      }
      cityMap[city].push({
        label: station.name,
        id: station.id,
      });
    });

    // 转换为树形结构
    const treeData = [
      {
        label: '全部城市',
        children: Object.keys(cityMap).map((city) => ({
          label: city,
          children: cityMap[city],
        })),
      },
    ];

    return treeData;
  } catch (error) {
    console.error('获取城市列表失败:', error);
    throw new Error('获取城市列表失败');
  }
}

// 获取站点的计费模板
export async function getBillingTemplateByStationService(stationId: number) {
  try {
    const template = await BillingTemplate.findOne({
      where: { station_id: stationId },
      include: [
        {
          model: Station,
          as: 'station',
          attributes: ['id', 'name', 'city'],
        },
      ],
    });

    if (!template) {
      // 返回空模板结构
      return {
        id: null,
        stationId: stationId,
        name: '',
        service: '',
        parking: '',
        remarks: '',
        date: [
          {
            date1: '',
            date2: '',
            electricity: '',
          },
        ],
      };
    }

    const timeSlots = (template as any).time_slots || [];

    return {
      id: (template as any).id,
      stationId: (template as any).station_id,
      name: (template as any).name || '',
      service: Number((template as any).service_fee || 0).toFixed(2),
      parking: Number((template as any).parking_fee || 0).toFixed(2),
      remarks: (template as any).remarks || '',
      date: timeSlots.length > 0 ? timeSlots : [
        {
          date1: '',
          date2: '',
          electricity: '',
        },
      ],
      stationName: (template as any).station?.name || '',
    };
  } catch (error) {
    console.error('获取计费模板失败:', error);
    throw new Error('获取计费模板失败');
  }
}

// 创建或更新计费模板
export async function saveBillingTemplateService(
  params: CreateBillingTemplateParams | UpdateBillingTemplateParams
) {
  const { station_id, name, service, parking, remarks, date } = params;

  // 验证充电站是否存在
  const station = await Station.findByPk(station_id);
  if (!station) {
    throw new Error('充电站不存在');
  }

  // 验证时间段数据
  if (!date || !Array.isArray(date) || date.length === 0) {
    throw new Error('至少需要配置一个时间段');
  }

  // 验证每个时间段
  for (const slot of date) {
    if (!slot.date1 || !slot.date2 || !slot.electricity) {
      throw new Error('时间段配置不完整，请填写开始时间、结束时间和电费');
    }
    // 验证时间格式
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    if (!timeRegex.test(slot.date1) || !timeRegex.test(slot.date2)) {
      throw new Error('时间格式不正确，应为 HH:mm:ss 格式');
    }
    // 验证电费为数字
    if (isNaN(Number(slot.electricity)) || Number(slot.electricity) < 0) {
      throw new Error('电费必须为非负数');
    }
  }

  // 验证服务费和停车费
  if (isNaN(Number(service)) || Number(service) < 0) {
    throw new Error('服务费必须为非负数');
  }
  if (isNaN(Number(parking)) || Number(parking) < 0) {
    throw new Error('停车费必须为非负数');
  }

  try {
    // 检查是否已存在模板
    const existing = await BillingTemplate.findOne({
      where: { station_id },
    });

    const templateData: any = {
      station_id,
      name: name.trim(),
      service_fee: Number(service),
      parking_fee: Number(parking),
      remarks: remarks || '',
      time_slots: date,
      updated_at: new Date(),
    };

    if (existing) {
      // 更新现有模板
      await (existing as any).update(templateData);
      return {
        id: (existing as any).id,
        message: '计费模板更新成功',
      };
    } else {
      // 创建新模板
      const template = await BillingTemplate.create({
        ...templateData,
        created_at: new Date(),
      });
      return {
        id: (template as any).id,
        message: '计费模板创建成功',
      };
    }
  } catch (error) {
    console.error('保存计费模板失败:', error);
    throw new Error('保存计费模板失败');
  }
}

// 删除计费模板
export async function deleteBillingTemplateService(stationId: number) {
  try {
    const template = await BillingTemplate.findOne({
      where: { station_id: stationId },
    });

    if (!template) {
      throw new Error('计费模板不存在');
    }

    await (template as any).destroy();

    return {
      message: '计费模板删除成功',
    };
  } catch (error) {
    console.error('删除计费模板失败:', error);
    throw new Error('删除计费模板失败');
  }
}

// 获取所有计费模板列表
export async function getBillingTemplateListService() {
  try {
    const templates = await BillingTemplate.findAll({
      include: [
        {
          model: Station,
          as: 'station',
          attributes: ['id', 'name', 'city'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    const list = templates.map((template: any) => ({
      id: template.id,
      stationId: template.station_id,
      stationName: template.station?.name || '',
      city: template.station?.city || '',
      name: template.name || '',
      serviceFee: Number(template.service_fee || 0).toFixed(2),
      parkingFee: Number(template.parking_fee || 0).toFixed(2),
      timeSlotCount: Array.isArray(template.time_slots)
        ? template.time_slots.length
        : 0,
      createdAt: template.created_at
        ? new Date(template.created_at).toLocaleString('zh-CN', {
            hour12: false,
          })
        : '',
    }));

    return { list };
  } catch (error) {
    console.error('获取计费模板列表失败:', error);
    throw new Error('获取计费模板列表失败');
  }
}

