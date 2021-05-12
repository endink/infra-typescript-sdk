import { isNullOrEmptyString } from "../utils";
import { RequestResponse } from "umi-request";
import { AssumedCredentials, MinioConfig } from ".";
import { ExtendedRequestMethod, ExtendedRequestOptionsInit } from "../request";
import { BucketPolicy } from "../core";
import * as Minio from "minio";

export interface MinioOptions {
    configURL: string;
    stsTokenURL: string;
    genUrl: string;
}

interface MinioContext {
    stsToken?: AssumedCredentials;
    tokenTime: number;
    config?: MinioConfig;
}

const minioContext: MinioContext = { tokenTime : Date.now().valueOf() };

type SimpleStringValue = {
    value: string
}

export class MinioUtils {
    private constructor(private request: ExtendedRequestMethod, public options: MinioOptions){
        
    }

    static create(request: ExtendedRequestMethod, serverBaseUrl: string) {
        const url = (serverBaseUrl || "").trim();
        const base = url.endsWith("/") ? url.substr(0, url.length - 1) : url;
        const options: MinioOptions = {
            configURL: `${base}/objects/cnf`,
            stsTokenURL: `${base}/objects/assume-role`,
            genUrl: `${base}/objects/pre-sign-url`
        };

        return new MinioUtils(request, options);
    }

    get context() {
        return minioContext;
    }

    public configure(config: MinioConfig) {
        minioContext.config = config;
    }

    public async fetchConfig(
        skipNotifyError: boolean = true,
        forceReload: boolean = false
    ): Promise<RequestResponse<MinioConfig>> {
        if (minioContext.config === undefined || forceReload) {
            const r = await this.request<MinioConfig>(this.options.configURL, {
                method: "GET",
                skipNotifyError
            });
            if (r.response.ok) {
                minioContext.config = r.data;
            }
            return r;
        }
        return { response: { ok: true }, data: minioContext.config } as RequestResponse<MinioConfig>;
    }

    public async getMinioContext(): Promise<RequestResponse<MinioContext>> {
        const config = await this.fetchConfig();
        if (!config.response.ok) {
            return config as any;
        }

        if (minioContext.stsToken === undefined || (minioContext.stsToken.expiration * 1000 + minioContext.tokenTime) <= Date.now().valueOf()) {
            const r = await this.request<AssumedCredentials>(this.options.stsTokenURL, {
                method: "POST",
                skipNotifyError: true
            });
            if (r.response.ok) {
                minioContext.stsToken = r.data;
                minioContext.tokenTime = Date.now().valueOf()
            } else {
                return r as any; // 发生错误，类型无所谓
            }
        }
        
        return { data: minioContext, response: { ok: true } } as any;
    }


    public generateObjectUrl(key: string): string | undefined {
        const config = minioContext.config;
        if (config && !isNullOrEmptyString(config.publicBucket)) {
            const bucket = config.publicBucket;
            const file = key.startsWith("/") ? key.substr(1, key.length - 1) : key;
            if(config.port){
                return `${config.schema}://${config.host}:${config.port}/${config.publicBucket}/${file}`;
            }else{
                return `${config.schema}://${config.host}/${config.publicBucket}/${file}`;
            }
        }
    }

    public async presignedObjectUrl(
        filePath: string,
        resOptions?: Omit<ExtendedRequestOptionsInit, "method" | "data">
    ): Promise<string> {
        const file= encodeURI(filePath)
        const requestOptions = { ...(resOptions || {}), method: "POST" };
        const { response, data } = await this.request<SimpleStringValue>(`${this.options.genUrl}?key=${file}`, requestOptions);
        if (response.ok) {
            return data.value;
        } else {
            return "";
        }
    }


    public ossUpload = async (
        bucketPolicy: BucketPolicy,
        key: string,
        stream: any
    ): Promise<{etag:string}> => {
        const context = await this.getMinioContext();

        if (!context.response.ok) {
            return context as any;
        }

        const { stsToken, config } = context.data;
        const cnf = {...config} as MinioConfig

        if(!cnf.port){
            cnf.port = (cnf.schema === "https") ? 443 : 80;
        }

        const bucketName = bucketPolicy == BucketPolicy.Private ? cnf.privateBucket : cnf.publicBucket;

        const minioClient = new Minio.Client({
            endPoint: cnf.host,
            port: cnf.port,
            useSSL: (cnf.schema === "https"),
            accessKey: stsToken?.accessKey || "",
            secretKey: stsToken?.secretKey || ""
        });

        return new Promise((resolve, reject)=>{
            minioClient.putObject(bucketName, key, stream, (err, etag)=>{
                if(err !== undefined && err !== null){
                    reject(err);
                }else{
                    resolve({ etag: etag });
                }
            });
        })

    };

}