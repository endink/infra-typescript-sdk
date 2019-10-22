import { AliyunStsToken, AliyunOssConfig, BucketPolicy } from ".";;
import { RequestResponse } from "umi-request";
import OSS, { Checkpoint, MultipartUploadResult } from "ali-oss";
import { ExtendedRequestMethod } from "../request";

const aliyunContext: {
    stsToken?: AliyunStsToken,
    ossConfig?: AliyunOssConfig
} = {  };

export interface OssOptions {
    configURL: string;
    stsTokenURL: string;
}

export class OssUtils {
    constructor(
        private request:ExtendedRequestMethod, 
        public options:OssOptions){
    }

    get context(){
        return aliyunContext;
    }

    public configure(config:AliyunOssConfig){
        aliyunContext.ossConfig = config;
    }

    public async fetchConfig(skipNotifyError: boolean = true): Promise<RequestResponse<AliyunOssConfig>> {
        if (aliyunContext.ossConfig === undefined) {
            const r = await this.request<AliyunOssConfig>(this.options.configURL, {
                method: "GET",
                skipNotifyError
            });
            if (r.response.ok) {
                aliyunContext.ossConfig = r.data;
            }
            return r
        }
        return { response: { ok: true } } as RequestResponse<AliyunOssConfig>;
    };

    public async getAliyunContext(): Promise<RequestResponse<{ token: AliyunStsToken, ossSettings: AliyunOssConfig }>> {
        if (aliyunContext.stsToken === undefined || (Number(aliyunContext.stsToken.expiration) <= Date.now().valueOf())) {
            const r = await this.request<AliyunStsToken>(this.options.stsTokenURL, {
                method: "GET",
                skipNotifyError: true
            });
            if (r.response.ok) {
                aliyunContext.stsToken = r.data;
            }
            else {
                return r as any; //发生错误，类型无所谓
            }
        }
        const r = await this.fetchConfig();
        if (!r.response.ok) {
            return r as any;
        }
        return { data: aliyunContext, response: { ok: true } } as any;
    };

    public generateObjectUrl(filePath: string) {
        const ossSettings = aliyunContext.ossConfig;
        if (ossSettings && ossSettings.public) {
            const bucket = ossSettings.public;
            const file = filePath.startsWith("/") ? filePath.substr(1, filePath.length - 1) : filePath;
            const hasCustomDomain = ((typeof bucket.customDomain) === "string" && bucket.customDomain.trim().length);
            const domain = hasCustomDomain ? bucket.customDomain : `${bucket.bucket}.${bucket.region}.aliyuncs.com`;
            return `https://${domain}/${file}`;
        }
        return "";
    };

    public ossUpload = async (
        bucketPolicy: BucketPolicy,
        savePath: string,
        file: any,
        progress?: (progress: number, checkPoint: Checkpoint) => void): Promise<RequestResponse<MultipartUploadResult>> => {

        const context = await this.getAliyunContext();

        if (!context.response.ok) {
            return context as any;
        }

        const { token, ossSettings } = context.data

        const uploadOptions: OSS.MultipartUploadOptions = {
            progress,
            partSize: 100 * 1024
        };

        const settings = bucketPolicy === BucketPolicy.Public ? ossSettings.public : ossSettings.public;
        const client = new OSS({
            accessKeyId: token.accessKeyId,
            accessKeySecret: token.accessKeySecret,
            stsToken: token.securityToken,
            endpoint: settings.endpoint,
            bucket: settings.bucket
        });
        const result = await client.multipartUpload(savePath, file, uploadOptions);
        return { response: { ok: true }, data: result } as any;
    };

}
