import { base, title, card, footer, colors } from "./common.mjs";

export async function slide02(presentation, ctx) {
  const slide = presentation.slides.add();
  base(slide, ctx);
  title(slide, ctx, "系统功能", "围绕课程要求实现可展示、可控制、可复现实验环境。");

  card(slide, ctx, "山地场景", "使用程序化 DAE 网格生成起伏地形，并叠加蛇形土路、岩石障碍物和红旗检查点。", 64, 270, 340, 190, colors.green);
  card(slide, ctx, "小车模型", "xacro 定义四轮小车：base_link、四个车轮、惯量、碰撞体与 Gazebo 控制插件。", 470, 270, 340, 190, "#2563EB");
  card(slide, ctx, "控制方式", "支持自动寻迹避障、旧版自动巡航、WASD 手动控制三种使用方式。", 876, 270, 340, 190, colors.brown);

  ctx.addText(slide, {
    text: "最终演示效果：启动 demo.launch 后，小车从山底出发，沿山路绕过岩石，靠近红旗后停止。",
    x: 92,
    y: 536,
    w: 1040,
    h: 38,
    fontSize: 20,
    color: colors.ink,
    bold: true,
  });
  footer(slide, ctx, 2);
  return slide;
}
