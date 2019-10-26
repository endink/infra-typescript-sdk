# 适用于 Typescript 的前端核心服务 SDK

![Hex.pm](https://img.shields.io/hexpm/l/plug.svg)
![Npm Repository](https://raster.shields.io/npm/v/infra-sdk-core)



### 介绍

- 基于 ts 用于配合 infra java 服务端开发的客户端 SDK， 自行处理 Oauth 请求、自动 refresh token。
- 阿里云 oss 集成 ，配合后端的 sts 授权。
- 简单前端数据缓存，基于 session storage。
- **需要配合后端 infra java 框架，非我厂人员该项目无任何价值**

### 吐槽

长期被前端虐，自学前端，看看到底有多难 .
为什么一个刷新 token 都懒得做！ 
为什么前端从来不把代码打包复用，都是 copy 到各个项目！
后端供应前端 SDK 合适吗？！

结论：网红程序员 ≠ 高手！！！

### 使用

```
npm i infra-sdk-core
npm i moment
```

> 注意：由于 moment 更新频繁，同时因为全球化全局配置冲突等问题，包中没有自动关联 moment 依赖，需要手动安装 moment
需要配合后端 infra 框架使用（ 该框架暂无开源计划 ）


#### Http Request 集成 后端 Oatuh2 认证

创建 request.ts (umi request 增强，自动刷新 token 中间件，错误处理)

```typescript

import { initRequest, RequestOptions } from "infra-sdk-core";
import { message } from 'antd';

const errors = {
  //commons
  "system_error": "系统错误",

  //auth
  "unauthorized":"客户端请求需要授权",
  "error_uri": "请求地址不正确",
  "invalid_request":"错误的请求格式",
  "invalid_client":"客户端认证失败",
  "invalid_grant":"用户名或密码错误",
  "unauthorized_client":"客户端端授权失败",
  "unsupported_grant_type":"不支持该授权类型",
  "invalid_scope":"授权请求的范围无效",
  "insufficient_scope":"授权的范围不足以完成该操作",
  "invalid_token":"会话状态异常，请重试或重新登录",
  "redirect_uri_mismatch":"请求缺少重定向地址",
  "unsupported_response_type":"不支持的响应类型",
  "access_denied":"你没有权限进行该操作",
  //...其他自定义错误自行补充
};

/**
 * 配置request请求时的默认参数
 */
const options:RequestOptions = {
  clientId: "my-client",
  clientSecret: "abcdef",
  accessTokenUrl:"/api/oauth/token", //Spring 标准 Endpoint
  toast: message,
  errorDescriber:errors
};

const request = initRequest(options);

export default request;

```

#### Oauth2 登录例子：

```typescript
import request from "./request";
import { clientSession, OAuth2AccessToken, LoginParam } from "infra-sdk-core";

//此处省略无数代码....

const req:LoginParam =  {
   //省略代码 
};
const {response, data} = await request.login(req, { skipNotifyError:true });
// Login successfully
if (response.ok) {
  clientSession.saveToken(data);
}else{
  const error = data.error_description;
  //handle error
}

```

> 增强特性：
> 1. 自动带入 bear token: 对 clientSession 调用 saveToken 后，之后的 http 请求自动带入 oauth2 的 bear token (自动添加 http header); 
> 2. 自动刷新 acccess token: 根据 access token 的过期时间判断是否在请求 HTTP 接口之前进行 refresh token 刷新操作; 
> 3. request.login 方法： 对接 spring security oauth2 标准 endpoint: /oauth/token， 登录并返回 access token;
> 4. request.checkToken 方法： 对接 spring security oauth2 标准 endpoint: oauth/check_token， 检查当前 token 是否有效;
> 5. skipNotifyError 属性: 是否使用 toast 方式来处理异常;
> 6. skipAuth 属性： 当设置为 true 时，1 和 2 步骤不再进行 (有时可能我们希望执行普通的 http 请求);


#### 使用阿里云 OSS

创建 oss.ts 文件：

```typescript
import { OssUtils } from 'infra-sdk-core/lib/aliyun';

const oss = new OssUtils(request, {
  configURL: "/api/oss-config",
  stsTokenURL: "api/get-oss-token" });
//oss.fetchConfig();
export default oss;

```
> 建议应用程序首次启动时执行一次 fetchConfig() 函数（从后端获取 oss 配置），以加速后续请求;
> 如果配置在前端配置，可以执行 configure() 函数

上传示例

```typescript

import oss from "./oss";
import { BucketPolicy } from 'infra-sdk-core/lib/aliyun';

//此处忽略无数代码...

const { response } = await oss.ossUpload(BucketPolicy.Public, "/test/xxxx.jpg", file, onUploading);
if(response.ok){
  //上传成功
}

```

> BucketPolicy.Public 和 BucketPolicy.Private 区分 bucket 的访问属性（需要配合后端 infra 框架）

处理 public bucket 生成访问路径 （该操作不会产生任何服务端请求）：

```typescript
import { oss } from "./oss";

const src = oss.generateObjectUrl("/test/aaa.jpg")

```

> 注意： 出于同步编程的便捷性考虑，generateObjectUrl 不会请求从后端配置，所以该方法需要在调用之前执行过 fetchConfig 或 configure 方法， 否则返回空串 ( "" );

### 相关命令

- npm run start 启动本地服务开发
- npm run build 是根据根目录的 tsconfig.json 文件来执行 tsx 解析并最终打包到根目录的 lib/文件夹内
- npm run lint 运行 tslint 检测代码格式问题
- npm run test 运行 Jest 进行代码测试 测试用例在/src/test/目录中 以 xxx.test.tsx 命名
- npm login 登录 npm（没有的话就去注册一个）
- npm publish 推送的代码到 npm

### 依赖

- umi-request
  > 处理 HTTP 请求.
- aliyun oss sdk
  > oss 操作相关的 js SDK

### 感谢 

npm-plugin-template 

https://github.com/funky-tiger/npm-plugin-template

懒得系统学习前端知识，打包全靠它了 ！！





#### 自用全栈开发库，后端人员作品，不喜勿喷
