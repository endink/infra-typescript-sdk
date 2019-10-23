import { AliyunStsToken, AliyunOssConfig, BucketPolicy } from ".";
import { RequestResponse } from "umi-request";
import OSS from "ali-oss";
import { ExtendedRequestMethod } from "../request";
interface AliyunContext {
    stsToken?: AliyunStsToken;
    ossConfig?: AliyunOssConfig;
}
export interface OssOptions {
    configURL: string;
    stsTokenURL: string;
}
export declare class OssUtils {
    private request;
    options: OssOptions;
    constructor(request: ExtendedRequestMethod, options: OssOptions);
    readonly context: AliyunContext;
    configure(config: AliyunOssConfig): void;
    fetchConfig(skipNotifyError?: boolean, forceReload?: boolean): Promise<RequestResponse<AliyunOssConfig>>;
    getAliyunContext(): Promise<RequestResponse<AliyunContext>>;
    generateObjectUrl(filePath: string): string;
    ossUpload: (bucketPolicy: BucketPolicy, savePath: string, file: any, progress?: ((progress: number, checkPoint: OSS.Checkpoint) => void) | undefined) => Promise<RequestResponse<OSS.MultipartUploadResult>>;
}
export {};
