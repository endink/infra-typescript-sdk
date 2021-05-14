import { generateUUID } from "../src/utils";
import { BucketPolicy } from "../src/core";
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
    expect(resp.response.ok).toBeTruthy();

    const file = generateUUID()
    const uploadResp = await minioUtils.upload(BucketPolicy.Public, `aaa/${file}.txt`, "XXXXXX");
    const { response, data } = uploadResp;
    expect(response.ok).toBeTruthy();
    expect(response.status).toEqual(200);
    expect(data.etag.length >0).toBeTruthy();
 });