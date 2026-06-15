import { base, title, card, footer, colors } from "./common.mjs";

export async function slide05(presentation, ctx) {
  const slide = presentation.slides.add();
  base(slide, ctx, "答辩演示顺序");
  title(slide, ctx, "现场展示与总结", "用最短路径说明项目完成度：能看、能跑、能控、能自动到达目标。");

  card(slide, ctx, "1. 场景展示", "展示 mesh 山体、蛇形土路、岩石障碍物、红旗检查点。", 86, 250, 330, 150, colors.green);
  card(slide, ctx, "2. 小车导入", "说明 xacro 四轮结构、颜色、碰撞体、惯量和重复 spawn 修复。", 475, 250, 330, 150, "#2563EB");
  card(slide, ctx, "3. 自动导航", "运行 demo.launch，观察小车沿路绕障并在红旗附近停止。", 864, 250, 330, 150, colors.red);

  ctx.addText(slide, {
    text: "项目价值：完成从 ROS 包组织、Gazebo 场景建模、机器人建模到控制算法的完整仿真闭环。",
    x: 120,
    y: 502,
    w: 1040,
    h: 52,
    fontSize: 24,
    color: colors.ink,
    bold: true,
    align: "center",
  });
  footer(slide, ctx, 5);
  return slide;
}
