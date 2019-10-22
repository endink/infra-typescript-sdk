export interface AliyunStsToken {
    securityToken: string;
    accessKeyId: string;
    accessKeySecret: string;
    expiration: string;
}
export interface BucketSettings {
    region: string;
    bucket: string;
    endpoint: string;
    customDomain: string;
}
export interface AliyunOssConfig {
    private: BucketSettings;
    public: BucketSettings;
}
export declare enum BucketPolicy {
    Private = 0,
    Public = 1
}
