const fs = require("fs");
const path = require("path");
const pptxgen = require("/Users/cuing/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pptxgenjs");

const OUT_DIR = "/Users/cuing/ros/ros-course-lab/docs/presentation";
const OUT = path.join(OUT_DIR, "mountain_city_system_presentation.pptx");

fs.mkdirSync(OUT_DIR, { recursive: true });

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "mountain_car_sim";
pptx.subject = "ROS + Gazebo 山地-城市融合多机器人仿真系统";
pptx.title = "山地-城市融合多机器人仿真系统";
pptx.company = "ROS Course Lab";
pptx.lang = "zh-CN";
pptx.theme = {
  headFontFace: "Microsoft YaHei",
  bodyFontFace: "Microsoft YaHei",
  lang: "zh-CN",
};
pptx.defineLayout({ name: "CUSTOM_WIDE", width: 13.333, height: 7.5 });
pptx.layout = "CUSTOM_WIDE";

const C = {
  bg: "F6F7F2",
  ink: "1E293B",
  muted: "64748B",
  line: "D7DDD4",
  white: "FFFFFF",
  mountain: "2E6B4E",
  mountainDark: "174934",
  road: "343A40",
  city: "3B82F6",
  cityDark: "1D4ED8",
  air: "F97316",
  yellow: "FACC15",
  brown: "8A5A2B",
  dirt: "C08457",
  paleGreen: "E4EEDF",
  paleBlue: "EAF2FF",
  paleOrange: "FFF0E2",
  paleGray: "EEF1F4",
  red: "DC2626",
};

function addBase(slide, page, kicker = "ROS Noetic + Gazebo Classic") {
  slide.background = { color: C.bg };
  slide.addText(kicker, {
    x: 0.55, y: 0.24, w: 4.2, h: 0.22,
    fontFace: "Microsoft YaHei", fontSize: 9.5, bold: true, color: C.mountainDark,
    margin: 0,
  });
  slide.addText("mountain_car_sim", {
    x: 10.2, y: 0.24, w: 2.55, h: 0.22,
    fontFace: "Microsoft YaHei", fontSize: 9, color: C.muted, align: "right",
    margin: 0,
  });
  slide.addShape(pptx.ShapeType.line, {
    x: 0.55, y: 0.64, w: 12.25, h: 0,
    line: { color: C.line, width: 1 },
  });
  slide.addText(`${page}/6`, {
    x: 12.1, y: 7.02, w: 0.7, h: 0.18,
    fontFace: "Microsoft YaHei", fontSize: 8.2, color: C.muted, align: "right",
    margin: 0,
  });
}

function title(slide, text, sub) {
  slide.addText(text, {
    x: 0.65, y: 0.9, w: 7.7, h: 0.55,
    fontFace: "Microsoft YaHei", fontSize: 25, bold: true, color: C.ink,
    breakLine: false, fit: "shrink", margin: 0,
  });
  if (sub) {
    slide.addText(sub, {
      x: 0.67, y: 1.52, w: 8.5, h: 0.36,
      fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.muted,
      breakLine: false, fit: "shrink", margin: 0,
    });
  }
}

function chip(slide, text, x, y, w, fill = C.white, color = C.ink) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h: 0.36,
    rectRadius: 0.06,
    fill: { color: fill },
    line: { color: C.line, width: 0.8 },
  });
  slide.addText(text, {
    x: x + 0.1, y: y + 0.085, w: w - 0.2, h: 0.17,
    fontFace: "Microsoft YaHei", fontSize: 8.5, bold: true, color,
    margin: 0, align: "center", fit: "shrink",
  });
}

function card(slide, head, body, x, y, w, h, accent = C.mountain, fill = C.white) {
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w, h,
    fill: { color: fill },
    line: { color: C.line, width: 0.75 },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w: 0.06, h,
    fill: { color: accent },
    line: { color: accent },
  });
  slide.addText(head, {
    x: x + 0.22, y: y + 0.18, w: w - 0.42, h: 0.25,
    fontFace: "Microsoft YaHei", fontSize: 13.2, bold: true, color: C.ink,
    margin: 0, fit: "shrink",
  });
  slide.addText(body, {
    x: x + 0.22, y: y + 0.55, w: w - 0.42, h: h - 0.68,
    fontFace: "Microsoft YaHei", fontSize: 9.2, color: C.muted,
    breakLine: false, fit: "shrink", margin: 0.02,
  });
}

function smallLabel(slide, text, x, y, w, color = C.muted) {
  slide.addText(text, {
    x, y, w, h: 0.18,
    fontFace: "Microsoft YaHei", fontSize: 8.3, color,
    margin: 0, align: "center", fit: "shrink",
  });
}

function arrow(slide, x, y, w, color = C.line) {
  slide.addShape(pptx.ShapeType.rightArrow, {
    x, y, w, h: 0.22,
    fill: { color },
    line: { color },
  });
}

function bulletList(slide, items, x, y, w, h, color = C.ink, fontSize = 10.2) {
  slide.addText(items.map(t => ({ text: `• ${t}`, options: { breakLine: true } })), {
    x, y, w, h,
    fontFace: "Microsoft YaHei", fontSize, color,
    fit: "shrink", margin: 0.03, breakLine: false,
    paraSpaceAfterPt: 4,
  });
}

function codeBox(slide, lines, x, y, w, h) {
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w, h,
    fill: { color: "111827" },
    line: { color: "111827" },
  });
  slide.addText(lines.join("\n"), {
    x: x + 0.15, y: y + 0.14, w: w - 0.3, h: h - 0.22,
    fontFace: "Menlo", fontSize: 8.2, color: "E5E7EB",
    margin: 0, fit: "shrink", breakLine: false,
  });
}

function drawMiniScene(slide, x, y, w, h) {
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w, h,
    fill: { color: "F4F8F1" },
    line: { color: "CAD8C7", width: 0.8 },
  });

  // Clear three-zone scene: mountain -> transition road -> city.
  const mountainW = w * 0.34;
  const transW = w * 0.25;
  const cityW = w - mountainW - transW - 0.28;
  slide.addShape(pptx.ShapeType.rect, {
    x: x + 0.15, y: y + 0.42, w: mountainW, h: h - 0.78,
    fill: { color: "E2F0DC" },
    line: { color: "B8D3B0", width: 0.7 },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: x + 0.15 + mountainW, y: y + 0.42, w: transW, h: h - 0.78,
    fill: { color: "FFF7ED" },
    line: { color: "FED7AA", width: 0.7 },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: x + 0.15 + mountainW + transW, y: y + 0.42, w: cityW, h: h - 0.78,
    fill: { color: "EAF2FF" },
    line: { color: "BFDBFE", width: 0.7 },
  });

  // Mountain zone.
  slide.addShape(pptx.ShapeType.triangle, {
    x: x + 0.32, y: y + 0.86, w: 0.92, h: 0.82,
    fill: { color: C.mountain },
    line: { color: C.mountain },
  });
  slide.addShape(pptx.ShapeType.triangle, {
    x: x + 1.03, y: y + 0.65, w: 1.1, h: 1.03,
    fill: { color: "4F8B62" },
    line: { color: "4F8B62" },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: x + 0.52, y: y + 1.62, w: 1.72, h: 0.24,
    fill: { color: C.dirt },
    line: { color: C.dirt },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: x + 0.88, y: y + 1.34, w: 1.35, h: 0.16,
    fill: { color: "D69B6A" },
    line: { color: "D69B6A" },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: x + 1.72, y: y + 1.03, w: 0.08, h: 0.42,
    fill: { color: C.brown },
    line: { color: C.brown },
  });

  // Transition road.
  const roadY = y + 1.42;
  slide.addShape(pptx.ShapeType.rect, {
    x: x + 0.23 + mountainW, y: roadY, w: transW * 0.35, h: 0.36,
    fill: { color: C.dirt },
    line: { color: C.dirt },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: x + 0.23 + mountainW + transW * 0.35, y: roadY, w: transW * 0.28, h: 0.36,
    fill: { color: "B7B7A4" },
    line: { color: "B7B7A4" },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: x + 0.23 + mountainW + transW * 0.63, y: roadY, w: transW * 0.35, h: 0.36,
    fill: { color: C.road },
    line: { color: C.road },
  });
  arrow(slide, x + 0.5 + mountainW, y + 0.86, transW - 0.42, "F59E0B");

  // City zone.
  const cx = x + 0.22 + mountainW + transW;
  slide.addShape(pptx.ShapeType.rect, {
    x: cx + 0.18, y: y + 1.44, w: cityW - 0.26, h: 0.34,
    fill: { color: C.road },
    line: { color: C.road },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: cx + cityW * 0.48, y: y + 0.72, w: 0.28, h: 1.55,
    fill: { color: C.road },
    line: { color: C.road },
  });
  [
    ["3B82F6", cityW * 0.14, 0.72, cityW * 0.20, 0.64],
    ["60A5FA", cityW * 0.58, 0.55, cityW * 0.22, 0.82],
    ["93C5FD", cityW * 0.82, 0.86, cityW * 0.14, 0.50],
  ].forEach(([color, bx, by, bw, bh]) => {
    slide.addShape(pptx.ShapeType.rect, {
      x: cx + bx, y: y + by, w: bw, h: bh,
      fill: { color },
      line: { color },
    });
  });
  slide.addShape(pptx.ShapeType.ellipse, {
    x: cx + cityW * 0.24, y: y + 2.02, w: 0.18, h: 0.18,
    fill: { color: C.mountain },
    line: { color: C.mountain },
  });
  slide.addShape(pptx.ShapeType.ellipse, {
    x: cx + cityW * 0.78, y: y + 2.02, w: 0.18, h: 0.18,
    fill: { color: C.mountain },
    line: { color: C.mountain },
  });

  // Air patrol is placed in its own upper lane.
  slide.addShape(pptx.ShapeType.line, {
    x: x + 0.42, y: y + 0.34, w: w - 0.86, h: 0,
    line: { color: C.air, width: 1.1, dash: "dash" },
  });
  slide.addShape(pptx.ShapeType.rtTriangle, {
    x: x + 1.48, y: y + 0.21, w: 0.3, h: 0.22,
    fill: { color: C.air },
    line: { color: C.air },
  });

  smallLabel(slide, "山地 mesh + 山路", x + 0.25, y + h - 0.28, mountainW - 0.15, C.mountainDark);
  smallLabel(slide, "过渡道路", x + 0.18 + mountainW, y + h - 0.28, transW - 0.05, C.brown);
  smallLabel(slide, "城市街区", x + 0.18 + mountainW + transW, y + h - 0.28, cityW - 0.1, C.cityDark);
  smallLabel(slide, "空中巡航轨迹", x + w * 0.35, y + 0.12, w * 0.35, C.air);
}

function drawMotionControlDiagram(slide, x, y, w, h) {
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w, h,
    fill: { color: "F8FAFC" },
    line: { color: "CBD5E1", width: 0.8 },
  });

  slide.addText("地面小车控制链路", {
    x: x + 0.25, y: y + 0.23, w: 1.5, h: 0.18,
    fontFace: "Microsoft YaHei", fontSize: 8.8, bold: true, color: "2563EB",
    margin: 0, fit: "shrink",
  });
  chip(slide, "键盘/自动节点", x + 0.25, y + 0.55, 1.08, C.white, C.ink);
  arrow(slide, x + 1.43, y + 0.62, 0.32, "93C5FD");
  chip(slide, "/cmd_vel", x + 1.83, y + 0.55, 0.78, C.paleBlue, C.cityDark);
  arrow(slide, x + 2.72, y + 0.62, 0.32, "93C5FD");
  chip(slide, "小车模型", x + 3.12, y + 0.55, 0.82, C.white, C.ink);

  slide.addShape(pptx.ShapeType.line, {
    x: x + 0.25, y: y + 1.45, w: w - 0.5, h: 0,
    line: { color: "CBD5E1", width: 0.8 },
  });

  slide.addText("空中巡航控制链路", {
    x: x + 0.25, y: y + 1.72, w: 1.5, h: 0.18,
    fontFace: "Microsoft YaHei", fontSize: 8.8, bold: true, color: C.air,
    margin: 0, fit: "shrink",
  });
  chip(slide, "巡航脚本", x + 0.25, y + 2.03, 0.92, C.white, C.ink);
  arrow(slide, x + 1.27, y + 2.10, 0.32, "FDBA74");
  chip(slide, "set_state", x + 1.67, y + 2.03, 0.8, C.paleOrange, C.air);
  arrow(slide, x + 2.58, y + 2.10, 0.32, "FDBA74");
  chip(slide, "飞机模型", x + 2.98, y + 2.03, 0.86, C.white, C.ink);

  smallLabel(slide, "飞机姿态 yaw 跟随运动方向，高度保持固定", x + 0.62, y + 2.58, w - 1.24, C.air);
}

function slide1() {
  const slide = pptx.addSlide();
  addBase(slide, 1, "课程大作业项目");
  slide.addText("基于 ROS + Gazebo 的山地—城市融合场景多机器人协同仿真系统", {
    x: 0.65, y: 0.95, w: 8.0, h: 1.04,
    fontFace: "Microsoft YaHei", fontSize: 24.5, bold: true, color: C.ink,
    margin: 0, fit: "shrink",
  });
  slide.addText("从原有“山地小车仿真”扩展为：山地地形、城市街景、地面小车、空中飞机/无人机共同运行的一键启动综合仿真环境。", {
    x: 0.68, y: 2.1, w: 6.9, h: 0.52,
    fontFace: "Microsoft YaHei", fontSize: 12, color: C.muted,
    margin: 0, fit: "shrink",
  });
  chip(slide, "山地地形", 0.68, 3.0, 1.25, C.paleGreen, C.mountainDark);
  chip(slide, "城市街景", 2.08, 3.0, 1.25, C.paleBlue, C.cityDark);
  chip(slide, "地面小车", 3.48, 3.0, 1.25, C.white, C.ink);
  chip(slide, "空中巡航", 4.88, 3.0, 1.25, C.paleOrange, C.air);
  chip(slide, "一键 launch", 6.28, 3.0, 1.35, C.white, C.ink);
  drawMiniScene(slide, 7.95, 1.05, 4.65, 2.98);
  card(slide, "最终演示效果", "Gazebo 打开后可以同时看到山地道路、城市街区、连接道路、小车和低空巡航飞机/无人机。重点是稳定、直观、便于答辩展示。", 0.68, 4.1, 3.75, 1.25, C.mountain);
  card(slide, "核心 package", "src/mountain_car_sim：包含 launch、worlds、models、urdf、scripts，所有新增场景和飞行控制都围绕该包组织。", 4.65, 4.1, 3.75, 1.25, C.city);
  card(slide, "启动入口", "roslaunch mountain_car_sim mountain_city_air_demo.launch", 8.62, 4.1, 3.75, 1.25, C.air);
  return slide;
}

function slide2() {
  const slide = pptx.addSlide();
  addBase(slide, 2);
  title(slide, "系统功能", "围绕“能看、能跑、能控、能展示”四个目标组织功能。");
  card(slide, "1. 山地场景展示", "保留原有山地主体 mesh，加入蛇形山路、岩石障碍、护栏、入口门架、警示牌、观景平台和植被细节。", 0.65, 2.15, 3.0, 1.35, C.mountain, C.paleGreen);
  card(slide, "2. 城市街景展示", "新增主干道、支路、十字路口、人行道、建筑群、路灯、树木、公交站、广告牌、施工区和停车位。", 3.85, 2.15, 3.0, 1.35, C.city, C.paleBlue);
  card(slide, "3. 山地城市融合", "使用泥土路、碎石层、沥青入口、护栏渐变、路牌和绿化把山地出口自然过渡到城市道路。", 7.05, 2.15, 3.0, 1.35, C.brown, "FFF7ED");
  card(slide, "4. 地面小车运动", "小车通过 URDF/Xacro 建模，保留 /cmd_vel 控制链路，支持手动控制和原有自动导航逻辑。", 0.65, 3.85, 3.0, 1.35, "2563EB", C.white);
  card(slide, "5. 空中模型巡航", "简化飞机/无人机使用 SDF 基础几何体建模，由 ROS 节点调用 /gazebo/set_model_state 控制巡航轨迹。", 3.85, 3.85, 3.0, 1.35, C.air, C.paleOrange);
  card(slide, "6. 一键综合启动", "mountain_city_air_demo.launch 统一加载 world、小车、飞机/无人机和飞行控制脚本，降低现场演示操作成本。", 7.05, 3.85, 3.0, 1.35, C.red, C.white);
  slide.addShape(pptx.ShapeType.rect, {
    x: 10.45, y: 2.15, w: 1.65, h: 3.05,
    fill: { color: "111827" },
    line: { color: "111827" },
  });
  slide.addText("演示关键词", {
    x: 10.62, y: 2.42, w: 1.3, h: 0.22,
    fontFace: "Microsoft YaHei", fontSize: 10, bold: true, color: C.white,
    align: "center", margin: 0,
  });
  ["融合场景", "地面运动", "空中巡航", "稳定启动"].forEach((t, i) => {
    chip(slide, t, 10.63, 2.9 + i * 0.55, 1.25, i % 2 ? C.paleOrange : C.paleBlue, C.ink);
  });
  return slide;
}

function slide3() {
  const slide = pptx.addSlide();
  addBase(slide, 3);
  title(slide, "实现技术架构", "ROS 负责系统组织与节点控制，Gazebo 负责 world、模型加载和物理仿真。");
  const xs = [0.9, 3.35, 5.8, 8.25, 10.7];
  const heads = ["Launch 启动层", "Gazebo World", "SDF / Mesh 模型", "URDF / Xacro 小车", "ROS 控制节点"];
  const bodies = [
    "统一加载综合 world、spawn 小车、启动飞行演示节点",
    "mountain_city_air_demo.world 融合山地、城市和空域",
    "道路、建筑、树木、路灯、飞机等模型化资源",
    "mountain_car.xacro 定义底盘、车轮、碰撞和插件",
    "uav_patrol_demo.py 控制空中模型轨迹"
  ];
  const accents = [C.red, C.city, C.mountain, "2563EB", C.air];
  xs.forEach((x, i) => {
    slide.addShape(pptx.ShapeType.roundRect, {
      x, y: 2.25, w: 1.72, h: 1.15,
      fill: { color: i % 2 ? C.white : C.paleGray },
      line: { color: C.line, width: 0.8 },
      rectRadius: 0.05,
    });
    slide.addShape(pptx.ShapeType.rect, {
      x, y: 2.25, w: 1.72, h: 0.08,
      fill: { color: accents[i] },
      line: { color: accents[i] },
    });
    slide.addText(heads[i], {
      x: x + 0.12, y: 2.45, w: 1.48, h: 0.24,
      fontFace: "Microsoft YaHei", fontSize: 10.2, bold: true, color: C.ink,
      align: "center", margin: 0, fit: "shrink",
    });
    slide.addText(bodies[i], {
      x: x + 0.15, y: 2.78, w: 1.42, h: 0.42,
      fontFace: "Microsoft YaHei", fontSize: 7.3, color: C.muted,
      align: "center", margin: 0.02, fit: "shrink",
    });
    if (i < xs.length - 1) arrow(slide, x + 1.82, 2.72, 0.38);
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.95, y: 4.18, w: 11.15, h: 1.2,
    fill: { color: "EEF4EA" },
    line: { color: "CAD8C7", width: 0.8 },
    rectRadius: 0.04,
  });
  slide.addText("/gazebo/model_states  →  小车/飞机控制节点  →  /cmd_vel 或 /gazebo/set_model_state  →  Gazebo 模型状态更新", {
    x: 1.22, y: 4.58, w: 10.6, h: 0.32,
    fontFace: "Microsoft YaHei", fontSize: 13.8, bold: true, color: C.mountainDark,
    align: "center", margin: 0, fit: "shrink",
  });
  bulletList(slide, [
    "模型资源通过 model:// 引用，避免绝对路径，方便别人 clone 后复现。",
    "新增内容尽量独立在 models/worlds/scripts/launch 中，保留原始山地小车功能。",
    "空中巡航采用演示级状态控制，减少 PX4、MAVROS 等复杂依赖。"
  ], 1.0, 5.75, 10.8, 0.75, C.ink, 9.2);
  return slide;
}

function slide4() {
  const slide = pptx.addSlide();
  addBase(slide, 4);
  title(slide, "山地与城市是怎么做出来的", "主体地形使用 mesh，城市和细节主要用轻量 SDF 几何体搭建。");
  card(slide, "山地主体 mountain_terrain", "使用 mountain_terrain.dae 构造起伏地形，mountain_trail.dae 叠加蛇形土路；mesh 同时作为 visual 和 collision，让小车能与坡面接触。", 0.65, 2.15, 3.15, 1.32, C.mountain, C.paleGreen);
  card(slide, "山地细节 mountain_showcase_details", "通过独立 SDF 增加护栏、入口门架、警示牌、观景平台、帐篷、风向袋、松树、灌木、碎石等展示元素。", 0.65, 3.75, 3.15, 1.32, C.mountainDark, C.white);
  drawMiniScene(slide, 4.25, 2.0, 4.5, 3.05);
  card(slide, "城市主体 simple_city", "道路、路口、人行道、建筑、树、路灯和路牌主要由 box、cylinder、sphere 组成，颜色和高度变化形成街区层次。", 9.1, 2.15, 3.15, 1.32, C.city, C.paleBlue);
  card(slide, "城市强化 showcase_city_details", "增加店铺门面、广告牌、交通龙门架、停车区、施工围挡、飞行标识等，让第一眼展示效果更明显。", 9.1, 3.75, 3.15, 1.32, C.cityDark, C.white);
  slide.addShape(pptx.ShapeType.rect, {
    x: 3.95, y: 5.55, w: 5.05, h: 0.55,
    fill: { color: "FFF7ED" },
    line: { color: "FED7AA", width: 0.8 },
  });
  slide.addText("融合关键：mountain_city_transition 用泥土 → 碎石 → 沥青的连续道路，把山地出口自然接入城市主路。", {
    x: 4.12, y: 5.72, w: 4.72, h: 0.18,
    fontFace: "Microsoft YaHei", fontSize: 8.8, bold: true, color: C.brown,
    align: "center", margin: 0, fit: "shrink",
  });
  return slide;
}

function slide5() {
  const slide = pptx.addSlide();
  addBase(slide, 5);
  title(slide, "车辆运动与空中巡航实现", "地面小车保留原有控制链路，空中模型采用稳定的演示级轨迹控制。");
  card(slide, "地面小车：URDF/Xacro + Gazebo 插件", "mountain_car.xacro 定义 base_link、车轮、碰撞体、惯量和外观；Gazebo 插件订阅 /cmd_vel，把速度命令转换为小车运动。", 0.72, 2.1, 3.25, 1.35, "2563EB", C.white);
  card(slide, "空中模型：简化飞机/无人机 SDF", "simple_airplane 和 simple_drone 使用基础几何体建模：机身、机翼、尾翼或旋翼臂，启动轻、依赖少、答辩解释清楚。", 0.72, 3.72, 3.25, 1.35, C.air, C.paleOrange);
  drawMotionControlDiagram(slide, 4.35, 2.3, 4.2, 2.65);
  card(slide, "飞行控制节点 uav_patrol_demo.py", "节点等待 /gazebo/set_model_state 服务可用；按时间计算椭圆/巡航轨迹；持续设置 model_name、pose、twist，使飞机在城市和山地上方循环飞行。", 9.0, 2.1, 3.15, 1.55, C.air, C.white);
  codeBox(slide, [
    "参数示例：",
    "model_name: patrol_airplane",
    "altitude: 3.8",
    "radius_x / radius_y",
    "speed: 轨迹角速度",
  ], 9.0, 3.95, 3.15, 1.18);
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 4.55, y: 5.35, w: 7.35, h: 0.54,
    fill: { color: "F8FAFC" },
    line: { color: C.line, width: 0.8 },
    rectRadius: 0.04,
  });
  slide.addText("技术取舍：不引入真实飞控，优先保证课程答辩现场稳定展示；复杂物理可作为后续拓展。", {
    x: 4.75, y: 5.53, w: 6.95, h: 0.18,
    fontFace: "Microsoft YaHei", fontSize: 9.2, bold: true, color: C.ink,
    align: "center", margin: 0, fit: "shrink",
  });
  return slide;
}

function slide6() {
  const slide = pptx.addSlide();
  addBase(slide, 6, "答辩演示流程");
  title(slide, "启动、展示与总结", "用一条命令打开综合场景，再按“场景 → 小车 → 飞机 → 技术实现”的顺序讲。");
  codeBox(slide, [
    "cd ~/catkin_ws",
    "catkin_make -DCATKIN_WHITELIST_PACKAGES=\"mountain_car_sim\"",
    "source devel/setup.bash",
    "roslaunch mountain_car_sim mountain_city_air_demo.launch"
  ], 0.72, 2.1, 5.45, 1.28);
  card(slide, "现场展示顺序", "1. 先移动视角看山地、城市和连接道路；2. 观察小车加载在道路附近；3. 看飞机/无人机低空巡航；4. 说明 launch 一键组织多个模型和节点。", 0.72, 3.72, 5.45, 1.55, C.mountain, C.white);
  card(slide, "项目完成度", "完成了从 Gazebo world 搭建、SDF/mesh 模型组织、URDF/Xacro 机器人建模、ROS launch 编排到 Gazebo 服务控制的完整仿真链路。", 6.55, 2.1, 5.45, 1.25, C.city, C.paleBlue);
  card(slide, "答辩总结表达", "本项目重点不是单一模型，而是把山地、城市、地面机器人和空中机器人放进同一个可运行仿真系统，体现多场景、多模型、多运动对象协同。", 6.55, 3.65, 5.45, 1.25, C.air, C.paleOrange);
  bulletList(slide, [
    "稳定性优先：轻量 SDF 几何体 + 简化飞行控制，降低启动失败概率。",
    "可扩展方向：加入更真实的无人机控制、路径规划、传感器、交通灯和更多动态障碍物。",
    "答辩时强调：ROS 管系统，Gazebo 管世界和物理，SDF/URDF 管模型。"
  ], 0.95, 5.75, 10.8, 0.75, C.ink, 9.2);
  return slide;
}

[slide1, slide2, slide3, slide4, slide5, slide6].forEach(fn => {
  const s = fn();
  if (typeof s.addNotes === "function") {
    s.addNotes("答辩时可以先讲本页主标题，再按页面中的模块从左到右说明。");
  }
});

pptx.writeFile({ fileName: OUT });
console.log(OUT);
