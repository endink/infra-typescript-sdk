# 适用于 Typescript 的前端核心服务 SDK

![Hex.pm](https://img.shields.io/hexpm/l/plug.svg)
![Npm Repository](https://raster.shields.io/npm/v/infra-sdk-core)

### 介绍

- 基于 ts 用于配合 infra java 服务端开发的客户端 SDK， 自行处理 Oauth 请求、自动 refresh token。
- 阿里云 oss 集成 ，配合后端的 sts 授权。
- 简单前端数据缓存，基于 session storage。


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

#### 感谢 

npm-plugin-template 

https://github.com/funky-tiger/npm-plugin-template

懒得系统学习前端知识，打包全靠它了 ！！

#### 自用全栈开发库，后端人员作品，不喜勿喷
