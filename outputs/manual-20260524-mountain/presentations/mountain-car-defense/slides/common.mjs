export const W = 1280;
export const H = 720;

export const colors = {
  bg: "#F7F7F2",
  ink: "#1F2933",
  muted: "#64748B",
  green: "#2E6B4E",
  greenDark: "#194D37",
  brown: "#8A5A2B",
  red: "#C8352E",
  line: "#D8DED6",
  white: "#FFFFFF",
};

export function base(slide, ctx, kicker = "ROS Noetic + Gazebo11") {
  slide.background.fill = colors.bg;
  ctx.addText(slide, {
    text: kicker,
    x: 64,
    y: 36,
    w: 420,
    h: 24,
    fontSize: 15,
    color: colors.greenDark,
    bold: true,
  });
  ctx.addText(slide, {
    text: "mountain_car_sim",
    x: 1040,
    y: 36,
    w: 176,
    h: 24,
    fontSize: 14,
    color: colors.muted,
    align: "right",
  });
  ctx.addShape(slide, {
    x: 64,
    y: 84,
    w: 1152,
    h: 1,
    fill: colors.line,
  });
}

export function title(slide, ctx, text, sub = "") {
  ctx.addText(slide, {
    text,
    x: 64,
    y: 112,
    w: 660,
    h: 76,
    fontSize: 34,
    color: colors.ink,
    bold: true,
  });
  if (sub) {
    ctx.addText(slide, {
      text: sub,
      x: 66,
      y: 190,
      w: 720,
      h: 48,
      fontSize: 17,
      color: colors.muted,
    });
  }
}

export function pill(slide, ctx, text, x, y, w, fill = colors.white) {
  ctx.addShape(slide, {
    geometry: "roundRect",
    x,
    y,
    w,
    h: 38,
    fill,
    line: { style: "solid", fill: colors.line, width: 1 },
  });
  ctx.addText(slide, {
    text,
    x: x + 16,
    y: y + 9,
    w: w - 32,
    h: 20,
    fontSize: 15,
    color: colors.ink,
    bold: true,
  });
}

export function card(slide, ctx, heading, body, x, y, w, h, accent = colors.green) {
  ctx.addShape(slide, {
    geometry: "rect",
    x,
    y,
    w,
    h,
    fill: colors.white,
    line: { style: "solid", fill: colors.line, width: 1 },
  });
  ctx.addShape(slide, { x, y, w: 5, h, fill: accent });
  ctx.addText(slide, {
    text: heading,
    x: x + 24,
    y: y + 20,
    w: w - 48,
    h: 28,
    fontSize: 20,
    color: colors.ink,
    bold: true,
  });
  ctx.addText(slide, {
    text: body,
    x: x + 24,
    y: y + 60,
    w: w - 48,
    h: h - 76,
    fontSize: 15,
    color: colors.muted,
  });
}

export function footer(slide, ctx, n) {
  ctx.addText(slide, {
    text: `${n}/5`,
    x: 1130,
    y: 664,
    w: 86,
    h: 20,
    fontSize: 13,
    color: colors.muted,
    align: "right",
  });
}
