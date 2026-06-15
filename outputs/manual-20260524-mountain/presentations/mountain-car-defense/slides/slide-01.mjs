import { base, title, pill, footer, colors } from "./common.mjs";

export async function slide01(presentation, ctx) {
  const slide = presentation.slides.add();
  base(slide, ctx, "课程实验大项目");
  title(slide, ctx, "山地场景搭建与小车自动导航", "新场景搭建1：在 Gazebo 中完成山地场景、四轮小车、手动控制与自动寻迹避障。");

  ctx.addShape(slide, { x: 740, y: 124, w: 420, h: 250, fill: "#DDE8D9", line: { style: "solid", fill: "#C8D5C2", width: 1 } });
  ctx.addShape(slide, { x: 770, y: 300, w: 360, h: 38, fill: colors.brown });
  ctx.addShape(slide, { x: 770, y: 230, w: 90, h: 72, fill: colors.green });
  ctx.addShape(slide, { x: 862, y: 202, w: 90, h: 100, fill: "#3F7B57" });
  ctx.addShape(slide, { x: 954, y: 170, w: 90, h: 132, fill: "#5D9268" });
  ctx.addShape(slide, { x: 1070, y: 164, w: 8, h: 108, fill: "#6B7280" });
  ctx.addShape(slide, { x: 1078, y: 164, w: 48, h: 30, fill: colors.red });
  ctx.addShape(slide, { x: 782, y: 342, w: 64, h: 34, fill: "#F28C28" });
  ctx.addShape(slide, { x: 795, y: 328, w: 34, h: 24, fill: "#2563EB" });
  ctx.addShape(slide, { geometry: "ellipse", x: 780, y: 368, w: 22, h: 22, fill: "#111827" });
  ctx.addShape(slide, { geometry: "ellipse", x: 830, y: 368, w: 22, h: 22, fill: "#111827" });

  pill(slide, ctx, "程序化山地 mesh", 64, 318, 218);
  pill(slide, ctx, "Gazebo 模型导入", 306, 318, 218);
  pill(slide, ctx, "WASD / 自动控制", 64, 378, 218);
  pill(slide, ctx, "寻迹避障到红旗", 306, 378, 218);

  ctx.addText(slide, {
    text: "答辩主线：从场景搭建到机器人控制，再到自动导航闭环。",
    x: 66,
    y: 510,
    w: 820,
    h: 34,
    fontSize: 22,
    color: colors.ink,
    bold: true,
  });
  footer(slide, ctx, 1);
  return slide;
}
