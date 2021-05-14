import { BucketPolicy } from "@src/core";
import { MinioUtils } from "../src/minio";
import { initRequestNoneOAuth2 } from "../src/request";

const request = initRequestNoneOAuth2();

const minioUtils = MinioUtils.create(request, "http://localhost:9898");

test("testAssumeRole", async ()=>{
   const resp = await minioUtils.fetchConfig(false, true);
   const{ response, data }= resp;
   expect(response.ok).toBeTruthy();
});

test("testAssumeRoleUpload", async ()=>{
    const resp = await minioUtils.fetchConfig(false, true);
    const{ response, data }= resp;
    expect(response.ok).toBeTruthy();

    const uploadResp = await minioUtils.ossUpload(BucketPolicy.Public, "aaaa/tttt.txt", "XXXXXX");
    const { res } = uploadResp;
 });