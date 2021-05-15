import { isNullOrEmptyString } from "../utils";
import { RequestResponse } from "umi-request";
import { AssumedCredentials, MinioConfig } from ".";
import { ExtendedRequestMethod, ExtendedRequestOptionsInit } from "../request";
import { ApplicationError, BucketPolicy } from "../core";
import { PresignedUrl } from "./types";

export interface MinioOptions {
    configURL: string;
    stsTokenURL: string;
    presignReadUrl: string;
    presignUploadURL: string;
}

interface MinioContext {
    stsToken?: AssumedCredentials;
    tokenTime: number;
    config?: MinioConfig;
}

const minioContext: MinioContext = { tokenTime: Date.now().valueOf() };

export class MinioUtils {
    private constructor(private request: ExtendedRequestMethod, public options: MinioOptions) {}

    static create(request: ExtendedRequestMethod, serverBaseUrl: string) {
        const url = (serverBaseUrl || "").trim();
        const base = url.endsWith("/") ? url.substr(0, url.length - 1) : url;
        const options: MinioOptions = {
            configURL: `${base}/objects/cnf`,
            stsTokenURL: `${base}/objects/assume-role`,
            presignReadUrl: `${base}/objects/pre-sign-url`,
            presignUploadURL: `${base}/objects/pre-sign-upload`
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

    public generateObjectUrl(key: string): string {
        const config = minioContext.config;
        if (config && !isNullOrEmptyString(config.publicBucket)) {
            const file = key.startsWith("/") ? key.substr(1, key.length - 1) : key;
            if (config.port) {
                return `${config.schema}://${config.host}:${config.port}/${config.publicBucket}/${file}`;
            } else {
                return `${config.schema}://${config.host}/${config.publicBucket}/${file}`;
            }
        }
        return "";
    }

    public async presignedObjectUrl(
        key: string,
        resOptions?: Omit<ExtendedRequestOptionsInit, "method" | "data">
    ): Promise<RequestResponse<PresignedUrl & ApplicationError>> {
        const file = encodeURI(key);
        const requestOptions = { ...(resOptions || {}), method: "POST" };
        return await this.request<PresignedUrl & ApplicationError>(
            `${this.options.presignReadUrl}?key=${file}`,
            requestOptions
        );
    }

    public async presignedUploadUrl(
        key: string,
        bucket: BucketPolicy = BucketPolicy.Public,
        resOptions?: Omit<ExtendedRequestOptionsInit, "method" | "data">
    ): Promise<RequestResponse<PresignedUrl & ApplicationError>> {
        const r = await this.getMinioContext();
        if (!r.response.ok) {
            return r as any;
        }
        const file = encodeURI(key);
        const requestOptions = { ...(resOptions || {}), method: "POST" };
        return await this.request<PresignedUrl & ApplicationError>(
            `${this.options.presignUploadURL}?key=${file}&b=${bucket}`,
            requestOptions
        );
    }

    private getFileName(key: string): string {
        const correctKey = key.replace("\\", "/");
        const index = correctKey.lastIndexOf("/");
        return correctKey.substr(index);
    }

    public async upload(
        key: string,
        blobOrString: Blob | string,
        bucketPolicy: BucketPolicy = BucketPolicy.Public
    ): Promise<RequestResponse<PresignedUrl & ApplicationError>> {
        const fileAPI = window.File && window.FileReader && window.FileList && window.Blob;
        if (!fileAPI) {
            return {
                response: { ok: false, status: 0, statusText: "file api unsupported" } as any,
                data: {
                    error: "file_api_unsupported",
                    error_description: "file api unsupported by current broswser."
                } as any
            };
        }

        const r = await this.getMinioContext();
        const fileName = this.getFileName(key);
        const length = typeof blobOrString === "string" ? blobOrString.length : blobOrString.size;
        const blob = typeof blobOrString === "string" ? new Blob([blobOrString], { type: "plain/text" }) : blobOrString;

        const presignedResult = await this.presignedUploadUrl(key, bucketPolicy);

        if (presignedResult.response.ok) {
            const formData = new FormData();
            formData.append("file", blob, fileName);

            const { url, contentType } = presignedResult.data;
            const { response, data } = await this.request.put(url, {
                data: formData,
                headers: { "Content-Length": `${length}`, "Content-Type":"multipart/form-data" }
            });

            if (response.ok) {
                if (bucketPolicy === BucketPolicy.Private) {
                    const presigned = await this.presignedObjectUrl(key);
                    if (presigned.response.ok) {
                        return presigned;
                    }
                }
                return {
                    response: { ok: true, status: 200 },
                    data: { url: this.generateObjectUrl(key), expireInSeconds: Number.MAX_VALUE, contentType }
                } as any;
            }
            return { response, data } as any;
        } else {
            return presignedResult as any;
        }
    }
}
