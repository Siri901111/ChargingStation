import {
  Alarm_default,
  BillingTemplate_default,
  ChargingUser_default,
  Document_default,
  Notice_default,
  Order_default,
  PileMaintenance_default,
  Pile_default,
  Revenue_default,
  Station_default,
  User_default,
  db_default,
  initMockData
} from "./chunk-ZVF4WKVT.js";

// src/app.ts
import express from "express";
import cors from "cors";
import dotenv2 from "dotenv";

// src/models/Role.ts
import { DataTypes, Model } from "sequelize";
var Role = class extends Model {
};
Role.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(32), allowNull: false }
  },
  {
    sequelize: db_default,
    modelName: "Role",
    tableName: "role",
    timestamps: false
  }
);
var Role_default = Role;

// src/models/Permission.ts
import { DataTypes as DataTypes2, Model as Model2 } from "sequelize";
var Permission = class extends Model2 {
};
Permission.init(
  {
    id: { type: DataTypes2.BIGINT, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes2.STRING(64), allowNull: false },
    type: { type: DataTypes2.STRING(16) }
    // menu/button
  },
  {
    sequelize: db_default,
    modelName: "Permission",
    tableName: "permission",
    timestamps: false
  }
);

// src/models/MonitorData.ts
import { DataTypes as DataTypes3, Model as Model3 } from "sequelize";
var MonitorData = class extends Model3 {
};
MonitorData.init(
  {
    id: {
      type: DataTypes3.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    // 上报数据的唯一ID
    report_id: {
      type: DataTypes3.STRING(64),
      allowNull: false,
      comment: "\u4E0A\u62A5\u6570\u636E\u552F\u4E00ID"
    },
    // 应用ID
    app_id: {
      type: DataTypes3.STRING(64),
      allowNull: false,
      comment: "\u5E94\u7528ID"
    },
    // 用户ID
    user_id: {
      type: DataTypes3.STRING(64),
      comment: "\u7528\u6237ID"
    },
    // 上报类型
    type: {
      type: DataTypes3.STRING(50),
      allowNull: false,
      comment: "\u4E0A\u62A5\u7C7B\u578B\uFF1Ajs_error, promise_error, resource_error, http_error, vue_error, performance, page_view, click, route_change, http_request, session_start, session_end\u7B49"
    },
    // 上报类别（用于分类查询）
    category: {
      type: DataTypes3.ENUM("error", "performance", "behavior", "network", "session"),
      allowNull: false,
      comment: "\u6570\u636E\u7C7B\u522B"
    },
    // 时间戳
    timestamp: {
      type: DataTypes3.BIGINT,
      allowNull: false,
      comment: "\u4E0A\u62A5\u65F6\u95F4\u6233"
    },
    // 页面URL
    page_url: {
      type: DataTypes3.STRING(1e3),
      comment: "\u9875\u9762URL"
    },
    // 页面标题
    page_title: {
      type: DataTypes3.STRING(200),
      comment: "\u9875\u9762\u6807\u9898"
    },
    // 设备信息 (JSON)
    device_info: {
      type: DataTypes3.JSON,
      comment: "\u8BBE\u5907\u4FE1\u606F\uFF1A\u6D4F\u89C8\u5668\u3001\u64CD\u4F5C\u7CFB\u7EDF\u3001\u8BBE\u5907\u7C7B\u578B\u7B49"
    },
    // 环境信息 (JSON)
    environment_info: {
      type: DataTypes3.JSON,
      comment: "\u73AF\u5883\u4FE1\u606F\uFF1A\u5C4F\u5E55\u3001\u7F51\u7EDC\u3001\u8BED\u8A00\u7B49"
    },
    // 会话信息 (JSON)
    session_info: {
      type: DataTypes3.JSON,
      comment: "\u4F1A\u8BDD\u4FE1\u606F\uFF1A\u4F1A\u8BDDID\u3001\u8BBF\u5BA2ID\u7B49"
    },
    // 核心数据 (JSON) - 存储不同类型的具体数据
    data: {
      type: DataTypes3.JSON,
      comment: "\u6838\u5FC3\u4E0A\u62A5\u6570\u636E\uFF0C\u6839\u636Etype\u4E0D\u540C\u5B58\u50A8\u4E0D\u540C\u7ED3\u6784"
    },
    // 额外数据 (JSON)
    extra: {
      type: DataTypes3.JSON,
      comment: "\u989D\u5916\u81EA\u5B9A\u4E49\u6570\u636E"
    },
    // IP地址
    ip_address: {
      type: DataTypes3.STRING(45),
      comment: "\u5BA2\u6237\u7AEFIP\u5730\u5740"
    },
    // User Agent
    user_agent: {
      type: DataTypes3.STRING(500),
      comment: "User Agent"
    },
    // 创建时间
    created_at: {
      type: DataTypes3.DATE,
      defaultValue: DataTypes3.NOW
    }
  },
  {
    sequelize: db_default,
    modelName: "MonitorData",
    tableName: "monitor_data",
    timestamps: false,
    indexes: [
      { fields: ["app_id"] },
      { fields: ["type"] },
      { fields: ["category"] },
      { fields: ["timestamp"] },
      { fields: ["created_at"] },
      { fields: ["user_id"] }
    ]
  }
);
var MonitorData_default = MonitorData;

// src/models/AIAgent.ts
import { DataTypes as DataTypes4, Model as Model4 } from "sequelize";
var AIAgent = class extends Model4 {
};
AIAgent.init(
  {
    id: { type: DataTypes4.BIGINT, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes4.STRING(100), allowNull: false, comment: "\u667A\u80FD\u4F53\u540D\u79F0" },
    description: { type: DataTypes4.TEXT, comment: "\u667A\u80FD\u4F53\u63CF\u8FF0" },
    type: {
      type: DataTypes4.ENUM("chat", "workflow", "multi-agent"),
      defaultValue: "chat",
      comment: "\u667A\u80FD\u4F53\u7C7B\u578B\uFF1A\u5BF9\u8BDD\u578B\u3001\u5DE5\u4F5C\u6D41\u578B\u3001\u591AAgent"
    },
    avatar: { type: DataTypes4.STRING(500), comment: "\u5934\u50CFURL" },
    system_prompt: { type: DataTypes4.TEXT, comment: "\u7CFB\u7EDF\u63D0\u793A\u8BCD" },
    welcome_message: { type: DataTypes4.STRING(500), comment: "\u6B22\u8FCE\u8BED" },
    suggested_questions: { type: DataTypes4.JSON, comment: "\u63A8\u8350\u95EE\u9898\u5217\u8868" },
    // 模型配置
    model_config: {
      type: DataTypes4.JSON,
      comment: "\u6A21\u578B\u914D\u7F6E\uFF1Amodel, temperature, topP, maxTokens, contextLength"
    },
    // MCP配置
    mcp_enabled: { type: DataTypes4.BOOLEAN, defaultValue: false, comment: "MCP\u662F\u5426\u542F\u7528" },
    mcp_servers: { type: DataTypes4.JSON, comment: "MCP\u670D\u52A1\u914D\u7F6E\u5217\u8868" },
    // RAG配置
    rag_enabled: { type: DataTypes4.BOOLEAN, defaultValue: false, comment: "RAG\u662F\u5426\u542F\u7528" },
    rag_config: {
      type: DataTypes4.JSON,
      comment: "RAG\u914D\u7F6E\uFF1AknowledgeBaseIds, retrievalMode, topK, scoreThreshold, rerankEnabled"
    },
    // 工作流配置
    workflow_enabled: { type: DataTypes4.BOOLEAN, defaultValue: false, comment: "\u5DE5\u4F5C\u6D41\u662F\u5426\u542F\u7528" },
    workflow_config: { type: DataTypes4.JSON, comment: "\u5DE5\u4F5C\u6D41\u914D\u7F6E\uFF1Anodes, edges" },
    // 插件配置
    plugins: { type: DataTypes4.JSON, comment: "\u542F\u7528\u7684\u63D2\u4EF6ID\u5217\u8868" },
    // 统计数据
    chat_count: { type: DataTypes4.INTEGER, defaultValue: 0, comment: "\u5BF9\u8BDD\u6B21\u6570" },
    // 状态
    status: {
      type: DataTypes4.TINYINT,
      defaultValue: 0,
      comment: "\u72B6\u6001\uFF1A-1\u5DF2\u505C\u7528\uFF0C0\u8349\u7A3F\uFF0C1\u5DF2\u53D1\u5E03"
    },
    // 创建者
    creator_id: { type: DataTypes4.BIGINT, comment: "\u521B\u5EFA\u8005ID" },
    created_at: { type: DataTypes4.DATE, defaultValue: DataTypes4.NOW },
    updated_at: { type: DataTypes4.DATE, defaultValue: DataTypes4.NOW }
  },
  {
    sequelize: db_default,
    modelName: "AIAgent",
    tableName: "ai_agent",
    timestamps: false
  }
);
var KnowledgeBase = class extends Model4 {
};
KnowledgeBase.init(
  {
    id: { type: DataTypes4.BIGINT, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes4.STRING(100), allowNull: false, comment: "\u77E5\u8BC6\u5E93\u540D\u79F0" },
    description: { type: DataTypes4.TEXT, comment: "\u77E5\u8BC6\u5E93\u63CF\u8FF0" },
    embedding_model: {
      type: DataTypes4.STRING(50),
      defaultValue: "text-embedding-3-small",
      comment: "Embedding\u6A21\u578B"
    },
    doc_count: { type: DataTypes4.INTEGER, defaultValue: 0, comment: "\u6587\u6863\u6570\u91CF" },
    chunk_count: { type: DataTypes4.INTEGER, defaultValue: 0, comment: "\u5206\u5757\u6570\u91CF" },
    status: { type: DataTypes4.TINYINT, defaultValue: 1, comment: "\u72B6\u6001\uFF1A0\u7981\u7528\uFF0C1\u542F\u7528" },
    creator_id: { type: DataTypes4.BIGINT, comment: "\u521B\u5EFA\u8005ID" },
    created_at: { type: DataTypes4.DATE, defaultValue: DataTypes4.NOW },
    updated_at: { type: DataTypes4.DATE, defaultValue: DataTypes4.NOW }
  },
  {
    sequelize: db_default,
    modelName: "KnowledgeBase",
    tableName: "knowledge_base",
    timestamps: false
  }
);
var KnowledgeDocument = class extends Model4 {
};
KnowledgeDocument.init(
  {
    id: { type: DataTypes4.BIGINT, autoIncrement: true, primaryKey: true },
    knowledge_base_id: {
      type: DataTypes4.BIGINT,
      allowNull: false,
      comment: "\u6240\u5C5E\u77E5\u8BC6\u5E93ID"
    },
    name: { type: DataTypes4.STRING(200), allowNull: false, comment: "\u6587\u6863\u540D\u79F0" },
    type: { type: DataTypes4.STRING(50), comment: "\u6587\u6863\u7C7B\u578B\uFF1Apdf, docx, txt, md\u7B49" },
    size: { type: DataTypes4.BIGINT, comment: "\u6587\u4EF6\u5927\u5C0F(\u5B57\u8282)" },
    file_path: { type: DataTypes4.STRING(500), comment: "\u6587\u4EF6\u5B58\u50A8\u8DEF\u5F84" },
    chunk_count: { type: DataTypes4.INTEGER, defaultValue: 0, comment: "\u5206\u5757\u6570\u91CF" },
    status: {
      type: DataTypes4.TINYINT,
      defaultValue: 0,
      comment: "\u72B6\u6001\uFF1A0\u5904\u7406\u4E2D\uFF0C1\u5904\u7406\u5B8C\u6210\uFF0C2\u5904\u7406\u5931\u8D25"
    },
    error_message: { type: DataTypes4.TEXT, comment: "\u9519\u8BEF\u4FE1\u606F" },
    created_at: { type: DataTypes4.DATE, defaultValue: DataTypes4.NOW },
    updated_at: { type: DataTypes4.DATE, defaultValue: DataTypes4.NOW }
  },
  {
    sequelize: db_default,
    modelName: "KnowledgeDocument",
    tableName: "knowledge_document",
    timestamps: false
  }
);
var ChatSession = class extends Model4 {
};
ChatSession.init(
  {
    id: { type: DataTypes4.BIGINT, autoIncrement: true, primaryKey: true },
    agent_id: { type: DataTypes4.BIGINT, allowNull: false, comment: "\u667A\u80FD\u4F53ID" },
    user_id: { type: DataTypes4.BIGINT, comment: "\u7528\u6237ID" },
    title: { type: DataTypes4.STRING(200), comment: "\u4F1A\u8BDD\u6807\u9898" },
    message_count: { type: DataTypes4.INTEGER, defaultValue: 0, comment: "\u6D88\u606F\u6570\u91CF" },
    total_tokens: { type: DataTypes4.INTEGER, defaultValue: 0, comment: "\u603BToken\u6570" },
    created_at: { type: DataTypes4.DATE, defaultValue: DataTypes4.NOW },
    updated_at: { type: DataTypes4.DATE, defaultValue: DataTypes4.NOW }
  },
  {
    sequelize: db_default,
    modelName: "ChatSession",
    tableName: "chat_session",
    timestamps: false
  }
);
var ChatMessage = class extends Model4 {
};
ChatMessage.init(
  {
    id: { type: DataTypes4.BIGINT, autoIncrement: true, primaryKey: true },
    session_id: { type: DataTypes4.BIGINT, allowNull: false, comment: "\u4F1A\u8BDDID" },
    role: {
      type: DataTypes4.ENUM("user", "assistant", "system"),
      allowNull: false,
      comment: "\u89D2\u8272"
    },
    content: { type: DataTypes4.TEXT, allowNull: false, comment: "\u6D88\u606F\u5185\u5BB9" },
    tokens: { type: DataTypes4.INTEGER, defaultValue: 0, comment: "Token\u6570\u91CF" },
    metadata: { type: DataTypes4.JSON, comment: "\u5143\u6570\u636E\uFF1A\u5F15\u7528\u7684\u77E5\u8BC6\u3001\u5DE5\u5177\u8C03\u7528\u7B49" },
    created_at: { type: DataTypes4.DATE, defaultValue: DataTypes4.NOW }
  },
  {
    sequelize: db_default,
    modelName: "ChatMessage",
    tableName: "chat_message",
    timestamps: false
  }
);
KnowledgeDocument.belongsTo(KnowledgeBase, { foreignKey: "knowledge_base_id", as: "knowledgeBase" });
KnowledgeBase.hasMany(KnowledgeDocument, { foreignKey: "knowledge_base_id", as: "documents" });
ChatSession.belongsTo(AIAgent, { foreignKey: "agent_id", as: "agent" });
AIAgent.hasMany(ChatSession, { foreignKey: "agent_id", as: "sessions" });
ChatMessage.belongsTo(ChatSession, { foreignKey: "session_id", as: "session" });
ChatSession.hasMany(ChatMessage, { foreignKey: "session_id", as: "messages" });

// src/models/index.ts
Station_default.hasMany(Pile_default, {
  foreignKey: "station_id",
  as: "piles"
});
Pile_default.belongsTo(Station_default, {
  foreignKey: "station_id",
  as: "station"
});
Station_default.hasMany(Order_default, {
  foreignKey: "station_id",
  as: "orders"
});
Order_default.belongsTo(Station_default, {
  foreignKey: "station_id",
  as: "station"
});
Station_default.hasMany(Revenue_default, {
  foreignKey: "station_id",
  as: "revenues"
});
Revenue_default.belongsTo(Station_default, {
  foreignKey: "station_id",
  as: "station"
});
Station_default.hasMany(Alarm_default, {
  foreignKey: "station_id",
  as: "alarms"
});
Alarm_default.belongsTo(Station_default, {
  foreignKey: "station_id",
  as: "station"
});
Station_default.hasOne(BillingTemplate_default, {
  foreignKey: "station_id",
  as: "billingTemplate"
});
BillingTemplate_default.belongsTo(Station_default, {
  foreignKey: "station_id",
  as: "station"
});
Pile_default.hasMany(Alarm_default, {
  foreignKey: "pile_id",
  as: "alarms"
});
Alarm_default.belongsTo(Pile_default, {
  foreignKey: "pile_id",
  as: "pile"
});
Pile_default.hasMany(PileMaintenance_default, {
  foreignKey: "pile_id",
  as: "maintenances"
});
PileMaintenance_default.belongsTo(Pile_default, {
  foreignKey: "pile_id",
  as: "pile"
});
ChargingUser_default.hasMany(Order_default, {
  foreignKey: "user_id",
  as: "orders"
});
Order_default.belongsTo(ChargingUser_default, {
  foreignKey: "user_id",
  as: "chargingUser"
});
User_default.belongsTo(Role_default, {
  foreignKey: "role_id",
  as: "role"
});
Role_default.hasMany(User_default, {
  foreignKey: "role_id",
  as: "users"
});
User_default.hasMany(Document_default, {
  foreignKey: "author_id",
  as: "documents"
});
Document_default.belongsTo(User_default, {
  foreignKey: "author_id",
  as: "author"
});
User_default.hasMany(AIAgent, {
  foreignKey: "creator_id",
  as: "agents"
});
AIAgent.belongsTo(User_default, {
  foreignKey: "creator_id",
  as: "creator"
});
User_default.hasMany(KnowledgeBase, {
  foreignKey: "creator_id",
  as: "knowledgeBases"
});
KnowledgeBase.belongsTo(User_default, {
  foreignKey: "creator_id",
  as: "creator"
});

// src/utils/initData.ts
import bcrypt from "bcryptjs";
async function initDefaultUser() {
  try {
    let adminRole = await Role_default.findOne({ where: { id: 1 } });
    if (!adminRole) {
      adminRole = await Role_default.create({
        id: 1,
        name: "admin"
      });
      console.log("\u2705 \u9ED8\u8BA4\u7BA1\u7406\u5458\u89D2\u8272\u521B\u5EFA\u6210\u529F\uFF01");
    }
    const roles = [
      { id: 2, name: "manager" },
      { id: 3, name: "user" }
    ];
    for (const roleData of roles) {
      const existingRole = await Role_default.findOne({ where: { id: roleData.id } });
      if (!existingRole) {
        await Role_default.create(roleData);
        console.log(`\u2705 \u89D2\u8272 ${roleData.name} \u521B\u5EFA\u6210\u529F\uFF01`);
      }
    }
    const admin = await User_default.findOne({ where: { account: "admin" } });
    if (!admin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await User_default.create({
        account: "admin",
        password: hashedPassword,
        name: "\u7CFB\u7EDF\u7BA1\u7406\u5458",
        phone: "13800138000",
        id_no: "110101199001011234",
        position: "\u7CFB\u7EDF\u7BA1\u7406\u5458",
        department: "\u603B\u88C1\u529E",
        status: 1,
        page_authority: "admin",
        btn_authority: "all,add,edit,delete",
        role_id: 1,
        address: "\u5317\u4EAC\u5E02\u671D\u9633\u533A\u5EFA\u56FD\u8DEF88\u53F7",
        tags: ["\u8BA4\u771F", "\u5DE5\u4F5C\u72C2", "\u4E0E\u4EBA\u548C\u5584", "\u4EE3\u7801\u6D01\u7656"],
        work_status: 1,
        avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=admin"
      });
      console.log("\u2705 \u9ED8\u8BA4\u7BA1\u7406\u5458\u8D26\u53F7\u521B\u5EFA\u6210\u529F\uFF01");
      console.log("   \u8D26\u53F7: admin");
      console.log("   \u5BC6\u7801: admin123");
    } else {
      console.log("\u2139\uFE0F  \u7BA1\u7406\u5458\u8D26\u53F7\u5DF2\u5B58\u5728\uFF0C\u8DF3\u8FC7\u521B\u5EFA");
    }
  } catch (error) {
    console.error("\u274C \u521D\u59CB\u5316\u9ED8\u8BA4\u7528\u6237\u5931\u8D25:", error);
    throw error;
  }
}

// src/routes/userRoutes.ts
import { Router } from "express";

// src/services/userService.ts
import bcrypt2 from "bcryptjs";

// src/utils/jwt.ts
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
var JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key";
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid token");
  }
}

// src/utils/validator.ts
function validatePhone(phone) {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}
function validateAccount(account) {
  const accountRegex = /^[a-zA-Z0-9_]{4,20}$/;
  return accountRegex.test(account);
}
function validatePassword(password) {
  if (password.length < 6) {
    return false;
  }
  return true;
}
function validateIdNo(idNo) {
  const idNoRegex = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
  return idNoRegex.test(idNo);
}

// src/services/userService.ts
import { Op } from "sequelize";
var getMenuAndBtnAuthByRole = (pageAuthority) => {
  if (pageAuthority === "admin") {
    return {
      menulist: [
        {
          name: "\u6570\u636E\u770B\u677F",
          url: "/dashboard",
          icon: "DataLine"
        },
        {
          name: "\u5145\u7535\u7AD9\u7BA1\u7406",
          url: "/chargingstation",
          icon: "Lightning",
          children: [
            {
              name: "\u5145\u7535\u7AD9\u76D1\u63A7",
              url: "/chargingstation/monitor",
              icon: "VideoCamera"
            },
            {
              name: "\u8425\u6536\u7EDF\u8BA1",
              url: "/chargingstation/revenue",
              icon: "DataAnalysis"
            },
            {
              name: "\u5145\u7535\u6869\u7BA1\u7406",
              url: "/chargingstation/fault",
              icon: "Warning"
            }
          ]
        },
        {
          name: "\u7535\u5B50\u5730\u56FE",
          url: "/map",
          icon: "MapLocation"
        },
        {
          name: "\u8FD0\u8425\u7BA1\u7406",
          url: "/operations",
          icon: "Files",
          children: [
            {
              name: "\u8BA2\u5355\u7BA1\u7406",
              url: "/operations/orders",
              icon: "DocumentCopy"
            },
            {
              name: "\u8BA2\u5355\u8BE6\u60C5",
              url: "/operations/detail",
              icon: "Share"
            },
            {
              name: "\u8BA1\u8D39\u7BA1\u7406",
              url: "/operations/total",
              icon: "Money"
            }
          ]
        },
        {
          name: "\u62A5\u8B66\u7BA1\u7406",
          url: "/alarm",
          icon: "Phone"
        },
        {
          name: "\u4F1A\u5458\u5361\u7BA1\u7406",
          url: "/equipment",
          icon: "Magnet"
        },
        {
          name: "\u62DB\u5546\u7BA1\u7406",
          url: "/document",
          icon: "Document"
        },
        {
          name: "\u7CFB\u7EDF\u8BBE\u7F6E",
          url: "/system",
          icon: "Setting"
        },
        {
          name: "\u670D\u52A1\u76D1\u63A7",
          url: "/web-monitor",
          icon: "Files",
          children: [
            {
              name: "\u76D1\u63A7\u603B\u89C8",
              url: "/web-monitor/overview",
              icon: "DocumentCopy"
            },
            {
              name: "\u884C\u4E3A\u76D1\u63A7",
              url: "/web-monitor/behavior",
              icon: "Flag"
            },
            {
              name: "\u7F51\u7EDC\u76D1\u63A7",
              url: "/web-monitor/network",
              icon: "MagicStick"
            },
            {
              name: "\u9519\u8BEF\u76D1\u63A7",
              url: "/web-monitor/errors",
              icon: "CloseBold"
            },
            {
              name: "\u6027\u80FD\u6307\u6807\u76D1\u63A7",
              url: "/web-monitor/performance",
              icon: "ChromeFilled"
            }
          ]
        },
        {
          name: "AI\u667A\u80FD\u4F53",
          url: "/ai-agent",
          icon: "MagicStick"
        },
        {
          name: "\u4E2A\u4EBA\u4E2D\u5FC3",
          url: "/personal",
          icon: "User"
        }
      ],
      btnAuth: ["all", "add", "edit", "delete"]
    };
  }
  if (pageAuthority === "manager") {
    return {
      menulist: [
        {
          name: "\u6570\u636E\u770B\u677F",
          url: "/dashboard",
          icon: "DataLine"
        },
        {
          name: "\u5145\u7535\u7AD9\u7BA1\u7406",
          url: "/chargingstation",
          icon: "Lightning",
          children: [
            {
              name: "\u5145\u7535\u7AD9\u76D1\u63A7",
              url: "/chargingstation/monitor",
              icon: "VideoCamera"
            },
            {
              name: "\u8425\u6536\u7EDF\u8BA1",
              url: "/chargingstation/revenue",
              icon: "DataAnalysis"
            },
            {
              name: "\u5145\u7535\u6869\u7BA1\u7406",
              url: "/chargingstation/fault",
              icon: "Warning"
            }
          ]
        },
        {
          name: "\u7535\u5B50\u5730\u56FE",
          url: "/map",
          icon: "MapLocation"
        },
        {
          name: "\u8FD0\u8425\u7BA1\u7406",
          url: "/operations",
          icon: "Files",
          children: [
            {
              name: "\u8BA2\u5355\u7BA1\u7406",
              url: "/operations/orders",
              icon: "DocumentCopy"
            },
            {
              name: "\u8BA2\u5355\u8BE6\u60C5",
              url: "/operations/detail",
              icon: "Share"
            },
            {
              name: "\u8BA1\u8D39\u7BA1\u7406",
              url: "/operations/total",
              icon: "Money"
            }
          ]
        },
        {
          name: "\u62A5\u8B66\u7BA1\u7406",
          url: "/alarm",
          icon: "Phone"
        },
        {
          name: "\u4F1A\u5458\u5361\u7BA1\u7406",
          url: "/equipment",
          icon: "Magnet"
        },
        {
          name: "AI\u667A\u80FD\u4F53",
          url: "/ai-agent",
          icon: "MagicStick"
        },
        {
          name: "\u4E2A\u4EBA\u4E2D\u5FC3",
          url: "/personal",
          icon: "User"
        }
      ],
      btnAuth: ["add", "edit"]
    };
  }
  return {
    menulist: [
      {
        name: "\u6570\u636E\u770B\u677F",
        url: "/dashboard",
        icon: "DataLine"
      },
      {
        name: "\u5145\u7535\u7AD9\u7BA1\u7406",
        url: "/chargingstation",
        icon: "Lightning",
        children: [
          {
            name: "\u5145\u7535\u7AD9\u76D1\u63A7",
            url: "/chargingstation/monitor",
            icon: "VideoCamera"
          },
          {
            name: "\u5145\u7535\u6869\u7BA1\u7406",
            url: "/chargingstation/fault",
            icon: "Warning"
          }
        ]
      },
      {
        name: "\u7535\u5B50\u5730\u56FE",
        url: "/map",
        icon: "MapLocation"
      },
      {
        name: "\u62A5\u8B66\u7BA1\u7406",
        url: "/alarm",
        icon: "Phone"
      },
      {
        name: "\u4F1A\u5458\u5361\u7BA1\u7406",
        url: "/equipment",
        icon: "Magnet"
      },
      {
        name: "\u4E2A\u4EBA\u4E2D\u5FC3",
        url: "/personal",
        icon: "User"
      }
    ],
    btnAuth: ["add"]
  };
};
async function loginService(params) {
  const { username, password } = params;
  const user = await User_default.findOne({
    where: { account: username }
  });
  if (!user) {
    throw new Error("\u7528\u6237\u540D\u6216\u5BC6\u7801\u9519\u8BEF");
  }
  const isPasswordValid = await bcrypt2.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("\u7528\u6237\u540D\u6216\u5BC6\u7801\u9519\u8BEF");
  }
  if (user.status !== 1) {
    throw new Error("\u8D26\u53F7\u5DF2\u88AB\u7981\u7528");
  }
  const pageAuthority = user.page_authority || "user";
  const roles = [pageAuthority];
  const tokenPayload = {
    userId: user.id,
    account: user.account,
    roles
  };
  const token = generateToken(tokenPayload);
  const { menulist, btnAuth } = getMenuAndBtnAuthByRole(pageAuthority);
  return {
    token,
    user: {
      id: user.id,
      username: user.name || user.account,
      roles
    },
    menulist,
    btnAuth
  };
}
async function registerService(params) {
  const { account, password, name, phone, id_no, position, department } = params;
  if (!account || !password || !name) {
    throw new Error("\u8D26\u53F7\u3001\u5BC6\u7801\u548C\u59D3\u540D\u4E0D\u80FD\u4E3A\u7A7A");
  }
  if (!validateAccount(account)) {
    throw new Error("\u8D26\u53F7\u683C\u5F0F\u4E0D\u6B63\u786E\uFF0C\u5E94\u4E3A4-20\u4F4D\u5B57\u6BCD\u3001\u6570\u5B57\u6216\u4E0B\u5212\u7EBF");
  }
  if (!validatePassword(password)) {
    throw new Error("\u5BC6\u7801\u957F\u5EA6\u81F3\u5C116\u4F4D");
  }
  if (phone && !validatePhone(phone)) {
    throw new Error("\u624B\u673A\u53F7\u683C\u5F0F\u4E0D\u6B63\u786E");
  }
  if (id_no && !validateIdNo(id_no)) {
    throw new Error("\u8EAB\u4EFD\u8BC1\u53F7\u683C\u5F0F\u4E0D\u6B63\u786E");
  }
  const existingAccount = await User_default.findOne({
    where: { account }
  });
  if (existingAccount) {
    throw new Error("\u8BE5\u8D26\u53F7\u5DF2\u88AB\u6CE8\u518C");
  }
  if (phone) {
    const existingPhone = await User_default.findOne({
      where: { phone }
    });
    if (existingPhone) {
      throw new Error("\u8BE5\u624B\u673A\u53F7\u5DF2\u88AB\u6CE8\u518C");
    }
  }
  const hashedPassword = await bcrypt2.hash(password, 10);
  const newUser = await User_default.create({
    account,
    password: hashedPassword,
    name,
    phone: phone || null,
    id_no: id_no || null,
    position: position || "\u666E\u901A\u7528\u6237",
    department: department || "\u5BA2\u670D\u90E8",
    status: 1,
    // 默认启用
    page_authority: "user",
    // 默认普通用户权限
    btn_authority: "add",
    // 默认只有添加权限
    role_id: 3
    // 普通用户角色ID
  });
  return {
    id: newUser.id,
    account: newUser.account,
    name: newUser.name,
    phone: newUser.phone,
    position: newUser.position,
    department: newUser.department,
    page_authority: newUser.page_authority
  };
}
async function getUserListService(params) {
  const { page = 1, pageSize = 10, name, department } = params;
  const where = {};
  if (name) {
    where.name = {
      [Op.like]: `%${name}%`
    };
  }
  if (department) {
    where.department = department;
  }
  const { count, rows } = await User_default.findAndCountAll({
    where,
    limit: pageSize,
    offset: (page - 1) * pageSize,
    attributes: { exclude: ["password"] },
    // 排除密码字段
    order: [["created_at", "DESC"]]
  });
  const list = rows.map((user) => ({
    account: user.account,
    name: user.name,
    phone: user.phone,
    idNo: user.id_no,
    position: user.position,
    department: user.department,
    pageAuthority: user.page_authority,
    btnAuthority: user.btn_authority,
    status: user.status
    // 添加状态字段
  }));
  return {
    list,
    total: count
  };
}
async function getUserAuthService(pageAuthority) {
  try {
    if (!pageAuthority || typeof pageAuthority !== "string") {
      throw new Error("\u6743\u9650\u7EA7\u522B\u53C2\u6570\u65E0\u6548");
    }
    const { menulist, btnAuth } = getMenuAndBtnAuthByRole(pageAuthority);
    return {
      list: menulist,
      btn: btnAuth
    };
  } catch (error) {
    console.error("getUserAuthService \u9519\u8BEF:", error);
    throw error;
  }
}
async function setUserAuthService(account, btnList, pageList) {
  const user = await User_default.findOne({ where: { account } });
  if (!user) {
    throw new Error("\u7528\u6237\u4E0D\u5B58\u5728");
  }
  let pageAuthority = "user";
  if (pageList.includes("/system") || pageList.includes("/document")) {
    pageAuthority = "admin";
  } else if (pageList.includes("/chargingstation/revenue") || pageList.includes("/operations/total") || pageList.includes("/operations/orders")) {
    pageAuthority = "manager";
  } else {
    pageAuthority = "user";
  }
  await User_default.update(
    {
      page_authority: pageAuthority,
      btn_authority: btnList.join(",")
    },
    { where: { account } }
  );
  return { message: "\u6743\u9650\u8BBE\u7F6E\u6210\u529F" };
}
async function deleteUserService(account) {
  const user = await User_default.findOne({ where: { account } });
  if (!user) {
    throw new Error("\u7528\u6237\u4E0D\u5B58\u5728");
  }
  if (user.page_authority === "admin" && user.account === "admin") {
    throw new Error("\u4E0D\u80FD\u5220\u9664\u7CFB\u7EDF\u7BA1\u7406\u5458\u8D26\u53F7");
  }
  await User_default.destroy({ where: { account } });
  return { message: "\u7528\u6237\u5220\u9664\u6210\u529F" };
}
async function toggleUserStatusService(account) {
  const user = await User_default.findOne({ where: { account } });
  if (!user) {
    throw new Error("\u7528\u6237\u4E0D\u5B58\u5728");
  }
  if (user.page_authority === "admin" && user.account === "admin") {
    throw new Error("\u4E0D\u80FD\u7981\u7528\u7CFB\u7EDF\u7BA1\u7406\u5458\u8D26\u53F7");
  }
  const newStatus = user.status === 1 ? 0 : 1;
  await User_default.update(
    { status: newStatus },
    { where: { account } }
  );
  return {
    message: newStatus === 1 ? "\u7528\u6237\u5DF2\u542F\u7528" : "\u7528\u6237\u5DF2\u7981\u7528",
    status: newStatus
  };
}

// src/controllers/userController.ts
async function loginController(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        message: "\u7528\u6237\u540D\u548C\u5BC6\u7801\u4E0D\u80FD\u4E3A\u7A7A",
        data: null
      });
    }
    const result = await loginService({ username, password });
    return res.json({
      code: 200,
      message: "\u767B\u5F55\u6210\u529F",
      data: result
    });
  } catch (error) {
    return res.status(401).json({
      code: 401,
      message: error.message || "\u767B\u5F55\u5931\u8D25",
      data: null
    });
  }
}
async function registerController(req, res) {
  try {
    const { account, password, name, phone, id_no, position, department } = req.body;
    if (!account || !password || !name) {
      return res.status(400).json({
        code: 400,
        message: "\u8D26\u53F7\u3001\u5BC6\u7801\u548C\u59D3\u540D\u4E0D\u80FD\u4E3A\u7A7A",
        data: null
      });
    }
    const result = await registerService({
      account,
      password,
      name,
      phone,
      id_no,
      position,
      department
    });
    return res.json({
      code: 200,
      message: "\u6CE8\u518C\u6210\u529F",
      data: result
    });
  } catch (error) {
    const statusCode = error.message.includes("\u5DF2\u88AB\u6CE8\u518C") || error.message.includes("\u683C\u5F0F\u4E0D\u6B63\u786E") ? 400 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u6CE8\u518C\u5931\u8D25",
      data: null
    });
  }
}

// src/controllers/userManagementController.ts
async function getUserListController(req, res) {
  try {
    const { page, pageSize, name, department } = req.body;
    const result = await getUserListService({
      page: page || 1,
      pageSize: pageSize || 10,
      name,
      department
    });
    return res.json({
      code: 200,
      message: "\u83B7\u53D6\u6210\u529F",
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message || "\u83B7\u53D6\u7528\u6237\u5217\u8868\u5931\u8D25",
      data: null
    });
  }
}
async function getUserAuthController(req, res) {
  try {
    const { pageAuthority } = req.body;
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({
        code: 401,
        message: "\u672A\u8BA4\u8BC1",
        data: null
      });
    }
    const currentUserRole = currentUser.roles?.[0] || "user";
    let targetAuthority;
    if (pageAuthority && typeof pageAuthority === "string" && pageAuthority.trim()) {
      if (currentUserRole !== "admin") {
        if (pageAuthority !== currentUserRole) {
          return res.status(403).json({
            code: 403,
            message: "\u65E0\u6743\u67E5\u770B\u5176\u4ED6\u6743\u9650\u7EA7\u522B\u7684\u83DC\u5355",
            data: null
          });
        }
      }
      targetAuthority = pageAuthority.trim();
    } else {
      targetAuthority = currentUserRole;
    }
    if (!["admin", "manager", "user"].includes(targetAuthority)) {
      console.error("\u65E0\u6548\u7684\u6743\u9650\u7EA7\u522B:", targetAuthority);
      return res.status(400).json({
        code: 400,
        message: "\u65E0\u6548\u7684\u6743\u9650\u7EA7\u522B",
        data: null
      });
    }
    const result = await getUserAuthService(targetAuthority);
    return res.json({
      code: 200,
      message: "\u83B7\u53D6\u6210\u529F",
      data: result
    });
  } catch (error) {
    console.error("\u83B7\u53D6\u7528\u6237\u6743\u9650\u5931\u8D25:", error);
    return res.status(500).json({
      code: 500,
      message: error.message || "\u83B7\u53D6\u7528\u6237\u6743\u9650\u5931\u8D25",
      data: null
    });
  }
}
async function setUserAuthController(req, res) {
  try {
    const { account, btnList, pageList } = req.body;
    if (!account) {
      return res.status(400).json({
        code: 400,
        message: "\u8D26\u53F7\u4E0D\u80FD\u4E3A\u7A7A",
        data: null
      });
    }
    if (!btnList || !Array.isArray(btnList)) {
      return res.status(400).json({
        code: 400,
        message: "\u6309\u94AE\u6743\u9650\u5217\u8868\u4E0D\u80FD\u4E3A\u7A7A",
        data: null
      });
    }
    if (!pageList || !Array.isArray(pageList)) {
      return res.status(400).json({
        code: 400,
        message: "\u9875\u9762\u6743\u9650\u5217\u8868\u4E0D\u80FD\u4E3A\u7A7A",
        data: null
      });
    }
    const currentUser = req.user;
    if (!currentUser || currentUser.roles[0] !== "admin") {
      return res.status(403).json({
        code: 403,
        message: "\u53EA\u6709\u7BA1\u7406\u5458\u53EF\u4EE5\u8BBE\u7F6E\u7528\u6237\u6743\u9650",
        data: null
      });
    }
    const result = await setUserAuthService(account, btnList, pageList);
    return res.json({
      code: 200,
      message: result.message,
      data: null
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u5B58\u5728") ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u8BBE\u7F6E\u7528\u6237\u6743\u9650\u5931\u8D25",
      data: null
    });
  }
}
async function deleteUserController(req, res) {
  try {
    const { account } = req.body;
    if (!account) {
      return res.status(400).json({
        code: 400,
        message: "\u8D26\u53F7\u4E0D\u80FD\u4E3A\u7A7A",
        data: null
      });
    }
    const currentUser = req.user;
    if (!currentUser || currentUser.roles[0] !== "admin") {
      return res.status(403).json({
        code: 403,
        message: "\u53EA\u6709\u7BA1\u7406\u5458\u53EF\u4EE5\u5220\u9664\u7528\u6237",
        data: null
      });
    }
    if (account === currentUser.account) {
      return res.status(400).json({
        code: 400,
        message: "\u4E0D\u80FD\u5220\u9664\u81EA\u5DF1\u7684\u8D26\u53F7",
        data: null
      });
    }
    const result = await deleteUserService(account);
    return res.json({
      code: 200,
      message: result.message,
      data: null
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u5B58\u5728") ? 404 : error.message.includes("\u4E0D\u80FD\u5220\u9664") ? 400 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u5220\u9664\u7528\u6237\u5931\u8D25",
      data: null
    });
  }
}
async function toggleUserStatusController(req, res) {
  try {
    const { account } = req.body;
    if (!account) {
      return res.status(400).json({
        code: 400,
        message: "\u8D26\u53F7\u4E0D\u80FD\u4E3A\u7A7A",
        data: null
      });
    }
    const currentUser = req.user;
    if (!currentUser || currentUser.roles[0] !== "admin") {
      return res.status(403).json({
        code: 403,
        message: "\u53EA\u6709\u7BA1\u7406\u5458\u53EF\u4EE5\u7981\u7528/\u542F\u7528\u7528\u6237",
        data: null
      });
    }
    if (account === currentUser.account) {
      return res.status(400).json({
        code: 400,
        message: "\u4E0D\u80FD\u4FEE\u6539\u81EA\u5DF1\u7684\u8D26\u53F7\u72B6\u6001",
        data: null
      });
    }
    const result = await toggleUserStatusService(account);
    return res.json({
      code: 200,
      message: result.message,
      data: {
        status: result.status
      }
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u5B58\u5728") ? 404 : error.message.includes("\u4E0D\u80FD\u7981\u7528") ? 400 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u64CD\u4F5C\u5931\u8D25",
      data: null
    });
  }
}

// src/middlewares/auth.ts
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "") || req.headers.token;
  if (!token) {
    return res.status(401).json({
      code: 401,
      message: "\u672A\u63D0\u4F9B\u8BA4\u8BC1\u4EE4\u724C",
      data: null
    });
  }
  try {
    const decoded = verifyToken(token);
    req.user = {
      userId: decoded.userId,
      account: decoded.account,
      roles: decoded.roles
    };
    next();
  } catch (error) {
    return res.status(401).json({
      code: 401,
      message: "\u65E0\u6548\u7684\u8BA4\u8BC1\u4EE4\u724C",
      data: null
    });
  }
}

// src/routes/userRoutes.ts
var router = Router();
router.post("/login", loginController);
router.post("/register", registerController);
router.post("/permissionList", authMiddleware, getUserListController);
router.post("/userAuth", authMiddleware, getUserAuthController);
router.post("/setAuth", authMiddleware, setUserAuthController);
router.post("/deleteUser", authMiddleware, deleteUserController);
router.post("/toggleUserStatus", authMiddleware, toggleUserStatusController);
var userRoutes_default = router;

// src/routes/stationRoutes.ts
import { Router as Router2 } from "express";

// src/services/stationService.ts
import { Op as Op2 } from "sequelize";
async function calculateStationStats(stationId) {
  const nowCount = await Pile_default.count({
    where: {
      station_id: stationId,
      status: 2
      // 充电中
    }
  });
  const faultCount = await Pile_default.count({
    where: {
      station_id: stationId,
      status: 6
      // 故障/离线
    }
  });
  return {
    now: nowCount,
    fault: faultCount
  };
}
function formatStationData(station, stats) {
  return {
    id: String(station.id),
    name: station.name,
    city: station.city,
    fast: String(station.fast || 0),
    slow: String(station.slow || 0),
    status: station.status,
    now: String(stats?.now || 0),
    fault: String(stats?.fault || 0),
    person: station.person || "",
    tel: station.tel || ""
  };
}
async function getStationListService(params) {
  const { page = 1, pageSize = 10, name, id, status } = params;
  const where = {};
  if (name) {
    where.name = {
      [Op2.like]: `%${name}%`
    };
  }
  if (id) {
    where.id = parseInt(id);
  }
  if (status && status !== 1) {
    where.status = status;
  }
  const { count, rows } = await Station_default.findAndCountAll({
    where,
    limit: pageSize,
    offset: (page - 1) * pageSize,
    order: [["id", "DESC"]]
  });
  const list = await Promise.all(
    rows.map(async (station) => {
      const stats = await calculateStationStats(station.id);
      return formatStationData(station, stats);
    })
  );
  return {
    list,
    total: count
  };
}
async function getStationByIdService(stationId) {
  const station = await Station_default.findByPk(stationId);
  if (!station) {
    throw new Error("\u5145\u7535\u7AD9\u4E0D\u5B58\u5728");
  }
  const stats = await calculateStationStats(stationId);
  return formatStationData(station, stats);
}
async function createStationService(params) {
  const { name, city, fast, slow, status, person, tel, longitude, latitude } = params;
  if (!name || !city || fast === void 0 || slow === void 0 || !status || !person || !tel) {
    throw new Error("\u5FC5\u586B\u5B57\u6BB5\u4E0D\u80FD\u4E3A\u7A7A");
  }
  const existing = await Station_default.findOne({
    where: { name }
  });
  if (existing) {
    throw new Error("\u7AD9\u70B9\u540D\u79F0\u5DF2\u5B58\u5728");
  }
  const station = await Station_default.create({
    name,
    city,
    fast: parseInt(String(fast)),
    slow: parseInt(String(slow)),
    status,
    person,
    tel,
    longitude: longitude || null,
    latitude: latitude || null,
    now: 0,
    // 初始值，实际会实时计算
    fault: 0
    // 初始值，实际会实时计算
  });
  return {
    id: String(station.id),
    message: "\u5145\u7535\u7AD9\u521B\u5EFA\u6210\u529F"
  };
}
async function updateStationService(stationId, params) {
  const station = await Station_default.findByPk(stationId);
  if (!station) {
    throw new Error("\u5145\u7535\u7AD9\u4E0D\u5B58\u5728");
  }
  if (params.name && params.name !== station.name) {
    const existing = await Station_default.findOne({
      where: {
        name: params.name,
        id: { [Op2.ne]: stationId }
      }
    });
    if (existing) {
      throw new Error("\u7AD9\u70B9\u540D\u79F0\u5DF2\u5B58\u5728");
    }
  }
  const updateData = {};
  if (params.name !== void 0) updateData.name = params.name;
  if (params.city !== void 0) updateData.city = params.city;
  if (params.fast !== void 0) updateData.fast = parseInt(String(params.fast));
  if (params.slow !== void 0) updateData.slow = parseInt(String(params.slow));
  if (params.status !== void 0) updateData.status = params.status;
  if (params.person !== void 0) updateData.person = params.person;
  if (params.tel !== void 0) updateData.tel = params.tel;
  if (params.longitude !== void 0) updateData.longitude = params.longitude;
  if (params.latitude !== void 0) updateData.latitude = params.latitude;
  await Station_default.update(updateData, {
    where: { id: stationId }
  });
  return {
    message: "\u5145\u7535\u7AD9\u66F4\u65B0\u6210\u529F"
  };
}
async function deleteStationService(stationId) {
  const station = await Station_default.findByPk(stationId);
  if (!station) {
    throw new Error("\u5145\u7535\u7AD9\u4E0D\u5B58\u5728");
  }
  const pileCount = await Pile_default.count({
    where: { station_id: stationId }
  });
  if (pileCount > 0) {
    throw new Error(`\u8BE5\u5145\u7535\u7AD9\u4E0B\u8FD8\u6709 ${pileCount} \u4E2A\u5145\u7535\u6869\uFF0C\u65E0\u6CD5\u5220\u9664`);
  }
  const orderCount = await Order_default.count({
    where: { station_id: stationId }
  });
  if (orderCount > 0) {
    throw new Error(`\u8BE5\u5145\u7535\u7AD9\u4E0B\u8FD8\u6709 ${orderCount} \u4E2A\u8BA2\u5355\uFF0C\u65E0\u6CD5\u5220\u9664`);
  }
  await Station_default.destroy({
    where: { id: stationId }
  });
  return {
    message: "\u5145\u7535\u7AD9\u5220\u9664\u6210\u529F"
  };
}

// src/controllers/stationController.ts
async function getStationListController(req, res) {
  try {
    const { page, pageSize, name, id, status } = req.query;
    const params = {
      page: page ? parseInt(String(page)) : 1,
      pageSize: pageSize ? parseInt(String(pageSize)) : 10
    };
    if (name) params.name = name;
    if (id) params.id = id;
    if (status) params.status = parseInt(String(status));
    const result = await getStationListService(params);
    return res.json({
      code: 200,
      message: "\u83B7\u53D6\u6210\u529F",
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message || "\u83B7\u53D6\u5145\u7535\u7AD9\u5217\u8868\u5931\u8D25",
      data: null
    });
  }
}
async function getStationByIdController(req, res) {
  try {
    const { id } = req.params;
    const cleanId = id?.replace(/\/$/, "");
    if (!cleanId) {
      return res.status(400).json({
        code: 400,
        message: "\u7AD9\u70B9ID\u4E0D\u80FD\u4E3A\u7A7A",
        data: null
      });
    }
    const stationId = parseInt(cleanId);
    if (isNaN(stationId)) {
      return res.status(400).json({
        code: 400,
        message: "\u65E0\u6548\u7684\u7AD9\u70B9ID",
        data: null
      });
    }
    const result = await getStationByIdService(stationId);
    return res.json({
      code: 200,
      message: "\u83B7\u53D6\u6210\u529F",
      data: result
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u5B58\u5728") ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u83B7\u53D6\u5145\u7535\u7AD9\u8BE6\u60C5\u5931\u8D25",
      data: null
    });
  }
}
async function createStationController(req, res) {
  try {
    const { name, city, fast, slow, status, person, tel, longitude, latitude } = req.body;
    const result = await createStationService({
      name,
      city,
      fast,
      slow,
      status,
      person,
      tel,
      longitude,
      latitude
    });
    return res.status(201).json({
      code: 201,
      message: result.message,
      data: result
    });
  } catch (error) {
    const statusCode = error.message.includes("\u5DF2\u5B58\u5728") || error.message.includes("\u4E0D\u80FD\u4E3A\u7A7A") ? 400 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u521B\u5EFA\u5145\u7535\u7AD9\u5931\u8D25",
      data: null
    });
  }
}
async function updateStationController(req, res) {
  try {
    const { id } = req.params;
    const cleanId = id?.replace(/\/$/, "");
    if (!cleanId) {
      return res.status(400).json({
        code: 400,
        message: "\u7AD9\u70B9ID\u4E0D\u80FD\u4E3A\u7A7A",
        data: null
      });
    }
    const stationId = parseInt(cleanId);
    if (isNaN(stationId)) {
      return res.status(400).json({
        code: 400,
        message: "\u65E0\u6548\u7684\u7AD9\u70B9ID",
        data: null
      });
    }
    const { name, city, fast, slow, status, person, tel, longitude, latitude } = req.body;
    const result = await updateStationService(stationId, {
      name,
      city,
      fast,
      slow,
      status,
      person,
      tel,
      longitude,
      latitude
    });
    return res.json({
      code: 200,
      message: result.message,
      data: null
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u5B58\u5728") ? 404 : error.message.includes("\u5DF2\u5B58\u5728") ? 400 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u66F4\u65B0\u5145\u7535\u7AD9\u5931\u8D25",
      data: null
    });
  }
}
async function deleteStationController(req, res) {
  try {
    const { id } = req.params;
    const cleanId = id?.replace(/\/$/, "");
    if (!cleanId) {
      return res.status(400).json({
        code: 400,
        message: "\u7AD9\u70B9ID\u4E0D\u80FD\u4E3A\u7A7A",
        data: null
      });
    }
    const stationId = parseInt(cleanId);
    if (isNaN(stationId)) {
      return res.status(400).json({
        code: 400,
        message: "\u65E0\u6548\u7684\u7AD9\u70B9ID",
        data: null
      });
    }
    const result = await deleteStationService(stationId);
    return res.json({
      code: 200,
      message: result.message,
      data: null
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u5B58\u5728") ? 404 : error.message.includes("\u65E0\u6CD5\u5220\u9664") ? 400 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u5220\u9664\u5145\u7535\u7AD9\u5931\u8D25",
      data: null
    });
  }
}

// src/routes/stationRoutes.ts
var router2 = Router2();
router2.get("/", authMiddleware, getStationListController);
router2.post("/", authMiddleware, createStationController);
router2.get("/:id", authMiddleware, getStationByIdController);
router2.put("/:id", authMiddleware, updateStationController);
router2.delete("/:id", authMiddleware, deleteStationController);
var stationRoutes_default = router2;

// src/routes/revenueRoutes.ts
import { Router as Router3 } from "express";

// src/services/revenueService.ts
import { Op as Op3 } from "sequelize";
async function getRevenueChartService() {
  const now = /* @__PURE__ */ new Date();
  const months = [];
  const monthNames = ["\u4E00\u6708", "\u4E8C\u6708", "\u4E09\u6708", "\u56DB\u6708", "\u4E94\u6708", "\u516D\u6708", "\u4E03\u6708", "\u516B\u6708", "\u4E5D\u6708", "\u5341\u6708", "\u5341\u4E00\u6708", "\u5341\u4E8C\u6708"];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(monthNames[date.getMonth()]);
  }
  const salesData = [];
  const visitData = [];
  for (let i = 6; i >= 0; i--) {
    const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    const monthRevenue = await Revenue_default.sum("month", {
      where: {
        day_date: {
          [Op3.between]: [startDate, endDate]
        }
      }
    }) || 0;
    const visitCount = await Revenue_default.count({
      where: {
        day_date: {
          [Op3.between]: [startDate, endDate]
        }
      }
    });
    salesData.push(Number(monthRevenue) / 1e4);
    visitData.push(visitCount * 100);
  }
  return {
    list: [
      {
        name: "\u9500\u552E",
        data: salesData
      },
      {
        name: "\u8BBF\u95EE\u91CF",
        data: visitData
      }
    ]
  };
}
async function getRevenueListService(params) {
  const { page = 1, pageSize = 10, name } = params;
  const where = {};
  if (name) {
    where.name = {
      [Op3.like]: `%${name}%`
    };
  }
  const stations = await Station_default.findAll({
    where: name ? { name: { [Op3.like]: `%${name}%` } } : {},
    limit: pageSize,
    offset: (page - 1) * pageSize,
    order: [["id", "DESC"]]
  });
  const total = await Station_default.count({
    where: name ? { name: { [Op3.like]: `%${name}%` } } : {}
  });
  const list = await Promise.all(
    stations.map(async (station) => {
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      let revenue = await Revenue_default.findOne({
        where: {
          station_id: station.id,
          day_date: {
            [Op3.gte]: today
          }
        },
        order: [["day_date", "DESC"]]
      });
      if (!revenue) {
        revenue = await Revenue_default.findOne({
          where: {
            station_id: station.id
          },
          order: [["day_date", "DESC"]]
        });
      }
      const day = revenue ? Number(revenue.electricity || 0) + Number(revenue.parking_fee || 0) + Number(revenue.service_fee || 0) + Number(revenue.member || 0) : 0;
      const month = revenue ? Number(revenue.month || 0) / 1e4 : 0;
      return {
        name: station.name,
        id: String(station.id),
        city: station.city || "",
        count: (station.fast || 0) + (station.slow || 0),
        // 充电桩总量
        day: Math.round(day * 100) / 100,
        // 单日总收入，保留2位小数
        month: Math.round(month * 100) / 100,
        // 月度总收入（万元），保留2位小数
        electricity: revenue ? Number(revenue.electricity || 0) : 0,
        parkingFee: revenue ? Number(revenue.parking_fee || 0) : 0,
        serviceFee: revenue ? Number(revenue.service_fee || 0) : 0,
        member: revenue ? Number(revenue.member || 0) : 0,
        percent: revenue ? Number(revenue.percent || 0) : 0,
        // 日增长百分比
        mpercent: revenue ? Number(revenue.mpercent || 0) : 0
        // 月增长百分比
      };
    })
  );
  return {
    list,
    total
  };
}

// src/controllers/revenueController.ts
async function getRevenueChartController(req, res) {
  try {
    const result = await getRevenueChartService();
    return res.json({
      code: 200,
      message: "\u83B7\u53D6\u6210\u529F",
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message || "\u83B7\u53D6\u8425\u6536\u56FE\u8868\u6570\u636E\u5931\u8D25",
      data: null
    });
  }
}
async function getRevenueListController(req, res) {
  try {
    const { page, pageSize, name } = req.body;
    const result = await getRevenueListService({
      page: page || 1,
      pageSize: pageSize || 10,
      name: name || ""
    });
    return res.json({
      code: 200,
      message: "\u83B7\u53D6\u6210\u529F",
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message || "\u83B7\u53D6\u8425\u6536\u5217\u8868\u5931\u8D25",
      data: null
    });
  }
}

// src/services/monitorService.ts
async function getCurrentListService() {
  const stations = await Station_default.findAll({
    order: [["id", "ASC"]]
  });
  const result = await Promise.all(
    stations.map(async (station) => {
      const piles = await Pile_default.findAll({
        where: {
          station_id: station.id
        },
        order: [["id", "ASC"]]
      });
      const pileList = await Promise.all(
        piles.map(async (pile) => {
          const records = await Order_default.findAll({
            where: {
              equipment_no: String(pile.id)
            },
            order: [["date", "DESC"]],
            limit: 6
          });
          const recordList = records.map((order) => ({
            time: order.date ? new Date(order.date).toLocaleTimeString("zh-CN", { hour12: false }) : "",
            msg: `\u5145\u7535${order.money ? Number(order.money).toFixed(0) : 0}\u5EA6\uFF0C\u6D88\u8D39${order.money ? Number(order.money).toFixed(0) : 0}\u5143`
          }));
          return {
            id: String(pile.id),
            voltage: pile.voltage ? `${pile.voltage}V` : "0V",
            current: pile.current ? `${pile.current}A` : "0A",
            power: pile.power ? `${pile.power}KW` : "0KW",
            tem: pile.temperature ? `${pile.temperature}\xB0c` : "0\xB0c",
            status: pile.status || 1,
            percent: pile.status === 2 && pile.percent ? `${pile.percent}%` : void 0,
            // 仅在充电中时显示
            record: recordList.length > 0 ? recordList : void 0
            // 有记录时才返回
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

// src/controllers/monitorController.ts
async function getCurrentListController(req, res) {
  try {
    const result = await getCurrentListService();
    return res.json({
      code: 200,
      message: "\u83B7\u53D6\u6210\u529F",
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message || "\u83B7\u53D6\u5145\u7535\u6869\u76D1\u63A7\u5217\u8868\u5931\u8D25",
      data: null
    });
  }
}

// src/routes/revenueRoutes.ts
var router3 = Router3();
router3.get("/revenueChart", authMiddleware, getRevenueChartController);
router3.post("/revenueList", authMiddleware, getRevenueListController);
router3.post("/currentList", authMiddleware, getCurrentListController);
var revenueRoutes_default = router3;

// src/routes/dashboardRoutes.ts
import { Router as Router4 } from "express";

// src/services/dashboardService.ts
import { Op as Op4 } from "sequelize";
async function getElectricityStatsService() {
  const now = /* @__PURE__ */ new Date();
  const hours = [];
  const electricityData = [];
  const chargingData = [];
  for (let i = 8; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 60 * 60 * 1e3);
    hours.push(hour.getHours() + ":00");
    electricityData.push(Math.floor(Math.random() * 50) + 100);
    chargingData.push(Math.floor(Math.random() * 30) + 80);
  }
  return {
    xAxis: hours,
    series: [
      {
        name: "\u603B\u7535\u91CF",
        type: "line",
        smooth: true,
        data: electricityData
      },
      {
        name: "\u5145\u7535\u91CF",
        type: "line",
        smooth: true,
        data: chargingData
      }
    ]
  };
}
async function getRevenueRatioService() {
  const oneMonthAgo = /* @__PURE__ */ new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const revenueStats = await Revenue_default.findAll({
    where: {
      day_date: {
        [Op4.gte]: oneMonthAgo
      }
    },
    attributes: [
      [Revenue_default.sequelize?.fn("SUM", Revenue_default.sequelize?.col("electricity")), "totalElectricity"],
      [Revenue_default.sequelize?.fn("SUM", Revenue_default.sequelize?.col("parking_fee")), "totalParkingFee"],
      [Revenue_default.sequelize?.fn("SUM", Revenue_default.sequelize?.col("service_fee")), "totalServiceFee"],
      [Revenue_default.sequelize?.fn("SUM", Revenue_default.sequelize?.col("member")), "totalMember"]
    ]
  });
  const stats = revenueStats[0];
  const electricityRevenue = Number(stats?.dataValues?.totalElectricity || 0) || 45e3;
  const parkingRevenue = Number(stats?.dataValues?.totalParkingFee || 0) || 12e3;
  const serviceRevenue = Number(stats?.dataValues?.totalServiceFee || 0) || 8e3;
  const memberRevenue = Number(stats?.dataValues?.totalMember || 0) || 15e3;
  return {
    list: [
      { name: "\u7535\u8D39\u6536\u5165", value: electricityRevenue },
      { name: "\u505C\u8F66\u8D39\u6536\u5165", value: parkingRevenue },
      { name: "\u670D\u52A1\u8D39\u6536\u5165", value: serviceRevenue },
      { name: "\u4F1A\u5458\u50A8\u503C", value: memberRevenue }
    ]
  };
}
async function getDeviceOverviewService() {
  const deviceStats = await Pile_default.findAll({
    attributes: [
      "status",
      [Pile_default.sequelize?.fn("COUNT", Pile_default.sequelize?.col("id")), "count"]
    ],
    group: ["status"]
  });
  let idleCount = 0;
  let usingCount = 0;
  let faultCount = 0;
  let repairCount = 0;
  let replaceCount = 0;
  let scrapCount = 0;
  deviceStats.forEach((stat) => {
    const status = stat.dataValues.status;
    const count = Number(stat.dataValues.count);
    switch (status) {
      case 1:
        idleCount = count;
        break;
      case 2:
        usingCount = count;
        break;
      case 3:
        usingCount += count;
        break;
      case 4:
        repairCount = count;
        break;
      case 5:
        replaceCount = count;
        break;
      case 6:
        faultCount = count;
        break;
    }
  });
  const scrapAlarms = await Alarm_default.count({
    where: {
      level: 1,
      // 严重级别
      fault_time: {
        [Op4.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3)
        // 最近30天
      }
    }
  });
  scrapCount = scrapAlarms;
  return {
    list: [idleCount, usingCount, faultCount, repairCount, replaceCount, scrapCount]
  };
}
async function getDeviceStatusService() {
  const totalPiles = await Pile_default.count();
  const usingPiles = await Pile_default.count({
    where: {
      status: {
        [Op4.in]: [2, 3]
        // 充电中或连接中
      }
    }
  });
  const faultPiles = await Pile_default.count({
    where: {
      status: 6
      // 故障/离线
    }
  });
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const todayRevenue = await Revenue_default.sum("day", {
    where: {
      day_date: {
        [Op4.gte]: today
      }
    }
  }) || 0;
  return {
    totalPiles,
    usingPiles,
    faultPiles,
    todayRevenue: Number(todayRevenue)
  };
}

// src/controllers/dashboardController.ts
async function getElectricityStatsController(req, res) {
  try {
    const result = await getElectricityStatsService();
    return res.json({
      code: 200,
      message: "\u83B7\u53D6\u7535\u91CF\u7EDF\u8BA1\u6570\u636E\u6210\u529F",
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message || "\u83B7\u53D6\u7535\u91CF\u7EDF\u8BA1\u6570\u636E\u5931\u8D25",
      data: null
    });
  }
}
async function getRevenueRatioController(req, res) {
  try {
    const result = await getRevenueRatioService();
    return res.json({
      code: 200,
      message: "\u83B7\u53D6\u8425\u6536\u5360\u6BD4\u6570\u636E\u6210\u529F",
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message || "\u83B7\u53D6\u8425\u6536\u5360\u6BD4\u6570\u636E\u5931\u8D25",
      data: null
    });
  }
}
async function getDeviceOverviewController(req, res) {
  try {
    const result = await getDeviceOverviewService();
    return res.json({
      code: 200,
      message: "\u83B7\u53D6\u8BBE\u5907\u603B\u89C8\u6570\u636E\u6210\u529F",
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message || "\u83B7\u53D6\u8BBE\u5907\u603B\u89C8\u6570\u636E\u5931\u8D25",
      data: null
    });
  }
}
async function getDeviceStatusController(req, res) {
  try {
    const result = await getDeviceStatusService();
    return res.json({
      code: 200,
      message: "\u83B7\u53D6\u8BBE\u5907\u72B6\u6001\u7EDF\u8BA1\u6210\u529F",
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message || "\u83B7\u53D6\u8BBE\u5907\u72B6\u6001\u7EDF\u8BA1\u5931\u8D25",
      data: null
    });
  }
}

// src/routes/dashboardRoutes.ts
var router4 = Router4();
router4.get("/electricity-stats", authMiddleware, getElectricityStatsController);
router4.get("/revenue-ratio", authMiddleware, getRevenueRatioController);
router4.get("/device-overview", authMiddleware, getDeviceOverviewController);
router4.get("/device-status", authMiddleware, getDeviceStatusController);
var dashboardRoutes_default = router4;

// src/routes/alarmRoutes.ts
import { Router as Router5 } from "express";

// src/services/alarmService.ts
import { Op as Op5 } from "sequelize";
async function getAlarmListService(params) {
  const { level, page = 1, pageSize = 10, status } = params;
  const where = {};
  if (level && level !== 0) {
    where.level = level;
  }
  if (status && status !== 0) {
    where.status = status;
  }
  try {
    const { rows: alarms, count: total } = await Alarm_default.findAndCountAll({
      where,
      include: [
        {
          model: Station_default,
          as: "station",
          attributes: ["id", "name", "city", "person", "tel"],
          required: true
          // 必须有关联的充电站
        },
        {
          model: Pile_default,
          as: "pile",
          attributes: ["id", "type", "status"],
          required: false
          // 左连接，因为可能是站点级别的报警
        }
      ],
      order: [["fault_time", "DESC"]],
      limit: pageSize,
      offset: (page - 1) * pageSize
    });
    const list = alarms.map((alarm) => {
      const station = alarm.station;
      const pile = alarm.pile;
      return {
        id: alarm.id,
        description: alarm.detail || alarm.title,
        address: `${station?.city || ""}${station?.name || ""}`,
        equNo: pile ? `${pile.id}` : `S${station?.id || ""}`,
        level: alarm.level,
        time: alarm.fault_time ? new Date(alarm.fault_time).toLocaleString("zh-CN", { hour12: false }) : "",
        code: Math.floor(Math.random() * 9e3) + 1e3,
        // 模拟故障代码
        status: alarm.status || 1,
        // 使用真实的status字段
        stationId: station?.id,
        pileId: pile?.id,
        title: alarm.title,
        detail: alarm.detail,
        handler: alarm.handler,
        handle_time: alarm.handle_time,
        handle_note: alarm.handle_note
      };
    });
    return {
      list,
      total
    };
  } catch (error) {
    console.error("\u83B7\u53D6\u62A5\u8B66\u5217\u8868\u5931\u8D25:", error);
    throw new Error("\u83B7\u53D6\u62A5\u8B66\u5217\u8868\u5931\u8D25");
  }
}
async function createAlarmService(params) {
  const { station_id, pile_id, title, detail, level } = params;
  const station = await Station_default.findByPk(station_id);
  if (!station) {
    throw new Error("\u5145\u7535\u7AD9\u4E0D\u5B58\u5728");
  }
  if (pile_id && pile_id > 0) {
    const pile = await Pile_default.findOne({
      where: {
        id: pile_id,
        station_id
      }
    });
    if (!pile) {
      throw new Error("\u5145\u7535\u6869\u4E0D\u5B58\u5728\u6216\u4E0D\u5C5E\u4E8E\u6307\u5B9A\u5145\u7535\u7AD9");
    }
  }
  const alarm = await Alarm_default.create({
    station_id,
    pile_id: pile_id && pile_id > 0 ? pile_id : null,
    title,
    detail,
    level,
    fault_time: /* @__PURE__ */ new Date()
  });
  return {
    id: alarm.id,
    message: "\u62A5\u8B66\u8BB0\u5F55\u521B\u5EFA\u6210\u529F"
  };
}
async function getAlarmDetailService(id) {
  const alarm = await Alarm_default.findByPk(id, {
    include: [
      {
        model: Station_default,
        as: "station",
        attributes: ["id", "name", "city", "person", "tel"]
      },
      {
        model: Pile_default,
        as: "pile",
        attributes: ["id", "type", "status"],
        required: false
      }
    ]
  });
  if (!alarm) {
    throw new Error("\u62A5\u8B66\u8BB0\u5F55\u4E0D\u5B58\u5728");
  }
  const station = alarm.station;
  const pile = alarm.pile;
  return {
    id: alarm.id,
    title: alarm.title,
    detail: alarm.detail,
    level: alarm.level,
    fault_time: alarm.fault_time,
    station: {
      id: station?.id,
      name: station?.name,
      city: station?.city,
      person: station?.person,
      tel: station?.tel
    },
    pile: pile ? {
      id: pile.id,
      type: pile.type,
      status: pile.status
    } : null
  };
}
async function updateAlarmStatusService(params) {
  const { id, status, handler, handle_time, handle_note } = params;
  const alarm = await Alarm_default.findByPk(id);
  if (!alarm) {
    throw new Error("\u62A5\u8B66\u8BB0\u5F55\u4E0D\u5B58\u5728");
  }
  if (![1, 2, 3, 4].includes(status)) {
    throw new Error("\u65E0\u6548\u7684\u5904\u7406\u72B6\u6001\uFF0C\u5FC5\u987B\u4E3A1-4\u4E4B\u95F4\u7684\u6570\u5B57");
  }
  try {
    const currentStatus = alarm.status;
    const updateData = {
      status,
      handler: handler || null,
      handle_time: handle_time || /* @__PURE__ */ new Date(),
      handle_note: handle_note || null
    };
    if (status === 1 && currentStatus !== 1) {
      updateData.urge_count = 0;
      updateData.last_urge_time = null;
    }
    if (status === 2 && currentStatus !== 2) {
      updateData.urge_count = 0;
      updateData.last_urge_time = null;
    }
    await alarm.update(updateData);
    return {
      message: "\u62A5\u8B66\u72B6\u6001\u66F4\u65B0\u6210\u529F"
    };
  } catch (error) {
    console.error("\u66F4\u65B0\u62A5\u8B66\u72B6\u6001\u5931\u8D25:", error);
    throw new Error("\u66F4\u65B0\u62A5\u8B66\u72B6\u6001\u5931\u8D25");
  }
}
async function getAlarmStatsService() {
  const levelStats = await Alarm_default.findAll({
    attributes: [
      "level",
      [Alarm_default.sequelize.fn("COUNT", Alarm_default.sequelize.col("id")), "count"]
    ],
    where: {
      fault_time: {
        [Op5.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3)
        // 最近30天
      }
    },
    group: ["level"]
  });
  const stats = {
    severe: 0,
    // 严重
    urgent: 0,
    // 紧急
    important: 0,
    // 重要
    general: 0
    // 一般
  };
  levelStats.forEach((stat) => {
    const level = stat.dataValues.level;
    const count = Number(stat.dataValues.count);
    switch (level) {
      case 1:
        stats.severe = count;
        break;
      case 2:
        stats.urgent = count;
        break;
      case 3:
        stats.important = count;
        break;
      case 4:
        stats.general = count;
        break;
    }
  });
  return stats;
}
async function assignAlarmTaskService(params) {
  const { alarmId, basicInfo, approvalInfo, responsibleInfo } = params;
  const alarm = await Alarm_default.findByPk(alarmId);
  if (!alarm) {
    throw new Error("\u62A5\u8B66\u8BB0\u5F55\u4E0D\u5B58\u5728");
  }
  const currentStatus = alarm.status;
  if (currentStatus !== 1 && currentStatus !== 4) {
    throw new Error('\u8BE5\u62A5\u8B66\u4EFB\u52A1\u5F53\u524D\u72B6\u6001\u4E0D\u5141\u8BB8\u6307\u6D3E\uFF0C\u53EA\u80FD\u4ECE"\u5F85\u6307\u6D3E"\u6216"\u5904\u7406\u5F02\u5E38"\u72B6\u6001\u8FDB\u884C\u6307\u6D3E');
  }
  try {
    const handleNote = `
\u6307\u6D3E\u4FE1\u606F\uFF1A
- \u5904\u7406\u4EBA\u5458\uFF1A${basicInfo.name} (\u5DE5\u53F7\uFF1A${basicInfo.no})
- \u8054\u7CFB\u65B9\u5F0F\uFF1A${basicInfo.tel} / ${basicInfo.email}
- \u662F\u5426\u52A0\u6025\uFF1A${basicInfo.urgent ? "\u662F" : "\u5426"}
- \u5904\u7406\u8981\u6C42\uFF1A${basicInfo.other.join(", ")}
- \u5907\u6CE8\uFF1A${basicInfo.remarks || "\u65E0"}

\u5BA1\u6279\u4FE1\u606F\uFF1A
- \u5BA1\u6279\u90E8\u95E8\uFF1A${getDeptName(approvalInfo.approvalDept)}
- \u6284\u9001\u90E8\u95E8\uFF1A${getDeptName(approvalInfo.ccDept)}

\u8D1F\u8D23\u4EBA\u4FE1\u606F\uFF1A
- \u8D1F\u8D23\u4EBA\uFF1A${responsibleInfo.person}
- \u8054\u7CFB\u7535\u8BDD\uFF1A${responsibleInfo.tel}
    `.trim();
    await alarm.update({
      status: 2,
      // 处理中
      handler: basicInfo.name,
      handle_time: /* @__PURE__ */ new Date(),
      handle_note: handleNote,
      urge_count: 0,
      // 清零催办次数，新的处理周期
      last_urge_time: null
      // 清空最后催办时间
    });
    return {
      message: "\u62A5\u8B66\u4EFB\u52A1\u6307\u6D3E\u6210\u529F",
      assignInfo: {
        handler: basicInfo.name,
        urgent: basicInfo.urgent,
        responsible: responsibleInfo.person
      }
    };
  } catch (error) {
    console.error("\u6307\u6D3E\u62A5\u8B66\u4EFB\u52A1\u5931\u8D25:", error);
    throw new Error("\u6307\u6D3E\u62A5\u8B66\u4EFB\u52A1\u5931\u8D25");
  }
}
async function urgeAlarmTaskService(params) {
  const { alarmId, urgeNote } = params;
  const alarm = await Alarm_default.findByPk(alarmId);
  if (!alarm) {
    throw new Error("\u62A5\u8B66\u8BB0\u5F55\u4E0D\u5B58\u5728");
  }
  const currentStatus = alarm.status;
  if (currentStatus !== 2) {
    throw new Error("\u8BE5\u62A5\u8B66\u4EFB\u52A1\u5F53\u524D\u72B6\u6001\u4E0D\u5141\u8BB8\u50AC\u529E");
  }
  try {
    const currentUrgeCount = alarm.urge_count || 0;
    const newUrgeCount = currentUrgeCount + 1;
    const urgeTime = /* @__PURE__ */ new Date();
    const currentNote = alarm.handle_note || "";
    const urgeRecord = `

[\u50AC\u529E\u8BB0\u5F55 ${newUrgeCount} - ${urgeTime.toLocaleString("zh-CN", { hour12: false })}]
${urgeNote || "\u8BF7\u52A0\u5FEB\u5904\u7406\u8FDB\u5EA6"}`;
    const updatedNote = currentNote + urgeRecord;
    await alarm.update({
      urge_count: newUrgeCount,
      last_urge_time: urgeTime,
      handle_note: updatedNote
    });
    return {
      message: `\u50AC\u529E\u6210\u529F\uFF0C\u5DF2\u901A\u77E5\u5904\u7406\u4EBA\u5458\uFF08\u7B2C${newUrgeCount}\u6B21\u50AC\u529E\uFF09`,
      urgeTime: urgeTime.toLocaleString("zh-CN", { hour12: false }),
      urgeCount: newUrgeCount
    };
  } catch (error) {
    console.error("\u50AC\u529E\u62A5\u8B66\u4EFB\u52A1\u5931\u8D25:", error);
    throw new Error("\u50AC\u529E\u62A5\u8B66\u4EFB\u52A1\u5931\u8D25");
  }
}
async function markAlarmExceptionService(alarmId, exceptionNote) {
  const alarm = await Alarm_default.findByPk(alarmId);
  if (!alarm) {
    throw new Error("\u62A5\u8B66\u8BB0\u5F55\u4E0D\u5B58\u5728");
  }
  const currentStatus = alarm.status;
  if (currentStatus !== 2) {
    throw new Error('\u8BE5\u62A5\u8B66\u4EFB\u52A1\u5F53\u524D\u72B6\u6001\u4E0D\u5141\u8BB8\u6807\u8BB0\u4E3A\u5F02\u5E38\uFF0C\u53EA\u80FD\u4ECE"\u5904\u7406\u4E2D"\u72B6\u6001\u6807\u8BB0');
  }
  try {
    const currentNote = alarm.handle_note || "";
    const exceptionRecord = `

[\u6807\u8BB0\u5F02\u5E38 - ${(/* @__PURE__ */ new Date()).toLocaleString("zh-CN", { hour12: false })}]
${exceptionNote || "\u5904\u7406\u8FC7\u7A0B\u4E2D\u9047\u5230\u5F02\u5E38\uFF0C\u9700\u8981\u534F\u8C03\u6216\u91CD\u65B0\u6307\u6D3E"}`;
    const updatedNote = currentNote + exceptionRecord;
    await alarm.update({
      status: 4,
      // 处理异常
      handle_note: updatedNote
      // 注意：不修改 urge_count 和 last_urge_time，保留历史记录
    });
    return {
      message: "\u62A5\u8B66\u4EFB\u52A1\u5DF2\u6807\u8BB0\u4E3A\u5904\u7406\u5F02\u5E38",
      exceptionTime: (/* @__PURE__ */ new Date()).toLocaleString("zh-CN", { hour12: false })
    };
  } catch (error) {
    console.error("\u6807\u8BB0\u62A5\u8B66\u5F02\u5E38\u5931\u8D25:", error);
    throw new Error("\u6807\u8BB0\u62A5\u8B66\u5F02\u5E38\u5931\u8D25");
  }
}
async function completeAlarmTaskService(alarmId, completionNote) {
  const alarm = await Alarm_default.findByPk(alarmId);
  if (!alarm) {
    throw new Error("\u62A5\u8B66\u8BB0\u5F55\u4E0D\u5B58\u5728");
  }
  const currentStatus = alarm.status;
  if (currentStatus !== 2) {
    throw new Error("\u8BE5\u62A5\u8B66\u4EFB\u52A1\u5F53\u524D\u72B6\u6001\u4E0D\u5141\u8BB8\u5B8C\u6210");
  }
  try {
    const currentNote = alarm.handle_note || "";
    const completionRecord = `

[\u4EFB\u52A1\u5B8C\u6210 - ${(/* @__PURE__ */ new Date()).toLocaleString("zh-CN", { hour12: false })}]
${completionNote || "\u4EFB\u52A1\u5DF2\u5B8C\u6210\u5904\u7406"}`;
    const updatedNote = currentNote + completionRecord;
    await alarm.update({
      status: 3,
      // 已处理
      handle_note: updatedNote
      // 注意：不修改 urge_count 和 last_urge_time，保留历史记录
    });
    return {
      message: "\u62A5\u8B66\u4EFB\u52A1\u5904\u7406\u5B8C\u6210",
      completionTime: (/* @__PURE__ */ new Date()).toLocaleString("zh-CN", { hour12: false })
    };
  } catch (error) {
    console.error("\u5B8C\u6210\u62A5\u8B66\u4EFB\u52A1\u5931\u8D25:", error);
    throw new Error("\u5B8C\u6210\u62A5\u8B66\u4EFB\u52A1\u5931\u8D25");
  }
}
async function getAlarmUrgeCountService(alarmId) {
  const alarm = await Alarm_default.findByPk(alarmId);
  if (!alarm) {
    throw new Error("\u62A5\u8B66\u8BB0\u5F55\u4E0D\u5B58\u5728");
  }
  const urgeCount = alarm.urge_count || 0;
  const lastUrgeTime = alarm.last_urge_time;
  return {
    alarmId,
    urgeCount,
    canUrge: alarm.status === 2,
    // 只有处理中状态才能催办
    lastUrgeTime: lastUrgeTime ? new Date(lastUrgeTime).toLocaleString("zh-CN", { hour12: false }) : null
  };
}
function getDeptName(deptId) {
  const deptMap = {
    "1": "\u603B\u88C1\u529E",
    "2": "\u8FD0\u8425\u90E8",
    "3": "\u7EF4\u4FEE\u90E8",
    "4": "\u5E02\u573A\u90E8",
    "5": "\u8D22\u52A1\u90E8"
  };
  return deptMap[deptId] || "\u672A\u77E5\u90E8\u95E8";
}

// src/controllers/alarmController.ts
async function getAlarmListController(req, res) {
  try {
    const { level, page, pageSize, status } = req.query;
    const result = await getAlarmListService({
      level: level ? parseInt(level) : 0,
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 10,
      status: status ? parseInt(status) : 0
    });
    return res.json({
      code: 200,
      message: "\u83B7\u53D6\u62A5\u8B66\u5217\u8868\u6210\u529F",
      data: result
    });
  } catch (error) {
    console.error("\u83B7\u53D6\u62A5\u8B66\u5217\u8868\u63A7\u5236\u5668\u9519\u8BEF:", error);
    return res.status(500).json({
      code: 500,
      message: error.message || "\u83B7\u53D6\u62A5\u8B66\u5217\u8868\u5931\u8D25",
      data: null
    });
  }
}
async function getAlarmDetailController(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        code: 400,
        message: "\u62A5\u8B66ID\u4E0D\u80FD\u4E3A\u7A7A",
        data: null
      });
    }
    const result = await getAlarmDetailService(parseInt(id));
    return res.json({
      code: 200,
      message: "\u83B7\u53D6\u62A5\u8B66\u8BE6\u60C5\u6210\u529F",
      data: result
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u5B58\u5728") ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u83B7\u53D6\u62A5\u8B66\u8BE6\u60C5\u5931\u8D25",
      data: null
    });
  }
}
async function createAlarmController(req, res) {
  try {
    const { station_id, pile_id, title, detail, level } = req.body;
    if (!station_id || !title || !detail || !level) {
      return res.status(400).json({
        code: 400,
        message: "\u5145\u7535\u7AD9ID\u3001\u6807\u9898\u3001\u8BE6\u60C5\u548C\u7EA7\u522B\u4E0D\u80FD\u4E3A\u7A7A",
        data: null
      });
    }
    if (![1, 2, 3, 4].includes(level)) {
      return res.status(400).json({
        code: 400,
        message: "\u62A5\u8B66\u7EA7\u522B\u5FC5\u987B\u4E3A1-4\u4E4B\u95F4\u7684\u6570\u5B57",
        data: null
      });
    }
    const result = await createAlarmService({
      station_id: parseInt(station_id),
      pile_id: pile_id ? parseInt(pile_id) : 0,
      title,
      detail,
      level: parseInt(level)
    });
    return res.status(201).json({
      code: 201,
      message: result.message,
      data: { id: result.id }
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u5B58\u5728") ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u521B\u5EFA\u62A5\u8B66\u8BB0\u5F55\u5931\u8D25",
      data: null
    });
  }
}
async function updateAlarmStatusController(req, res) {
  try {
    const { id } = req.params;
    const { status, handler, handle_note } = req.body;
    if (!id) {
      return res.status(400).json({
        code: 400,
        message: "\u62A5\u8B66ID\u4E0D\u80FD\u4E3A\u7A7A",
        data: null
      });
    }
    if (!status) {
      return res.status(400).json({
        code: 400,
        message: "\u5904\u7406\u72B6\u6001\u4E0D\u80FD\u4E3A\u7A7A",
        data: null
      });
    }
    const result = await updateAlarmStatusService({
      id: parseInt(id),
      status: parseInt(status),
      handler,
      handle_time: /* @__PURE__ */ new Date(),
      handle_note
    });
    return res.json({
      code: 200,
      message: result.message,
      data: null
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u5B58\u5728") ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u66F4\u65B0\u62A5\u8B66\u72B6\u6001\u5931\u8D25",
      data: null
    });
  }
}
async function getAlarmStatsController(req, res) {
  try {
    const result = await getAlarmStatsService();
    return res.json({
      code: 200,
      message: "\u83B7\u53D6\u62A5\u8B66\u7EDF\u8BA1\u6210\u529F",
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message || "\u83B7\u53D6\u62A5\u8B66\u7EDF\u8BA1\u5931\u8D25",
      data: null
    });
  }
}
async function assignAlarmTaskController(req, res) {
  try {
    const { id } = req.params;
    const { basicInfo, approvalInfo, responsibleInfo } = req.body;
    if (!id) {
      return res.status(400).json({
        code: 400,
        message: "\u62A5\u8B66ID\u4E0D\u80FD\u4E3A\u7A7A",
        data: null
      });
    }
    if (!basicInfo?.name || !basicInfo?.tel || !basicInfo?.no || !responsibleInfo?.person || !responsibleInfo?.tel) {
      return res.status(400).json({
        code: 400,
        message: "\u57FA\u672C\u4FE1\u606F\u548C\u8D1F\u8D23\u4EBA\u4FE1\u606F\u4E0D\u80FD\u4E3A\u7A7A",
        data: null
      });
    }
    const result = await assignAlarmTaskService({
      alarmId: parseInt(id),
      basicInfo,
      approvalInfo: approvalInfo || { approvalDept: "", ccDept: "" },
      responsibleInfo
    });
    return res.json({
      code: 200,
      message: result.message,
      data: result.assignInfo
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u5B58\u5728") ? 404 : error.message.includes("\u4E0D\u5141\u8BB8") ? 400 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u6307\u6D3E\u62A5\u8B66\u4EFB\u52A1\u5931\u8D25",
      data: null
    });
  }
}
async function urgeAlarmTaskController(req, res) {
  try {
    const { id } = req.params;
    const { urgeNote } = req.body;
    if (!id) {
      return res.status(400).json({
        code: 400,
        message: "\u62A5\u8B66ID\u4E0D\u80FD\u4E3A\u7A7A",
        data: null
      });
    }
    const result = await urgeAlarmTaskService({
      alarmId: parseInt(id),
      urgeNote
    });
    return res.json({
      code: 200,
      message: result.message,
      data: {
        urgeTime: result.urgeTime,
        urgeCount: result.urgeCount
      }
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u5B58\u5728") ? 404 : error.message.includes("\u4E0D\u5141\u8BB8") ? 400 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u50AC\u529E\u62A5\u8B66\u4EFB\u52A1\u5931\u8D25",
      data: null
    });
  }
}
async function markAlarmExceptionController(req, res) {
  try {
    const { id } = req.params;
    const { exceptionNote } = req.body;
    if (!id) {
      return res.status(400).json({
        code: 400,
        message: "\u62A5\u8B66ID\u4E0D\u80FD\u4E3A\u7A7A",
        data: null
      });
    }
    const result = await markAlarmExceptionService(parseInt(id), exceptionNote);
    return res.json({
      code: 200,
      message: result.message,
      data: { exceptionTime: result.exceptionTime }
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u5B58\u5728") ? 404 : error.message.includes("\u4E0D\u5141\u8BB8") ? 400 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u6807\u8BB0\u62A5\u8B66\u5F02\u5E38\u5931\u8D25",
      data: null
    });
  }
}
async function completeAlarmTaskController(req, res) {
  try {
    const { id } = req.params;
    const { completionNote } = req.body;
    if (!id) {
      return res.status(400).json({
        code: 400,
        message: "\u62A5\u8B66ID\u4E0D\u80FD\u4E3A\u7A7A",
        data: null
      });
    }
    const result = await completeAlarmTaskService(parseInt(id), completionNote);
    return res.json({
      code: 200,
      message: result.message,
      data: { completionTime: result.completionTime }
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u5B58\u5728") ? 404 : error.message.includes("\u4E0D\u5141\u8BB8") ? 400 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u5B8C\u6210\u62A5\u8B66\u4EFB\u52A1\u5931\u8D25",
      data: null
    });
  }
}
async function getAlarmUrgeCountController(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        code: 400,
        message: "\u62A5\u8B66ID\u4E0D\u80FD\u4E3A\u7A7A",
        data: null
      });
    }
    const result = await getAlarmUrgeCountService(parseInt(id));
    return res.json({
      code: 200,
      message: "\u83B7\u53D6\u50AC\u529E\u4FE1\u606F\u6210\u529F",
      data: result
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u5B58\u5728") ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u83B7\u53D6\u50AC\u529E\u4FE1\u606F\u5931\u8D25",
      data: null
    });
  }
}

// src/routes/alarmRoutes.ts
var router5 = Router5();
router5.get("/", authMiddleware, getAlarmListController);
router5.get("/alarmList", authMiddleware, getAlarmListController);
router5.get("/stats", authMiddleware, getAlarmStatsController);
router5.get("/:id/urge-count", authMiddleware, getAlarmUrgeCountController);
router5.get("/:id", authMiddleware, getAlarmDetailController);
router5.post("/", authMiddleware, createAlarmController);
router5.post("/:id/assign", authMiddleware, assignAlarmTaskController);
router5.post("/:id/urge", authMiddleware, urgeAlarmTaskController);
router5.post("/:id/exception", authMiddleware, markAlarmExceptionController);
router5.post("/:id/complete", authMiddleware, completeAlarmTaskController);
router5.put("/:id/status", authMiddleware, updateAlarmStatusController);
var alarmRoutes_default = router5;

// src/routes/memberCardRoutes.ts
import { Router as Router6 } from "express";

// src/services/memberCardService.ts
import { Op as Op6 } from "sequelize";
async function getMemberCardListService(params) {
  const { page = 1, pageSize = 10, no, tel, name } = params;
  const where = {};
  if (no && typeof no === "string" && no.trim()) {
    where.member_card_no = { [Op6.like]: `%${no.trim()}%` };
  }
  if (tel && typeof tel === "string" && tel.trim()) {
    where.phone = { [Op6.like]: `%${tel.trim()}%` };
  }
  if (name && typeof name === "string" && name.trim()) {
    where.name = { [Op6.like]: `%${name.trim()}%` };
  }
  try {
    const { rows: users, count: total } = await ChargingUser_default.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [["created_at", "DESC"]]
    });
    const list = await Promise.all(
      users.map(async (user) => {
        const orders = await Order_default.findAll({
          where: {
            user_id: user.id,
            status: 3
            // 只统计已完成的订单
          },
          order: [["date", "DESC"]],
          limit: 5,
          attributes: ["date", "money", "pay"]
        });
        const transactionRecords = orders.map((order) => {
          let transactionType = "\u5176\u4ED6";
          if (order.pay === "\u4F1A\u5458\u5361") {
            transactionType = "\u5145\u7535\u6263\u6B3E";
          } else if (order.pay?.includes("\u670D\u52A1\u8D39")) {
            transactionType = "\u670D\u52A1\u8D39\u6263\u6B3E";
          } else if (order.pay?.includes("\u505C\u8F66")) {
            transactionType = "\u505C\u8F66\u8D39\u6263\u6B3E";
          }
          return {
            transactionDate: order.date ? new Date(order.date).toLocaleDateString("zh-CN") : "",
            transactionAmount: Number(order.money || 0).toFixed(2),
            transactionType
          };
        });
        return {
          memberCardNumber: user.member_card_no || "",
          cardType: user.card_type || "\u666E\u901A\u5361",
          issueDate: user.issue_date ? new Date(user.issue_date).toLocaleDateString("zh-CN") : user.created_at ? new Date(user.created_at).toLocaleDateString("zh-CN") : "",
          holderName: user.name || "",
          holderPhone: user.phone || "",
          cardBalance: Number(user.balance || 0).toFixed(2),
          transactionRecords,
          validUntil: user.valid_until ? new Date(user.valid_until).toLocaleDateString("zh-CN") : ""
        };
      })
    );
    return {
      list,
      total
    };
  } catch (error) {
    console.error("\u83B7\u53D6\u4F1A\u5458\u5361\u5217\u8868\u5931\u8D25:", error);
    throw new Error("\u83B7\u53D6\u4F1A\u5458\u5361\u5217\u8868\u5931\u8D25");
  }
}
async function getMemberCardDetailService(memberCardNo) {
  const user = await ChargingUser_default.findOne({
    where: { member_card_no: memberCardNo }
  });
  if (!user) {
    throw new Error("\u4F1A\u5458\u5361\u4E0D\u5B58\u5728");
  }
  const orders = await Order_default.findAll({
    where: {
      user_id: user.id,
      status: 3
      // 只统计已完成的订单
    },
    order: [["date", "DESC"]],
    attributes: ["order_no", "date", "money", "pay", "station_id"]
  });
  const transactionRecords = orders.map((order) => {
    let transactionType = "\u5176\u4ED6";
    if (order.pay === "\u4F1A\u5458\u5361") {
      transactionType = "\u5145\u7535\u6263\u6B3E";
    } else if (order.pay?.includes("\u670D\u52A1\u8D39")) {
      transactionType = "\u670D\u52A1\u8D39\u6263\u6B3E";
    } else if (order.pay?.includes("\u505C\u8F66")) {
      transactionType = "\u505C\u8F66\u8D39\u6263\u6B3E";
    }
    return {
      transactionDate: order.date ? new Date(order.date).toLocaleDateString("zh-CN") : "",
      transactionAmount: Number(order.money || 0).toFixed(2),
      transactionType,
      orderNo: order.order_no
    };
  });
  return {
    memberCardNumber: user.member_card_no || "",
    cardType: user.card_type || "\u666E\u901A\u5361",
    issueDate: user.issue_date ? new Date(user.issue_date).toLocaleDateString("zh-CN") : user.created_at ? new Date(user.created_at).toLocaleDateString("zh-CN") : "",
    holderName: user.name || "",
    holderPhone: user.phone || "",
    cardBalance: Number(user.balance || 0).toFixed(2),
    transactionRecords,
    validUntil: user.valid_until ? new Date(user.valid_until).toLocaleDateString("zh-CN") : "",
    idNo: user.id_no || "",
    status: user.status
  };
}

// src/controllers/memberCardController.ts
async function getMemberCardListController(req, res) {
  try {
    const { page, pageSize, no, tel, name } = req.body;
    const params = {
      page: page && !isNaN(Number(page)) ? Number(page) : 1,
      pageSize: pageSize && !isNaN(Number(pageSize)) ? Number(pageSize) : 10
    };
    if (no && typeof no === "string" && no.trim()) {
      params.no = no.trim();
    }
    if (tel && typeof tel === "string" && tel.trim()) {
      params.tel = tel.trim();
    }
    if (name && typeof name === "string" && name.trim()) {
      params.name = name.trim();
    }
    const result = await getMemberCardListService(params);
    return res.json({
      code: 200,
      message: "\u83B7\u53D6\u4F1A\u5458\u5361\u5217\u8868\u6210\u529F",
      data: result
    });
  } catch (error) {
    console.error("\u83B7\u53D6\u4F1A\u5458\u5361\u5217\u8868\u63A7\u5236\u5668\u9519\u8BEF:", error);
    return res.status(500).json({
      code: 500,
      message: error.message || "\u83B7\u53D6\u4F1A\u5458\u5361\u5217\u8868\u5931\u8D25",
      data: null
    });
  }
}
async function getMemberCardDetailController(req, res) {
  try {
    const { cardNo } = req.params;
    if (!cardNo) {
      return res.status(400).json({
        code: 400,
        message: "\u4F1A\u5458\u5361\u53F7\u4E0D\u80FD\u4E3A\u7A7A",
        data: null
      });
    }
    const result = await getMemberCardDetailService(cardNo);
    return res.json({
      code: 200,
      message: "\u83B7\u53D6\u4F1A\u5458\u5361\u8BE6\u60C5\u6210\u529F",
      data: result
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u5B58\u5728") ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u83B7\u53D6\u4F1A\u5458\u5361\u8BE6\u60C5\u5931\u8D25",
      data: null
    });
  }
}

// src/routes/memberCardRoutes.ts
var router6 = Router6();
router6.post("/", authMiddleware, getMemberCardListController);
router6.get("/:cardNo", authMiddleware, getMemberCardDetailController);
var memberCardRoutes_default = router6;

// src/routes/orderRoutes.ts
import { Router as Router7 } from "express";

// src/services/orderService.ts
import { Op as Op7 } from "sequelize";
async function getOrderListService(params) {
  const {
    page = 1,
    pageSize = 10,
    orderNo,
    status,
    equipmentNo,
    stationName,
    startDate,
    endDate
  } = params;
  const where = {};
  if (orderNo && typeof orderNo === "string" && orderNo.trim()) {
    where.order_no = { [Op7.like]: `%${orderNo.trim()}%` };
  }
  if (status && status !== 1) {
    where.status = status;
  }
  if (equipmentNo && typeof equipmentNo === "string" && equipmentNo.trim()) {
    where.equipment_no = { [Op7.like]: `%${equipmentNo.trim()}%` };
  }
  if (startDate && endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    where.date = {
      [Op7.between]: [start, end]
    };
  }
  const include = [];
  if (stationName && typeof stationName === "string" && stationName.trim()) {
    include.push({
      model: Station_default,
      as: "station",
      attributes: ["id", "name", "city"],
      where: {
        name: { [Op7.like]: `%${stationName.trim()}%` }
      },
      required: true
      // 内连接，必须有关联的充电站
    });
  } else {
    include.push({
      model: Station_default,
      as: "station",
      attributes: ["id", "name", "city", "person", "tel"],
      required: false
    });
  }
  try {
    const { rows: orders, count: total } = await Order_default.findAndCountAll({
      where,
      include,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [["date", "DESC"]]
    });
    const list = orders.map((order) => {
      const station = order.station;
      return {
        orderNo: order.order_no,
        equipmentNo: order.equipment_no || "",
        date: order.date ? new Date(order.date).toLocaleDateString("zh-CN") : "",
        startTime: order.start_time ? new Date(order.start_time).toLocaleTimeString("zh-CN", {
          hour12: false
        }) : "",
        endTime: order.end_time ? new Date(order.end_time).toLocaleTimeString("zh-CN", {
          hour12: false
        }) : "",
        money: Number(order.money || 0).toFixed(2),
        pay: order.pay || "",
        status: order.status,
        stationName: station?.name || ""
      };
    });
    return {
      list,
      total
    };
  } catch (error) {
    console.error("\u83B7\u53D6\u8BA2\u5355\u5217\u8868\u5931\u8D25:", error);
    throw new Error("\u83B7\u53D6\u8BA2\u5355\u5217\u8868\u5931\u8D25");
  }
}
async function batchDeleteOrdersService(orderNos) {
  if (!orderNos || orderNos.length === 0) {
    throw new Error("\u8BA2\u5355\u53F7\u5217\u8868\u4E0D\u80FD\u4E3A\u7A7A");
  }
  try {
    const result = await Order_default.destroy({
      where: {
        order_no: {
          [Op7.in]: orderNos
        }
      }
    });
    if (result === 0) {
      throw new Error("\u6CA1\u6709\u627E\u5230\u8981\u5220\u9664\u7684\u8BA2\u5355");
    }
    return {
      message: `\u6210\u529F\u5220\u9664 ${result} \u6761\u8BA2\u5355`,
      deletedCount: result
    };
  } catch (error) {
    console.error("\u6279\u91CF\u5220\u9664\u8BA2\u5355\u5931\u8D25:", error);
    throw new Error("\u6279\u91CF\u5220\u9664\u8BA2\u5355\u5931\u8D25");
  }
}
async function getOrderDetailService(orderNo) {
  const order = await Order_default.findOne({
    where: { order_no: orderNo },
    include: [
      {
        model: Station_default,
        as: "station",
        attributes: ["id", "name", "city", "person", "tel"],
        required: false
      },
      {
        model: ChargingUser_default,
        as: "chargingUser",
        attributes: ["id", "name", "phone"],
        required: false
      }
    ]
  });
  if (!order) {
    throw new Error("\u8BA2\u5355\u4E0D\u5B58\u5728");
  }
  const station = order.station;
  const user = order.chargingUser;
  let chargeDuration = 0;
  if (order.start_time && order.end_time) {
    const start = new Date(order.start_time);
    const end = new Date(order.end_time);
    chargeDuration = (end.getTime() - start.getTime()) / (1e3 * 60 * 60);
  }
  const totalMoney = Number(order.money || 0);
  const electricityFee = totalMoney * 0.85;
  const serviceFee = totalMoney * 0.1;
  const parkingFee = totalMoney * 0.05;
  const chargeAmount = (electricityFee / 0.8).toFixed(2);
  let chargeDevice = "\u5145\u7535\u6869(\u5FEB\u5145)";
  if (order.equipment_no) {
    try {
      const pileMatch = order.equipment_no.match(/PILE(\d+)/);
      if (pileMatch) {
        const pileId = parseInt(pileMatch[1]);
        const pile = await Pile_default.findByPk(pileId);
        if (pile) {
          chargeDevice = `\u5145\u7535\u6869(${pile.type || "\u5FEB\u5145"})`;
        }
      }
    } catch (error) {
      console.error("\u83B7\u53D6\u5145\u7535\u6869\u4FE1\u606F\u5931\u8D25:", error);
    }
  }
  const maintenancePerson = {
    name: "\u5218\u6765",
    tel: "17777777777"
  };
  return {
    orderNo: order.order_no,
    equipmentNo: order.equipment_no || "",
    date: order.date ? new Date(order.date).toLocaleDateString("zh-CN") : "",
    startTime: order.start_time ? new Date(order.start_time).toLocaleTimeString("zh-CN", {
      hour12: false
    }) : "",
    endTime: order.end_time ? new Date(order.end_time).toLocaleTimeString("zh-CN", {
      hour12: false
    }) : "",
    money: totalMoney.toFixed(2),
    pay: order.pay || "",
    status: order.status,
    stationName: station?.name || "",
    city: station?.city || "",
    chargeAmount,
    // 充电量（度）
    chargeDevice,
    // 充电设备
    chargeDuration: chargeDuration.toFixed(2),
    // 充电总时长（小时）
    person: station?.person || "",
    // 负责人姓名
    tel: station?.tel || "",
    // 负责人电话
    maintenancePersonName: maintenancePerson.name,
    // 维保人员姓名
    maintenancePersonTel: maintenancePerson.tel,
    // 维保人员电话
    serviceFee: serviceFee.toFixed(2),
    // 服务费
    parkingFee: parkingFee.toFixed(2),
    // 停车费
    electricityFee: electricityFee.toFixed(2),
    // 电费
    feeInfo: "\u7535\u8D39+\u670D\u52A1\u8D39+\u505C\u8F66\u8D39\uFF0C\u9AD8\u5CF0\u65F6\u6BB5\u8D39\u7528\u4E3A2.3\u5143/\u5EA6\uFF0C\u505C\u8F66\u8D392\u5143/\u5C0F\u65F6\uFF0C\u670D\u52A1\u8D395\u5143/\u6B21",
    remark: "\u6682\u65E0"
  };
}

// src/controllers/orderController.ts
async function getOrderListController(req, res) {
  try {
    const {
      page,
      pageSize,
      orderNo,
      status,
      no,
      name,
      startDate,
      endDate
    } = req.body;
    const params = {
      page: page && !isNaN(Number(page)) ? Number(page) : 1,
      pageSize: pageSize && !isNaN(Number(pageSize)) ? Number(pageSize) : 10
    };
    if (orderNo && typeof orderNo === "string" && orderNo.trim()) {
      params.orderNo = orderNo.trim();
    }
    if (status && !isNaN(Number(status))) {
      params.status = Number(status);
    }
    if (no && typeof no === "string" && no.trim()) {
      params.equipmentNo = no.trim();
    }
    if (name && typeof name === "string" && name.trim()) {
      params.stationName = name.trim();
    }
    if (startDate && typeof startDate === "string" && startDate.trim()) {
      params.startDate = startDate.trim();
    }
    if (endDate && typeof endDate === "string" && endDate.trim()) {
      params.endDate = endDate.trim();
    }
    const result = await getOrderListService(params);
    return res.json({
      code: 200,
      message: "\u83B7\u53D6\u8BA2\u5355\u5217\u8868\u6210\u529F",
      data: result
    });
  } catch (error) {
    console.error("\u83B7\u53D6\u8BA2\u5355\u5217\u8868\u63A7\u5236\u5668\u9519\u8BEF:", error);
    return res.status(500).json({
      code: 500,
      message: error.message || "\u83B7\u53D6\u8BA2\u5355\u5217\u8868\u5931\u8D25",
      data: null
    });
  }
}
async function batchDeleteOrdersController(req, res) {
  try {
    const { order } = req.body;
    if (!order || !Array.isArray(order) || order.length === 0) {
      return res.status(400).json({
        code: 400,
        message: "\u8BA2\u5355\u53F7\u5217\u8868\u4E0D\u80FD\u4E3A\u7A7A",
        data: null
      });
    }
    const result = await batchDeleteOrdersService(order);
    return res.json({
      code: 200,
      message: result.message,
      data: result.message
    });
  } catch (error) {
    const statusCode = error.message.includes("\u6CA1\u6709\u627E\u5230") ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u6279\u91CF\u5220\u9664\u8BA2\u5355\u5931\u8D25",
      data: null
    });
  }
}
async function getOrderDetailController(req, res) {
  try {
    const { orderNo } = req.params;
    if (!orderNo) {
      return res.status(400).json({
        code: 400,
        message: "\u8BA2\u5355\u53F7\u4E0D\u80FD\u4E3A\u7A7A",
        data: null
      });
    }
    const result = await getOrderDetailService(orderNo);
    return res.json({
      code: 200,
      message: "\u83B7\u53D6\u8BA2\u5355\u8BE6\u60C5\u6210\u529F",
      data: result
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u5B58\u5728") ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u83B7\u53D6\u8BA2\u5355\u8BE6\u60C5\u5931\u8D25",
      data: null
    });
  }
}

// src/routes/orderRoutes.ts
var router7 = Router7();
router7.post("/orderList", authMiddleware, getOrderListController);
router7.post("/batchDelete", authMiddleware, batchDeleteOrdersController);
router7.get("/orders/:orderNo", authMiddleware, getOrderDetailController);
var orderRoutes_default = router7;

// src/routes/billingTemplateRoutes.ts
import { Router as Router8 } from "express";

// src/services/billingTemplateService.ts
import { Op as Op8 } from "sequelize";
async function getCityListService() {
  try {
    const stations = await Station_default.findAll({
      attributes: ["id", "name", "city"],
      where: {
        city: {
          [Op8.not]: null,
          [Op8.ne]: ""
        }
      },
      order: [["city", "ASC"], ["name", "ASC"]]
    });
    const cityMap = {};
    stations.forEach((station) => {
      const city = station.city || "\u672A\u5206\u7C7B";
      if (!cityMap[city]) {
        cityMap[city] = [];
      }
      cityMap[city].push({
        label: station.name,
        id: station.id
      });
    });
    const treeData = [
      {
        label: "\u5168\u90E8\u57CE\u5E02",
        children: Object.keys(cityMap).map((city) => ({
          label: city,
          children: cityMap[city]
        }))
      }
    ];
    return treeData;
  } catch (error) {
    console.error("\u83B7\u53D6\u57CE\u5E02\u5217\u8868\u5931\u8D25:", error);
    throw new Error("\u83B7\u53D6\u57CE\u5E02\u5217\u8868\u5931\u8D25");
  }
}
async function getBillingTemplateByStationService(stationId) {
  try {
    const template = await BillingTemplate_default.findOne({
      where: { station_id: stationId },
      include: [
        {
          model: Station_default,
          as: "station",
          attributes: ["id", "name", "city"]
        }
      ]
    });
    if (!template) {
      return {
        id: null,
        stationId,
        name: "",
        service: "",
        parking: "",
        remarks: "",
        date: [
          {
            date1: "",
            date2: "",
            electricity: ""
          }
        ]
      };
    }
    const timeSlots = template.time_slots || [];
    return {
      id: template.id,
      stationId: template.station_id,
      name: template.name || "",
      service: Number(template.service_fee || 0).toFixed(2),
      parking: Number(template.parking_fee || 0).toFixed(2),
      remarks: template.remarks || "",
      date: timeSlots.length > 0 ? timeSlots : [
        {
          date1: "",
          date2: "",
          electricity: ""
        }
      ],
      stationName: template.station?.name || ""
    };
  } catch (error) {
    console.error("\u83B7\u53D6\u8BA1\u8D39\u6A21\u677F\u5931\u8D25:", error);
    throw new Error("\u83B7\u53D6\u8BA1\u8D39\u6A21\u677F\u5931\u8D25");
  }
}
async function saveBillingTemplateService(params) {
  const { station_id, name, service, parking, remarks, date } = params;
  const station = await Station_default.findByPk(station_id);
  if (!station) {
    throw new Error("\u5145\u7535\u7AD9\u4E0D\u5B58\u5728");
  }
  if (!date || !Array.isArray(date) || date.length === 0) {
    throw new Error("\u81F3\u5C11\u9700\u8981\u914D\u7F6E\u4E00\u4E2A\u65F6\u95F4\u6BB5");
  }
  for (const slot of date) {
    if (!slot.date1 || !slot.date2 || !slot.electricity) {
      throw new Error("\u65F6\u95F4\u6BB5\u914D\u7F6E\u4E0D\u5B8C\u6574\uFF0C\u8BF7\u586B\u5199\u5F00\u59CB\u65F6\u95F4\u3001\u7ED3\u675F\u65F6\u95F4\u548C\u7535\u8D39");
    }
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    if (!timeRegex.test(slot.date1) || !timeRegex.test(slot.date2)) {
      throw new Error("\u65F6\u95F4\u683C\u5F0F\u4E0D\u6B63\u786E\uFF0C\u5E94\u4E3A HH:mm:ss \u683C\u5F0F");
    }
    if (isNaN(Number(slot.electricity)) || Number(slot.electricity) < 0) {
      throw new Error("\u7535\u8D39\u5FC5\u987B\u4E3A\u975E\u8D1F\u6570");
    }
  }
  if (isNaN(Number(service)) || Number(service) < 0) {
    throw new Error("\u670D\u52A1\u8D39\u5FC5\u987B\u4E3A\u975E\u8D1F\u6570");
  }
  if (isNaN(Number(parking)) || Number(parking) < 0) {
    throw new Error("\u505C\u8F66\u8D39\u5FC5\u987B\u4E3A\u975E\u8D1F\u6570");
  }
  try {
    const existing = await BillingTemplate_default.findOne({
      where: { station_id }
    });
    const templateData = {
      station_id,
      name: name.trim(),
      service_fee: Number(service),
      parking_fee: Number(parking),
      remarks: remarks || "",
      time_slots: date,
      updated_at: /* @__PURE__ */ new Date()
    };
    if (existing) {
      await existing.update(templateData);
      return {
        id: existing.id,
        message: "\u8BA1\u8D39\u6A21\u677F\u66F4\u65B0\u6210\u529F"
      };
    } else {
      const template = await BillingTemplate_default.create({
        ...templateData,
        created_at: /* @__PURE__ */ new Date()
      });
      return {
        id: template.id,
        message: "\u8BA1\u8D39\u6A21\u677F\u521B\u5EFA\u6210\u529F"
      };
    }
  } catch (error) {
    console.error("\u4FDD\u5B58\u8BA1\u8D39\u6A21\u677F\u5931\u8D25:", error);
    throw new Error("\u4FDD\u5B58\u8BA1\u8D39\u6A21\u677F\u5931\u8D25");
  }
}
async function deleteBillingTemplateService(stationId) {
  try {
    const template = await BillingTemplate_default.findOne({
      where: { station_id: stationId }
    });
    if (!template) {
      throw new Error("\u8BA1\u8D39\u6A21\u677F\u4E0D\u5B58\u5728");
    }
    await template.destroy();
    return {
      message: "\u8BA1\u8D39\u6A21\u677F\u5220\u9664\u6210\u529F"
    };
  } catch (error) {
    console.error("\u5220\u9664\u8BA1\u8D39\u6A21\u677F\u5931\u8D25:", error);
    throw new Error("\u5220\u9664\u8BA1\u8D39\u6A21\u677F\u5931\u8D25");
  }
}
async function getBillingTemplateListService() {
  try {
    const templates = await BillingTemplate_default.findAll({
      include: [
        {
          model: Station_default,
          as: "station",
          attributes: ["id", "name", "city"]
        }
      ],
      order: [["created_at", "DESC"]]
    });
    const list = templates.map((template) => ({
      id: template.id,
      stationId: template.station_id,
      stationName: template.station?.name || "",
      city: template.station?.city || "",
      name: template.name || "",
      serviceFee: Number(template.service_fee || 0).toFixed(2),
      parkingFee: Number(template.parking_fee || 0).toFixed(2),
      timeSlotCount: Array.isArray(template.time_slots) ? template.time_slots.length : 0,
      createdAt: template.created_at ? new Date(template.created_at).toLocaleString("zh-CN", {
        hour12: false
      }) : ""
    }));
    return { list };
  } catch (error) {
    console.error("\u83B7\u53D6\u8BA1\u8D39\u6A21\u677F\u5217\u8868\u5931\u8D25:", error);
    throw new Error("\u83B7\u53D6\u8BA1\u8D39\u6A21\u677F\u5217\u8868\u5931\u8D25");
  }
}

// src/controllers/billingTemplateController.ts
async function getCityListController(req, res) {
  try {
    const result = await getCityListService();
    return res.json({
      code: 200,
      message: "\u83B7\u53D6\u57CE\u5E02\u5217\u8868\u6210\u529F",
      data: result
    });
  } catch (error) {
    console.error("\u83B7\u53D6\u57CE\u5E02\u5217\u8868\u63A7\u5236\u5668\u9519\u8BEF:", error);
    return res.status(500).json({
      code: 500,
      message: error.message || "\u83B7\u53D6\u57CE\u5E02\u5217\u8868\u5931\u8D25",
      data: null
    });
  }
}
async function getBillingTemplateController(req, res) {
  try {
    const { stationId } = req.params;
    if (!stationId) {
      return res.status(400).json({
        code: 400,
        message: "\u7AD9\u70B9ID\u4E0D\u80FD\u4E3A\u7A7A",
        data: null
      });
    }
    const result = await getBillingTemplateByStationService(
      parseInt(stationId)
    );
    return res.json({
      code: 200,
      message: "\u83B7\u53D6\u8BA1\u8D39\u6A21\u677F\u6210\u529F",
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message || "\u83B7\u53D6\u8BA1\u8D39\u6A21\u677F\u5931\u8D25",
      data: null
    });
  }
}
async function saveBillingTemplateController(req, res) {
  try {
    const { station_id, name, service, parking, remarks, date } = req.body;
    if (!station_id) {
      return res.status(400).json({
        code: 400,
        message: "\u7AD9\u70B9ID\u4E0D\u80FD\u4E3A\u7A7A",
        data: null
      });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({
        code: 400,
        message: "\u6A21\u677F\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A",
        data: null
      });
    }
    if (!service || isNaN(Number(service))) {
      return res.status(400).json({
        code: 400,
        message: "\u670D\u52A1\u8D39\u5FC5\u987B\u4E3A\u6709\u6548\u6570\u5B57",
        data: null
      });
    }
    if (!parking || isNaN(Number(parking))) {
      return res.status(400).json({
        code: 400,
        message: "\u505C\u8F66\u8D39\u5FC5\u987B\u4E3A\u6709\u6548\u6570\u5B57",
        data: null
      });
    }
    if (!date || !Array.isArray(date) || date.length === 0) {
      return res.status(400).json({
        code: 400,
        message: "\u81F3\u5C11\u9700\u8981\u914D\u7F6E\u4E00\u4E2A\u65F6\u95F4\u6BB5",
        data: null
      });
    }
    const result = await saveBillingTemplateService({
      station_id: parseInt(station_id),
      name: name.trim(),
      service,
      parking,
      remarks: remarks || "",
      date
    });
    return res.json({
      code: 200,
      message: result.message,
      data: { id: result.id }
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u5B58\u5728") || error.message.includes("\u4E0D\u5B8C\u6574") || error.message.includes("\u683C\u5F0F") || error.message.includes("\u5FC5\u987B") ? 400 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u4FDD\u5B58\u8BA1\u8D39\u6A21\u677F\u5931\u8D25",
      data: null
    });
  }
}
async function deleteBillingTemplateController(req, res) {
  try {
    const { stationId } = req.params;
    if (!stationId) {
      return res.status(400).json({
        code: 400,
        message: "\u7AD9\u70B9ID\u4E0D\u80FD\u4E3A\u7A7A",
        data: null
      });
    }
    const result = await deleteBillingTemplateService(parseInt(stationId));
    return res.json({
      code: 200,
      message: result.message,
      data: null
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u5B58\u5728") ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u5220\u9664\u8BA1\u8D39\u6A21\u677F\u5931\u8D25",
      data: null
    });
  }
}
async function getBillingTemplateListController(req, res) {
  try {
    const result = await getBillingTemplateListService();
    return res.json({
      code: 200,
      message: "\u83B7\u53D6\u8BA1\u8D39\u6A21\u677F\u5217\u8868\u6210\u529F",
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message || "\u83B7\u53D6\u8BA1\u8D39\u6A21\u677F\u5217\u8868\u5931\u8D25",
      data: null
    });
  }
}

// src/routes/billingTemplateRoutes.ts
var router8 = Router8();
router8.get("/cityList", authMiddleware, getCityListController);
router8.get("/billing-template/list", authMiddleware, getBillingTemplateListController);
router8.get("/billing-template/:stationId", authMiddleware, getBillingTemplateController);
router8.post("/billing-template", authMiddleware, saveBillingTemplateController);
router8.delete("/billing-template/:stationId", authMiddleware, deleteBillingTemplateController);
var billingTemplateRoutes_default = router8;

// src/routes/documentRoutes.ts
import { Router as Router9 } from "express";

// src/services/documentService.ts
import { Op as Op9 } from "sequelize";
async function getDocumentTypeListService() {
  try {
    return {
      type: ["\u62DB\u5546\u7C7B", "\u5E7F\u544A\u7C7B", "\u516C\u544A\u7C7B", "\u63D0\u793A\u7C7B", "\u65E5\u5E38\u7C7B", "\u544A\u8B66\u7C7B", "\u5176\u4ED6"],
      important: ["\u4E00\u7EA7", "\u4E8C\u7EA7", "\u4E09\u7EA7", "\u56DB\u7EA7"],
      publish: ["\u7AD9\u5185\u4FE1", "\u516C\u4F17\u53F7", "\u5C0F\u7A0B\u5E8F", "H5", "\u5B98\u7F51"]
    };
  } catch (error) {
    console.error("\u83B7\u53D6\u6587\u7AE0\u7C7B\u578B\u5217\u8868\u5931\u8D25:", error);
    throw new Error("\u83B7\u53D6\u6587\u7AE0\u7C7B\u578B\u5217\u8868\u5931\u8D25");
  }
}
async function createDocumentService(params) {
  const { type, important, publish, content, title, author_id } = params;
  if (!type || !important || !publish || !content) {
    throw new Error("\u6587\u7AE0\u7C7B\u578B\u3001\u91CD\u8981\u7A0B\u5EA6\u3001\u53D1\u5E03\u6E20\u9053\u548C\u5185\u5BB9\u4E0D\u80FD\u4E3A\u7A7A");
  }
  const author = await User_default.findByPk(author_id);
  if (!author) {
    throw new Error("\u4F5C\u8005\u4E0D\u5B58\u5728");
  }
  const allowedTypes = ["\u62DB\u5546\u7C7B", "\u5E7F\u544A\u7C7B", "\u516C\u544A\u7C7B", "\u63D0\u793A\u7C7B", "\u65E5\u5E38\u7C7B", "\u544A\u8B66\u7C7B", "\u5176\u4ED6"];
  if (!allowedTypes.includes(type)) {
    throw new Error("\u65E0\u6548\u7684\u6587\u7AE0\u7C7B\u578B");
  }
  const allowedImportant = ["\u4E00\u7EA7", "\u4E8C\u7EA7", "\u4E09\u7EA7", "\u56DB\u7EA7"];
  if (!allowedImportant.includes(important)) {
    throw new Error("\u65E0\u6548\u7684\u91CD\u8981\u7A0B\u5EA6");
  }
  const allowedPublish = ["\u7AD9\u5185\u4FE1", "\u516C\u4F17\u53F7", "\u5C0F\u7A0B\u5E8F", "H5", "\u5B98\u7F51"];
  if (!allowedPublish.includes(publish)) {
    throw new Error("\u65E0\u6548\u7684\u53D1\u5E03\u6E20\u9053");
  }
  try {
    const document = await Document_default.create({
      type,
      important,
      publish,
      content,
      title: title || null,
      author_id,
      status: 1,
      // 默认草稿状态
      created_at: /* @__PURE__ */ new Date(),
      updated_at: /* @__PURE__ */ new Date()
    });
    return {
      id: document.id,
      message: "\u6587\u7AE0\u521B\u5EFA\u6210\u529F"
    };
  } catch (error) {
    console.error("\u521B\u5EFA\u6587\u7AE0\u5931\u8D25:", error);
    throw new Error("\u521B\u5EFA\u6587\u7AE0\u5931\u8D25");
  }
}
async function getDocumentListService(params) {
  const {
    page = 1,
    pageSize = 10,
    type,
    important,
    publish,
    status,
    keyword
  } = params;
  const where = {};
  if (type) {
    where.type = type;
  }
  if (important) {
    where.important = important;
  }
  if (publish) {
    where.publish = publish;
  }
  if (status !== void 0) {
    where.status = status;
  } else {
    where.status = { [Op9.ne]: 3 };
  }
  if (keyword) {
    where[Op9.or] = [
      { title: { [Op9.like]: `%${keyword}%` } },
      { content: { [Op9.like]: `%${keyword}%` } }
    ];
  }
  try {
    const { rows: documents, count: total } = await Document_default.findAndCountAll({
      where,
      include: [
        {
          model: User_default,
          as: "author",
          attributes: ["id", "name", "account"]
        }
      ],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [["created_at", "DESC"]]
    });
    const list = documents.map((doc) => ({
      id: doc.id,
      type: doc.type,
      important: doc.important,
      publish: doc.publish,
      title: doc.title || "\u65E0\u6807\u9898",
      content: doc.content,
      status: doc.status,
      authorName: doc.author?.name || "\u672A\u77E5",
      authorAccount: doc.author?.account || "",
      createdAt: doc.created_at ? new Date(doc.created_at).toLocaleString("zh-CN", { hour12: false }) : "",
      updatedAt: doc.updated_at ? new Date(doc.updated_at).toLocaleString("zh-CN", { hour12: false }) : ""
    }));
    return {
      list,
      total
    };
  } catch (error) {
    console.error("\u83B7\u53D6\u6587\u7AE0\u5217\u8868\u5931\u8D25:", error);
    throw new Error("\u83B7\u53D6\u6587\u7AE0\u5217\u8868\u5931\u8D25");
  }
}
async function getDocumentDetailService(documentId) {
  const document = await Document_default.findOne({
    where: { id: documentId },
    include: [
      {
        model: User_default,
        as: "author",
        attributes: ["id", "name", "account"]
      }
    ]
  });
  if (!document) {
    throw new Error("\u6587\u7AE0\u4E0D\u5B58\u5728");
  }
  return {
    id: document.id,
    type: document.type,
    important: document.important,
    publish: document.publish,
    title: document.title || "\u65E0\u6807\u9898",
    content: document.content,
    status: document.status,
    authorId: document.author_id,
    authorName: document.author?.name || "\u672A\u77E5",
    authorAccount: document.author?.account || "",
    createdAt: document.created_at ? new Date(document.created_at).toLocaleString("zh-CN", {
      hour12: false
    }) : "",
    updatedAt: document.updated_at ? new Date(document.updated_at).toLocaleString("zh-CN", {
      hour12: false
    }) : ""
  };
}
async function updateDocumentService(documentId, params) {
  const document = await Document_default.findByPk(documentId);
  if (!document) {
    throw new Error("\u6587\u7AE0\u4E0D\u5B58\u5728");
  }
  const updateData = {
    updated_at: /* @__PURE__ */ new Date()
  };
  if (params.type !== void 0) {
    updateData.type = params.type;
  }
  if (params.important !== void 0) {
    updateData.important = params.important;
  }
  if (params.publish !== void 0) {
    updateData.publish = params.publish;
  }
  if (params.content !== void 0) {
    updateData.content = params.content;
  }
  if (params.title !== void 0) {
    updateData.title = params.title;
  }
  try {
    await document.update(updateData);
    return {
      message: "\u6587\u7AE0\u66F4\u65B0\u6210\u529F"
    };
  } catch (error) {
    console.error("\u66F4\u65B0\u6587\u7AE0\u5931\u8D25:", error);
    throw new Error("\u66F4\u65B0\u6587\u7AE0\u5931\u8D25");
  }
}
async function deleteDocumentService(documentId) {
  const document = await Document_default.findByPk(documentId);
  if (!document) {
    throw new Error("\u6587\u7AE0\u4E0D\u5B58\u5728");
  }
  try {
    await document.update({
      status: 3,
      // 已删除
      updated_at: /* @__PURE__ */ new Date()
    });
    return {
      message: "\u6587\u7AE0\u5220\u9664\u6210\u529F"
    };
  } catch (error) {
    console.error("\u5220\u9664\u6587\u7AE0\u5931\u8D25:", error);
    throw new Error("\u5220\u9664\u6587\u7AE0\u5931\u8D25");
  }
}
async function publishDocumentService(documentId) {
  const document = await Document_default.findByPk(documentId);
  if (!document) {
    throw new Error("\u6587\u7AE0\u4E0D\u5B58\u5728");
  }
  try {
    await document.update({
      status: 2,
      // 已发布
      updated_at: /* @__PURE__ */ new Date()
    });
    return {
      message: "\u6587\u7AE0\u53D1\u5E03\u6210\u529F"
    };
  } catch (error) {
    console.error("\u53D1\u5E03\u6587\u7AE0\u5931\u8D25:", error);
    throw new Error("\u53D1\u5E03\u6587\u7AE0\u5931\u8D25");
  }
}

// src/controllers/documentController.ts
async function getDocumentTypeListController(req, res) {
  try {
    const result = await getDocumentTypeListService();
    return res.json({
      code: 200,
      message: "\u64CD\u4F5C\u6210\u529F",
      data: result
    });
  } catch (error) {
    console.error("\u83B7\u53D6\u6587\u7AE0\u7C7B\u578B\u5217\u8868\u63A7\u5236\u5668\u9519\u8BEF:", error);
    return res.status(500).json({
      code: 500,
      message: error.message || "\u83B7\u53D6\u6587\u7AE0\u7C7B\u578B\u5217\u8868\u5931\u8D25",
      data: null
    });
  }
}
async function createDocumentController(req, res) {
  try {
    const { type, important, publish, content, title } = req.body;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: "\u672A\u6388\u6743\uFF0C\u8BF7\u5148\u767B\u5F55",
        data: null
      });
    }
    if (!type || !important || !publish || !content) {
      return res.status(400).json({
        code: 400,
        message: "\u6587\u7AE0\u7C7B\u578B\u3001\u91CD\u8981\u7A0B\u5EA6\u3001\u53D1\u5E03\u6E20\u9053\u548C\u5185\u5BB9\u4E0D\u80FD\u4E3A\u7A7A",
        data: null
      });
    }
    const result = await createDocumentService({
      type,
      important,
      publish,
      content,
      title: title || void 0,
      author_id: userId
    });
    return res.json({
      code: 200,
      message: result.message,
      data: { id: result.id }
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u5B58\u5728") || error.message.includes("\u4E0D\u80FD\u4E3A\u7A7A") || error.message.includes("\u65E0\u6548") ? 400 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u521B\u5EFA\u6587\u7AE0\u5931\u8D25",
      data: null
    });
  }
}
async function getDocumentListController(req, res) {
  try {
    const {
      page,
      pageSize,
      type,
      important,
      publish,
      status,
      keyword
    } = req.query;
    const params = {
      page: page && !isNaN(Number(page)) ? Number(page) : 1,
      pageSize: pageSize && !isNaN(Number(pageSize)) ? Number(pageSize) : 10
    };
    if (type && typeof type === "string") {
      params.type = type;
    }
    if (important && typeof important === "string") {
      params.important = important;
    }
    if (publish && typeof publish === "string") {
      params.publish = publish;
    }
    if (status && !isNaN(Number(status))) {
      params.status = Number(status);
    }
    if (keyword && typeof keyword === "string") {
      params.keyword = keyword;
    }
    const result = await getDocumentListService(params);
    return res.json({
      code: 200,
      message: "\u83B7\u53D6\u6587\u7AE0\u5217\u8868\u6210\u529F",
      data: result
    });
  } catch (error) {
    console.error("\u83B7\u53D6\u6587\u7AE0\u5217\u8868\u63A7\u5236\u5668\u9519\u8BEF:", error);
    return res.status(500).json({
      code: 500,
      message: error.message || "\u83B7\u53D6\u6587\u7AE0\u5217\u8868\u5931\u8D25",
      data: null
    });
  }
}
async function getDocumentDetailController(req, res) {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        code: 400,
        message: "\u6587\u7AE0ID\u65E0\u6548",
        data: null
      });
    }
    const result = await getDocumentDetailService(Number(id));
    return res.json({
      code: 200,
      message: "\u83B7\u53D6\u6587\u7AE0\u8BE6\u60C5\u6210\u529F",
      data: result
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u5B58\u5728") ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u83B7\u53D6\u6587\u7AE0\u8BE6\u60C5\u5931\u8D25",
      data: null
    });
  }
}
async function updateDocumentController(req, res) {
  try {
    const { id } = req.params;
    const { type, important, publish, content, title } = req.body;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        code: 400,
        message: "\u6587\u7AE0ID\u65E0\u6548",
        data: null
      });
    }
    const result = await updateDocumentService(Number(id), {
      type,
      important,
      publish,
      content,
      title
    });
    return res.json({
      code: 200,
      message: result.message,
      data: null
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u5B58\u5728") ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u66F4\u65B0\u6587\u7AE0\u5931\u8D25",
      data: null
    });
  }
}
async function deleteDocumentController(req, res) {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        code: 400,
        message: "\u6587\u7AE0ID\u65E0\u6548",
        data: null
      });
    }
    const result = await deleteDocumentService(Number(id));
    return res.json({
      code: 200,
      message: result.message,
      data: null
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u5B58\u5728") ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u5220\u9664\u6587\u7AE0\u5931\u8D25",
      data: null
    });
  }
}
async function publishDocumentController(req, res) {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        code: 400,
        message: "\u6587\u7AE0ID\u65E0\u6548",
        data: null
      });
    }
    const result = await publishDocumentService(Number(id));
    return res.json({
      code: 200,
      message: result.message,
      data: null
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u5B58\u5728") ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u53D1\u5E03\u6587\u7AE0\u5931\u8D25",
      data: null
    });
  }
}

// src/routes/documentRoutes.ts
var router9 = Router9();
router9.get("/document", authMiddleware, getDocumentTypeListController);
router9.post("/document", authMiddleware, createDocumentController);
router9.get("/document/list", authMiddleware, getDocumentListController);
router9.get("/document/:id", authMiddleware, getDocumentDetailController);
router9.put("/document/:id", authMiddleware, updateDocumentController);
router9.delete("/document/:id", authMiddleware, deleteDocumentController);
router9.post("/document/:id/publish", authMiddleware, publishDocumentController);
var documentRoutes_default = router9;

// src/routes/personalRoutes.ts
import { Router as Router10 } from "express";

// src/services/personalService.ts
import "sequelize";
async function getPersonalInfoService(userId) {
  try {
    const user = await User_default.findByPk(userId);
    if (!user) {
      throw new Error("\u7528\u6237\u4E0D\u5B58\u5728");
    }
    return {
      id: user.id,
      account: user.account,
      name: user.name || "",
      phone: user.phone || "",
      address: user.address || "",
      position: user.position || "",
      department: user.department || "",
      tags: user.tags || ["\u8BA4\u771F", "\u5DE5\u4F5C\u72C2", "\u4E0E\u4EBA\u548C\u5584", "\u4EE3\u7801\u6D01\u7656"],
      // 默认标签
      workStatus: user.work_status || 1,
      avatar: user.avatar || `https://api.dicebear.com/7.x/miniavs/svg?seed=${user.id}`,
      status: user.status,
      createdAt: user.created_at ? new Date(user.created_at).toLocaleString("zh-CN", {
        hour12: false
      }) : ""
    };
  } catch (error) {
    console.error("\u83B7\u53D6\u4E2A\u4EBA\u4FE1\u606F\u5931\u8D25:", error);
    throw new Error("\u83B7\u53D6\u4E2A\u4EBA\u4FE1\u606F\u5931\u8D25");
  }
}
async function updatePersonalInfoService(userId, params) {
  try {
    const user = await User_default.findByPk(userId);
    if (!user) {
      throw new Error("\u7528\u6237\u4E0D\u5B58\u5728");
    }
    const updateData = {};
    if (params.name !== void 0) {
      updateData.name = params.name.trim();
    }
    if (params.phone !== void 0) {
      if (params.phone && !/^1[3-9]\d{9}$/.test(params.phone)) {
        throw new Error("\u624B\u673A\u53F7\u683C\u5F0F\u4E0D\u6B63\u786E");
      }
      updateData.phone = params.phone;
    }
    if (params.address !== void 0) {
      updateData.address = params.address;
    }
    if (params.workStatus !== void 0) {
      if (![1, 2, 3, 4].includes(params.workStatus)) {
        throw new Error("\u65E0\u6548\u7684\u5728\u804C\u72B6\u6001");
      }
      updateData.work_status = params.workStatus;
    }
    if (params.tags !== void 0) {
      updateData.tags = params.tags;
    }
    await user.update(updateData);
    return {
      message: "\u4E2A\u4EBA\u4FE1\u606F\u66F4\u65B0\u6210\u529F"
    };
  } catch (error) {
    console.error("\u66F4\u65B0\u4E2A\u4EBA\u4FE1\u606F\u5931\u8D25:", error);
    throw new Error(error.message || "\u66F4\u65B0\u4E2A\u4EBA\u4FE1\u606F\u5931\u8D25");
  }
}
async function getPersonalStatsService(userId) {
  try {
    const user = await User_default.findByPk(userId);
    if (!user) {
      throw new Error("\u7528\u6237\u4E0D\u5B58\u5728");
    }
    const userName = user.name || "";
    const todoCount = await Alarm_default.count({
      where: { status: 1 }
      // 待指派
    });
    const assignedToMeCount = await Alarm_default.count({
      where: {
        status: 2,
        // 处理中
        handler: userName
      }
    });
    const department = user.department || "";
    const noticeCount = await Notice_default.count({
      where: {
        // 可以根据部门或其他条件筛选
        // 这里先统计所有通知
      }
    });
    const messageCount = await Notice_default.count({
      where: {
        // 可以根据用户或其他条件筛选
        // 这里先统计所有通知
      }
    });
    const myAssignedCount = await Alarm_default.count({
      where: {
        status: 2
        // 处理中
        // 注意：这里需要根据handle_note中是否包含当前用户信息来判断
        // 简化处理：统计所有处理中的报警
      }
    });
    return {
      todoCount,
      assignedToMeCount,
      noticeCount,
      messageCount,
      myAssignedCount
    };
  } catch (error) {
    console.error("\u83B7\u53D6\u4E2A\u4EBA\u7EDF\u8BA1\u6570\u636E\u5931\u8D25:", error);
    throw new Error("\u83B7\u53D6\u4E2A\u4EBA\u7EDF\u8BA1\u6570\u636E\u5931\u8D25");
  }
}
async function getPersonalNoticesService(userId, page = 1, pageSize = 10) {
  try {
    const { rows: notices, count: total } = await Notice_default.findAndCountAll({
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [["publish_time", "DESC"]]
      // Notice表使用publish_time字段
    });
    const list = notices.map((notice) => ({
      id: notice.id,
      title: notice.title || "",
      content: notice.content || "",
      type: notice.type || "\u901A\u77E5",
      createdAt: notice.publish_time ? new Date(notice.publish_time).toLocaleString("zh-CN", {
        hour12: false
      }) : ""
    }));
    return {
      list,
      total
    };
  } catch (error) {
    console.error("\u83B7\u53D6\u901A\u77E5\u5217\u8868\u5931\u8D25:", error);
    throw new Error("\u83B7\u53D6\u901A\u77E5\u5217\u8868\u5931\u8D25");
  }
}
async function changePasswordService(userId, params) {
  const { oldPassword, newPassword } = params;
  if (!oldPassword || !newPassword) {
    throw new Error("\u65E7\u5BC6\u7801\u548C\u65B0\u5BC6\u7801\u4E0D\u80FD\u4E3A\u7A7A");
  }
  if (newPassword.length < 6) {
    throw new Error("\u65B0\u5BC6\u7801\u957F\u5EA6\u4E0D\u80FD\u5C11\u4E8E6\u4F4D");
  }
  try {
    const user = await User_default.findByPk(userId);
    if (!user) {
      throw new Error("\u7528\u6237\u4E0D\u5B58\u5728");
    }
    const bcrypt3 = await import("bcryptjs");
    const isPasswordValid = await bcrypt3.default.compare(
      oldPassword,
      user.password
    );
    if (!isPasswordValid) {
      throw new Error("\u65E7\u5BC6\u7801\u4E0D\u6B63\u786E");
    }
    const hashedPassword = await bcrypt3.default.hash(newPassword, 10);
    await user.update({
      password: hashedPassword
    });
    return {
      message: "\u5BC6\u7801\u4FEE\u6539\u6210\u529F"
    };
  } catch (error) {
    console.error("\u4FEE\u6539\u5BC6\u7801\u5931\u8D25:", error);
    throw new Error(error.message || "\u4FEE\u6539\u5BC6\u7801\u5931\u8D25");
  }
}

// src/controllers/personalController.ts
async function getPersonalInfoController(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: "\u672A\u6388\u6743\uFF0C\u8BF7\u5148\u767B\u5F55",
        data: null
      });
    }
    const result = await getPersonalInfoService(userId);
    return res.json({
      code: 200,
      message: "\u83B7\u53D6\u4E2A\u4EBA\u4FE1\u606F\u6210\u529F",
      data: result
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u5B58\u5728") ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u83B7\u53D6\u4E2A\u4EBA\u4FE1\u606F\u5931\u8D25",
      data: null
    });
  }
}
async function updatePersonalInfoController(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: "\u672A\u6388\u6743\uFF0C\u8BF7\u5148\u767B\u5F55",
        data: null
      });
    }
    const { name, phone, address, workStatus, tags } = req.body;
    const result = await updatePersonalInfoService(userId, {
      name,
      phone,
      address,
      workStatus,
      tags
    });
    return res.json({
      code: 200,
      message: result.message,
      data: null
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u5B58\u5728") || error.message.includes("\u683C\u5F0F") || error.message.includes("\u65E0\u6548") ? 400 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u66F4\u65B0\u4E2A\u4EBA\u4FE1\u606F\u5931\u8D25",
      data: null
    });
  }
}
async function getPersonalStatsController(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: "\u672A\u6388\u6743\uFF0C\u8BF7\u5148\u767B\u5F55",
        data: null
      });
    }
    const result = await getPersonalStatsService(userId);
    return res.json({
      code: 200,
      message: "\u83B7\u53D6\u7EDF\u8BA1\u6570\u636E\u6210\u529F",
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message || "\u83B7\u53D6\u7EDF\u8BA1\u6570\u636E\u5931\u8D25",
      data: null
    });
  }
}
async function getPersonalNoticesController(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: "\u672A\u6388\u6743\uFF0C\u8BF7\u5148\u767B\u5F55",
        data: null
      });
    }
    const { page, pageSize } = req.query;
    const result = await getPersonalNoticesService(
      userId,
      page && !isNaN(Number(page)) ? Number(page) : 1,
      pageSize && !isNaN(Number(pageSize)) ? Number(pageSize) : 10
    );
    return res.json({
      code: 200,
      message: "\u83B7\u53D6\u901A\u77E5\u5217\u8868\u6210\u529F",
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message || "\u83B7\u53D6\u901A\u77E5\u5217\u8868\u5931\u8D25",
      data: null
    });
  }
}
async function changePasswordController(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: "\u672A\u6388\u6743\uFF0C\u8BF7\u5148\u767B\u5F55",
        data: null
      });
    }
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        code: 400,
        message: "\u65E7\u5BC6\u7801\u548C\u65B0\u5BC6\u7801\u4E0D\u80FD\u4E3A\u7A7A",
        data: null
      });
    }
    const result = await changePasswordService(userId, {
      oldPassword,
      newPassword
    });
    return res.json({
      code: 200,
      message: result.message,
      data: null
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u6B63\u786E") || error.message.includes("\u4E0D\u80FD\u4E3A\u7A7A") || error.message.includes("\u957F\u5EA6") ? 400 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u4FEE\u6539\u5BC6\u7801\u5931\u8D25",
      data: null
    });
  }
}

// src/routes/personalRoutes.ts
var router10 = Router10();
router10.get("/personal/info", authMiddleware, getPersonalInfoController);
router10.put("/personal/info", authMiddleware, updatePersonalInfoController);
router10.get("/personal/stats", authMiddleware, getPersonalStatsController);
router10.get("/personal/notices", authMiddleware, getPersonalNoticesController);
router10.post("/personal/change-password", authMiddleware, changePasswordController);
var personalRoutes_default = router10;

// src/routes/mapRoutes.ts
import { Router as Router11 } from "express";

// src/services/mapService.ts
import { Op as Op11 } from "sequelize";
async function getMapStationListService() {
  try {
    const stations = await Station_default.findAll({
      attributes: ["id", "name", "longitude", "latitude", "status", "city"],
      where: {
        longitude: { [Op11.not]: null },
        latitude: { [Op11.not]: null }
      }
    });
    const stationsWithCount = await Promise.all(
      stations.map(async (station) => {
        const pileCount = await Pile_default.count({
          where: { station_id: station.id }
        });
        return {
          position: [station.longitude, station.latitude],
          // [经度, 纬度]
          title: station.name,
          status: station.status || 1,
          count: pileCount,
          id: station.id,
          city: station.city || ""
        };
      })
    );
    return stationsWithCount;
  } catch (error) {
    console.error("\u83B7\u53D6\u5730\u56FE\u5145\u7535\u7AD9\u5217\u8868\u5931\u8D25:", error);
    throw new Error("\u83B7\u53D6\u5730\u56FE\u5145\u7535\u7AD9\u5217\u8868\u5931\u8D25");
  }
}
async function getMapStatsService() {
  try {
    const totalStations = await Station_default.count();
    const provinceStats = await Station_default.findAll({
      attributes: [
        "city",
        [db_default.fn("COUNT", db_default.col("id")), "count"]
      ],
      group: ["city"],
      order: [[db_default.fn("COUNT", db_default.col("id")), "DESC"]],
      raw: true
    });
    const maxProvince = provinceStats.length > 0 ? provinceStats[0] : null;
    const maxProvinceName = maxProvince ? maxProvince.city || "\u672A\u77E5" : "\u672A\u77E5";
    const maxProvinceCount = maxProvince ? Number(maxProvince.count) : 0;
    const provinceCount = provinceStats.length;
    const totalProvinces = 34;
    const noStationProvinces = totalProvinces - provinceCount;
    const accumulatedStation = `${maxProvinceName}(${maxProvinceCount}\u4E2A)`;
    const [revenueResults] = await db_default.query(`
      SELECT 
        station_id,
        MAX(day) as maxDay,
        MIN(day) as minDay
      FROM revenue
      GROUP BY station_id
    `);
    let maxRevenueStation = null;
    let minRevenueStation = null;
    let maxRevenue = 0;
    let minRevenue = Infinity;
    for (const stat of revenueResults) {
      const stationId = stat.station_id;
      const station = await Station_default.findByPk(stationId);
      if (station) {
        const maxDay = Number(stat.maxDay || 0);
        const minDay = Number(stat.minDay || 0);
        if (maxDay > maxRevenue) {
          maxRevenue = maxDay;
          maxRevenueStation = station.name;
        }
        if (minDay < minRevenue && minDay > 0) {
          minRevenue = minDay;
          minRevenueStation = station.name;
        }
      }
    }
    const [alarmResults] = await db_default.query(`
      SELECT 
        station_id,
        COUNT(id) as alarmCount
      FROM alarm
      GROUP BY station_id
      ORDER BY alarmCount DESC
      LIMIT 1
    `);
    let maxFaultStation = null;
    if (alarmResults.length > 0) {
      const stationId = alarmResults[0].station_id;
      const station = await Station_default.findByPk(stationId);
      if (station) {
        maxFaultStation = station.name;
      }
    }
    return {
      totalStations,
      // 累计充电站数量
      maxProvinceName,
      // 单省份最多充电站省份名
      maxProvinceCount,
      // 单省份最多充电站数量
      provinceCount,
      // 充电站遍及省份数量
      noStationProvinces,
      // 暂无充电站省份数量
      accumulatedStation,
      // 累计充电站（格式：省份名(数量个)）
      maxRevenueStation: maxRevenueStation || "\u6682\u65E0\u6570\u636E",
      // 单日营收最高
      minRevenueStation: minRevenueStation || "\u6682\u65E0\u6570\u636E",
      // 单日营收最低
      maxFaultStation: maxFaultStation || "\u6682\u65E0\u6570\u636E"
      // 故障率最高
    };
  } catch (error) {
    console.error("\u83B7\u53D6\u5730\u56FE\u7EDF\u8BA1\u4FE1\u606F\u5931\u8D25:", error);
    throw new Error("\u83B7\u53D6\u5730\u56FE\u7EDF\u8BA1\u4FE1\u606F\u5931\u8D25");
  }
}
async function createStationFromMapService(params) {
  const { name, region, location1, location2, now, remarks } = params;
  if (!name || !region || !location1 || !location2) {
    throw new Error("\u7AD9\u70B9\u540D\u79F0\u3001\u5730\u5740\u3001\u7ECF\u5EA6\u3001\u7EAC\u5EA6\u4E0D\u80FD\u4E3A\u7A7A");
  }
  const longitude = parseFloat(location1);
  const latitude = parseFloat(location2);
  if (isNaN(longitude) || isNaN(latitude)) {
    throw new Error("\u7ECF\u7EAC\u5EA6\u683C\u5F0F\u4E0D\u6B63\u786E");
  }
  if (longitude < -180 || longitude > 180) {
    throw new Error("\u7ECF\u5EA6\u8303\u56F4\u5E94\u5728-180\u5230180\u4E4B\u95F4");
  }
  if (latitude < -90 || latitude > 90) {
    throw new Error("\u7EAC\u5EA6\u8303\u56F4\u5E94\u5728-90\u523090\u4E4B\u95F4");
  }
  try {
    const cityMatch = region.match(/([^省市区]+[省市区])/);
    const city = cityMatch ? cityMatch[1] : "\u672A\u77E5";
    const station = await Station_default.create({
      name: name.trim(),
      city,
      longitude,
      latitude,
      status: now ? 1 : 0,
      // 立即使用则状态为1，否则为0
      fast: 0,
      slow: 0,
      now: 0,
      fault: 0
      // 备注可以存储在扩展字段中，这里简化处理
    });
    return {
      id: station.id,
      message: "\u5145\u7535\u7AD9\u521B\u5EFA\u6210\u529F"
    };
  } catch (error) {
    console.error("\u521B\u5EFA\u5145\u7535\u7AD9\u5931\u8D25:", error);
    throw new Error("\u521B\u5EFA\u5145\u7535\u7AD9\u5931\u8D25");
  }
}

// src/controllers/mapController.ts
async function getMapStationListController(req, res) {
  try {
    const result = await getMapStationListService();
    return res.json({
      code: 200,
      success: true,
      data: result
    });
  } catch (error) {
    console.error("\u83B7\u53D6\u5730\u56FE\u5145\u7535\u7AD9\u5217\u8868\u63A7\u5236\u5668\u9519\u8BEF:", error);
    return res.status(500).json({
      code: 500,
      success: false,
      message: error.message || "\u83B7\u53D6\u5730\u56FE\u5145\u7535\u7AD9\u5217\u8868\u5931\u8D25",
      data: null
    });
  }
}
async function getMapStatsController(req, res) {
  try {
    const result = await getMapStatsService();
    return res.json({
      code: 200,
      message: "\u83B7\u53D6\u5730\u56FE\u7EDF\u8BA1\u4FE1\u606F\u6210\u529F",
      data: result
    });
  } catch (error) {
    console.error("\u83B7\u53D6\u5730\u56FE\u7EDF\u8BA1\u4FE1\u606F\u63A7\u5236\u5668\u9519\u8BEF:", error);
    return res.status(500).json({
      code: 500,
      message: error.message || "\u83B7\u53D6\u5730\u56FE\u7EDF\u8BA1\u4FE1\u606F\u5931\u8D25",
      data: null
    });
  }
}
async function createStationFromMapController(req, res) {
  try {
    const { name, region, location1, location2, now, remarks } = req.body;
    if (!name || !region || !location1 || !location2) {
      return res.status(400).json({
        code: 400,
        message: "\u7AD9\u70B9\u540D\u79F0\u3001\u5730\u5740\u3001\u7ECF\u5EA6\u3001\u7EAC\u5EA6\u4E0D\u80FD\u4E3A\u7A7A",
        data: null
      });
    }
    const result = await createStationFromMapService({
      name,
      region,
      location1,
      location2,
      now: now === true || now === "true" || now === 1,
      remarks
    });
    return res.json({
      code: 200,
      message: result.message,
      data: { id: result.id }
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u80FD\u4E3A\u7A7A") || error.message.includes("\u683C\u5F0F") || error.message.includes("\u8303\u56F4") ? 400 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u521B\u5EFA\u5145\u7535\u7AD9\u5931\u8D25",
      data: null
    });
  }
}

// src/routes/mapRoutes.ts
var router11 = Router11();
router11.post("/mapList", authMiddleware, getMapStationListController);
router11.get("/map/stats", authMiddleware, getMapStatsController);
router11.post("/map/station", authMiddleware, createStationFromMapController);
var mapRoutes_default = router11;

// src/routes/pileRoutes.ts
import { Router as Router12 } from "express";

// src/services/pileService.ts
import { Op as Op12 } from "sequelize";
async function getPileListService(params) {
  const {
    page = 1,
    pageSize = 10,
    stationId,
    status,
    type,
    keyword
  } = params;
  const where = {};
  if (stationId) {
    where.station_id = stationId;
  }
  if (status !== void 0) {
    where.status = status;
  }
  if (type) {
    where.type = { [Op12.like]: `%${type}%` };
  }
  if (keyword) {
    where[Op12.or] = [
      { id: { [Op12.like]: `%${keyword}%` } },
      { type: { [Op12.like]: `%${keyword}%` } }
    ];
  }
  try {
    const { rows: piles, count: total } = await Pile_default.findAndCountAll({
      where,
      include: [
        {
          model: Station_default,
          as: "station",
          attributes: ["id", "name", "city"]
        }
      ],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [["id", "ASC"]]
    });
    const list = piles.map((pile) => ({
      id: pile.id,
      stationId: pile.station_id,
      stationName: pile.station?.name || "",
      city: pile.station?.city || "",
      type: pile.type || "",
      status: pile.status || 1,
      percent: pile.percent || 0,
      voltage: pile.voltage || 0,
      current: pile.current || 0,
      power: pile.power || 0,
      temperature: pile.temperature || 0,
      installDate: pile.install_date ? new Date(pile.install_date).toLocaleDateString("zh-CN") : ""
    }));
    return {
      list,
      total
    };
  } catch (error) {
    console.error("\u83B7\u53D6\u5145\u7535\u6869\u5217\u8868\u5931\u8D25:", error);
    throw new Error("\u83B7\u53D6\u5145\u7535\u6869\u5217\u8868\u5931\u8D25");
  }
}
async function getPileDetailService(pileId) {
  const pile = await Pile_default.findOne({
    where: { id: pileId },
    include: [
      {
        model: Station_default,
        as: "station",
        attributes: ["id", "name", "city"]
      }
    ]
  });
  if (!pile) {
    throw new Error("\u5145\u7535\u6869\u4E0D\u5B58\u5728");
  }
  return {
    id: pile.id,
    stationId: pile.station_id,
    stationName: pile.station?.name || "",
    city: pile.station?.city || "",
    type: pile.type || "",
    status: pile.status || 1,
    percent: pile.percent || 0,
    voltage: pile.voltage || 0,
    current: pile.current || 0,
    power: pile.power || 0,
    temperature: pile.temperature || 0,
    installDate: pile.install_date ? new Date(pile.install_date).toLocaleDateString("zh-CN") : ""
  };
}
async function createPileService(params) {
  const {
    station_id,
    type,
    status = 1,
    voltage,
    current,
    power,
    temperature,
    install_date
  } = params;
  const station = await Station_default.findByPk(station_id);
  if (!station) {
    throw new Error("\u5145\u7535\u7AD9\u4E0D\u5B58\u5728");
  }
  if (!type || !["\u5FEB\u5145", "\u6162\u5145"].includes(type)) {
    throw new Error('\u5145\u7535\u6869\u7C7B\u578B\u5FC5\u987B\u4E3A"\u5FEB\u5145"\u6216"\u6162\u5145"');
  }
  try {
    const pile = await Pile_default.create({
      station_id,
      type,
      status,
      voltage: voltage || null,
      current: current || null,
      power: power || null,
      temperature: temperature || null,
      install_date: install_date ? new Date(install_date) : null,
      percent: 0
    });
    if (type === "\u5FEB\u5145") {
      await station.increment("fast");
    } else {
      await station.increment("slow");
    }
    return {
      id: pile.id,
      message: "\u5145\u7535\u6869\u521B\u5EFA\u6210\u529F"
    };
  } catch (error) {
    console.error("\u521B\u5EFA\u5145\u7535\u6869\u5931\u8D25:", error);
    throw new Error("\u521B\u5EFA\u5145\u7535\u6869\u5931\u8D25");
  }
}
async function updatePileService(pileId, params) {
  const pile = await Pile_default.findByPk(pileId);
  if (!pile) {
    throw new Error("\u5145\u7535\u6869\u4E0D\u5B58\u5728");
  }
  const updateData = {};
  if (params.type !== void 0) {
    if (!["\u5FEB\u5145", "\u6162\u5145"].includes(params.type)) {
      throw new Error('\u5145\u7535\u6869\u7C7B\u578B\u5FC5\u987B\u4E3A"\u5FEB\u5145"\u6216"\u6162\u5145"');
    }
    const oldType = pile.type;
    if (oldType !== params.type) {
      const station = await Station_default.findByPk(pile.station_id);
      if (station) {
        if (oldType === "\u5FEB\u5145") {
          await station.decrement("fast");
        } else if (oldType === "\u6162\u5145") {
          await station.decrement("slow");
        }
        if (params.type === "\u5FEB\u5145") {
          await station.increment("fast");
        } else {
          await station.increment("slow");
        }
      }
    }
    updateData.type = params.type;
  }
  if (params.status !== void 0) {
    updateData.status = params.status;
  }
  if (params.voltage !== void 0) {
    updateData.voltage = params.voltage;
  }
  if (params.current !== void 0) {
    updateData.current = params.current;
  }
  if (params.power !== void 0) {
    updateData.power = params.power;
  }
  if (params.temperature !== void 0) {
    updateData.temperature = params.temperature;
  }
  if (params.percent !== void 0) {
    updateData.percent = params.percent;
  }
  if (params.install_date !== void 0) {
    updateData.install_date = params.install_date ? new Date(params.install_date) : null;
  }
  try {
    await pile.update(updateData);
    return {
      message: "\u5145\u7535\u6869\u66F4\u65B0\u6210\u529F"
    };
  } catch (error) {
    console.error("\u66F4\u65B0\u5145\u7535\u6869\u5931\u8D25:", error);
    throw new Error("\u66F4\u65B0\u5145\u7535\u6869\u5931\u8D25");
  }
}
async function deletePileService(pileId) {
  const pile = await Pile_default.findByPk(pileId);
  if (!pile) {
    throw new Error("\u5145\u7535\u6869\u4E0D\u5B58\u5728");
  }
  const orderCount = await Order_default.count({
    where: { equipment_no: String(pileId) }
  });
  if (orderCount > 0) {
    throw new Error("\u8BE5\u5145\u7535\u6869\u5B58\u5728\u5173\u8054\u8BA2\u5355\uFF0C\u65E0\u6CD5\u5220\u9664");
  }
  try {
    const station = await Station_default.findByPk(pile.station_id);
    const pileType = pile.type;
    await pile.destroy();
    if (station) {
      if (pileType === "\u5FEB\u5145") {
        await station.decrement("fast");
      } else if (pileType === "\u6162\u5145") {
        await station.decrement("slow");
      }
    }
    return {
      message: "\u5145\u7535\u6869\u5220\u9664\u6210\u529F"
    };
  } catch (error) {
    console.error("\u5220\u9664\u5145\u7535\u6869\u5931\u8D25:", error);
    throw new Error("\u5220\u9664\u5145\u7535\u6869\u5931\u8D25");
  }
}
async function updatePileStatusService(pileId, status) {
  const pile = await Pile_default.findByPk(pileId);
  if (!pile) {
    throw new Error("\u5145\u7535\u6869\u4E0D\u5B58\u5728");
  }
  if (![1, 2, 3, 4, 5, 6].includes(status)) {
    throw new Error("\u65E0\u6548\u7684\u5145\u7535\u6869\u72B6\u6001\uFF0C\u5FC5\u987B\u4E3A1-6\u4E4B\u95F4\u7684\u6570\u5B57");
  }
  try {
    await pile.update({
      status,
      // 如果状态不是充电中，清空进度
      percent: status === 2 ? pile.percent : 0
    });
    return {
      message: "\u5145\u7535\u6869\u72B6\u6001\u66F4\u65B0\u6210\u529F"
    };
  } catch (error) {
    console.error("\u66F4\u65B0\u5145\u7535\u6869\u72B6\u6001\u5931\u8D25:", error);
    throw new Error("\u66F4\u65B0\u5145\u7535\u6869\u72B6\u6001\u5931\u8D25");
  }
}
async function getPileUsageRecordsService(pileId, page = 1, pageSize = 10) {
  const pile = await Pile_default.findByPk(pileId);
  if (!pile) {
    throw new Error("\u5145\u7535\u6869\u4E0D\u5B58\u5728");
  }
  try {
    const { rows: orders, count: total } = await Order_default.findAndCountAll({
      where: {
        equipment_no: String(pileId)
      },
      include: [
        {
          model: Station_default,
          as: "station",
          attributes: ["id", "name"]
        }
      ],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [["date", "DESC"]]
    });
    const list = orders.map((order) => ({
      id: order.order_no,
      orderNo: order.order_no,
      stationName: order.station?.name || "",
      startTime: order.start_time ? new Date(order.start_time).toLocaleString("zh-CN", {
        hour12: false
      }) : "",
      endTime: order.end_time ? new Date(order.end_time).toLocaleString("zh-CN", {
        hour12: false
      }) : "",
      money: Number(order.money || 0).toFixed(2),
      pay: order.pay || "",
      status: order.status,
      date: order.date ? new Date(order.date).toLocaleDateString("zh-CN") : ""
    }));
    return {
      list,
      total
    };
  } catch (error) {
    console.error("\u83B7\u53D6\u5145\u7535\u6869\u4F7F\u7528\u8BB0\u5F55\u5931\u8D25:", error);
    throw new Error("\u83B7\u53D6\u5145\u7535\u6869\u4F7F\u7528\u8BB0\u5F55\u5931\u8D25");
  }
}
async function getPileMaintenanceService(pileId, page = 1, pageSize = 10) {
  const pile = await Pile_default.findByPk(pileId);
  if (!pile) {
    throw new Error("\u5145\u7535\u6869\u4E0D\u5B58\u5728");
  }
  try {
    const { rows: maintenances, count: total } = await PileMaintenance_default.findAndCountAll({
      where: { pile_id: pileId },
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [["maintenance_time", "DESC"]]
    });
    const list = maintenances.map((maintenance) => ({
      id: maintenance.id,
      maintenanceType: maintenance.maintenance_type || "",
      maintenancePerson: maintenance.maintenance_person || "",
      maintenanceTime: maintenance.maintenance_time ? new Date(maintenance.maintenance_time).toLocaleString("zh-CN", {
        hour12: false
      }) : "",
      maintenanceContent: maintenance.maintenance_content || "",
      maintenanceCost: Number(maintenance.maintenance_cost || 0).toFixed(2),
      nextMaintenanceTime: maintenance.next_maintenance_time ? new Date(maintenance.next_maintenance_time).toLocaleString("zh-CN", {
        hour12: false
      }) : "",
      status: maintenance.status || 1,
      createdAt: maintenance.created_at ? new Date(maintenance.created_at).toLocaleString("zh-CN", {
        hour12: false
      }) : ""
    }));
    return {
      list,
      total
    };
  } catch (error) {
    console.error("\u83B7\u53D6\u5145\u7535\u6869\u7EF4\u4FDD\u8BB0\u5F55\u5931\u8D25:", error);
    throw new Error("\u83B7\u53D6\u5145\u7535\u6869\u7EF4\u4FDD\u8BB0\u5F55\u5931\u8D25");
  }
}
async function createPileMaintenanceService(pileId, params) {
  const pile = await Pile_default.findByPk(pileId);
  if (!pile) {
    throw new Error("\u5145\u7535\u6869\u4E0D\u5B58\u5728");
  }
  const {
    maintenance_type,
    maintenance_person,
    maintenance_time,
    maintenance_content,
    maintenance_cost,
    next_maintenance_time,
    status = 1
  } = params;
  if (!maintenance_type || !maintenance_person || !maintenance_time) {
    throw new Error("\u7EF4\u4FDD\u7C7B\u578B\u3001\u7EF4\u4FDD\u4EBA\u5458\u548C\u7EF4\u4FDD\u65F6\u95F4\u4E0D\u80FD\u4E3A\u7A7A");
  }
  try {
    const maintenance = await PileMaintenance_default.create({
      pile_id: pileId,
      maintenance_type,
      maintenance_person,
      maintenance_time: new Date(maintenance_time),
      maintenance_content: maintenance_content || "",
      maintenance_cost: maintenance_cost || 0,
      next_maintenance_time: next_maintenance_time ? new Date(next_maintenance_time) : null,
      status,
      created_at: /* @__PURE__ */ new Date()
    });
    return {
      id: maintenance.id,
      message: "\u7EF4\u4FDD\u8BB0\u5F55\u521B\u5EFA\u6210\u529F"
    };
  } catch (error) {
    console.error("\u521B\u5EFA\u7EF4\u4FDD\u8BB0\u5F55\u5931\u8D25:", error);
    throw new Error("\u521B\u5EFA\u7EF4\u4FDD\u8BB0\u5F55\u5931\u8D25");
  }
}
async function updatePileMaintenanceService(maintenanceId, params) {
  const maintenance = await PileMaintenance_default.findByPk(maintenanceId);
  if (!maintenance) {
    throw new Error("\u7EF4\u4FDD\u8BB0\u5F55\u4E0D\u5B58\u5728");
  }
  const updateData = {};
  if (params.maintenance_type !== void 0) {
    updateData.maintenance_type = params.maintenance_type;
  }
  if (params.maintenance_person !== void 0) {
    updateData.maintenance_person = params.maintenance_person;
  }
  if (params.maintenance_time !== void 0) {
    updateData.maintenance_time = new Date(params.maintenance_time);
  }
  if (params.maintenance_content !== void 0) {
    updateData.maintenance_content = params.maintenance_content;
  }
  if (params.maintenance_cost !== void 0) {
    updateData.maintenance_cost = params.maintenance_cost;
  }
  if (params.next_maintenance_time !== void 0) {
    updateData.next_maintenance_time = params.next_maintenance_time ? new Date(params.next_maintenance_time) : null;
  }
  if (params.status !== void 0) {
    updateData.status = params.status;
  }
  try {
    await maintenance.update(updateData);
    return {
      message: "\u7EF4\u4FDD\u8BB0\u5F55\u66F4\u65B0\u6210\u529F"
    };
  } catch (error) {
    console.error("\u66F4\u65B0\u7EF4\u4FDD\u8BB0\u5F55\u5931\u8D25:", error);
    throw new Error("\u66F4\u65B0\u7EF4\u4FDD\u8BB0\u5F55\u5931\u8D25");
  }
}

// src/controllers/pileController.ts
async function getPileListController(req, res) {
  try {
    const {
      page,
      pageSize,
      stationId,
      status,
      type,
      keyword
    } = req.query;
    const params = {
      page: page && !isNaN(Number(page)) ? Number(page) : 1,
      pageSize: pageSize && !isNaN(Number(pageSize)) ? Number(pageSize) : 10
    };
    if (stationId && !isNaN(Number(stationId))) {
      params.stationId = Number(stationId);
    }
    if (status && !isNaN(Number(status))) {
      params.status = Number(status);
    }
    if (type && typeof type === "string") {
      params.type = type;
    }
    if (keyword && typeof keyword === "string") {
      params.keyword = keyword;
    }
    const result = await getPileListService(params);
    return res.json({
      code: 200,
      message: "\u83B7\u53D6\u5145\u7535\u6869\u5217\u8868\u6210\u529F",
      data: result
    });
  } catch (error) {
    console.error("\u83B7\u53D6\u5145\u7535\u6869\u5217\u8868\u63A7\u5236\u5668\u9519\u8BEF:", error);
    return res.status(500).json({
      code: 500,
      message: error.message || "\u83B7\u53D6\u5145\u7535\u6869\u5217\u8868\u5931\u8D25",
      data: null
    });
  }
}
async function getPileDetailController(req, res) {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        code: 400,
        message: "\u5145\u7535\u6869ID\u65E0\u6548",
        data: null
      });
    }
    const result = await getPileDetailService(Number(id));
    return res.json({
      code: 200,
      message: "\u83B7\u53D6\u5145\u7535\u6869\u8BE6\u60C5\u6210\u529F",
      data: result
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u5B58\u5728") ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u83B7\u53D6\u5145\u7535\u6869\u8BE6\u60C5\u5931\u8D25",
      data: null
    });
  }
}
async function createPileController(req, res) {
  try {
    const {
      station_id,
      type,
      status,
      voltage,
      current,
      power,
      temperature,
      install_date
    } = req.body;
    if (!station_id || !type) {
      return res.status(400).json({
        code: 400,
        message: "\u5145\u7535\u7AD9ID\u548C\u5145\u7535\u6869\u7C7B\u578B\u4E0D\u80FD\u4E3A\u7A7A",
        data: null
      });
    }
    const result = await createPileService({
      station_id: parseInt(station_id),
      type,
      status,
      voltage,
      current,
      power,
      temperature,
      install_date
    });
    return res.json({
      code: 200,
      message: result.message,
      data: { id: result.id }
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u5B58\u5728") || error.message.includes("\u5FC5\u987B\u4E3A") ? 400 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u521B\u5EFA\u5145\u7535\u6869\u5931\u8D25",
      data: null
    });
  }
}
async function updatePileController(req, res) {
  try {
    const { id } = req.params;
    const { type, status, voltage, current, power, temperature, percent, install_date } = req.body;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        code: 400,
        message: "\u5145\u7535\u6869ID\u65E0\u6548",
        data: null
      });
    }
    const result = await updatePileService(Number(id), {
      type,
      status,
      voltage,
      current,
      power,
      temperature,
      percent,
      install_date
    });
    return res.json({
      code: 200,
      message: result.message,
      data: null
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u5B58\u5728") || error.message.includes("\u5FC5\u987B\u4E3A") ? 400 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u66F4\u65B0\u5145\u7535\u6869\u5931\u8D25",
      data: null
    });
  }
}
async function deletePileController(req, res) {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        code: 400,
        message: "\u5145\u7535\u6869ID\u65E0\u6548",
        data: null
      });
    }
    const result = await deletePileService(Number(id));
    return res.json({
      code: 200,
      message: result.message,
      data: null
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u5B58\u5728") || error.message.includes("\u5173\u8054\u8BA2\u5355") ? 400 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u5220\u9664\u5145\u7535\u6869\u5931\u8D25",
      data: null
    });
  }
}
async function updatePileStatusController(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        code: 400,
        message: "\u5145\u7535\u6869ID\u65E0\u6548",
        data: null
      });
    }
    if (status === void 0 || isNaN(Number(status))) {
      return res.status(400).json({
        code: 400,
        message: "\u72B6\u6001\u503C\u4E0D\u80FD\u4E3A\u7A7A",
        data: null
      });
    }
    const result = await updatePileStatusService(Number(id), Number(status));
    return res.json({
      code: 200,
      message: result.message,
      data: null
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u5B58\u5728") || error.message.includes("\u65E0\u6548") ? 400 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u66F4\u65B0\u5145\u7535\u6869\u72B6\u6001\u5931\u8D25",
      data: null
    });
  }
}
async function getPileUsageRecordsController(req, res) {
  try {
    const { id } = req.params;
    const { page, pageSize } = req.query;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        code: 400,
        message: "\u5145\u7535\u6869ID\u65E0\u6548",
        data: null
      });
    }
    const result = await getPileUsageRecordsService(
      Number(id),
      page && !isNaN(Number(page)) ? Number(page) : 1,
      pageSize && !isNaN(Number(pageSize)) ? Number(pageSize) : 10
    );
    return res.json({
      code: 200,
      message: "\u83B7\u53D6\u4F7F\u7528\u8BB0\u5F55\u6210\u529F",
      data: result
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u5B58\u5728") ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u83B7\u53D6\u4F7F\u7528\u8BB0\u5F55\u5931\u8D25",
      data: null
    });
  }
}
async function getPileMaintenanceController(req, res) {
  try {
    const { id } = req.params;
    const { page, pageSize } = req.query;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        code: 400,
        message: "\u5145\u7535\u6869ID\u65E0\u6548",
        data: null
      });
    }
    const result = await getPileMaintenanceService(
      Number(id),
      page && !isNaN(Number(page)) ? Number(page) : 1,
      pageSize && !isNaN(Number(pageSize)) ? Number(pageSize) : 10
    );
    return res.json({
      code: 200,
      message: "\u83B7\u53D6\u7EF4\u4FDD\u8BB0\u5F55\u6210\u529F",
      data: result
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u5B58\u5728") ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u83B7\u53D6\u7EF4\u4FDD\u8BB0\u5F55\u5931\u8D25",
      data: null
    });
  }
}
async function createPileMaintenanceController(req, res) {
  try {
    const { id } = req.params;
    const {
      maintenance_type,
      maintenance_person,
      maintenance_time,
      maintenance_content,
      maintenance_cost,
      next_maintenance_time,
      status
    } = req.body;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        code: 400,
        message: "\u5145\u7535\u6869ID\u65E0\u6548",
        data: null
      });
    }
    if (!maintenance_type || !maintenance_person || !maintenance_time) {
      return res.status(400).json({
        code: 400,
        message: "\u7EF4\u4FDD\u7C7B\u578B\u3001\u7EF4\u4FDD\u4EBA\u5458\u548C\u7EF4\u4FDD\u65F6\u95F4\u4E0D\u80FD\u4E3A\u7A7A",
        data: null
      });
    }
    const result = await createPileMaintenanceService(Number(id), {
      maintenance_type,
      maintenance_person,
      maintenance_time,
      maintenance_content,
      maintenance_cost,
      next_maintenance_time,
      status
    });
    return res.json({
      code: 200,
      message: result.message,
      data: { id: result.id }
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u5B58\u5728") || error.message.includes("\u4E0D\u80FD\u4E3A\u7A7A") ? 400 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u521B\u5EFA\u7EF4\u4FDD\u8BB0\u5F55\u5931\u8D25",
      data: null
    });
  }
}
async function updatePileMaintenanceController(req, res) {
  try {
    const { id, maintenanceId } = req.params;
    const {
      maintenance_type,
      maintenance_person,
      maintenance_time,
      maintenance_content,
      maintenance_cost,
      next_maintenance_time,
      status
    } = req.body;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        code: 400,
        message: "\u5145\u7535\u6869ID\u65E0\u6548",
        data: null
      });
    }
    if (!maintenanceId || isNaN(Number(maintenanceId))) {
      return res.status(400).json({
        code: 400,
        message: "\u7EF4\u4FDD\u8BB0\u5F55ID\u65E0\u6548",
        data: null
      });
    }
    const result = await updatePileMaintenanceService(Number(maintenanceId), {
      maintenance_type,
      maintenance_person,
      maintenance_time,
      maintenance_content,
      maintenance_cost,
      next_maintenance_time,
      status
    });
    return res.json({
      code: 200,
      message: result.message,
      data: null
    });
  } catch (error) {
    const statusCode = error.message.includes("\u4E0D\u5B58\u5728") ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || "\u66F4\u65B0\u7EF4\u4FDD\u8BB0\u5F55\u5931\u8D25",
      data: null
    });
  }
}

// src/routes/pileRoutes.ts
var router12 = Router12();
router12.get("/piles", authMiddleware, getPileListController);
router12.get("/piles/:id", authMiddleware, getPileDetailController);
router12.post("/piles", authMiddleware, createPileController);
router12.put("/piles/:id", authMiddleware, updatePileController);
router12.delete("/piles/:id", authMiddleware, deletePileController);
router12.put("/piles/:id/status", authMiddleware, updatePileStatusController);
router12.get("/piles/:id/usage-records", authMiddleware, getPileUsageRecordsController);
router12.get("/piles/:id/maintenance", authMiddleware, getPileMaintenanceController);
router12.post("/piles/:id/maintenance", authMiddleware, createPileMaintenanceController);
router12.put("/piles/:id/maintenance/:maintenanceId", authMiddleware, updatePileMaintenanceController);
var pileRoutes_default = router12;

// src/routes/monitorDataRoutes.ts
import { Router as Router13 } from "express";

// src/services/monitorDataService.ts
import { Op as Op13, fn, col, literal } from "sequelize";
MonitorData_default.belongsTo(User_default, {
  foreignKey: "user_id",
  targetKey: "id",
  as: "user"
});
var TYPE_CATEGORY_MAP = {
  // 错误类型
  "js_error": "error",
  "promise_error": "error",
  "resource_error": "error",
  "http_error": "error",
  "vue_error": "error",
  "console_error": "error",
  // 性能类型
  "performance": "performance",
  "resource_timing": "performance",
  "long_task": "performance",
  "first_paint": "performance",
  "first_contentful_paint": "performance",
  "largest_contentful_paint": "performance",
  "first_input_delay": "performance",
  "cumulative_layout_shift": "performance",
  "time_to_first_byte": "performance",
  "interaction_to_next_paint": "performance",
  // 行为类型
  "page_view": "behavior",
  "page_leave": "behavior",
  "click": "behavior",
  "route_change": "behavior",
  "custom_event": "behavior",
  "behavior_stack": "behavior",
  // 网络类型
  "http_request": "network",
  // 会话类型
  "session_start": "session",
  "session_end": "session"
};
function getCategory(type) {
  return TYPE_CATEGORY_MAP[type] || "behavior";
}
async function saveMonitorData(dataList, clientInfo) {
  const records = dataList.map((item) => ({
    report_id: item.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    app_id: item.appId || "unknown",
    user_id: item.userId || null,
    type: item.type,
    category: getCategory(item.type),
    timestamp: item.timestamp || Date.now(),
    page_url: item.pageUrl || null,
    page_title: item.pageTitle || null,
    device_info: item.deviceInfo || null,
    environment_info: item.environmentInfo || null,
    session_info: item.sessionInfo || null,
    data: extractCoreData(item),
    extra: item.extra || null,
    ip_address: clientInfo.ip || null,
    user_agent: clientInfo.userAgent || null
  }));
  return MonitorData_default.bulkCreate(records);
}
function extractCoreData(item) {
  const { id, appId, userId, timestamp, pageUrl, pageTitle, deviceInfo, environmentInfo, sessionInfo, extra, ...coreData } = item;
  return coreData;
}
async function getMonitorDataList(params) {
  const { page = 1, pageSize = 20, category, type, appId, startTime, endTime } = params;
  const where = {};
  if (category) {
    where.category = category;
  }
  if (type) {
    where.type = type;
  }
  if (appId) {
    where.app_id = appId;
  }
  if (startTime && endTime) {
    where.timestamp = {
      [Op13.between]: [startTime, endTime]
    };
  } else if (startTime) {
    where.timestamp = {
      [Op13.gte]: startTime
    };
  } else if (endTime) {
    where.timestamp = {
      [Op13.lte]: endTime
    };
  }
  const { count, rows } = await MonitorData_default.findAndCountAll({
    where,
    order: [["created_at", "DESC"]],
    limit: pageSize,
    offset: (page - 1) * pageSize,
    include: [{
      model: User_default,
      as: "user",
      attributes: ["id", "name", "account"],
      required: false
    }]
  });
  const list = rows.map((row) => {
    const item = row.toJSON();
    item.user_name = item.user?.name || null;
    delete item.user;
    return item;
  });
  return {
    list,
    total: count,
    page,
    pageSize,
    totalPages: Math.ceil(count / pageSize)
  };
}
async function getErrorList(params) {
  return getMonitorDataList({
    ...params,
    category: "error"
  });
}
async function getPerformanceList(params) {
  return getMonitorDataList({
    ...params,
    category: "performance"
  });
}
async function getBehaviorList(params) {
  return getMonitorDataList({
    ...params,
    category: "behavior"
  });
}
async function getNetworkList(params) {
  return getMonitorDataList({
    ...params,
    category: "network"
  });
}
async function getOverviewStats(params) {
  const { startTime, endTime, appId } = params;
  const where = {};
  if (appId) {
    where.app_id = appId;
  }
  if (startTime && endTime) {
    where.timestamp = {
      [Op13.between]: [startTime, endTime]
    };
  }
  const categoryStats = await MonitorData_default.findAll({
    where,
    attributes: [
      "category",
      [fn("COUNT", col("id")), "count"]
    ],
    group: ["category"],
    raw: true
  });
  const typeStats = await MonitorData_default.findAll({
    where,
    attributes: [
      "type",
      [fn("COUNT", col("id")), "count"]
    ],
    group: ["type"],
    order: [[literal("count"), "DESC"]],
    limit: 10,
    raw: true
  });
  const total = await MonitorData_default.count({ where });
  const errorCount = await MonitorData_default.count({
    where: { ...where, category: "error" }
  });
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = await MonitorData_default.count({
    where: {
      ...where,
      created_at: {
        [Op13.gte]: today
      }
    }
  });
  const uvResult = await MonitorData_default.findAll({
    where,
    attributes: [[fn("COUNT", fn("DISTINCT", col("user_id"))), "uv"]],
    raw: true
  });
  const uv = uvResult[0]?.uv || 0;
  const pv = await MonitorData_default.count({
    where: { ...where, type: "page_view" }
  });
  return {
    total,
    errorCount,
    todayCount,
    uv,
    pv,
    categoryStats: categoryStats.reduce((acc, item) => {
      acc[item.category] = parseInt(item.count);
      return acc;
    }, {}),
    typeStats: typeStats.map((item) => ({
      type: item.type,
      count: parseInt(item.count)
    }))
  };
}
async function getTrendData(params) {
  const { startTime, endTime, groupBy = "hour", category, appId } = params;
  const where = {
    timestamp: {
      [Op13.between]: [startTime, endTime]
    }
  };
  if (category) {
    where.category = category;
  }
  if (appId) {
    where.app_id = appId;
  }
  const dateFormat = groupBy === "hour" ? "%Y-%m-%d %H:00:00" : "%Y-%m-%d";
  const result = await MonitorData_default.findAll({
    where,
    attributes: [
      [fn("DATE_FORMAT", fn("FROM_UNIXTIME", literal("timestamp / 1000")), dateFormat), "time"],
      [fn("COUNT", col("id")), "count"]
    ],
    group: [literal("time")],
    order: [[literal("time"), "ASC"]],
    raw: true
  });
  return result.map((item) => ({
    time: item.time,
    count: parseInt(item.count)
  }));
}
async function getPerformanceMetrics(params) {
  const { startTime, endTime, appId } = params;
  const where = {
    type: "performance"
  };
  if (appId) {
    where.app_id = appId;
  }
  if (startTime && endTime) {
    where.timestamp = {
      [Op13.between]: [startTime, endTime]
    };
  }
  const performanceData = await MonitorData_default.findAll({
    where,
    attributes: ["data"],
    order: [["created_at", "DESC"]],
    limit: 100,
    raw: true
  });
  if (performanceData.length === 0) {
    return {
      avgFCP: 0,
      avgLCP: 0,
      avgTTFB: 0,
      avgFID: 0,
      avgCLS: 0,
      avgLoadComplete: 0,
      sampleCount: 0
    };
  }
  let fcpSum = 0, lcpSum = 0, ttfbSum = 0, fidSum = 0, clsSum = 0, loadSum = 0;
  let fcpCount = 0, lcpCount = 0, ttfbCount = 0, fidCount = 0, clsCount = 0, loadCount = 0;
  performanceData.forEach((item) => {
    const data = typeof item.data === "string" ? JSON.parse(item.data) : item.data;
    if (data.firstContentfulPaint) {
      fcpSum += data.firstContentfulPaint;
      fcpCount++;
    }
    if (data.largestContentfulPaint) {
      lcpSum += data.largestContentfulPaint;
      lcpCount++;
    }
    if (data.timeToFirstByte) {
      ttfbSum += data.timeToFirstByte;
      ttfbCount++;
    }
    if (data.firstInputDelay) {
      fidSum += data.firstInputDelay;
      fidCount++;
    }
    if (data.cumulativeLayoutShift) {
      clsSum += data.cumulativeLayoutShift;
      clsCount++;
    }
    if (data.loadComplete) {
      loadSum += data.loadComplete;
      loadCount++;
    }
  });
  return {
    avgFCP: fcpCount > 0 ? Math.round(fcpSum / fcpCount) : 0,
    avgLCP: lcpCount > 0 ? Math.round(lcpSum / lcpCount) : 0,
    avgTTFB: ttfbCount > 0 ? Math.round(ttfbSum / ttfbCount) : 0,
    avgFID: fidCount > 0 ? Math.round(fidSum / fidCount) : 0,
    avgCLS: clsCount > 0 ? (clsSum / clsCount).toFixed(3) : 0,
    avgLoadComplete: loadCount > 0 ? Math.round(loadSum / loadCount) : 0,
    sampleCount: performanceData.length
  };
}
async function getErrorStats(params) {
  const { startTime, endTime, appId } = params;
  const where = {
    category: "error"
  };
  if (appId) {
    where.app_id = appId;
  }
  if (startTime && endTime) {
    where.timestamp = {
      [Op13.between]: [startTime, endTime]
    };
  }
  const typeStats = await MonitorData_default.findAll({
    where,
    attributes: [
      "type",
      [fn("COUNT", col("id")), "count"]
    ],
    group: ["type"],
    order: [[literal("count"), "DESC"]],
    raw: true
  });
  const pageStats = await MonitorData_default.findAll({
    where,
    attributes: [
      "page_url",
      [fn("COUNT", col("id")), "count"]
    ],
    group: ["page_url"],
    order: [[literal("count"), "DESC"]],
    limit: 10,
    raw: true
  });
  const total = await MonitorData_default.count({ where });
  return {
    total,
    byType: typeStats.map((item) => ({
      type: item.type,
      count: parseInt(item.count)
    })),
    byPage: pageStats.map((item) => ({
      page: item.page_url,
      count: parseInt(item.count)
    }))
  };
}
async function getBehaviorStats(params) {
  const { startTime, endTime, appId } = params;
  const where = {
    category: "behavior"
  };
  if (appId) {
    where.app_id = appId;
  }
  if (startTime && endTime) {
    where.timestamp = {
      [Op13.between]: [startTime, endTime]
    };
  }
  const pageViewStats = await MonitorData_default.findAll({
    where: { ...where, type: "page_view" },
    attributes: [
      "page_url",
      [fn("COUNT", col("id")), "count"]
    ],
    group: ["page_url"],
    order: [[literal("count"), "DESC"]],
    limit: 10,
    raw: true
  });
  const pv = await MonitorData_default.count({
    where: { ...where, type: "page_view" }
  });
  const uvResult = await MonitorData_default.findAll({
    where,
    attributes: [[fn("COUNT", fn("DISTINCT", col("user_id"))), "uv"]],
    raw: true
  });
  const uv = uvResult[0]?.uv || 0;
  const clickCount = await MonitorData_default.count({
    where: { ...where, type: "click" }
  });
  const routeChangeCount = await MonitorData_default.count({
    where: { ...where, type: "route_change" }
  });
  return {
    pv,
    uv,
    clickCount,
    routeChangeCount,
    topPages: pageViewStats.map((item) => ({
      page: item.page_url,
      count: parseInt(item.count)
    }))
  };
}
async function deleteMonitorData(ids) {
  return MonitorData_default.destroy({
    where: {
      id: {
        [Op13.in]: ids
      }
    }
  });
}
async function cleanOldData(daysToKeep = 30) {
  const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1e3;
  return MonitorData_default.destroy({
    where: {
      timestamp: {
        [Op13.lt]: cutoffTime
      }
    }
  });
}
async function getUserTrackingData(params) {
  const { userName, page = 1, pageSize = 20, startTime, endTime, category } = params;
  const user = await User_default.findOne({
    where: {
      name: userName
    }
  });
  if (!user) {
    return {
      list: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
      userInfo: null,
      stats: null
    };
  }
  const userId = user.id;
  const userIdStr = String(userId);
  const where = {
    user_id: userIdStr
  };
  if (startTime && endTime) {
    where.timestamp = {
      [Op13.between]: [startTime, endTime]
    };
  } else if (startTime) {
    where.timestamp = { [Op13.gte]: startTime };
  } else if (endTime) {
    where.timestamp = { [Op13.lte]: endTime };
  }
  if (category) {
    where.category = category;
  }
  const { count, rows } = await MonitorData_default.findAndCountAll({
    where,
    order: [["timestamp", "DESC"]],
    limit: pageSize,
    offset: (page - 1) * pageSize
  });
  const list = rows.map((row) => {
    const item = row.toJSON();
    item.user_name = user.name;
    return item;
  });
  const behaviorStats = await MonitorData_default.findAll({
    where: { user_id: userIdStr },
    attributes: [
      "type",
      [fn("COUNT", col("id")), "count"]
    ],
    group: ["type"],
    raw: true
  });
  const pageStats = await MonitorData_default.findAll({
    where: { user_id: userIdStr, type: "page_view" },
    attributes: [
      "page_url",
      [fn("COUNT", col("id")), "count"]
    ],
    group: ["page_url"],
    order: [[literal("count"), "DESC"]],
    limit: 10,
    raw: true
  });
  const timeRange = await MonitorData_default.findOne({
    where: { user_id: userIdStr },
    attributes: [
      [fn("MIN", col("timestamp")), "firstVisit"],
      [fn("MAX", col("timestamp")), "lastVisit"]
    ],
    raw: true
  });
  const totalBehaviors = await MonitorData_default.count({ where: { user_id: userIdStr } });
  return {
    list,
    total: count,
    page,
    pageSize,
    totalPages: Math.ceil(count / pageSize),
    userInfo: {
      id: userId,
      name: user.name,
      account: user.account
    },
    stats: {
      totalBehaviors,
      firstVisit: timeRange?.firstVisit || null,
      lastVisit: timeRange?.lastVisit || null,
      behaviorTypes: behaviorStats.map((item) => ({
        type: item.type,
        count: parseInt(item.count)
      })),
      topPages: pageStats.map((item) => ({
        page: item.page_url,
        count: parseInt(item.count)
      }))
    }
  };
}
async function getActiveUsers(params) {
  const { startTime, endTime } = params;
  const where = {};
  if (startTime && endTime) {
    where.timestamp = {
      [Op13.between]: [startTime, endTime]
    };
  }
  const userIds = await MonitorData_default.findAll({
    where: {
      ...where,
      user_id: {
        [Op13.ne]: null
      }
    },
    attributes: [
      "user_id",
      [fn("COUNT", col("id")), "behaviorCount"]
    ],
    group: ["user_id"],
    order: [[literal("behaviorCount"), "DESC"]],
    raw: true
  });
  if (userIds.length === 0) {
    return [];
  }
  const users = await User_default.findAll({
    where: {
      id: {
        [Op13.in]: userIds.map((item) => item.user_id)
      }
    },
    attributes: ["id", "name", "account"],
    raw: true
  });
  return userIds.map((item) => {
    const user = users.find((u) => u.id === item.user_id);
    return {
      userId: item.user_id,
      userName: user?.name || "\u672A\u77E5\u7528\u6237",
      account: user?.account || "",
      behaviorCount: parseInt(item.behaviorCount)
    };
  });
}
async function getErrorBehaviorContext(params) {
  const { errorId, seconds = 10 } = params;
  const errorRecord = await MonitorData_default.findByPk(errorId);
  if (!errorRecord) {
    return {
      error: null,
      behaviors: [],
      userInfo: null
    };
  }
  const errorData = errorRecord.toJSON();
  const errorTimestamp = errorData.timestamp;
  const userId = errorData.user_id;
  const sessionInfo = errorData.session_info;
  const startTime = errorTimestamp - seconds * 1e3;
  const endTime = errorTimestamp;
  const where = {
    timestamp: {
      [Op13.between]: [startTime, endTime]
    },
    category: "behavior"
    // 只查询行为类型的数据
  };
  if (sessionInfo?.sessionId) {
    where[Op13.or] = [
      { "session_info.sessionId": sessionInfo.sessionId },
      ...userId ? [{ user_id: userId }] : []
    ];
  } else if (userId) {
    where.user_id = userId;
  } else {
    return {
      error: errorData,
      behaviors: [],
      userInfo: null
    };
  }
  const behaviors = await MonitorData_default.findAll({
    where,
    order: [["timestamp", "ASC"]],
    limit: 50
    // 最多返回50条行为记录
  });
  const behaviorList = behaviors.map((b) => b.toJSON());
  let userInfo = null;
  if (userId) {
    const user = await User_default.findByPk(userId, {
      attributes: ["id", "name", "account"]
    });
    if (user) {
      userInfo = user.toJSON();
    }
  }
  return {
    error: errorData,
    behaviors: behaviorList,
    userInfo,
    timeRange: {
      start: startTime,
      end: endTime,
      seconds
    }
  };
}

// src/controllers/monitorDataController.ts
async function reportData(req, res) {
  try {
    const data = req.body;
    const dataList = Array.isArray(data) ? data : [data];
    if (dataList.length === 0) {
      return res.status(400).json({
        code: 400,
        message: "\u4E0A\u62A5\u6570\u636E\u4E0D\u80FD\u4E3A\u7A7A"
      });
    }
    const clientInfo = {
      ip: req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      userAgent: req.headers["user-agent"]
    };
    await saveMonitorData(dataList, clientInfo);
    res.status(200).json({
      code: 200,
      message: "\u4E0A\u62A5\u6210\u529F",
      count: dataList.length
    });
  } catch (error) {
    console.error("\u76D1\u63A7\u6570\u636E\u4E0A\u62A5\u5931\u8D25:", error);
    res.status(500).json({
      code: 500,
      message: "\u4E0A\u62A5\u5931\u8D25",
      error: error.message
    });
  }
}
async function getDataList(req, res) {
  try {
    const { page, pageSize, category, type, appId, startTime, endTime } = req.query;
    const result = await getMonitorDataList({
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
      category,
      type,
      appId,
      startTime: startTime ? parseInt(startTime) : void 0,
      endTime: endTime ? parseInt(endTime) : void 0
    });
    res.json({
      code: 200,
      data: result
    });
  } catch (error) {
    console.error("\u83B7\u53D6\u76D1\u63A7\u6570\u636E\u5217\u8868\u5931\u8D25:", error);
    res.status(500).json({
      code: 500,
      message: "\u83B7\u53D6\u6570\u636E\u5931\u8D25",
      error: error.message
    });
  }
}
async function getErrors(req, res) {
  try {
    const { page, pageSize, type, startTime, endTime } = req.query;
    const result = await getErrorList({
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
      type,
      startTime: startTime ? parseInt(startTime) : void 0,
      endTime: endTime ? parseInt(endTime) : void 0
    });
    res.json({
      code: 200,
      data: result
    });
  } catch (error) {
    console.error("\u83B7\u53D6\u9519\u8BEF\u5217\u8868\u5931\u8D25:", error);
    res.status(500).json({
      code: 500,
      message: "\u83B7\u53D6\u6570\u636E\u5931\u8D25",
      error: error.message
    });
  }
}
async function getPerformance(req, res) {
  try {
    const { page, pageSize, type, startTime, endTime } = req.query;
    const result = await getPerformanceList({
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
      type,
      startTime: startTime ? parseInt(startTime) : void 0,
      endTime: endTime ? parseInt(endTime) : void 0
    });
    res.json({
      code: 200,
      data: result
    });
  } catch (error) {
    console.error("\u83B7\u53D6\u6027\u80FD\u6570\u636E\u5217\u8868\u5931\u8D25:", error);
    res.status(500).json({
      code: 500,
      message: "\u83B7\u53D6\u6570\u636E\u5931\u8D25",
      error: error.message
    });
  }
}
async function getBehaviors(req, res) {
  try {
    const { page, pageSize, type, startTime, endTime } = req.query;
    const result = await getBehaviorList({
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
      type,
      startTime: startTime ? parseInt(startTime) : void 0,
      endTime: endTime ? parseInt(endTime) : void 0
    });
    res.json({
      code: 200,
      data: result
    });
  } catch (error) {
    console.error("\u83B7\u53D6\u884C\u4E3A\u6570\u636E\u5217\u8868\u5931\u8D25:", error);
    res.status(500).json({
      code: 500,
      message: "\u83B7\u53D6\u6570\u636E\u5931\u8D25",
      error: error.message
    });
  }
}
async function getNetworks(req, res) {
  try {
    const { page, pageSize, startTime, endTime } = req.query;
    const result = await getNetworkList({
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
      startTime: startTime ? parseInt(startTime) : void 0,
      endTime: endTime ? parseInt(endTime) : void 0
    });
    res.json({
      code: 200,
      data: result
    });
  } catch (error) {
    console.error("\u83B7\u53D6\u7F51\u7EDC\u8BF7\u6C42\u5217\u8868\u5931\u8D25:", error);
    res.status(500).json({
      code: 500,
      message: "\u83B7\u53D6\u6570\u636E\u5931\u8D25",
      error: error.message
    });
  }
}
async function getOverview(req, res) {
  try {
    const { startTime, endTime, appId } = req.query;
    const result = await getOverviewStats({
      startTime: startTime ? parseInt(startTime) : void 0,
      endTime: endTime ? parseInt(endTime) : void 0,
      appId
    });
    res.json({
      code: 200,
      data: result
    });
  } catch (error) {
    console.error("\u83B7\u53D6\u7EDF\u8BA1\u6982\u89C8\u5931\u8D25:", error);
    res.status(500).json({
      code: 500,
      message: "\u83B7\u53D6\u6570\u636E\u5931\u8D25",
      error: error.message
    });
  }
}
async function getTrend(req, res) {
  try {
    const { startTime, endTime, groupBy, category, appId } = req.query;
    if (!startTime || !endTime) {
      return res.status(400).json({
        code: 400,
        message: "startTime\u548CendTime\u4E3A\u5FC5\u586B\u53C2\u6570"
      });
    }
    const result = await getTrendData({
      startTime: parseInt(startTime),
      endTime: parseInt(endTime),
      groupBy: groupBy || "hour",
      category,
      appId
    });
    res.json({
      code: 200,
      data: result
    });
  } catch (error) {
    console.error("\u83B7\u53D6\u8D8B\u52BF\u6570\u636E\u5931\u8D25:", error);
    res.status(500).json({
      code: 500,
      message: "\u83B7\u53D6\u6570\u636E\u5931\u8D25",
      error: error.message
    });
  }
}
async function getPerformanceMetrics2(req, res) {
  try {
    const { startTime, endTime, appId } = req.query;
    const result = await getPerformanceMetrics({
      startTime: startTime ? parseInt(startTime) : void 0,
      endTime: endTime ? parseInt(endTime) : void 0,
      appId
    });
    res.json({
      code: 200,
      data: result
    });
  } catch (error) {
    console.error("\u83B7\u53D6\u6027\u80FD\u6307\u6807\u7EDF\u8BA1\u5931\u8D25:", error);
    res.status(500).json({
      code: 500,
      message: "\u83B7\u53D6\u6570\u636E\u5931\u8D25",
      error: error.message
    });
  }
}
async function getErrorStats2(req, res) {
  try {
    const { startTime, endTime, appId } = req.query;
    const result = await getErrorStats({
      startTime: startTime ? parseInt(startTime) : void 0,
      endTime: endTime ? parseInt(endTime) : void 0,
      appId
    });
    res.json({
      code: 200,
      data: result
    });
  } catch (error) {
    console.error("\u83B7\u53D6\u9519\u8BEF\u7EDF\u8BA1\u5931\u8D25:", error);
    res.status(500).json({
      code: 500,
      message: "\u83B7\u53D6\u6570\u636E\u5931\u8D25",
      error: error.message
    });
  }
}
async function getBehaviorStats2(req, res) {
  try {
    const { startTime, endTime, appId } = req.query;
    const result = await getBehaviorStats({
      startTime: startTime ? parseInt(startTime) : void 0,
      endTime: endTime ? parseInt(endTime) : void 0,
      appId
    });
    res.json({
      code: 200,
      data: result
    });
  } catch (error) {
    console.error("\u83B7\u53D6\u7528\u6237\u884C\u4E3A\u7EDF\u8BA1\u5931\u8D25:", error);
    res.status(500).json({
      code: 500,
      message: "\u83B7\u53D6\u6570\u636E\u5931\u8D25",
      error: error.message
    });
  }
}
async function deleteData(req, res) {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 400,
        message: "\u8BF7\u63D0\u4F9B\u8981\u5220\u9664\u7684\u6570\u636EID\u5217\u8868"
      });
    }
    const count = await deleteMonitorData(ids);
    res.json({
      code: 200,
      message: "\u5220\u9664\u6210\u529F",
      deletedCount: count
    });
  } catch (error) {
    console.error("\u5220\u9664\u76D1\u63A7\u6570\u636E\u5931\u8D25:", error);
    res.status(500).json({
      code: 500,
      message: "\u5220\u9664\u5931\u8D25",
      error: error.message
    });
  }
}
async function cleanOldData2(req, res) {
  try {
    const { days } = req.body;
    const daysToKeep = days ? parseInt(days) : 30;
    const count = await cleanOldData(daysToKeep);
    res.json({
      code: 200,
      message: `\u5DF2\u6E05\u7406${daysToKeep}\u5929\u524D\u7684\u6570\u636E`,
      deletedCount: count
    });
  } catch (error) {
    console.error("\u6E05\u7406\u8FC7\u671F\u6570\u636E\u5931\u8D25:", error);
    res.status(500).json({
      code: 500,
      message: "\u6E05\u7406\u5931\u8D25",
      error: error.message
    });
  }
}
async function getUserTracking(req, res) {
  try {
    const { userName, page, pageSize, startTime, endTime, category } = req.query;
    if (!userName) {
      return res.status(400).json({
        code: 400,
        message: "\u7528\u6237\u540D\u4E3A\u5FC5\u586B\u53C2\u6570"
      });
    }
    const result = await getUserTrackingData({
      userName,
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
      startTime: startTime ? parseInt(startTime) : void 0,
      endTime: endTime ? parseInt(endTime) : void 0,
      category
    });
    res.json({
      code: 200,
      data: result
    });
  } catch (error) {
    console.error("\u83B7\u53D6\u7528\u6237\u8FFD\u8E2A\u6570\u636E\u5931\u8D25:", error);
    res.status(500).json({
      code: 500,
      message: "\u83B7\u53D6\u6570\u636E\u5931\u8D25",
      error: error.message
    });
  }
}
async function getActiveUsers2(req, res) {
  try {
    const { startTime, endTime } = req.query;
    const result = await getActiveUsers({
      startTime: startTime ? parseInt(startTime) : void 0,
      endTime: endTime ? parseInt(endTime) : void 0
    });
    res.json({
      code: 200,
      data: result
    });
  } catch (error) {
    console.error("\u83B7\u53D6\u6D3B\u8DC3\u7528\u6237\u5217\u8868\u5931\u8D25:", error);
    res.status(500).json({
      code: 500,
      message: "\u83B7\u53D6\u6570\u636E\u5931\u8D25",
      error: error.message
    });
  }
}
async function getErrorBehaviorContext2(req, res) {
  try {
    const { errorId, seconds } = req.query;
    if (!errorId) {
      return res.status(400).json({
        code: 400,
        message: "errorId\u4E3A\u5FC5\u586B\u53C2\u6570"
      });
    }
    const result = await getErrorBehaviorContext({
      errorId: parseInt(errorId),
      seconds: seconds ? parseInt(seconds) : 10
    });
    res.json({
      code: 200,
      data: result
    });
  } catch (error) {
    console.error("\u83B7\u53D6\u9519\u8BEF\u884C\u4E3A\u4E0A\u4E0B\u6587\u5931\u8D25:", error);
    res.status(500).json({
      code: 500,
      message: "\u83B7\u53D6\u6570\u636E\u5931\u8D25",
      error: error.message
    });
  }
}

// src/routes/monitorDataRoutes.ts
var router13 = Router13();
router13.post("/report", reportData);
router13.get("/list", getDataList);
router13.get("/errors", getErrors);
router13.get("/performance", getPerformance);
router13.get("/behaviors", getBehaviors);
router13.get("/networks", getNetworks);
router13.get("/overview", getOverview);
router13.get("/trend", getTrend);
router13.get("/performance-metrics", getPerformanceMetrics2);
router13.get("/error-stats", getErrorStats2);
router13.get("/behavior-stats", getBehaviorStats2);
router13.get("/user-tracking", getUserTracking);
router13.get("/active-users", getActiveUsers2);
router13.get("/error-context", getErrorBehaviorContext2);
router13.delete("/delete", deleteData);
router13.post("/clean", cleanOldData2);
var monitorDataRoutes_default = router13;

// src/routes/aiAgentRoutes.ts
import { Router as Router14 } from "express";

// src/services/aiAgentService.ts
import { Op as Op14 } from "sequelize";
var getAgentList = async (params) => {
  const { page = 1, pageSize = 10, keyword, type, status, creatorId } = params;
  const offset = (page - 1) * pageSize;
  const where = {};
  if (keyword) {
    where[Op14.or] = [
      { name: { [Op14.like]: `%${keyword}%` } },
      { description: { [Op14.like]: `%${keyword}%` } }
    ];
  }
  if (type) {
    where.type = type;
  }
  if (status !== void 0 && status !== null) {
    where.status = status;
  }
  if (creatorId) {
    where.creator_id = creatorId;
  }
  const { count, rows } = await AIAgent.findAndCountAll({
    where,
    include: [
      {
        model: User_default,
        as: "creator",
        attributes: ["id", "name", "account"]
      }
    ],
    order: [["updated_at", "DESC"]],
    offset,
    limit: pageSize
  });
  const list = rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    type: row.type,
    avatar: row.avatar,
    status: row.status,
    mcpEnabled: row.mcp_enabled,
    ragEnabled: row.rag_enabled,
    workflowEnabled: row.workflow_enabled,
    pluginsCount: row.plugins ? row.plugins.length : 0,
    chatCount: row.chat_count,
    creatorName: row.creator?.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
  return { list, total: count };
};
var getAgentDetail = async (id) => {
  const agent = await AIAgent.findByPk(id, {
    include: [
      {
        model: User_default,
        as: "creator",
        attributes: ["id", "name", "account"]
      }
    ]
  });
  if (!agent) {
    throw new Error("\u667A\u80FD\u4F53\u4E0D\u5B58\u5728");
  }
  const data = agent.toJSON();
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    type: data.type,
    avatar: data.avatar,
    systemPrompt: data.system_prompt,
    welcomeMessage: data.welcome_message,
    suggestedQuestions: data.suggested_questions || [],
    modelConfig: data.model_config || {
      model: "gpt-4o",
      temperature: 0.7,
      topP: 0.9,
      maxTokens: 4096,
      contextLength: 10
    },
    mcpEnabled: data.mcp_enabled,
    mcpServers: data.mcp_servers || [],
    ragEnabled: data.rag_enabled,
    ragConfig: data.rag_config || {
      knowledgeBaseIds: [],
      retrievalMode: "hybrid",
      topK: 5,
      scoreThreshold: 0.5,
      rerankEnabled: true
    },
    workflowEnabled: data.workflow_enabled,
    workflowConfig: data.workflow_config || { nodes: [], edges: [] },
    plugins: data.plugins || [],
    status: data.status,
    chatCount: data.chat_count,
    creatorName: data.creator?.name,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};
var createAgent = async (data, creatorId) => {
  const agent = await AIAgent.create({
    name: data.name,
    description: data.description,
    type: data.type || "chat",
    avatar: data.avatar,
    system_prompt: data.systemPrompt,
    welcome_message: data.welcomeMessage,
    suggested_questions: data.suggestedQuestions || [],
    model_config: data.modelConfig,
    mcp_enabled: data.mcpEnabled || false,
    mcp_servers: data.mcpServers || [],
    rag_enabled: data.ragEnabled || false,
    rag_config: data.ragConfig,
    workflow_enabled: data.workflowEnabled || false,
    workflow_config: data.workflowConfig,
    plugins: data.plugins || [],
    status: data.status || 0,
    creator_id: creatorId,
    created_at: /* @__PURE__ */ new Date(),
    updated_at: /* @__PURE__ */ new Date()
  });
  return agent;
};
var updateAgent = async (id, data) => {
  const agent = await AIAgent.findByPk(id);
  if (!agent) {
    throw new Error("\u667A\u80FD\u4F53\u4E0D\u5B58\u5728");
  }
  const updateData = {
    updated_at: /* @__PURE__ */ new Date()
  };
  if (data.name !== void 0) updateData.name = data.name;
  if (data.description !== void 0) updateData.description = data.description;
  if (data.type !== void 0) updateData.type = data.type;
  if (data.avatar !== void 0) updateData.avatar = data.avatar;
  if (data.systemPrompt !== void 0) updateData.system_prompt = data.systemPrompt;
  if (data.welcomeMessage !== void 0) updateData.welcome_message = data.welcomeMessage;
  if (data.suggestedQuestions !== void 0) updateData.suggested_questions = data.suggestedQuestions;
  if (data.modelConfig !== void 0) updateData.model_config = data.modelConfig;
  if (data.mcpEnabled !== void 0) updateData.mcp_enabled = data.mcpEnabled;
  if (data.mcpServers !== void 0) updateData.mcp_servers = data.mcpServers;
  if (data.ragEnabled !== void 0) updateData.rag_enabled = data.ragEnabled;
  if (data.ragConfig !== void 0) updateData.rag_config = data.ragConfig;
  if (data.workflowEnabled !== void 0) updateData.workflow_enabled = data.workflowEnabled;
  if (data.workflowConfig !== void 0) updateData.workflow_config = data.workflowConfig;
  if (data.plugins !== void 0) updateData.plugins = data.plugins;
  if (data.status !== void 0) updateData.status = data.status;
  await agent.update(updateData);
  return agent;
};
var deleteAgent = async (id) => {
  const agent = await AIAgent.findByPk(id);
  if (!agent) {
    throw new Error("\u667A\u80FD\u4F53\u4E0D\u5B58\u5728");
  }
  const sessions = await ChatSession.findAll({ where: { agent_id: id } });
  for (const session of sessions) {
    await ChatMessage.destroy({ where: { session_id: session.id } });
  }
  await ChatSession.destroy({ where: { agent_id: id } });
  await agent.destroy();
  return true;
};
var publishAgent = async (id) => {
  const agent = await AIAgent.findByPk(id);
  if (!agent) {
    throw new Error("\u667A\u80FD\u4F53\u4E0D\u5B58\u5728");
  }
  await agent.update({ status: 1, updated_at: /* @__PURE__ */ new Date() });
  return true;
};
var disableAgent = async (id) => {
  const agent = await AIAgent.findByPk(id);
  if (!agent) {
    throw new Error("\u667A\u80FD\u4F53\u4E0D\u5B58\u5728");
  }
  await agent.update({ status: -1, updated_at: /* @__PURE__ */ new Date() });
  return true;
};
var copyAgent = async (id, creatorId) => {
  const agent = await AIAgent.findByPk(id);
  if (!agent) {
    throw new Error("\u667A\u80FD\u4F53\u4E0D\u5B58\u5728");
  }
  const data = agent.toJSON();
  const newAgent = await AIAgent.create({
    name: `${data.name} (\u526F\u672C)`,
    description: data.description,
    type: data.type,
    avatar: data.avatar,
    system_prompt: data.system_prompt,
    welcome_message: data.welcome_message,
    suggested_questions: data.suggested_questions,
    model_config: data.model_config,
    mcp_enabled: data.mcp_enabled,
    mcp_servers: data.mcp_servers,
    rag_enabled: data.rag_enabled,
    rag_config: data.rag_config,
    workflow_enabled: data.workflow_enabled,
    workflow_config: data.workflow_config,
    plugins: data.plugins,
    status: 0,
    // 复制后为草稿状态
    chat_count: 0,
    creator_id: creatorId,
    created_at: /* @__PURE__ */ new Date(),
    updated_at: /* @__PURE__ */ new Date()
  });
  return newAgent;
};
var exportAgent = async (id) => {
  const agent = await AIAgent.findByPk(id);
  if (!agent) {
    throw new Error("\u667A\u80FD\u4F53\u4E0D\u5B58\u5728");
  }
  const data = agent.toJSON();
  return {
    name: data.name,
    description: data.description,
    type: data.type,
    avatar: data.avatar,
    systemPrompt: data.system_prompt,
    welcomeMessage: data.welcome_message,
    suggestedQuestions: data.suggested_questions,
    modelConfig: data.model_config,
    mcpEnabled: data.mcp_enabled,
    mcpServers: data.mcp_servers,
    ragEnabled: data.rag_enabled,
    ragConfig: data.rag_config,
    workflowEnabled: data.workflow_enabled,
    workflowConfig: data.workflow_config,
    plugins: data.plugins,
    exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
    version: "1.0"
  };
};
var chatWithAgent = async (agentId, message, history, userId) => {
  const agent = await AIAgent.findByPk(agentId);
  if (!agent) {
    throw new Error("\u667A\u80FD\u4F53\u4E0D\u5B58\u5728");
  }
  await agent.increment("chat_count");
  const agentData = agent.toJSON();
  const modelConfig = agentData.model_config || {};
  const systemPrompt = agentData.system_prompt || "";
  const reply = `\u6536\u5230\u60A8\u7684\u6D88\u606F\uFF1A"${message}"\u3002\u8FD9\u662F\u6765\u81EA\u667A\u80FD\u4F53"${agentData.name}"\u7684\u56DE\u590D\u3002

\u5F53\u524D\u914D\u7F6E\uFF1A
- \u6A21\u578B\uFF1A${modelConfig.model || "gpt-4o"}
- Temperature\uFF1A${modelConfig.temperature || 0.7}
- MCP\uFF1A${agentData.mcp_enabled ? "\u5DF2\u542F\u7528" : "\u672A\u542F\u7528"}
- RAG\uFF1A${agentData.rag_enabled ? "\u5DF2\u542F\u7528" : "\u672A\u542F\u7528"}
- \u5DE5\u4F5C\u6D41\uFF1A${agentData.workflow_enabled ? "\u5DF2\u542F\u7528" : "\u672A\u542F\u7528"}

\u5728\u5B9E\u9645\u4F7F\u7528\u4E2D\uFF0C\u8FD9\u91CC\u4F1A\u8C03\u7528\u771F\u5B9E\u7684AI\u670D\u52A1\u8FDB\u884C\u56DE\u590D\u3002`;
  const tokens = Math.floor(message.length * 1.5 + reply.length * 1.5);
  return {
    reply,
    tokens,
    model: modelConfig.model || "gpt-4o"
  };
};
var getChatHistory = async (agentId, params) => {
  const { page = 1, pageSize = 20 } = params;
  const offset = (page - 1) * pageSize;
  const { count, rows } = await ChatSession.findAndCountAll({
    where: { agent_id: agentId },
    order: [["updated_at", "DESC"]],
    offset,
    limit: pageSize
  });
  const list = rows.map((row) => ({
    id: row.id,
    title: row.title,
    messageCount: row.message_count,
    totalTokens: row.total_tokens,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
  return { list, total: count };
};
var getKnowledgeBaseList = async (params) => {
  const { page = 1, pageSize = 20, creatorId } = params;
  const offset = (page - 1) * pageSize;
  const where = {};
  if (creatorId) {
    where.creator_id = creatorId;
  }
  const { count, rows } = await KnowledgeBase.findAndCountAll({
    where,
    include: [
      {
        model: User_default,
        as: "creator",
        attributes: ["id", "name"]
      }
    ],
    order: [["updated_at", "DESC"]],
    offset,
    limit: pageSize
  });
  const list = rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    embeddingModel: row.embedding_model,
    docCount: row.doc_count,
    chunkCount: row.chunk_count,
    status: row.status,
    creatorName: row.creator?.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
  return { list, total: count };
};
var createKnowledgeBase = async (data, creatorId) => {
  const kb = await KnowledgeBase.create({
    name: data.name,
    description: data.description,
    embedding_model: data.embeddingModel || "text-embedding-3-small",
    status: 1,
    creator_id: creatorId,
    created_at: /* @__PURE__ */ new Date(),
    updated_at: /* @__PURE__ */ new Date()
  });
  return kb;
};
var deleteKnowledgeBase = async (id) => {
  const kb = await KnowledgeBase.findByPk(id);
  if (!kb) {
    throw new Error("\u77E5\u8BC6\u5E93\u4E0D\u5B58\u5728");
  }
  await KnowledgeDocument.destroy({ where: { knowledge_base_id: id } });
  await kb.destroy();
  return true;
};
var getKnowledgeBaseDocuments = async (knowledgeBaseId) => {
  const documents = await KnowledgeDocument.findAll({
    where: { knowledge_base_id: knowledgeBaseId },
    order: [["created_at", "DESC"]]
  });
  return documents.map((doc) => ({
    id: doc.id,
    name: doc.name,
    type: doc.type,
    size: doc.size,
    chunkCount: doc.chunk_count,
    status: doc.status,
    errorMessage: doc.error_message,
    createdAt: doc.created_at
  }));
};
var getPlugins = async () => {
  return [
    {
      id: "web_search",
      name: "\u8054\u7F51\u641C\u7D22",
      description: "\u641C\u7D22\u4E92\u8054\u7F51\u83B7\u53D6\u6700\u65B0\u4FE1\u606F",
      icon: "Search",
      color: "#409eff",
      tags: ["\u4FE1\u606F\u83B7\u53D6", "\u5B9E\u65F6\u6027"]
    },
    {
      id: "code_interpreter",
      name: "\u4EE3\u7801\u89E3\u91CA\u5668",
      description: "\u6267\u884CPython\u4EE3\u7801\u8FDB\u884C\u6570\u636E\u5206\u6790",
      icon: "Cpu",
      color: "#67c23a",
      tags: ["\u4EE3\u7801\u6267\u884C", "\u6570\u636E\u5206\u6790"]
    },
    {
      id: "image_gen",
      name: "\u56FE\u7247\u751F\u6210",
      description: "\u4F7F\u7528DALL-E\u751F\u6210\u56FE\u7247",
      icon: "Picture",
      color: "#e6a23c",
      tags: ["\u56FE\u7247\u751F\u6210", "AI\u7ED8\u753B"]
    },
    {
      id: "file_reader",
      name: "\u6587\u4EF6\u9605\u8BFB",
      description: "\u8BFB\u53D6\u548C\u89E3\u6790\u5404\u7C7B\u6587\u6863",
      icon: "Files",
      color: "#909399",
      tags: ["\u6587\u6863\u5904\u7406", "PDF"]
    },
    {
      id: "calendar",
      name: "\u65E5\u7A0B\u7BA1\u7406",
      description: "\u7BA1\u7406\u65E5\u7A0B\u548C\u63D0\u9192",
      icon: "Calendar",
      color: "#f56c6c",
      tags: ["\u65E5\u7A0B", "\u63D0\u9192"]
    },
    {
      id: "weather",
      name: "\u5929\u6C14\u67E5\u8BE2",
      description: "\u67E5\u8BE2\u5929\u6C14\u9884\u62A5",
      icon: "Clock",
      color: "#00bcd4",
      tags: ["\u5929\u6C14", "\u751F\u6D3B"]
    }
  ];
};
var getMcpServers = async () => {
  return [
    {
      id: "filesystem",
      name: "\u6587\u4EF6\u7CFB\u7EDF",
      description: "\u8BFB\u5199\u672C\u5730\u6587\u4EF6",
      command: "npx",
      args: '["-y", "@modelcontextprotocol/server-filesystem", "/path/to/dir"]'
    },
    {
      id: "database",
      name: "\u6570\u636E\u5E93",
      description: "\u8FDE\u63A5SQL\u6570\u636E\u5E93",
      command: "npx",
      args: '["-y", "@modelcontextprotocol/server-postgres"]'
    },
    {
      id: "web",
      name: "Web\u6D4F\u89C8",
      description: "\u8BBF\u95EE\u548C\u89E3\u6790\u7F51\u9875",
      command: "npx",
      args: '["-y", "@anthropics/mcp-server-puppeteer"]'
    },
    {
      id: "github",
      name: "GitHub",
      description: "\u64CD\u4F5CGitHub\u4ED3\u5E93",
      command: "npx",
      args: '["-y", "@modelcontextprotocol/server-github"]'
    }
  ];
};
var testMcpConnection = async (serverConfig) => {
  return {
    success: true,
    message: "MCP\u670D\u52A1\u8FDE\u63A5\u6D4B\u8BD5\u6210\u529F",
    tools: ["tool1", "tool2", "tool3"]
  };
};

// src/controllers/aiAgentController.ts
var getAgentList2 = async (req, res) => {
  try {
    const { page, pageSize, keyword, type, status } = req.body;
    const userId = req.user?.id;
    const result = await getAgentList({
      page: page || 1,
      pageSize: pageSize || 10,
      keyword,
      type,
      status
    });
    res.json({
      code: 200,
      message: "\u83B7\u53D6\u6210\u529F",
      data: result
    });
  } catch (error) {
    console.error("\u83B7\u53D6\u667A\u80FD\u4F53\u5217\u8868\u5931\u8D25:", error);
    res.json({
      code: 500,
      message: error.message || "\u83B7\u53D6\u667A\u80FD\u4F53\u5217\u8868\u5931\u8D25",
      data: null
    });
  }
};
var getAgentDetail2 = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getAgentDetail(Number(id));
    res.json({
      code: 200,
      message: "\u83B7\u53D6\u6210\u529F",
      data: result
    });
  } catch (error) {
    console.error("\u83B7\u53D6\u667A\u80FD\u4F53\u8BE6\u60C5\u5931\u8D25:", error);
    res.json({
      code: 500,
      message: error.message || "\u83B7\u53D6\u667A\u80FD\u4F53\u8BE6\u60C5\u5931\u8D25",
      data: null
    });
  }
};
var createAgent2 = async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const result = await createAgent(req.body, userId);
    res.json({
      code: 200,
      message: "\u521B\u5EFA\u6210\u529F",
      data: { id: result.id }
    });
  } catch (error) {
    console.error("\u521B\u5EFA\u667A\u80FD\u4F53\u5931\u8D25:", error);
    res.json({
      code: 500,
      message: error.message || "\u521B\u5EFA\u667A\u80FD\u4F53\u5931\u8D25",
      data: null
    });
  }
};
var updateAgent2 = async (req, res) => {
  try {
    const { id } = req.params;
    await updateAgent(Number(id), req.body);
    res.json({
      code: 200,
      message: "\u66F4\u65B0\u6210\u529F",
      data: null
    });
  } catch (error) {
    console.error("\u66F4\u65B0\u667A\u80FD\u4F53\u5931\u8D25:", error);
    res.json({
      code: 500,
      message: error.message || "\u66F4\u65B0\u667A\u80FD\u4F53\u5931\u8D25",
      data: null
    });
  }
};
var deleteAgent2 = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteAgent(Number(id));
    res.json({
      code: 200,
      message: "\u5220\u9664\u6210\u529F",
      data: null
    });
  } catch (error) {
    console.error("\u5220\u9664\u667A\u80FD\u4F53\u5931\u8D25:", error);
    res.json({
      code: 500,
      message: error.message || "\u5220\u9664\u667A\u80FD\u4F53\u5931\u8D25",
      data: null
    });
  }
};
var publishAgent2 = async (req, res) => {
  try {
    const { id } = req.params;
    await publishAgent(Number(id));
    res.json({
      code: 200,
      message: "\u53D1\u5E03\u6210\u529F",
      data: null
    });
  } catch (error) {
    console.error("\u53D1\u5E03\u667A\u80FD\u4F53\u5931\u8D25:", error);
    res.json({
      code: 500,
      message: error.message || "\u53D1\u5E03\u667A\u80FD\u4F53\u5931\u8D25",
      data: null
    });
  }
};
var disableAgent2 = async (req, res) => {
  try {
    const { id } = req.params;
    await disableAgent(Number(id));
    res.json({
      code: 200,
      message: "\u505C\u7528\u6210\u529F",
      data: null
    });
  } catch (error) {
    console.error("\u505C\u7528\u667A\u80FD\u4F53\u5931\u8D25:", error);
    res.json({
      code: 500,
      message: error.message || "\u505C\u7528\u667A\u80FD\u4F53\u5931\u8D25",
      data: null
    });
  }
};
var copyAgent2 = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 1;
    const result = await copyAgent(Number(id), userId);
    res.json({
      code: 200,
      message: "\u590D\u5236\u6210\u529F",
      data: { id: result.id }
    });
  } catch (error) {
    console.error("\u590D\u5236\u667A\u80FD\u4F53\u5931\u8D25:", error);
    res.json({
      code: 500,
      message: error.message || "\u590D\u5236\u667A\u80FD\u4F53\u5931\u8D25",
      data: null
    });
  }
};
var exportAgent2 = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await exportAgent(Number(id));
    res.json({
      code: 200,
      message: "\u5BFC\u51FA\u6210\u529F",
      data: result
    });
  } catch (error) {
    console.error("\u5BFC\u51FA\u667A\u80FD\u4F53\u5931\u8D25:", error);
    res.json({
      code: 500,
      message: error.message || "\u5BFC\u51FA\u667A\u80FD\u4F53\u5931\u8D25",
      data: null
    });
  }
};
var importAgent = async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const configData = req.body;
    const result = await createAgent({
      name: configData.name,
      description: configData.description,
      type: configData.type,
      avatar: configData.avatar,
      systemPrompt: configData.systemPrompt,
      welcomeMessage: configData.welcomeMessage,
      suggestedQuestions: configData.suggestedQuestions,
      modelConfig: configData.modelConfig,
      mcpEnabled: configData.mcpEnabled,
      mcpServers: configData.mcpServers,
      ragEnabled: configData.ragEnabled,
      ragConfig: configData.ragConfig,
      workflowEnabled: configData.workflowEnabled,
      workflowConfig: configData.workflowConfig,
      plugins: configData.plugins,
      status: 0
      // 导入后为草稿状态
    }, userId);
    res.json({
      code: 200,
      message: "\u5BFC\u5165\u6210\u529F",
      data: { id: result.id }
    });
  } catch (error) {
    console.error("\u5BFC\u5165\u667A\u80FD\u4F53\u5931\u8D25:", error);
    res.json({
      code: 500,
      message: error.message || "\u5BFC\u5165\u667A\u80FD\u4F53\u5931\u8D25",
      data: null
    });
  }
};
var chatWithAgent2 = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { message, history } = req.body;
    const userId = req.user?.id;
    const result = await chatWithAgent(
      Number(agentId),
      message,
      history || [],
      userId
    );
    res.json({
      code: 200,
      message: "\u6210\u529F",
      data: result
    });
  } catch (error) {
    console.error("\u5BF9\u8BDD\u5931\u8D25:", error);
    res.json({
      code: 500,
      message: error.message || "\u5BF9\u8BDD\u5931\u8D25",
      data: null
    });
  }
};
var getChatHistory2 = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { page, pageSize } = req.body;
    const result = await getChatHistory(Number(agentId), {
      page: page || 1,
      pageSize: pageSize || 20
    });
    res.json({
      code: 200,
      message: "\u83B7\u53D6\u6210\u529F",
      data: result
    });
  } catch (error) {
    console.error("\u83B7\u53D6\u5BF9\u8BDD\u5386\u53F2\u5931\u8D25:", error);
    res.json({
      code: 500,
      message: error.message || "\u83B7\u53D6\u5BF9\u8BDD\u5386\u53F2\u5931\u8D25",
      data: null
    });
  }
};
var getKnowledgeBaseList2 = async (req, res) => {
  try {
    const { page, pageSize } = req.body;
    const userId = req.user?.id;
    const result = await getKnowledgeBaseList({
      page: page || 1,
      pageSize: pageSize || 20
    });
    res.json({
      code: 200,
      message: "\u83B7\u53D6\u6210\u529F",
      data: result
    });
  } catch (error) {
    console.error("\u83B7\u53D6\u77E5\u8BC6\u5E93\u5217\u8868\u5931\u8D25:", error);
    res.json({
      code: 500,
      message: error.message || "\u83B7\u53D6\u77E5\u8BC6\u5E93\u5217\u8868\u5931\u8D25",
      data: null
    });
  }
};
var createKnowledgeBase2 = async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const result = await createKnowledgeBase(req.body, userId);
    res.json({
      code: 200,
      message: "\u521B\u5EFA\u6210\u529F",
      data: { id: result.id }
    });
  } catch (error) {
    console.error("\u521B\u5EFA\u77E5\u8BC6\u5E93\u5931\u8D25:", error);
    res.json({
      code: 500,
      message: error.message || "\u521B\u5EFA\u77E5\u8BC6\u5E93\u5931\u8D25",
      data: null
    });
  }
};
var deleteKnowledgeBase2 = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteKnowledgeBase(Number(id));
    res.json({
      code: 200,
      message: "\u5220\u9664\u6210\u529F",
      data: null
    });
  } catch (error) {
    console.error("\u5220\u9664\u77E5\u8BC6\u5E93\u5931\u8D25:", error);
    res.json({
      code: 500,
      message: error.message || "\u5220\u9664\u77E5\u8BC6\u5E93\u5931\u8D25",
      data: null
    });
  }
};
var uploadDocument = async (req, res) => {
  try {
    const { knowledgeBaseId } = req.params;
    res.json({
      code: 200,
      message: "\u4E0A\u4F20\u6210\u529F\uFF0C\u6B63\u5728\u5904\u7406\u4E2D",
      data: {
        id: Date.now(),
        status: 0
        // 处理中
      }
    });
  } catch (error) {
    console.error("\u4E0A\u4F20\u6587\u6863\u5931\u8D25:", error);
    res.json({
      code: 500,
      message: error.message || "\u4E0A\u4F20\u6587\u6863\u5931\u8D25",
      data: null
    });
  }
};
var getKnowledgeBaseDocuments2 = async (req, res) => {
  try {
    const { knowledgeBaseId } = req.params;
    const result = await getKnowledgeBaseDocuments(Number(knowledgeBaseId));
    res.json({
      code: 200,
      message: "\u83B7\u53D6\u6210\u529F",
      data: result
    });
  } catch (error) {
    console.error("\u83B7\u53D6\u77E5\u8BC6\u5E93\u6587\u6863\u5931\u8D25:", error);
    res.json({
      code: 500,
      message: error.message || "\u83B7\u53D6\u77E5\u8BC6\u5E93\u6587\u6863\u5931\u8D25",
      data: null
    });
  }
};
var getPlugins2 = async (req, res) => {
  try {
    const result = await getPlugins();
    res.json({
      code: 200,
      message: "\u83B7\u53D6\u6210\u529F",
      data: result
    });
  } catch (error) {
    console.error("\u83B7\u53D6\u63D2\u4EF6\u5217\u8868\u5931\u8D25:", error);
    res.json({
      code: 500,
      message: error.message || "\u83B7\u53D6\u63D2\u4EF6\u5217\u8868\u5931\u8D25",
      data: null
    });
  }
};
var getMcpServers2 = async (req, res) => {
  try {
    const result = await getMcpServers();
    res.json({
      code: 200,
      message: "\u83B7\u53D6\u6210\u529F",
      data: result
    });
  } catch (error) {
    console.error("\u83B7\u53D6MCP\u670D\u52A1\u5217\u8868\u5931\u8D25:", error);
    res.json({
      code: 500,
      message: error.message || "\u83B7\u53D6MCP\u670D\u52A1\u5217\u8868\u5931\u8D25",
      data: null
    });
  }
};
var testMcpConnection2 = async (req, res) => {
  try {
    const result = await testMcpConnection(req.body);
    res.json({
      code: 200,
      message: "\u6D4B\u8BD5\u6210\u529F",
      data: result
    });
  } catch (error) {
    console.error("\u6D4B\u8BD5MCP\u8FDE\u63A5\u5931\u8D25:", error);
    res.json({
      code: 500,
      message: error.message || "\u6D4B\u8BD5MCP\u8FDE\u63A5\u5931\u8D25",
      data: null
    });
  }
};
var saveWorkflow = async (req, res) => {
  try {
    const { agentId } = req.params;
    const workflowConfig = req.body;
    await updateAgent(Number(agentId), {
      workflowConfig,
      workflowEnabled: true
    });
    res.json({
      code: 200,
      message: "\u4FDD\u5B58\u6210\u529F",
      data: null
    });
  } catch (error) {
    console.error("\u4FDD\u5B58\u5DE5\u4F5C\u6D41\u5931\u8D25:", error);
    res.json({
      code: 500,
      message: error.message || "\u4FDD\u5B58\u5DE5\u4F5C\u6D41\u5931\u8D25",
      data: null
    });
  }
};
var executeWorkflow = async (req, res) => {
  try {
    const { agentId } = req.params;
    const input = req.body;
    res.json({
      code: 200,
      message: "\u6267\u884C\u6210\u529F",
      data: {
        output: "\u5DE5\u4F5C\u6D41\u6267\u884C\u7ED3\u679C...",
        executionTime: 1234,
        nodes: []
      }
    });
  } catch (error) {
    console.error("\u6267\u884C\u5DE5\u4F5C\u6D41\u5931\u8D25:", error);
    res.json({
      code: 500,
      message: error.message || "\u6267\u884C\u5DE5\u4F5C\u6D41\u5931\u8D25",
      data: null
    });
  }
};

// src/routes/aiAgentRoutes.ts
var router14 = Router14();
router14.post("/list", getAgentList2);
router14.get("/detail/:id", getAgentDetail2);
router14.post("/create", createAgent2);
router14.post("/update/:id", updateAgent2);
router14.delete("/delete/:id", deleteAgent2);
router14.post("/publish/:id", publishAgent2);
router14.post("/disable/:id", disableAgent2);
router14.post("/copy/:id", copyAgent2);
router14.get("/export/:id", exportAgent2);
router14.post("/import", importAgent);
router14.post("/chat/:agentId", chatWithAgent2);
router14.post("/chat-history/:agentId", getChatHistory2);
router14.post("/knowledge-base/list", getKnowledgeBaseList2);
router14.post("/knowledge-base/create", createKnowledgeBase2);
router14.delete("/knowledge-base/:id", deleteKnowledgeBase2);
router14.post("/knowledge-base/:knowledgeBaseId/upload", uploadDocument);
router14.get("/knowledge-base/:knowledgeBaseId/documents", getKnowledgeBaseDocuments2);
router14.get("/plugins", getPlugins2);
router14.get("/mcp/servers", getMcpServers2);
router14.post("/mcp/test", testMcpConnection2);
router14.post("/workflow/:agentId", saveWorkflow);
router14.post("/workflow/:agentId/execute", executeWorkflow);
var aiAgentRoutes_default = router14;

// src/app.ts
dotenv2.config();
var app = express();
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "token"]
}));
app.use(express.json());
app.use((req, res, next) => {
  if (req.path.length > 1 && req.path.endsWith("/")) {
    const query = req.url.slice(req.path.length);
    res.redirect(301, req.path.slice(0, -1) + query);
    return;
  }
  next();
});
app.use("/api", userRoutes_default);
app.use("/api/stations", stationRoutes_default);
app.use("/api", revenueRoutes_default);
app.use("/api/dashboard", dashboardRoutes_default);
app.use("/api/alarms", alarmRoutes_default);
app.use("/api/member", memberCardRoutes_default);
app.use("/api", orderRoutes_default);
app.use("/api", billingTemplateRoutes_default);
app.use("/api", documentRoutes_default);
app.use("/api", personalRoutes_default);
app.use("/api", mapRoutes_default);
app.use("/api", pileRoutes_default);
app.use("/api/monitor", monitorDataRoutes_default);
app.use("/api/ai-agent", aiAgentRoutes_default);
app.use("/api", alarmRoutes_default);
async function updateExistingUsersData() {
  try {
    const users = await User_default.findAll();
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
    const tagOptions = [
      ["\u8BA4\u771F", "\u5DE5\u4F5C\u72C2", "\u4E0E\u4EBA\u548C\u5584", "\u4EE3\u7801\u6D01\u7656"],
      ["\u8D1F\u8D23", "\u9AD8\u6548", "\u56E2\u961F\u5408\u4F5C", "\u5B66\u4E60\u80FD\u529B\u5F3A"],
      ["\u7EC6\u5FC3", "\u4E13\u4E1A", "\u6C9F\u901A\u80FD\u529B\u5F3A", "\u6267\u884C\u529B\u5F3A"],
      ["\u521B\u65B0", "\u79EF\u6781", "\u4E50\u89C2", "\u6297\u538B\u80FD\u529B\u5F3A"],
      ["\u4E25\u8C28", "\u4E13\u6CE8", "\u6709\u8D23\u4EFB\u5FC3", "\u6280\u672F\u8FC7\u786C"]
    ];
    for (const user of users) {
      const updateData = {};
      let needUpdate = false;
      if (!user.address) {
        updateData.address = addresses[Math.floor(Math.random() * addresses.length)];
        needUpdate = true;
      }
      if (!user.tags || Array.isArray(user.tags) && user.tags.length === 0) {
        updateData.tags = tagOptions[Math.floor(Math.random() * tagOptions.length)];
        needUpdate = true;
      }
      if (!user.work_status) {
        updateData.work_status = Math.floor(Math.random() * 4) + 1;
        needUpdate = true;
      }
      if (!user.avatar) {
        const seed = user.account || user.id;
        updateData.avatar = `https://api.dicebear.com/7.x/miniavs/svg?seed=${seed}`;
        needUpdate = true;
      }
      if (needUpdate) {
        await user.update(updateData);
      }
    }
    if (users.length > 0) {
      console.log(`\u2705 \u5DF2\u66F4\u65B0 ${users.length} \u4E2A\u7528\u6237\u7684\u4E2A\u4EBA\u4FE1\u606F\u5B57\u6BB5`);
    }
  } catch (error) {
    console.error("\u26A0\uFE0F  \u66F4\u65B0\u7528\u6237\u6570\u636E\u65F6\u51FA\u9519:", error);
  }
}
async function addMissingColumnsIfNeeded() {
  try {
    const [chargingUserResults] = await db_default.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'charging_user'
    `);
    const chargingUserColumns = chargingUserResults.map((r) => r.COLUMN_NAME);
    const queries = [];
    if (!chargingUserColumns.includes("card_type")) {
      queries.push(`ALTER TABLE charging_user ADD COLUMN card_type VARCHAR(20) DEFAULT '\u666E\u901A\u5361' COMMENT '\u5361\u7C7B\u578B\uFF1A\u666E\u901A\u5361\u3001VIP\u5361\u3001\u5B63\u5361'`);
    }
    if (!chargingUserColumns.includes("issue_date")) {
      queries.push(`ALTER TABLE charging_user ADD COLUMN issue_date DATETIME COMMENT '\u5F00\u5361\u65E5\u671F'`);
    }
    if (!chargingUserColumns.includes("valid_until")) {
      queries.push(`ALTER TABLE charging_user ADD COLUMN valid_until DATETIME COMMENT '\u6709\u6548\u671F\u81F3'`);
    }
    const [userResults] = await db_default.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'user'
    `);
    const userColumns = userResults.map((r) => r.COLUMN_NAME);
    if (!userColumns.includes("address")) {
      queries.push(`ALTER TABLE user ADD COLUMN address VARCHAR(200) COMMENT '\u5730\u5740'`);
    }
    if (!userColumns.includes("tags")) {
      queries.push(`ALTER TABLE user ADD COLUMN tags JSON COMMENT '\u4E2A\u4EBA\u6807\u7B7E\uFF08\u6570\u7EC4\uFF09'`);
    }
    if (!userColumns.includes("work_status")) {
      queries.push(`ALTER TABLE user ADD COLUMN work_status TINYINT DEFAULT 1 COMMENT '\u5728\u804C\u72B6\u6001\uFF1A1\u5DE5\u4F5C\u4E2D\uFF0C2\u8BF7\u5047\u4E2D\uFF0C3\u51FA\u5DEE\u4E2D\uFF0C4\u5E74\u5047\u4E2D'`);
    }
    if (!userColumns.includes("avatar")) {
      queries.push(`ALTER TABLE user ADD COLUMN avatar VARCHAR(500) COMMENT '\u5934\u50CFURL'`);
    }
    for (const query of queries) {
      await db_default.query(query);
    }
    if (queries.length > 0) {
      console.log(`\u2705 \u5DF2\u6DFB\u52A0 ${queries.length} \u4E2A\u7F3A\u5931\u7684\u5B57\u6BB5`);
    }
  } catch (error) {
    console.error("\u26A0\uFE0F  \u6DFB\u52A0\u7F3A\u5931\u5B57\u6BB5\u65F6\u51FA\u9519\uFF08\u53EF\u80FD\u5B57\u6BB5\u5DF2\u5B58\u5728\uFF09:", error);
  }
}
var PORT = process.env.PORT || 3001;
db_default.authenticate().then(async () => {
  console.log("\u2705 \u6570\u636E\u5E93\u8FDE\u63A5\u6210\u529F\uFF01");
  try {
    await db_default.query("SET FOREIGN_KEY_CHECKS = 0");
    const result = await db_default.sync({ alter: false, force: false });
    await db_default.query("SET FOREIGN_KEY_CHECKS = 1");
    await addMissingColumnsIfNeeded();
    return result;
  } catch (syncError) {
    await db_default.query("SET FOREIGN_KEY_CHECKS = 1");
    if (syncError.message && syncError.message.includes("keys")) {
      console.error("\u26A0\uFE0F  \u6570\u636E\u5E93\u7D22\u5F15\u9519\u8BEF\uFF0C\u53EF\u80FD\u9700\u8981\u624B\u52A8\u5904\u7406\uFF1A");
      console.error("   1. \u68C0\u67E5\u662F\u5426\u6709\u91CD\u590D\u7684\u7D22\u5F15");
      console.error("   2. \u68C0\u67E5\u7D22\u5F15\u6570\u91CF\u662F\u5426\u8D85\u8FC7\u9650\u5236");
      console.error("   3. \u53EF\u4EE5\u5C1D\u8BD5\u5220\u9664\u8868\u540E\u91CD\u65B0\u521B\u5EFA\uFF08\u4F1A\u4E22\u5931\u6570\u636E\uFF09");
    }
    throw syncError;
  }
}).then(async () => {
  console.log("\u2705 \u6570\u636E\u5E93\u8868\u7ED3\u6784\u540C\u6B65\u6210\u529F\uFF01");
  try {
    await initDefaultUser();
    await updateExistingUsersData();
    const FORCE_INIT_MOCK = process.env.FORCE_INIT_MOCK === "true";
    const userCount = await User_default.count();
    const chargingUserCount = await ChargingUser_default.count();
    if (FORCE_INIT_MOCK) {
      console.log("\u{1F504} \u5F3A\u5236\u521D\u59CB\u5316Mock\u6570\u636E\uFF08FORCE_INIT_MOCK=true\uFF09...");
      await initMockData();
    } else if (userCount <= 1) {
      await initMockData();
    } else if (chargingUserCount === 0) {
      console.log("\u{1F4E6} \u5F00\u59CB\u521D\u59CB\u5316\u5145\u7535\u7528\u6237\u6570\u636E...");
      const { initChargingUsers } = await import("./initMockData-JZZZUJE7.js");
      await initChargingUsers();
      console.log("\u2705 \u5145\u7535\u7528\u6237\u6570\u636E\u521D\u59CB\u5316\u5B8C\u6210");
    } else {
      console.log("\u2139\uFE0F  \u6570\u636E\u5E93\u5DF2\u6709\u6570\u636E\uFF0C\u8DF3\u8FC7Mock\u6570\u636E\u521D\u59CB\u5316");
      console.log("\u{1F4A1} \u63D0\u793A\uFF1A\u5982\u9700\u5F3A\u5236\u91CD\u65B0\u521D\u59CB\u5316\uFF0C\u8BF7\u5728 .env \u6587\u4EF6\u4E2D\u8BBE\u7F6E FORCE_INIT_MOCK=true");
    }
  } catch (error) {
    console.error("\u274C \u6570\u636E\u521D\u59CB\u5316\u5931\u8D25:", error);
    console.log("\u26A0\uFE0F  \u670D\u52A1\u5668\u5C06\u7EE7\u7EED\u542F\u52A8\uFF0C\u4F46\u53EF\u80FD\u7F3A\u5C11\u521D\u59CB\u6570\u636E");
  }
  app.listen(PORT, () => {
    console.log(`\u{1F680} Server running at http://localhost:${PORT}`);
    console.log(`\u{1F4DD} API \u6587\u6863: http://localhost:${PORT}/api`);
  });
}).catch((err) => {
  console.error("\u274C \u542F\u52A8\u5931\u8D25\uFF1A");
  console.error("\u9519\u8BEF\u8BE6\u60C5\uFF1A", err.message);
  if (err.message.includes("ECONNREFUSED")) {
    console.error("\n\u{1F4A1} \u63D0\u793A\uFF1A\u8BF7\u68C0\u67E5\uFF1A");
    console.error("   1. MySQL \u670D\u52A1\u662F\u5426\u5DF2\u542F\u52A8");
    console.error("   2. \u6570\u636E\u5E93\u8FDE\u63A5\u914D\u7F6E\u662F\u5426\u6B63\u786E\uFF08.env \u6587\u4EF6\uFF09");
    console.error("   3. \u6570\u636E\u5E93 charging_station \u662F\u5426\u5DF2\u521B\u5EFA");
  } else if (err.message.includes("Access denied")) {
    console.error("\n\u{1F4A1} \u63D0\u793A\uFF1A\u6570\u636E\u5E93\u7528\u6237\u540D\u6216\u5BC6\u7801\u9519\u8BEF\uFF0C\u8BF7\u68C0\u67E5 .env \u6587\u4EF6");
  } else if (err.message.includes("Unknown database")) {
    console.error("\n\u{1F4A1} \u63D0\u793A\uFF1A\u6570\u636E\u5E93\u4E0D\u5B58\u5728\uFF0C\u8BF7\u5148\u521B\u5EFA\u6570\u636E\u5E93\uFF1A");
    console.error("   CREATE DATABASE charging_station CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
  }
  process.exit(1);
});
