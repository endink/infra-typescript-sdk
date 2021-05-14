import { isNullOrEmptyString } from "../utils";
import { RequestResponse, ResponseError } from "umi-request";
import { AssumedCredentials, MinioConfig } from ".";
import { ExtendedRequestMethod, ExtendedRequestOptionsInit } from "../request";
import { ApplicationError, BucketPolicy } from "../core";
import * as Minio from "minio";
import { PresignedResult, UploadResult } from "./types";

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

const minioContext: MinioContext = { tokenTime: Date.now().valueOf() };

type SimpleStringValue = {
    value: string;
};

export class MinioUtils {
    private constructor(private request: ExtendedRequestMethod, public options: MinioOptions) {}

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

    public async getMinioContext(): Promise<RequestResponse<MinioContext & ApplicationError>> {
        const config = await this.fetchConfig();
        if (!config.response.ok) {
            return config as any;
        }

        const durationSeconds = minioContext?.stsToken?.expiration;
        // 提前三分钟过期
        const durationMills = durationSeconds ? (durationSeconds - 180) * 1000 : 0;

        if (minioContext.stsToken === undefined || minioContext.tokenTime + durationMills <= Date.now().valueOf()) {
            const r = await this.request<AssumedCredentials>(this.options.stsTokenURL, {
                method: "POST",
                skipNotifyError: true
            });

            if (r.response.ok) {
                minioContext.stsToken = r.data;
                minioContext.tokenTime = Date.now().valueOf();
            } else {
                return r as any; // 发生错误，类型无所谓
            }
        }

        return { data: minioContext, response: { ok: true } } as any;
    }

    public generateObjectUrl(key: string): string | undefined {
        const config = minioContext.config;
        if (config && !isNullOrEmptyString(config.publicBucket)) {
            const file = key.startsWith("/") ? key.substr(1, key.length - 1) : key;
            if (config.port) {
                return `${config.schema}://${config.host}:${config.port}/${config.publicBucket}/${file}`;
            } else {
                return `${config.schema}://${config.host}/${config.publicBucket}/${file}`;
            }
        }
    }

    public async presignedObjectUrl(
        filePath: string,
        resOptions?: Omit<ExtendedRequestOptionsInit, "method" | "data">
    ): Promise<RequestResponse<PresignedResult & ApplicationError>> {
        const file = encodeURI(filePath);
        const requestOptions = { ...(resOptions || {}), method: "POST" };
        const { response, data } = await this.request<SimpleStringValue & ApplicationError>(
            `${this.options.genUrl}?key=${file}`,
            requestOptions
        );
        return { data: { url: (data?.value || "") }, response }
    }

    private putObjectAsync(
        client: Minio.Client,
        bucketName: string,
        objectName: string,
        stream: any
    ): Promise<RequestResponse<UploadResult>> {
        return new Promise((resolve, reject) => {
            client.putObject(bucketName, objectName, stream, (err, etag) => {
                if (err === undefined || err === null) {
                    resolve({ data: { etag }, response: { ok: true, status: 200, type: "default" } as any });
                } else {
                    const data: UploadResult = { etag };
                    if (typeof err === "string") {
                        data.error = err as any;
                        data.error_description = err as any;
                    } else {
                        data.error = err?.name;
                        data.error_description = err?.message;
                    }

                    reject({ data, response: { ok: false, status: 500 } as any });
                }
            });
        });
    }

    public async upload(bucketPolicy: BucketPolicy, key: string, stream: any): Promise<RequestResponse<UploadResult>> {
        const r = await this.getMinioContext();

        const { response, data } = r;
        if (!r.response.ok) {
            return { data: data as any, response };
        }

        const { stsToken, config } = r.data;
        const cnf = config as MinioConfig;

        const bucketName = bucketPolicy === BucketPolicy.Private ? cnf.privateBucket : cnf.publicBucket;

        const minioClient = new Minio.Client({
            endPoint: cnf.host,
            port: cnf.port,
            region: cnf.region,
            useSSL: cnf.schema === "https",
            accessKey: stsToken?.accessKey || "",
            secretKey: stsToken?.secretKey || "",
            sessionToken:stsToken?.sessionToken || "",
        });

        return await this.putObjectAsync(minioClient, bucketName, key, stream);
    }
}
