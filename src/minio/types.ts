import { ApplicationError } from "../core";

export interface MinioConfig {
    schema: string;
    host: string;
    port?: number;
    region: string;
    privateBucket: string;
    publicBucket: string;
}

export interface AssumedCredentials {
    accessKey: string;
    secretKey: string;
    /**
     * expired in seconds
     */
    expiration: number;
    sessionToken: string;
}

export interface UploadResult extends ApplicationError {
    etag: string;
}