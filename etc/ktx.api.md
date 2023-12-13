## API Report File for "@3d-tiles-tools/ktx"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

/// <reference types="node" />

// @internal
export class BasisEncoder {
    static create(): Promise<BasisEncoder>;
    delete(): void;
    encode(dst_basis_file_js_val: Uint8Array): any;
    setCheckForAlpha(check_for_alpha_flag: boolean): any;
    setCompressionLevel(comp_level: number): any;
    setComputeStats(compute_stats_flag: boolean): any;
    setCreateKTX2File(create_ktx2_file: boolean): any;
    setDebug(debug_flag: boolean): any;
    setEndpointRDOThresh(endpoint_rdo_thresh: number): any;
    setForceAlpha(force_alpha_flag: boolean): any;
    setKTX2SRGBTransferFunc(srgb_transfer_func: boolean): any;
    setKTX2UASTCSupercompression(use_zstandard: boolean): any;
    setMaxEndpointClusters(max_endpoint_clusters: number): any;
    setMaxSelectorClusters(max_selector_clusters: number): any;
    setMipFilter(mip_filter: number): any;
    setMipGen(mip_gen_flag: boolean): any;
    setMipRenormalize(mip_renormalize_flag: boolean): any;
    setMipScale(mip_scale: number): any;
    setMipSmallestDimension(mip_smallest_dimension: number): any;
    setMipSRGB(mip_srgb_flag: boolean): any;
    setMipWrapping(mip_wrapping_flag: boolean): any;
    setNoEndpointRDO(no_endpoint_rdo_flag: boolean): any;
    setNormalMap(): any;
    setNoSelectorRDO(no_selector_rdo_flag: boolean): any;
    setPackUASTCFlags(pack_uastc_flags: number): any;
    setPerceptual(perceptual_flag: boolean): any;
    setQualityLevel(quality_level: number): any;
    setRDOUASTC(rdo_uastc: boolean): any;
    setRDOUASTCDictSize(dict_size: number): any;
    setRDOUASTCMaxAllowedRMSIncreaseRatio(rdo_uastc_max_allowed_rms_increase_ratio: number): any;
    setRDOUASTCQualityScalar(rdo_quality: number): any;
    setRDOUASTCSkipBlockRMSThresh(rdo_uastc_skip_block_rms_thresh: number): any;
    setRenormalize(renormalize_flag: boolean): any;
    setSelectorRDOThresh(selector_rdo_thresh: number): any;
    setSliceSourceImage(slice_index: number, src_image_js_val: Uint8Array, width: number, height: number, src_image_is_png: boolean): any;
    setSwizzle(r: number, g: number, b: number, a: number): any;
    setTexType(tex_type: number): any;
    setUASTC(uastc_flag: boolean): any;
    setYFlip(y_flip_flag: boolean): any;
}

// @internal
export class KtxError extends Error {
    constructor(message: string);
    // (undocumented)
    toString: () => string;
}

// @internal
export type KtxEtc1sOptions = Partial<{
    compressionLevel: number;
    qualityLevel: number;
    transferFunction: "SRGB" | "LINEAR";
}>;

// @internal
export type KtxOptions = KtxEtc1sOptions & KtxUastcOptions & {
    uastc: boolean;
    computeStats?: boolean;
    debug?: boolean;
};

// @internal
export type KtxUastcOptions = Partial<{
    level: number;
    rdo_l: number;
    rdo_d: number;
    zstd: number;
    transferFunction: "SRGB" | "LINEAR";
}>;

// @internal
export class KtxUtility {
    static convertImageData(inputImageData: Buffer, options: KtxOptions | undefined): Promise<Buffer>;
    static convertImageFile(inputFileName: string, outputFileName: string, options: KtxOptions | undefined): Promise<void>;
}

// (No @packageDocumentation comment for this package)

```