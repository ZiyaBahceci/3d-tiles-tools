import { Cartesian3 } from "cesium";
import { Math as CesiumMath } from "cesium";

// Adapted from CesiumJS 'AttributeCompression' class:
export class AttributeCompression {
  private static readonly octDecodeInRangeInternalResultScratch =
    new Cartesian3();

  static octDecode(input: number[]): number[] {
    const rangeMax = 65535;
    const result = AttributeCompression.octDecodeInRangeInternalResultScratch;
    const x = input[0];
    const y = input[1];
    AttributeCompression.octDecodeInRangeInternal(x, y, rangeMax, result);
    const array: number[] = Array(3);
    Cartesian3.pack(result, array, 0);
    return array;
  }

  private static octDecodeInRangeInternal(
    x: number,
    y: number,
    rangeMax: number,
    result: Cartesian3
  ) {
    result.x = CesiumMath.fromSNorm(x, rangeMax);
    result.y = CesiumMath.fromSNorm(y, rangeMax);
    result.z = 1.0 - (Math.abs(result.x) + Math.abs(result.y));

    if (result.z < 0.0) {
      const oldVX = result.x;
      result.x = (1.0 - Math.abs(result.y)) * CesiumMath.signNotZero(oldVX);
      result.y = (1.0 - Math.abs(oldVX)) * CesiumMath.signNotZero(result.y);
    }
    return Cartesian3.normalize(result, result);
  }

  static decodeRGB565ToRGBA(value: number): number[] {
    const mask5 = (1 << 5) - 1;
    const mask6 = (1 << 6) - 1;
    const normalize5 = 1.0 / 31.0;
    const normalize6 = 1.0 / 63.0;
    const red = value >> 11;
    const green = (value >> 5) & mask6;
    const blue = value & mask5;
    const result: number[] = Array(4);
    result[0] = red * normalize5;
    result[1] = green * normalize6;
    result[2] = blue * normalize5;
    result[3] = 1.0;
    return result;
  }
}