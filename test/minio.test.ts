import { MinioUtils } from "../src/minio";
import { initRequestNoneOAuth2 } from "../src/request";

const request = initRequestNoneOAuth2();

const minioUtils = MinioUtils.create(request, "http://localhost:9898");

test("testFetchConfig", async () => {
   const resp = await minioUtils.fetchConfig(false, true);
   const { response, data } = resp;
   expect(response.ok).toBeTruthy();
});

test("testPresignedUploadUrl", async () => {
   const resp = await minioUtils.fetchConfig(false, true);
   expect(resp.response.ok).toBeTruthy();

   const { response, data } = await minioUtils.presignedUploadUrl("kkkk/aaa.jpg");
   expect(response.ok).toBeTruthy();

   expect(data.contentType?.length).toBeDefined()
   expect(data.error).toBeUndefined();
   expect(data.url).toBeDefined();
   expect(data.expireInSeconds > 0).toBeTruthy();

   console.log(data);
});


test("testUpload", async () => {
   const blob = new Blob(["\ufeff","xxxxx"], { type: "text/plain", endings:"transparent" });

   console.log(blob);

   const { response, data } = await minioUtils.upload("test/aaa.txt", blob);
   expect(response.ok).toBeTruthy();

   expect(data.contentType?.length).toBeDefined()
   expect(data.error).toBeUndefined();
   expect(data.url).toBeDefined();
   expect(data.expireInSeconds > 0).toBeTruthy();

   const r = await request.get(data.url);
   expect(r.response.ok).toBeTruthy();
   expect(r.data).toBe("xxxxx");

   console.log(data);
});
