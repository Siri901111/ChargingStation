// src/utils/initMockData.ts
import bcrypt from "bcryptjs";

// src/models/User.ts
import { DataTypes, Model } from "sequelize";

// src/config/db.ts
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();
var sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    port: Number(process.env.DB_PORT) || 3306,
    logging: false
  }
);
var db_default = sequelize;

// src/models/User.ts
var User = class extends Model {
};
User.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    account: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(256), allowNull: false },
    name: { type: DataTypes.STRING(32), allowNull: false },
    phone: { type: DataTypes.STRING(16) },
    id_no: { type: DataTypes.STRING(24) },
    position: { type: DataTypes.STRING(32) },
    department: { type: DataTypes.STRING(32) },
    status: { type: DataTypes.TINYINT, defaultValue: 1 },
    page_authority: { type: DataTypes.STRING(512) },
    btn_authority: { type: DataTypes.STRING(512) },
    role_id: { type: DataTypes.BIGINT },
    address: { type: DataTypes.STRING(200) },
    // 地址
    tags: { type: DataTypes.JSON },
    // 个人标签（数组）
    work_status: { type: DataTypes.TINYINT, defaultValue: 1 },
    // 在职状态：1工作中，2请假中，3出差中，4年假中
    avatar: { type: DataTypes.STRING(500) },
    // 头像URL
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  },
  {
    sequelize: db_default,
    modelName: "User",
    tableName: "user",
    timestamps: false
  }
);
var User_default = User;

// src/models/ChargingUser.ts
import { DataTypes as DataTypes2, Model as Model2 } from "sequelize";
var ChargingUser = class extends Model2 {
};
ChargingUser.init(
  {
    id: { type: DataTypes2.BIGINT, autoIncrement: true, primaryKey: true },
    phone: { type: DataTypes2.STRING(16), allowNull: false, unique: true },
    name: { type: DataTypes2.STRING(32) },
    id_no: { type: DataTypes2.STRING(24) },
    member_card_no: { type: DataTypes2.STRING(32) },
    // 会员卡号（业务层保证唯一性）
    card_type: { type: DataTypes2.STRING(20), defaultValue: "\u666E\u901A\u5361" },
    // 卡类型：普通卡、VIP卡、季卡
    balance: { type: DataTypes2.DECIMAL(10, 2), defaultValue: 0 },
    // 余额
    issue_date: { type: DataTypes2.DATE },
    // 开卡日期
    valid_until: { type: DataTypes2.DATE },
    // 有效期至
    status: { type: DataTypes2.TINYINT, defaultValue: 1 },
    // 1正常 0禁用
    created_at: { type: DataTypes2.DATE, defaultValue: DataTypes2.NOW }
  },
  {
    sequelize: db_default,
    modelName: "ChargingUser",
    tableName: "charging_user",
    timestamps: false
  }
);
var ChargingUser_default = ChargingUser;

// src/models/Station.ts
import { DataTypes as DataTypes3, Model as Model3 } from "sequelize";
var Station = class extends Model3 {
};
Station.init(
  {
    id: { type: DataTypes3.BIGINT, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes3.STRING(100), allowNull: false },
    city: { type: DataTypes3.STRING(30) },
    fast: { type: DataTypes3.INTEGER },
    slow: { type: DataTypes3.INTEGER },
    status: { type: DataTypes3.TINYINT, defaultValue: 1 },
    now: { type: DataTypes3.INTEGER },
    fault: { type: DataTypes3.INTEGER },
    person: { type: DataTypes3.STRING(50) },
    tel: { type: DataTypes3.STRING(16) },
    longitude: { type: DataTypes3.FLOAT },
    latitude: { type: DataTypes3.FLOAT }
  },
  {
    sequelize: db_default,
    modelName: "Station",
    tableName: "station",
    timestamps: false
  }
);
var Station_default = Station;

// src/models/Pile.ts
import { DataTypes as DataTypes4, Model as Model4 } from "sequelize";
var Pile = class extends Model4 {
};
Pile.init(
  {
    id: { type: DataTypes4.BIGINT, autoIncrement: true, primaryKey: true },
    station_id: { type: DataTypes4.BIGINT, allowNull: false },
    type: { type: DataTypes4.STRING(16) },
    status: { type: DataTypes4.TINYINT },
    percent: { type: DataTypes4.INTEGER },
    voltage: { type: DataTypes4.FLOAT },
    current: { type: DataTypes4.FLOAT },
    power: { type: DataTypes4.FLOAT },
    temperature: { type: DataTypes4.FLOAT },
    install_date: { type: DataTypes4.DATE }
  },
  {
    sequelize: db_default,
    modelName: "Pile",
    tableName: "pile",
    timestamps: false
  }
);
var Pile_default = Pile;

// src/models/Order.ts
import { DataTypes as DataTypes5, Model as Model5 } from "sequelize";
var Order = class extends Model5 {
};
Order.init(
  {
    order_no: { type: DataTypes5.STRING(64), primaryKey: true },
    user_id: { type: DataTypes5.BIGINT, allowNull: false },
    equipment_no: { type: DataTypes5.STRING(64) },
    station_id: { type: DataTypes5.BIGINT },
    date: { type: DataTypes5.DATE },
    start_time: { type: DataTypes5.DATE },
    end_time: { type: DataTypes5.DATE },
    money: { type: DataTypes5.DECIMAL(10, 2) },
    pay: { type: DataTypes5.STRING(20) },
    status: { type: DataTypes5.TINYINT }
  },
  {
    sequelize: db_default,
    modelName: "Order",
    tableName: "order",
    timestamps: false
  }
);
var Order_default = Order;

// src/models/Revenue.ts
import { DataTypes as DataTypes6, Model as Model6 } from "sequelize";
var Revenue = class extends Model6 {
};
Revenue.init(
  {
    id: { type: DataTypes6.BIGINT, autoIncrement: true, primaryKey: true },
    station_id: { type: DataTypes6.BIGINT, allowNull: false },
    day_date: { type: DataTypes6.DATE },
    day: { type: DataTypes6.DECIMAL(10, 2) },
    month: { type: DataTypes6.DECIMAL(10, 2) },
    electricity: { type: DataTypes6.DECIMAL(10, 2) },
    parking_fee: { type: DataTypes6.DECIMAL(10, 2) },
    service_fee: { type: DataTypes6.DECIMAL(10, 2) },
    member: { type: DataTypes6.DECIMAL(10, 2) },
    mpercent: { type: DataTypes6.DECIMAL(5, 2) },
    percent: { type: DataTypes6.DECIMAL(5, 2) }
  },
  {
    sequelize: db_default,
    modelName: "Revenue",
    tableName: "revenue",
    timestamps: false
  }
);
var Revenue_default = Revenue;

// src/models/Alarm.ts
import { DataTypes as DataTypes7, Model as Model7 } from "sequelize";
var Alarm = class extends Model7 {
};
Alarm.init(
  {
    id: { type: DataTypes7.BIGINT, autoIncrement: true, primaryKey: true },
    station_id: { type: DataTypes7.BIGINT },
    pile_id: { type: DataTypes7.BIGINT },
    title: { type: DataTypes7.STRING(120) },
    detail: { type: DataTypes7.STRING(255) },
    fault_time: { type: DataTypes7.DATE },
    level: { type: DataTypes7.TINYINT },
    status: { type: DataTypes7.TINYINT, defaultValue: 1 },
    // 处理状态：1待指派，2处理中，3已处理，4处理异常
    handler: { type: DataTypes7.STRING(50), allowNull: true },
    // 处理人员
    handle_time: { type: DataTypes7.DATE, allowNull: true },
    // 处理时间
    handle_note: { type: DataTypes7.TEXT, allowNull: true },
    // 处理备注
    urge_count: { type: DataTypes7.INTEGER, defaultValue: 0 },
    // 催办次数
    last_urge_time: { type: DataTypes7.DATE, allowNull: true }
    // 最后催办时间
  },
  {
    sequelize: db_default,
    modelName: "Alarm",
    tableName: "alarm",
    timestamps: false
  }
);
var Alarm_default = Alarm;

// src/models/Notice.ts
import { DataTypes as DataTypes8, Model as Model8 } from "sequelize";
var Notice = class extends Model8 {
};
Notice.init(
  {
    id: { type: DataTypes8.BIGINT, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes8.STRING(128), allowNull: false },
    content: { type: DataTypes8.TEXT },
    publish_time: { type: DataTypes8.DATE },
    type: { type: DataTypes8.STRING(32) },
    status: { type: DataTypes8.TINYINT, defaultValue: 0 }
  },
  {
    sequelize: db_default,
    modelName: "Notice",
    tableName: "notice",
    timestamps: false
  }
);
var Notice_default = Notice;

// src/models/PileMaintenance.ts
import { DataTypes as DataTypes9, Model as Model9 } from "sequelize";
var PileMaintenance = class extends Model9 {
};
PileMaintenance.init(
  {
    id: { type: DataTypes9.BIGINT, autoIncrement: true, primaryKey: true },
    pile_id: { type: DataTypes9.BIGINT, allowNull: false },
    // 充电桩ID
    maintenance_type: { type: DataTypes9.STRING(50) },
    // 维保类型：日常维护、故障维修、定期检查
    maintenance_person: { type: DataTypes9.STRING(50) },
    // 维保人员
    maintenance_time: { type: DataTypes9.DATE },
    // 维保时间
    maintenance_content: { type: DataTypes9.TEXT },
    // 维保内容
    maintenance_cost: { type: DataTypes9.DECIMAL(10, 2) },
    // 维保费用
    next_maintenance_time: { type: DataTypes9.DATE },
    // 下次维保时间
    status: { type: DataTypes9.TINYINT, defaultValue: 1 },
    // 状态：1已完成，2进行中，3已计划
    created_at: { type: DataTypes9.DATE, defaultValue: DataTypes9.NOW }
  },
  {
    sequelize: db_default,
    modelName: "PileMaintenance",
    tableName: "pile_maintenance",
    timestamps: false
  }
);
var PileMaintenance_default = PileMaintenance;

// src/models/BillingTemplate.ts
import { DataTypes as DataTypes10, Model as Model10 } from "sequelize";
var BillingTemplate = class extends Model10 {
};
BillingTemplate.init(
  {
    id: { type: DataTypes10.BIGINT, autoIncrement: true, primaryKey: true },
    station_id: { type: DataTypes10.BIGINT, allowNull: false },
    // 关联充电站
    name: { type: DataTypes10.STRING(100), allowNull: false },
    // 模板名称
    service_fee: { type: DataTypes10.DECIMAL(10, 2), allowNull: false },
    // 服务费
    parking_fee: { type: DataTypes10.DECIMAL(10, 2), allowNull: false },
    // 停车费
    remarks: { type: DataTypes10.TEXT },
    // 备注
    time_slots: { type: DataTypes10.JSON },
    // 时间段配置：[{date1: "08:00:00", date2: "18:00:00", electricity: "1.5"}]
    created_at: { type: DataTypes10.DATE, defaultValue: DataTypes10.NOW },
    updated_at: { type: DataTypes10.DATE, defaultValue: DataTypes10.NOW }
  },
  {
    sequelize: db_default,
    modelName: "BillingTemplate",
    tableName: "billing_template",
    timestamps: false
  }
);
var BillingTemplate_default = BillingTemplate;

// src/models/Document.ts
import { DataTypes as DataTypes11, Model as Model11 } from "sequelize";
var Document = class extends Model11 {
};
Document.init(
  {
    id: { type: DataTypes11.BIGINT, autoIncrement: true, primaryKey: true },
    type: { type: DataTypes11.STRING(50), allowNull: false },
    // 文章类型：招商类、广告类、公告类等
    important: { type: DataTypes11.STRING(20), allowNull: false },
    // 重要程度：一级、二级、三级、四级
    publish: { type: DataTypes11.STRING(50), allowNull: false },
    // 发布渠道：站内信、公众号、小程序等
    content: { type: DataTypes11.TEXT, allowNull: false },
    // 富文本内容
    title: { type: DataTypes11.STRING(200) },
    // 文章标题（可选）
    author_id: { type: DataTypes11.BIGINT },
    // 作者ID（关联后台用户）
    status: { type: DataTypes11.TINYINT, defaultValue: 1 },
    // 状态：1草稿，2已发布，3已删除
    created_at: { type: DataTypes11.DATE, defaultValue: DataTypes11.NOW },
    updated_at: { type: DataTypes11.DATE, defaultValue: DataTypes11.NOW }
  },
  {
    sequelize: db_default,
    modelName: "Document",
    tableName: "document",
    timestamps: false
  }
);
var Document_default = Document;

// src/utils/initMockData.ts
async function initMockData() {
  try {
    console.log("\u{1F4E6} \u5F00\u59CB\u521D\u59CB\u5316Mock\u6570\u636E...");
    await initUsers();
    const chargingUsers = await initChargingUsers();
    const stations = await initStations();
    await initPiles(stations);
    await initOrders(stations, chargingUsers);
    await initRevenue(stations);
    await initAlarms(stations);
    await initNotices();
    await initPileMaintenance();
    await initBillingTemplates(stations);
    await initDocuments();
    console.log("\u2705 Mock\u6570\u636E\u521D\u59CB\u5316\u5B8C\u6210\uFF01");
  } catch (error) {
    console.error("\u274C Mock\u6570\u636E\u521D\u59CB\u5316\u5931\u8D25:", error);
  }
}
async function initUsers() {
  const tagOptions = [
    ["\u8BA4\u771F", "\u5DE5\u4F5C\u72C2", "\u4E0E\u4EBA\u548C\u5584", "\u4EE3\u7801\u6D01\u7656"],
    ["\u8D1F\u8D23", "\u9AD8\u6548", "\u56E2\u961F\u5408\u4F5C", "\u5B66\u4E60\u80FD\u529B\u5F3A"],
    ["\u7EC6\u5FC3", "\u4E13\u4E1A", "\u6C9F\u901A\u80FD\u529B\u5F3A", "\u6267\u884C\u529B\u5F3A"],
    ["\u521B\u65B0", "\u79EF\u6781", "\u4E50\u89C2", "\u6297\u538B\u80FD\u529B\u5F3A"],
    ["\u4E25\u8C28", "\u4E13\u6CE8", "\u6709\u8D23\u4EFB\u5FC3", "\u6280\u672F\u8FC7\u786C"]
  ];
  const addresses = [
    "\u5317\u4EAC\u5E02\u671D\u9633\u533A\u5EFA\u56FD\u8DEF88\u53F7",
    "\u5317\u4EAC\u5E02\u6D77\u6DC0\u533A\u4E2D\u5173\u6751\u5927\u88571\u53F7",
    "\u5317\u4EAC\u5E02\u897F\u57CE\u533A\u897F\u5355\u5317\u5927\u8857176\u53F7",
    "\u4E0A\u6D77\u5E02\u6D66\u4E1C\u65B0\u533A\u9646\u5BB6\u5634\u73AF\u8DEF1000\u53F7",
    "\u4E0A\u6D77\u5E02\u9EC4\u6D66\u533A\u5357\u4EAC\u4E1C\u8DEF100\u53F7",
    "\u5E7F\u5DDE\u5E02\u5929\u6CB3\u533A\u5929\u6CB3\u8DEF123\u53F7",
    "\u6DF1\u5733\u5E02\u5357\u5C71\u533A\u79D1\u6280\u56ED\u5357\u8DEF2\u53F7",
    "\u676D\u5DDE\u5E02\u897F\u6E56\u533A\u6587\u4E09\u8DEF259\u53F7"
  ];
  const users = [
    {
      account: "admin",
      password: await bcrypt.hash("admin123", 10),
      name: "\u7CFB\u7EDF\u7BA1\u7406\u5458",
      phone: "13800138000",
      id_no: "110101199001011234",
      position: "\u7CFB\u7EDF\u7BA1\u7406\u5458",
      department: "\u603B\u88C1\u529E",
      status: 1,
      page_authority: "admin",
      btn_authority: "all,add,edit,delete",
      role_id: 1,
      address: addresses[0],
      tags: tagOptions[0],
      work_status: 1,
      avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=admin"
    },
    {
      account: "manager1",
      password: await bcrypt.hash("123456", 10),
      name: "\u5F20\u8FD0\u8425",
      phone: "13800138001",
      id_no: "110101199002021234",
      position: "\u8FD0\u8425\u7ECF\u7406",
      department: "\u8FD0\u8425\u90E8",
      status: 1,
      page_authority: "manager",
      btn_authority: "add,edit",
      role_id: 2,
      address: addresses[1],
      tags: tagOptions[1],
      work_status: 1,
      avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=manager1"
    },
    {
      account: "manager2",
      password: await bcrypt.hash("123456", 10),
      name: "\u674E\u8FD0\u8425",
      phone: "13800138002",
      id_no: "110101199003031234",
      position: "\u8FD0\u8425\u4E13\u5458",
      department: "\u8FD0\u8425\u90E8",
      status: 1,
      page_authority: "manager",
      btn_authority: "add,edit",
      role_id: 2,
      address: addresses[2],
      tags: tagOptions[2],
      work_status: 2,
      // 请假中
      avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=manager2"
    },
    {
      account: "user1",
      password: await bcrypt.hash("123456", 10),
      name: "\u738B\u7528\u6237",
      phone: "13800138003",
      id_no: "110101199004041234",
      position: "\u666E\u901A\u7528\u6237",
      department: "\u5BA2\u670D\u90E8",
      status: 1,
      page_authority: "user",
      btn_authority: "add",
      role_id: 3,
      address: addresses[3],
      tags: tagOptions[3],
      work_status: 1,
      avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=user1"
    },
    {
      account: "user2",
      password: await bcrypt.hash("123456", 10),
      name: "\u8D75\u7528\u6237",
      phone: "13800138004",
      id_no: "110101199005051234",
      position: "\u666E\u901A\u7528\u6237",
      department: "\u5BA2\u670D\u90E8",
      status: 1,
      page_authority: "user",
      btn_authority: "add",
      role_id: 3,
      address: addresses[4],
      tags: tagOptions[4],
      work_status: 3,
      // 出差中
      avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=user2"
    }
  ];
  for (const userData of users) {
    const existing = await User_default.findOne({ where: { account: userData.account } });
    if (!existing) {
      await User_default.create(userData);
    }
  }
  console.log("\u2705 \u7528\u6237\u6570\u636E\u521D\u59CB\u5316\u5B8C\u6210");
}
async function initChargingUsers() {
  const cardTypes = ["\u666E\u901A\u5361", "VIP\u5361", "\u5B63\u5361"];
  const names = ["\u5F20\u4E09", "\u674E\u56DB", "\u738B\u4E94", "\u8D75\u516D", "\u94B1\u4E03", "\u5B59\u516B", "\u5468\u4E5D", "\u5434\u5341"];
  const phones = [
    "13800138001",
    "13800138002",
    "13800138003",
    "13800138004",
    "13800138005",
    "13800138006",
    "13800138007",
    "13800138008",
    "13900139001",
    "13900139002",
    "13900139003",
    "13900139004",
    "15000150001",
    "15000150002",
    "15000150003",
    "15000150004",
    "15100151001",
    "15100151002",
    "15100151003",
    "15100151004"
  ];
  const chargingUsers = [];
  for (let i = 0; i < 30; i++) {
    const phone = phones[i % phones.length];
    const name = names[i % names.length];
    const cardType = cardTypes[Math.floor(Math.random() * cardTypes.length)];
    const memberCardNo = `MC${String(i + 1).padStart(6, "0")}`;
    const issueDate = /* @__PURE__ */ new Date();
    issueDate.setMonth(issueDate.getMonth() - Math.floor(Math.random() * 12) - 1);
    let validUntil = null;
    if (cardType === "\u5B63\u5361") {
      validUntil = new Date(issueDate);
      validUntil.setMonth(validUntil.getMonth() + 3);
    } else if (cardType === "VIP\u5361") {
      validUntil = new Date(issueDate);
      validUntil.setFullYear(validUntil.getFullYear() + 1);
    } else {
      validUntil = new Date(issueDate);
      validUntil.setFullYear(validUntil.getFullYear() + 2);
    }
    let balance = 0;
    if (cardType === "VIP\u5361") {
      balance = Math.floor(Math.random() * 5e3) + 2e3;
    } else if (cardType === "\u5B63\u5361") {
      balance = Math.floor(Math.random() * 3e3) + 1e3;
    } else {
      balance = Math.floor(Math.random() * 2e3) + 500;
    }
    const idNo = `110101199${String(Math.floor(Math.random() * 1e6)).padStart(6, "0")}${String(Math.floor(Math.random() * 100)).padStart(2, "0")}`;
    try {
      const existing = await ChargingUser_default.findOne({ where: { phone } });
      if (!existing) {
        const user = await ChargingUser_default.create({
          phone,
          name: `${name}${i > 7 ? i : ""}`,
          id_no: idNo,
          member_card_no: memberCardNo,
          card_type: cardType,
          balance,
          issue_date: issueDate,
          valid_until: validUntil,
          status: Math.random() > 0.1 ? 1 : 0,
          // 90%正常，10%禁用
          created_at: issueDate
        });
        chargingUsers.push(user);
      } else {
        chargingUsers.push(existing);
      }
    } catch (error) {
      console.error(`\u521B\u5EFA\u5145\u7535\u7528\u6237\u5931\u8D25 (${phone}):`, error);
    }
  }
  console.log("\u2705 \u5145\u7535\u7528\u6237\u6570\u636E\u521D\u59CB\u5316\u5B8C\u6210");
  return chargingUsers;
}
async function initStations() {
  const stationsData = [
    {
      name: "\u5317\u4EAC\u671D\u9633\u5145\u7535\u7AD9",
      city: "\u5317\u4EAC\u5E02",
      fast: 12,
      slow: 8,
      status: 2,
      // 使用中
      now: 8,
      fault: 1,
      person: "\u5F20\u7AD9\u957F",
      tel: "13800138010",
      longitude: 116.4074,
      latitude: 39.9042
    },
    {
      name: "\u4E0A\u6D77\u6D66\u4E1C\u5145\u7535\u7AD9",
      city: "\u4E0A\u6D77\u5E02",
      fast: 15,
      slow: 10,
      status: 2,
      now: 12,
      fault: 0,
      person: "\u674E\u7AD9\u957F",
      tel: "13800138011",
      longitude: 121.4737,
      latitude: 31.2304
    },
    {
      name: "\u5E7F\u5DDE\u5929\u6CB3\u5145\u7535\u7AD9",
      city: "\u5E7F\u5DDE\u5E02",
      fast: 10,
      slow: 6,
      status: 3,
      // 空闲中
      now: 2,
      fault: 0,
      person: "\u738B\u7AD9\u957F",
      tel: "13800138012",
      longitude: 113.2644,
      latitude: 23.1291
    },
    {
      name: "\u6DF1\u5733\u5357\u5C71\u5145\u7535\u7AD9",
      city: "\u6DF1\u5733\u5E02",
      fast: 20,
      slow: 15,
      status: 2,
      now: 18,
      fault: 2,
      person: "\u8D75\u7AD9\u957F",
      tel: "13800138013",
      longitude: 113.9308,
      latitude: 22.533
    },
    {
      name: "\u676D\u5DDE\u897F\u6E56\u5145\u7535\u7AD9",
      city: "\u676D\u5DDE\u5E02",
      fast: 8,
      slow: 5,
      status: 4,
      // 维护中
      now: 0,
      fault: 1,
      person: "\u5B59\u7AD9\u957F",
      tel: "13800138014",
      longitude: 120.1551,
      latitude: 30.2741
    },
    {
      name: "\u6210\u90FD\u9526\u6C5F\u5145\u7535\u7AD9",
      city: "\u6210\u90FD\u5E02",
      fast: 12,
      slow: 8,
      status: 2,
      now: 9,
      fault: 0,
      person: "\u5468\u7AD9\u957F",
      tel: "13800138015",
      longitude: 104.0668,
      latitude: 30.5728
    }
  ];
  const stations = [];
  for (const stationData of stationsData) {
    const existing = await Station_default.findOne({ where: { name: stationData.name } });
    if (!existing) {
      const station = await Station_default.create(stationData);
      stations.push(station);
    } else {
      stations.push(existing);
    }
  }
  console.log("\u2705 \u5145\u7535\u7AD9\u6570\u636E\u521D\u59CB\u5316\u5B8C\u6210");
  return stations;
}
async function initPiles(stations) {
  const pileStatuses = [1, 2, 2, 3, 1, 2, 6, 1, 2, 2];
  for (const station of stations) {
    const totalPiles = station.fast + station.slow;
    for (let i = 1; i <= totalPiles; i++) {
      const isFast = i <= station.fast;
      const status = pileStatuses[i % pileStatuses.length];
      await Pile_default.create({
        station_id: station.id,
        type: isFast ? "\u5FEB\u5145" : "\u6162\u5145",
        status,
        percent: status === 2 ? Math.floor(Math.random() * 80) + 10 : 0,
        voltage: status === 2 || status === 3 ? 380 + Math.random() * 20 : 0,
        current: status === 2 || status === 3 ? 50 + Math.random() * 30 : 0,
        power: status === 2 || status === 3 ? 30 + Math.random() * 20 : 0,
        temperature: 25 + Math.random() * 15,
        install_date: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
      });
    }
  }
  console.log("\u2705 \u5145\u7535\u6869\u6570\u636E\u521D\u59CB\u5316\u5B8C\u6210");
}
async function initOrders(stations, chargingUsers) {
  const payMethods = ["\u5FAE\u4FE1\u652F\u4ED8", "\u652F\u4ED8\u5B9D", "\u94F6\u884C\u5361", "\u4F1A\u5458\u5361"];
  const statuses = [2, 3, 3, 3, 4];
  if (!chargingUsers || chargingUsers.length === 0) {
    chargingUsers = await ChargingUser_default.findAll();
  }
  if (chargingUsers.length === 0) {
    console.log("\u26A0\uFE0F  \u6CA1\u6709\u5145\u7535\u7528\u6237\uFF0C\u8DF3\u8FC7\u8BA2\u5355\u6570\u636E\u521D\u59CB\u5316");
    return;
  }
  const piles = await Pile_default.findAll();
  for (let i = 0; i < 200; i++) {
    const station = stations[Math.floor(Math.random() * stations.length)];
    const user = chargingUsers[Math.floor(Math.random() * chargingUsers.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const startTime = /* @__PURE__ */ new Date();
    startTime.setDate(startTime.getDate() - Math.floor(Math.random() * 90));
    startTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + Math.floor(Math.random() * 3) + 1);
    endTime.setMinutes(Math.floor(Math.random() * 60));
    const hours = (endTime.getTime() - startTime.getTime()) / (1e3 * 60 * 60);
    const money = (hours * 30 + Math.random() * 20).toFixed(2);
    const stationPiles = piles.filter((pile) => pile.station_id === station.id);
    const equipmentNo = stationPiles.length > 0 ? String(stationPiles[Math.floor(Math.random() * stationPiles.length)].id) : `PILE${station.id}-${Math.floor(Math.random() * 20) + 1}`;
    await Order_default.create({
      order_no: `ORD${Date.now()}${i}${Math.floor(Math.random() * 1e4)}`,
      user_id: user.id,
      equipment_no: equipmentNo,
      station_id: station.id,
      date: startTime,
      start_time: startTime,
      end_time: status === 2 ? null : endTime,
      money: parseFloat(money),
      pay: payMethods[Math.floor(Math.random() * payMethods.length)],
      status
    });
  }
  console.log("\u2705 \u8BA2\u5355\u6570\u636E\u521D\u59CB\u5316\u5B8C\u6210");
}
async function initRevenue(stations) {
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  for (const station of stations) {
    const dayRevenue = {
      station_id: station.id,
      day_date: today,
      day: 5e3 + Math.random() * 1e4,
      month: 15e4 + Math.random() * 5e4,
      electricity: 2e3 + Math.random() * 3e3,
      parking_fee: 500 + Math.random() * 1e3,
      service_fee: 1e3 + Math.random() * 2e3,
      member: 1500 + Math.random() * 2e3,
      percent: (Math.random() * 40 - 20).toFixed(2),
      // -20% 到 +20%
      mpercent: (Math.random() * 30 - 15).toFixed(2)
    };
    await Revenue_default.create(dayRevenue);
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const dayMultiplier = isWeekend ? 0.7 : 1;
      await Revenue_default.create({
        station_id: station.id,
        day_date: date,
        day: (3e3 + Math.random() * 8e3) * dayMultiplier,
        month: 14e4 + Math.random() * 6e4,
        electricity: (1500 + Math.random() * 4e3) * dayMultiplier,
        parking_fee: (300 + Math.random() * 1200) * dayMultiplier,
        service_fee: (800 + Math.random() * 2500) * dayMultiplier,
        member: (1e3 + Math.random() * 3e3) * dayMultiplier,
        percent: (Math.random() * 40 - 20).toFixed(2),
        mpercent: (Math.random() * 30 - 15).toFixed(2)
      });
    }
  }
  console.log("\u2705 \u8425\u6536\u6570\u636E\u521D\u59CB\u5316\u5B8C\u6210");
}
async function initAlarms(stations) {
  const alarmTitles = [
    "\u5145\u7535\u6869\u901A\u8BAF\u4E2D\u65AD",
    "\u5145\u7535\u6869\u8FC7\u8F7D\u4FDD\u62A4",
    "\u5145\u7535\u6869\u6E29\u5EA6\u5F02\u5E38",
    "\u5145\u7535\u6869\u7535\u538B\u5F02\u5E38",
    "\u5145\u7535\u6869\u7535\u6D41\u5F02\u5E38",
    "\u5145\u7535\u7AD9\u7F51\u7EDC\u4E2D\u65AD",
    "\u5145\u7535\u7AD9\u8BBE\u5907\u6545\u969C",
    "\u5145\u7535\u6869\u63A5\u5730\u6545\u969C",
    "\u5145\u7535\u6869\u7EDD\u7F18\u6545\u969C",
    "\u5145\u7535\u6869\u6025\u505C\u6309\u94AE\u89E6\u53D1",
    "\u5145\u7535\u6869\u95E8\u9501\u5F02\u5E38",
    "\u5145\u7535\u6869\u663E\u793A\u5C4F\u6545\u969C"
  ];
  const levels = [1, 2, 3, 4];
  const piles = await Pile_default.findAll();
  for (let i = 0; i < 50; i++) {
    const station = stations[Math.floor(Math.random() * stations.length)];
    const title = alarmTitles[Math.floor(Math.random() * alarmTitles.length)];
    const level = levels[Math.floor(Math.random() * levels.length)];
    const shouldHavePile = Math.random() > 0.3;
    let pileId = null;
    if (shouldHavePile && piles.length > 0) {
      const stationPiles = piles.filter((pile) => pile.station_id === station.id);
      if (stationPiles.length > 0) {
        const randomPile = stationPiles[Math.floor(Math.random() * stationPiles.length)];
        pileId = randomPile.id;
      }
    }
    const faultTime = /* @__PURE__ */ new Date();
    faultTime.setDate(faultTime.getDate() - Math.floor(Math.random() * 60));
    faultTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
    let initialStatus = 1;
    let urgeCount = 0;
    if (level === 2) {
      initialStatus = 2;
      urgeCount = Math.floor(Math.random() * 2);
    }
    if (level === 4) {
      initialStatus = Math.random() > 0.5 ? 3 : 1;
    }
    if (level === 1) {
      initialStatus = Math.random() > 0.3 ? 2 : 1;
      urgeCount = Math.floor(Math.random() * 3);
    }
    const handlers = ["\u5F20\u5DE5\u7A0B\u5E08", "\u674E\u7EF4\u4FEE\u5458", "\u738B\u6280\u672F\u5458", "\u8D75\u6280\u5E08", "\u94B1\u7EF4\u4FEE", "\u5B59\u6280\u672F"];
    const handleNotes = [
      "\u95EE\u9898\u5DF2\u89E3\u51B3\uFF0C\u8BBE\u5907\u6062\u590D\u6B63\u5E38",
      "\u6B63\u5728\u73B0\u573A\u5904\u7406\u4E2D",
      "\u5DF2\u66F4\u6362\u6545\u969C\u90E8\u4EF6\uFF0C\u6D4B\u8BD5\u6B63\u5E38",
      "\u8BBE\u5907\u91CD\u542F\u540E\u6062\u590D\u6B63\u5E38",
      "\u5DF2\u8054\u7CFB\u5382\u5BB6\u6280\u672F\u652F\u6301",
      "\u7B49\u5F85\u5907\u4EF6\u5230\u8D27"
    ];
    await Alarm_default.create({
      station_id: station.id,
      pile_id: pileId,
      title,
      detail: `${station.name}\u7684${title}\uFF0C\u8BF7\u53CA\u65F6\u5904\u7406\u3002\u6545\u969C\u8BE6\u60C5\uFF1A${["\u8BBE\u5907\u8FD0\u884C\u5F02\u5E38", "\u901A\u8BAF\u6A21\u5757\u6545\u969C", "\u7535\u6E90\u6A21\u5757\u5F02\u5E38", "\u63A7\u5236\u677F\u6545\u969C", "\u4F20\u611F\u5668\u6545\u969C"][Math.floor(Math.random() * 5)]}`,
      fault_time: faultTime,
      level,
      status: initialStatus,
      handler: initialStatus > 1 ? handlers[Math.floor(Math.random() * handlers.length)] : null,
      handle_time: initialStatus > 1 ? new Date(faultTime.getTime() + Math.random() * 24 * 60 * 60 * 1e3) : null,
      handle_note: initialStatus === 3 ? handleNotes[Math.floor(Math.random() * handleNotes.length)] : initialStatus === 2 ? "\u6B63\u5728\u73B0\u573A\u5904\u7406\u4E2D" : null,
      urge_count: urgeCount,
      last_urge_time: urgeCount > 0 ? new Date(faultTime.getTime() + Math.random() * 12 * 60 * 60 * 1e3) : null
    });
  }
  console.log("\u2705 \u62A5\u8B66\u6570\u636E\u521D\u59CB\u5316\u5B8C\u6210");
}
async function initNotices() {
  const notices = [
    {
      title: "\u7CFB\u7EDF\u7EF4\u62A4\u901A\u77E5",
      content: "\u7CFB\u7EDF\u5C06\u4E8E2024\u5E7412\u67081\u65E5 00:00-06:00 \u8FDB\u884C\u7EF4\u62A4\u5347\u7EA7\uFF0C\u671F\u95F4\u53EF\u80FD\u65E0\u6CD5\u6B63\u5E38\u4F7F\u7528\uFF0C\u8BF7\u63D0\u524D\u505A\u597D\u51C6\u5907\u3002",
      publish_time: new Date(2024, 10, 25),
      type: "\u7CFB\u7EDF\u901A\u77E5",
      status: 1
    },
    {
      title: "\u5145\u7535\u7AD9\u4F18\u60E0\u6D3B\u52A8",
      content: "\u5373\u65E5\u8D77\u81F312\u670831\u65E5\uFF0C\u6240\u6709\u5145\u7535\u7AD9\u4EAB\u53D78\u6298\u4F18\u60E0\uFF0C\u6B22\u8FCE\u4F7F\u7528\uFF01",
      publish_time: new Date(2024, 11, 1),
      type: "\u6D3B\u52A8\u901A\u77E5",
      status: 1
    },
    {
      title: "\u65B0\u7AD9\u70B9\u4E0A\u7EBF\u901A\u77E5",
      content: "\u5317\u4EAC\u671D\u9633\u5145\u7535\u7AD9\u3001\u4E0A\u6D77\u6D66\u4E1C\u5145\u7535\u7AD9\u5DF2\u6B63\u5F0F\u4E0A\u7EBF\u8FD0\u8425\uFF0C\u6B22\u8FCE\u4F7F\u7528\uFF01",
      publish_time: new Date(2024, 10, 15),
      type: "\u8FD0\u8425\u901A\u77E5",
      status: 1
    },
    {
      title: "\u6625\u8282\u671F\u95F4\u670D\u52A1\u65F6\u95F4\u8C03\u6574",
      content: "\u6625\u8282\u671F\u95F4\uFF082\u670810\u65E5-2\u670817\u65E5\uFF09\u6240\u6709\u5145\u7535\u7AD9\u6B63\u5E38\u8FD0\u8425\uFF0C24\u5C0F\u65F6\u670D\u52A1\uFF0C\u795D\u5927\u5BB6\u6625\u8282\u5FEB\u4E50\uFF01",
      publish_time: new Date(2024, 1, 5),
      type: "\u8FD0\u8425\u901A\u77E5",
      status: 1
    },
    {
      title: "\u4F1A\u5458\u5361\u5145\u503C\u4F18\u60E0",
      content: "\u5373\u65E5\u8D77\u5145\u503C\u4F1A\u5458\u5361\u6EE1500\u5143\u900150\u5143\uFF0C\u6EE11000\u5143\u9001120\u5143\uFF0C\u591A\u5145\u591A\u9001\uFF01",
      publish_time: new Date(2024, 11, 5),
      type: "\u6D3B\u52A8\u901A\u77E5",
      status: 1
    },
    {
      title: "\u5145\u7535\u7AD9APP\u66F4\u65B0",
      content: "\u5145\u7535\u7AD9\u7BA1\u7406APP\u5DF2\u66F4\u65B0\u81F3v2.0\u7248\u672C\uFF0C\u65B0\u589E\u5B9E\u65F6\u76D1\u63A7\u3001\u6545\u969C\u9884\u8B66\u7B49\u529F\u80FD\uFF0C\u8BF7\u53CA\u65F6\u66F4\u65B0\u3002",
      publish_time: new Date(2024, 10, 20),
      type: "\u7CFB\u7EDF\u901A\u77E5",
      status: 1
    },
    {
      title: "\u65B0\u589E\u5FEB\u5145\u6869\u901A\u77E5",
      content: "\u6DF1\u5733\u5357\u5C71\u5145\u7535\u7AD9\u65B0\u589E10\u4E2A\u5FEB\u5145\u6869\uFF0C\u5145\u7535\u529F\u7387\u63D0\u5347\u81F3120KW\uFF0C\u6B22\u8FCE\u4F53\u9A8C\uFF01",
      publish_time: new Date(2024, 10, 10),
      type: "\u8FD0\u8425\u901A\u77E5",
      status: 1
    }
  ];
  for (const noticeData of notices) {
    const existing = await Notice_default.findOne({ where: { title: noticeData.title } });
    if (!existing) {
      await Notice_default.create(noticeData);
    }
  }
  console.log("\u2705 \u516C\u544A\u6570\u636E\u521D\u59CB\u5316\u5B8C\u6210");
}
async function initPileMaintenance() {
  const piles = await Pile_default.findAll();
  if (piles.length === 0) {
    console.log("\u26A0\uFE0F  \u6CA1\u6709\u5145\u7535\u6869\uFF0C\u8DF3\u8FC7\u7EF4\u4FDD\u8BB0\u5F55\u6570\u636E\u521D\u59CB\u5316");
    return;
  }
  const maintenanceTypes = ["\u65E5\u5E38\u7EF4\u62A4", "\u6545\u969C\u7EF4\u4FEE", "\u5B9A\u671F\u68C0\u67E5", "\u9884\u9632\u6027\u7EF4\u62A4", "\u5347\u7EA7\u6539\u9020"];
  const maintenancePersons = ["\u5F20\u5DE5\u7A0B\u5E08", "\u674E\u7EF4\u4FEE\u5458", "\u738B\u6280\u672F\u5458", "\u8D75\u6280\u5E08", "\u94B1\u7EF4\u4FEE", "\u5B59\u6280\u672F"];
  const maintenanceContents = [
    "\u6E05\u6D01\u5145\u7535\u6869\u5916\u58F3\uFF0C\u68C0\u67E5\u8FDE\u63A5\u7EBF\u8DEF",
    "\u66F4\u6362\u6545\u969C\u6A21\u5757\uFF0C\u6D4B\u8BD5\u5145\u7535\u529F\u80FD",
    "\u68C0\u67E5\u5145\u7535\u67AA\u63A5\u53E3\uFF0C\u6E05\u6D01\u63A5\u89E6\u70B9",
    "\u66F4\u65B0\u7CFB\u7EDF\u8F6F\u4EF6\uFF0C\u4F18\u5316\u5145\u7535\u6548\u7387",
    "\u68C0\u67E5\u5B89\u5168\u4FDD\u62A4\u88C5\u7F6E\uFF0C\u786E\u4FDD\u6B63\u5E38\u8FD0\u884C",
    "\u66F4\u6362\u8001\u5316\u7EBF\u7F06\uFF0C\u63D0\u5347\u5B89\u5168\u6027",
    "\u68C0\u67E5\u663E\u793A\u5C4F\u548C\u6309\u952E\u529F\u80FD",
    "\u6821\u51C6\u7535\u538B\u7535\u6D41\u4F20\u611F\u5668"
  ];
  for (const pile of piles) {
    const recordCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < recordCount; i++) {
      const maintenanceTime = /* @__PURE__ */ new Date();
      maintenanceTime.setDate(maintenanceTime.getDate() - Math.floor(Math.random() * 180));
      maintenanceTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
      const maintenanceType = maintenanceTypes[Math.floor(Math.random() * maintenanceTypes.length)];
      const maintenancePerson = maintenancePersons[Math.floor(Math.random() * maintenancePersons.length)];
      const maintenanceContent = maintenanceContents[Math.floor(Math.random() * maintenanceContents.length)];
      const maintenanceCost = Math.floor(Math.random() * 2e3) + 200;
      let nextMaintenanceTime = null;
      if (maintenanceType === "\u5B9A\u671F\u68C0\u67E5" || maintenanceType === "\u9884\u9632\u6027\u7EF4\u62A4") {
        nextMaintenanceTime = new Date(maintenanceTime);
        nextMaintenanceTime.setMonth(nextMaintenanceTime.getMonth() + 3);
      }
      const status = Math.random() > 0.2 ? 1 : 2;
      await PileMaintenance_default.create({
        pile_id: pile.id,
        maintenance_type: maintenanceType,
        maintenance_person: maintenancePerson,
        maintenance_time: maintenanceTime,
        maintenance_content: maintenanceContent,
        maintenance_cost: maintenanceCost,
        next_maintenance_time: nextMaintenanceTime,
        status
      });
    }
  }
  console.log("\u2705 \u7EF4\u4FDD\u8BB0\u5F55\u6570\u636E\u521D\u59CB\u5316\u5B8C\u6210");
}
async function initBillingTemplates(stations) {
  const timeSlotsTemplates = [
    [
      { date1: "00:00:00", date2: "08:00:00", electricity: "0.8" },
      { date1: "08:00:00", date2: "18:00:00", electricity: "1.2" },
      { date1: "18:00:00", date2: "22:00:00", electricity: "1.5" },
      { date1: "22:00:00", date2: "24:00:00", electricity: "0.8" }
    ],
    [
      { date1: "00:00:00", date2: "06:00:00", electricity: "0.7" },
      { date1: "06:00:00", date2: "22:00:00", electricity: "1.3" },
      { date1: "22:00:00", date2: "24:00:00", electricity: "0.7" }
    ],
    [
      { date1: "00:00:00", date2: "10:00:00", electricity: "0.9" },
      { date1: "10:00:00", date2: "20:00:00", electricity: "1.4" },
      { date1: "20:00:00", date2: "24:00:00", electricity: "0.9" }
    ]
  ];
  const templateNames = ["\u6807\u51C6\u8BA1\u8D39\u6A21\u677F", "\u9AD8\u5CF0\u8BA1\u8D39\u6A21\u677F", "\u4F18\u60E0\u8BA1\u8D39\u6A21\u677F", "VIP\u8BA1\u8D39\u6A21\u677F"];
  const remarksList = [
    "\u9002\u7528\u4E8E\u5DE5\u4F5C\u65E5\u6B63\u5E38\u65F6\u6BB5",
    "\u9002\u7528\u4E8E\u8282\u5047\u65E5\u548C\u9AD8\u5CF0\u671F",
    "\u9002\u7528\u4E8E\u4F1A\u5458\u7528\u6237",
    "\u9002\u7528\u4E8E\u591C\u95F4\u5145\u7535\u4F18\u60E0"
  ];
  for (const station of stations) {
    const templateCount = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < templateCount; i++) {
      const timeSlots = timeSlotsTemplates[Math.floor(Math.random() * timeSlotsTemplates.length)];
      const serviceFee = 0.5 + Math.random() * 0.5;
      const parkingFee = 2 + Math.random() * 3;
      await BillingTemplate_default.create({
        station_id: station.id,
        name: `${station.name}-${templateNames[Math.floor(Math.random() * templateNames.length)]}`,
        service_fee: Math.round(serviceFee * 100) / 100,
        parking_fee: Math.round(parkingFee * 100) / 100,
        time_slots: timeSlots,
        remarks: remarksList[Math.floor(Math.random() * remarksList.length)],
        created_at: /* @__PURE__ */ new Date(),
        updated_at: /* @__PURE__ */ new Date()
      });
    }
  }
  console.log("\u2705 \u8BA1\u8D39\u6A21\u677F\u6570\u636E\u521D\u59CB\u5316\u5B8C\u6210");
}
async function initDocuments() {
  const users = await User_default.findAll();
  if (users.length === 0) {
    console.log("\u26A0\uFE0F  \u6CA1\u6709\u7528\u6237\uFF0C\u8DF3\u8FC7\u6587\u6863\u6570\u636E\u521D\u59CB\u5316");
    return;
  }
  const documentTypes = ["\u62DB\u5546\u7C7B", "\u5E7F\u544A\u7C7B", "\u516C\u544A\u7C7B", "\u65B0\u95FB\u7C7B", "\u6D3B\u52A8\u7C7B"];
  const importants = ["\u4E00\u7EA7", "\u4E8C\u7EA7", "\u4E09\u7EA7", "\u56DB\u7EA7"];
  const publishChannels = ["\u7AD9\u5185\u4FE1", "\u516C\u4F17\u53F7", "\u5C0F\u7A0B\u5E8F", "\u5B98\u7F51", "APP"];
  const statuses = [1, 2, 2, 2];
  const titles = [
    "\u65B0\u80FD\u6E90\u6C7D\u8F66\u5145\u7535\u7AD9\u62DB\u5546\u5408\u4F5C",
    "\u5145\u7535\u7AD9\u52A0\u76DF\u4F18\u60E0\u653F\u7B56",
    "\u5145\u7535\u7AD9\u8FD0\u8425\u7BA1\u7406\u89C4\u8303",
    "\u5145\u7535\u7AD9\u5B89\u5168\u4F7F\u7528\u6307\u5357",
    "\u5145\u7535\u7AD9\u4F1A\u5458\u6743\u76CA\u8BF4\u660E",
    "\u5145\u7535\u7AD9\u4F18\u60E0\u6D3B\u52A8\u901A\u77E5",
    "\u5145\u7535\u7AD9\u8BBE\u5907\u5347\u7EA7\u516C\u544A",
    "\u5145\u7535\u7AD9\u670D\u52A1\u65F6\u95F4\u8C03\u6574",
    "\u5145\u7535\u7AD9\u65B0\u529F\u80FD\u4E0A\u7EBF",
    "\u5145\u7535\u7AD9\u7528\u6237\u534F\u8BAE",
    "\u5145\u7535\u7AD9\u9690\u79C1\u653F\u7B56",
    "\u5145\u7535\u7AD9\u5E38\u89C1\u95EE\u9898\u89E3\u7B54"
  ];
  const contents = [
    "<p>\u6B22\u8FCE\u52A0\u5165\u6211\u4EEC\u7684\u5145\u7535\u7AD9\u7F51\u7EDC\uFF01\u6211\u4EEC\u63D0\u4F9B\u5B8C\u5584\u7684\u8FD0\u8425\u652F\u6301\u548C\u6280\u672F\u670D\u52A1\u3002</p><p>\u5408\u4F5C\u4F18\u52BF\uFF1A</p><ul><li>\u54C1\u724C\u652F\u6301</li><li>\u6280\u672F\u652F\u6301</li><li>\u8FD0\u8425\u6307\u5BFC</li></ul>",
    "<p>\u5373\u65E5\u8D77\uFF0C\u65B0\u52A0\u76DF\u7684\u5145\u7535\u7AD9\u4EAB\u53D7\u4EE5\u4E0B\u4F18\u60E0\u653F\u7B56\uFF1A</p><ol><li>\u514D\u52A0\u76DF\u8D39</li><li>\u8BBE\u5907\u8865\u8D34</li><li>\u8FD0\u8425\u57F9\u8BAD</li></ol>",
    "<p>\u4E3A\u4E86\u786E\u4FDD\u5145\u7535\u7AD9\u7684\u5B89\u5168\u8FD0\u8425\uFF0C\u8BF7\u9075\u5B88\u4EE5\u4E0B\u7BA1\u7406\u89C4\u8303\uFF1A</p><p>1. \u5B9A\u671F\u68C0\u67E5\u8BBE\u5907</p><p>2. \u4FDD\u6301\u73AF\u5883\u6574\u6D01</p><p>3. \u53CA\u65F6\u5904\u7406\u6545\u969C</p>",
    "<p>\u4F7F\u7528\u5145\u7535\u7AD9\u65F6\u8BF7\u6CE8\u610F\uFF1A</p><p>1. \u68C0\u67E5\u5145\u7535\u67AA\u662F\u5426\u5B8C\u597D</p><p>2. \u786E\u8BA4\u8F66\u8F86\u5145\u7535\u63A5\u53E3\u5339\u914D</p><p>3. \u5145\u7535\u8FC7\u7A0B\u4E2D\u4E0D\u8981\u79BB\u5F00</p>",
    "<p>\u4F1A\u5458\u7528\u6237\u4EAB\u53D7\u4EE5\u4E0B\u6743\u76CA\uFF1A</p><ul><li>\u5145\u7535\u6298\u6263</li><li>\u4F18\u5148\u5145\u7535</li><li>\u4E13\u5C5E\u5BA2\u670D</li></ul>"
  ];
  const docCount = 20 + Math.floor(Math.random() * 11);
  for (let i = 0; i < docCount; i++) {
    const type = documentTypes[Math.floor(Math.random() * documentTypes.length)];
    const important = importants[Math.floor(Math.random() * importants.length)];
    const publish = publishChannels[Math.floor(Math.random() * publishChannels.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const author = users[Math.floor(Math.random() * users.length)];
    const title = titles[Math.floor(Math.random() * titles.length)];
    const content = contents[Math.floor(Math.random() * contents.length)];
    const publishTime = /* @__PURE__ */ new Date();
    publishTime.setDate(publishTime.getDate() - Math.floor(Math.random() * 90));
    publishTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
    await Document_default.create({
      type,
      important,
      publish,
      content,
      title,
      author_id: author.id,
      status,
      created_at: publishTime,
      updated_at: publishTime
    });
  }
  console.log("\u2705 \u6587\u6863\u6570\u636E\u521D\u59CB\u5316\u5B8C\u6210");
}

export {
  db_default,
  User_default,
  ChargingUser_default,
  Station_default,
  Pile_default,
  Order_default,
  Revenue_default,
  Alarm_default,
  Notice_default,
  BillingTemplate_default,
  Document_default,
  PileMaintenance_default,
  initMockData,
  initChargingUsers
};
