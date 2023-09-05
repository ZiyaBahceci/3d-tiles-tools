import sharp from "sharp";
import fs from "fs";
import path from "path";

import { DataError } from "../base/DataError";

import { BasisEncoder } from "./BasisEncoder";
import { KtxOptions } from "./KtxOptions";
import { KtxEtc1sOptions } from "./KtxEtc1sOptions";
import { KtxUastcOptions } from "./KtxUastcOptions";

import { LoggerFactory } from "../logging/LoggerFactory";
const logger = LoggerFactory("KTX");

/**
 * Utility class for converting images into KTX2 format.
 */
export class KtxUtility {
  /**
   * Apply KTX compression to the specified input file, and write
   * the result to the specified output file.
   *
   * The exact set of input formats that are supported is not
   * specified, but they include JPG and PNG.
   *
   * @param inputFileName - The input file name
   * @param outputFileName - The output file name
   * @param options The options for the KTX compression
   */
  static async convertImageFile(
    inputFileName: string,
    outputFileName: string,
    options: KtxOptions | undefined
  ): Promise<void> {
    const inputImageData = fs.readFileSync(inputFileName);
    const outputImageData = await KtxUtility.convertImageData(
      inputImageData,
      options
    );
    const outputDirectory = path.dirname(outputFileName);
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, { recursive: true });
    }
    fs.writeFileSync(outputFileName, outputImageData);
  }

  /**
   * Apply KTX compression to the given input image data, and return
   * the result as a buffer.
   *
   * The exact set of input formats that are supported is not
   * specified, but they include JPG and PNG.
   *
   * @param inputImageData - The input file name
   * @param options The options for the KTX compression
   * @returns The KTX compressed data
   */
  static async convertImageData(
    inputImageData: Buffer,
    options: KtxOptions | undefined
  ): Promise<Buffer> {
    const image = sharp(inputImageData);
    const metadata = await image.metadata();
    const imageWidth = metadata.width;
    const imageHeight = metadata.height;
    const rgbaPixels = await image
      .toColorspace("srgb")
      .ensureAlpha()
      .raw()
      .toBuffer();
    if (!imageWidth || !imageHeight) {
      throw new DataError("Could not determine size of image data");
    }
    const result = await KtxUtility.encodeImageData(
      imageWidth,
      imageHeight,
      rgbaPixels,
      options
    );
    return result;
  }

  /**
   * Encode the given RGBA pixels with KTX, and reuturn the
   * result as a buffer.
   *
   * @param imageWidth The image width
   * @param imageHeight The image height
   * @param rgbaPixels The pixels
   * @param options The options for the KTX compression
   * @returns The KTX data
   */
  private static async encodeImageData(
    imageWidth: number,
    imageHeight: number,
    rgbaPixels: Buffer,
    options: KtxOptions | undefined
  ): Promise<Buffer> {
    const basisEncoder = await BasisEncoder.create();

    if (options) {
      KtxUtility.applyOptions(basisEncoder, options);
    } else {
      const defaultOptions: KtxOptions = {
        uastc: false,
        transferFunction: "SRGB",
        //debug: true,
      };
      KtxUtility.applyOptions(basisEncoder, defaultOptions);
    }

    basisEncoder.setSliceSourceImage(
      0,
      rgbaPixels,
      imageWidth,
      imageHeight,
      false
    );

    const basisData = new Uint8Array(imageWidth * imageHeight * 4 * 100);

    logger.info(`Encoding ${imageWidth}x${imageHeight} pixels to KTX`);
    if (logger.isLevelEnabled("debug")) {
      logger.debug(`Encoding options:\n${JSON.stringify(options, null, 2)}`);
    }

    const resultSize = basisEncoder.encode(basisData);
    const result = Buffer.from(basisData.subarray(0, resultSize));

    logger.info(`Encoding ${imageWidth}x${imageHeight} pixels to KTX DONE`);

    return result;
  }

  /**
   * Apply the given options to the given encoder.
   *
   * Depending on whether `options.uastc` is true, this will
   * delegate to `applyUastcOptions` or `applyEtc1sOptions`
   *
   * @param basisEncoder - The `BasisEncoder`
   * @param options - The options
   */
  private static applyOptions(basisEncoder: BasisEncoder, options: KtxOptions) {
    basisEncoder.setCreateKTX2File(true);
    basisEncoder.setKTX2UASTCSupercompression(true);
    basisEncoder.setMipGen(false);

    // These should be the default, but have to be set explicitly
    basisEncoder.setMaxSelectorClusters(512);
    basisEncoder.setMaxEndpointClusters(512);

    if (options.computeStats !== undefined) {
      basisEncoder.setComputeStats(options.computeStats);
    }
    if (options.debug !== undefined) {
      basisEncoder.setDebug(options.debug);
    }

    if (options.uastc) {
      basisEncoder.setUASTC(true);
      KtxUtility.applyUastcOptions(basisEncoder, options);
    } else {
      basisEncoder.setUASTC(false);
      KtxUtility.applyEtc1sOptions(basisEncoder, options);
    }
  }

  /**
   * Apply the given UASTC compression options to the given encoder.
   *
   * @param basisEncoder - The `BasisEncoder`
   * @param options - The options
   */
  private static applyUastcOptions(
    basisEncoder: BasisEncoder,
    options: KtxUastcOptions
  ) {
    if (options.level !== undefined) {
      basisEncoder.setPackUASTCFlags(options.level);
    }
    if (options.rdo_l !== undefined) {
      basisEncoder.setRDOUASTCQualityScalar(options.rdo_l);
    }
    if (options.rdo_d !== undefined) {
      basisEncoder.setRDOUASTCDictSize(options.rdo_d);
    }
    if (options.transferFunction !== undefined) {
      if (options.transferFunction === "SRGB") {
        basisEncoder.setPerceptual(true);
        basisEncoder.setMipSRGB(true);
        basisEncoder.setKTX2SRGBTransferFunc(true);
      } else {
        basisEncoder.setPerceptual(false);
        basisEncoder.setMipSRGB(false);
        basisEncoder.setKTX2SRGBTransferFunc(false);
      }
    }
    if (options.zstd !== undefined) {
      // This is only a flag in the JS wrapper:
      basisEncoder.setKTX2UASTCSupercompression(true);
    }
  }

  /**
   * Apply the given ETC1S compression options to the given encoder.
   *
   * @param basisEncoder - The `BasisEncoder`
   * @param options - The options
   */
  private static applyEtc1sOptions(
    basisEncoder: BasisEncoder,
    options: KtxEtc1sOptions
  ) {
    if (options.compressionLevel !== undefined) {
      basisEncoder.setCompressionLevel(options.compressionLevel);
    }
    if (options.qualityLevel !== undefined) {
      basisEncoder.setQualityLevel(options.qualityLevel);
    }
    if (options.transferFunction !== undefined) {
      if (options.transferFunction === "SRGB") {
        basisEncoder.setPerceptual(true);
        basisEncoder.setMipSRGB(true);
        basisEncoder.setKTX2SRGBTransferFunc(true);
      } else {
        basisEncoder.setPerceptual(false);
        basisEncoder.setMipSRGB(false);
        basisEncoder.setKTX2SRGBTransferFunc(false);
      }
    }
  }
}