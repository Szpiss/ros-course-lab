import { base, title, footer, colors } from "./common.mjs";

export async function slide04(presentation, ctx) {
  const slide = presentation.slides.add();
  base(slide, ctx);
  title(slide, ctx, "自动寻迹与避障", "航点跟踪负责沿路前进，障碍物斥力负责局部绕行。");

  ctx.addShape(slide, { x: 120, y: 290, w: 1040, h: 2, fill: colors.line });
  const xs = [160, 370, 580, 790, 1000];
  const labels = ["读取状态", "选择航点", "计算偏航", "岩石避障", "发布速度"];
  const bodies = ["model_states", "蛇形山路", "heading error", "repulsive vector", "/cmd_vel"];
  xs.forEach((x, i) => {
    ctx.addShape(slide, { geometry: "ellipse", x, y: 250, w: 86, h: 86, fill: i === 4 ? colors.green : colors.white, line: { style: "solid", fill: colors.green, width: 2 } });
    ctx.addText(slide, { text: String(i + 1), x: x + 31, y: 266, w: 24, h: 24, fontSize: 24, color: i === 4 ? colors.white : colors.green, bold: true, align: "center" });
    ctx.addText(slide, { text: labels[i], x: x - 28, y: 352, w: 142, h: 24, fontSize: 18, color: colors.ink, bold: true, align: "center" });
    ctx.addText(slide, { text: bodies[i], x: x - 34, y: 382, w: 154, h: 22, fontSize: 14, color: colors.muted, align: "center" });
  });

  ctx.addShape(slide, { x: 160, y: 485, w: 960, h: 84, fill: colors.white, line: { style: "solid", fill: colors.line, width: 1 } });
  ctx.addText(slide, {
    text: "控制逻辑：目标方向 = 航点方向 + 障碍物斥力；速度随距离和偏航角自适应，到红旗附近自动停止。",
    x: 196,
    y: 512,
    w: 888,
    h: 30,
    fontSize: 20,
    color: colors.ink,
    bold: true,
    align: "center",
  });
  footer(slide, ctx, 4);
  return slide;
}
