# koa-webpack-ssr

基于koa2和webpack的vue服务端渲染

## 特点
  
  1. 支持热刷新

  2. 支持类似于NUXT的asyncData的请求数据和合并数据方式

  3. 支持类似于NUXT在asyncData时重定向或抛出错误的方式

  4. 支持基于页面路由地址定义哪些页面第二次请求返回304

  5. 支持基于页面路由地址定义需要LRU缓存的页面，以便于访问时直接抛出静态页面而不需再次渲染

  6. 支持PWA配置

  7. 支持类似于vue-templates/webpack中的config配置

  8. 使用eslint, babel

## 用例

```
$ npm install -g vue-cli
$ vue init zczhangchao51/koa-webpack-ssr my-project  
$ cd my-project
$ npm install
$ npm run dev
```

## 命令

- `npm run dev`: 进入开发模式

- `npm run build`: 同时构建服务端代码及客户端代码

- `npm run build:client`: 仅构建客户端代码

- `npm run build:server`: 仅构建服务端代码

- `npm run start`: 启动生产模式