import { AliyunStsToken, AliyunOssConfig, BucketPolicy } from ".";
import { RequestResponse } from "umi-request";
import OSS from "ali-oss";
import { ExtendedRequestMethod } from "../request";
export interface OssOptions {
    configURL: string;
    stsTokenURL: string;
}
export declare class OssUtils {
    private request;
    options: OssOptions;
    constructor(request: ExtendedRequestMethod, options: OssOptions);
    readonly context: {
        stsToken?: AliyunStsToken | undefined;
        ossConfig?: AliyunOssConfig | undefined;
    };
    configure(config: AliyunOssConfig): void;
    fetchConfig(skipNotifyError?: boolean): Promise<RequestResponse<AliyunOssConfig>>;
    getAliyunContext(): Promise<RequestResponse<{
        token: AliyunStsToken;
        ossSettings: AliyunOssConfig;
    }>>;
    generateObjectUrl(filePath: string): string;
    ossUpload: (bucketPolicy: BucketPolicy, savePath: string, file: any, progress?: ((progress: number, checkPoint: OSS.Checkpoint) => void) | undefined) => Promise<RequestResponse<OSS.MultipartUploadResult>>;
}
