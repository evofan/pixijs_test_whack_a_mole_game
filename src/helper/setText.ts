import * as PIXI from "pixi.js";
import { TextStyleAlign, TextStyleFontWeight } from "pixi.js";

/**
 * Set textStyle
 * @exports setText
 * @param message
 * @param fontfamily
 * @param fontsize
 * @param fillcolor
 * @param strokecolor
 * @param sthickness
 * @param isShadow
 * @param shadowcolor
 * @returns {object} PIXI.TEXT
 */
export const setText: Function = (
  message: string | number,
  fontfamily: string = "Arial",
  fontsize: number = 12,
  fillcolor: number = 0xff0000,
  align: TextStyleAlign = "left",
  fontweight: TextStyleFontWeight = "normal",
  strokecolor: string = "#000000",
  sthickness: number = 0,
  isShadow: boolean = false,
  shadowcolor: string = "#000000"
) => {
  return new PIXI.Text(`${message}`, {
    fontFamily: fontfamily,
    fontSize: fontsize,
    fill: fillcolor,
    align: align,
    fontWeight: fontweight,
    stroke: strokecolor,
    strokeThickness: sthickness,
    dropShadow: isShadow,
    dropShadowColor: shadowcolor,
    lineJoin: "round"
  });
};

