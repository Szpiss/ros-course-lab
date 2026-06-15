import { base, title, footer, colors } from "./common.mjs";

function block(slide, ctx, label, body, x, y, w, accent) {
  ctx.addShape(slide, { x, y, w, h: 86, fill: colors.white, line: { style: "solid", fill: colors.line, width: 1 } });
  ctx.addShape(slide, { x, y, w: 6, h: 86, fill: accent });
  ctx.addText(slide, { text: label, x: x + 18, y: y + 14, w: w - 36, h: 24, fontSize: 18, color: colors.ink, bold: true });
  ctx.addText(slide, { text: body, x: x + 18, y: y + 43, w: w - 36, h: 32, fontSize: 14, color: colors.muted });
}

export async function slide03(presentation, ctx) {
  const slide = presentation.slides.add();
  base(slide, ctx);
  title(slide, ctx, "实现技术架构", "ROS 负责组织节点与话题，Gazebo 负责物理仿真和模型加载。");

  block(slide, ctx, "launch 启动层", "demo.launch 串联 world、spawn、控制节点", 80, 260, 250, colors.green);
  block(slide, ctx, "Gazebo 场景层", "world + models：地形、岩石、红旗", 382, 260, 250, colors.brown);
  block(slide, ctx, "机器人模型层", "xacro：底盘、四轮、碰撞与惯量", 684, 260, 250, "#2563EB");
  block(slide, ctx, "控制算法层", "cmd_vel：手动控制与自动导航", 986, 260, 220, colors.red);

  ctx.addShape(slide, { geometry: "rightArrow", x: 336, y: 286, w: 36, h: 28, fill: colors.line });
  ctx.addShape(slide, { geometry: "rightArrow", x: 638, y: 286, w: 36, h: 28, fill: colors.line });
  ctx.addShape(slide, { geometry: "rightArrow", x: 940, y: 286, w: 36, h: 28, fill: colors.line });

  ctx.addShape(slide, { x: 150, y: 430, w: 980, h: 70, fill: "#EEF4EA", line: { style: "solid", fill: "#CAD8C7", width: 1 } });
  ctx.addText(slide, {
    text: "/gazebo/model_states  ->  autonomous_flag_nav  ->  /cmd_vel  ->  Gazebo 控制插件",
    x: 180,
    y: 452,
    w: 920,
    h: 30,
    fontSize: 22,
    color: colors.greenDark,
    bold: true,
    align: "center",
  });
  footer(slide, ctx, 3);
  return slide;
}
