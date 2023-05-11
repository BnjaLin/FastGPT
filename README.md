# Fast GPT

Fast GPT 允许你使用自己的 openai API KEY 来快速的调用 openai 接口，目前集成了 gpt35 和 embedding. 可构建自己的知识库。

## 🛸 在线体验

🎉 [fastgpt.run](https://fastgpt.run/) （国内版）  
🎉 [ai.fastgpt.run](https://ai.fastgpt.run/) （海外版）

![Demo](docs/imgs/demo.png?raw=true 'demo')

#### 知识库原理图

![KBProcess](docs/imgs/KBProcess.jpg?raw=true 'KBProcess')

## 👨‍💻 开发

项目技术栈: NextJs + TS + ChakraUI + Mongo + Postgres（Vector 插件）  
这是一个平台项目，非单机项目，除了模型调用外还涉及非常多用户的内容。  
[本地开发 Quick Start](docs/dev/README.md)

## 🚀 私有化部署

```bash
# proxy（可选）
AXIOS_PROXY_HOST=127.0.0.1
AXIOS_PROXY_PORT=7890
# openai 中转连接（可选）
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_BASE_URL_AUTH=可选的安全凭证
queueTask=1
parentUrl=https://hostname/api/openapi/startEvents
# 发送邮箱验证码配置。用的是QQ邮箱。参考 nodeMail 获取MAILE_CODE，自行百度。
MY_MAIL=xxx@qq.com
MAILE_CODE=xxx
aliAccessKeyId=xxx
aliAccessKeySecret=xxx
aliSignName=xxx
aliTemplateCode=SMS_xxx
TOKEN_KEY=xxx
OPENAIKEY=sk-xxx
# 和mongo镜像的username,password对应
MONGODB_URI=mongodb://username:password@服务器IP:27017/test?authSource=admin
MONGODB_NAME=xxx
PG_HOST=服务器IP
PG_PORT=8100
PG_USER=fastgpt # POSTGRES_USER
PG_PASSWORD=1234 # POSTGRES_PASSWORD
PG_DB_NAME=fastgpt # POSTGRES_DB
```

[docker-compose 部署教程](docs/deploy/docker.md)

## :point_right: RoadMap

- [FastGpt RoadMap](https://kjqvjse66l.feishu.cn/docx/RVUxdqE2WolDYyxEKATcM0XXnte)

## 🏘️ 交流群

wx: fastgpt123  
![Demo](docs/imgs/wx300.jpg?raw=true 'wx')

## 👀 其他

- [FastGpt 常见问题](https://kjqvjse66l.feishu.cn/docx/HtrgdT0pkonP4kxGx8qcu6XDnGh)
- [FastGpt + Laf 最佳实践，将知识库装入公众号，点击去 Laf 公众号体验效果](https://hnvacz-laf-upload-ai.oss.laf.run/3ffd528ee2f9ae1dcd3508fe9994dd9.png)
- [FastGpt V3.4 更新集合](https://www.bilibili.com/video/BV1Lo4y147Qh/?vd_source=92041a1a395f852f9d89158eaa3f61b4)
- [FastGpt 知识库演示](https://www.bilibili.com/video/BV1Wo4y1p7i1/)

## 🌟 Star History

#### 1. 准备

> 1. 服务器开通 80 端口。用代理的话，对应的代理端口也需要打开。
> 2. QQ 邮箱 Code：进入 QQ 邮箱 -> 账号 -> 申请 SMTP 账号
> 3. 有域名的准备好 SSL 证书

#### 2. 安装 docker 和 docker-compose

这个不同系统略有区别，百度安装下。验证安装成功后进行下一步。下面给出一个例子：

```bash
# 安装docker
curl -L https://get.daocloud.io/docker | sh
sudo systemctl start docker
# 安装 docker-compose
curl -L https://github.com/docker/compose/releases/download/1.23.2/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
# 验证安装
docker -v
docker-compose -v
# 如果docker-compose运行不了，可以把 deploy/docker-compose 文件复制到服务器，然后在 docker-compose 文件夹里执行 sh init.sh。会把docker-compose文件复制到对应目录。
```

#### 2. 创建 3 个初始化文件

手动创建或者直接把 deploy 里内容复制过去,然后把 deploy 文件夹改名为: fastgpt

**/root/fast-gpt/pg/init.sql PG 数据库初始化**

```sql
set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL

CREATE EXTENSION vector;
-- init table
CREATE TABLE modelData (
    id BIGSERIAL PRIMARY KEY,
    vector VECTOR(1536),
    status VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    model_id VARCHAR(50) NOT NULL,
    q TEXT NOT NULL,
    a TEXT NOT NULL
);
-- create index
CREATE INDEX modelData_status_index ON modelData USING HASH (status);
CREATE INDEX modelData_userId_index ON modelData USING HASH (user_id);
CREATE INDEX modelData_modelId_index ON modelData USING HASH (model_id);
EOSQL
```

**/root/fast-gpt/nginx/nginx.conf Nginx 配置**

```conf
user nginx;
worker_processes auto;
worker_rlimit_nofile 51200;

events {
    worker_connections 1024;
}

http {
    resolver 8.8.8.8;
    proxy_ssl_server_name on;

    access_log off;
    server_names_hash_bucket_size 512;
    client_header_buffer_size 64k;
    large_client_header_buffers 4 64k;
    client_max_body_size 50M;

    proxy_connect_timeout       240s;
    proxy_read_timeout          240s;
    proxy_buffer_size 128k;
    proxy_buffers 4 256k;

    gzip  on;
    gzip_min_length   1k;
    gzip_buffers  4 8k;
    gzip_http_version 1.1;
    gzip_comp_level 6;
    gzip_vary on;
    gzip_types  text/plain application/x-javascript text/css application/javascript application/json application/xml;
    gzip_disable "MSIE [1-6]\.";

    open_file_cache max=1000 inactive=1d;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 8;
    open_file_cache_errors off;

    server {
        listen 443 ssl;
        # 改成自己的域名和证书
        server_name docgpt.ahapocket.cn;
        ssl_certificate /ssl/docgpt.pem;
        ssl_certificate_key /ssl/docgpt.key;
        ssl_session_timeout 5m;

        location / {
            proxy_pass http://localhost:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
    server {
        listen 80;
        server_name docgpt.ahapocket.cn;
        rewrite ^(.*) https://$server_name$1 permanent;
    }
}
```

**/root/fast-gpt/docker-compose.yml 核心部署文件**

```yml
version: '3.3'
services:
  fast-gpt:
    image: c121914yu/fast-gpt:latest
    network_mode: host
    restart: always
    container_name: fast-gpt
    environment:
      # proxy（可选）
      - AXIOS_PROXY_HOST=127.0.0.1
      - AXIOS_PROXY_PORT=7890
      # openai 中转连接（可选）
      - OPENAI_BASE_URL=https://api.openai.com/v1
      - OPENAI_BASE_URL_AUTH=可选的安全凭证
      # 是否开启队列任务。 1-开启，0-关闭（请求 parentUrl 去执行任务,单机时直接填1）
      - queueTask=1
      - parentUrl=https://hostname/api/openapi/startEvents
      # 发送邮箱验证码配置。用的是QQ邮箱。参考 nodeMail 获取MAILE_CODE，自行百度。
      - MY_MAIL=xxxx@qq.com
      - MAILE_CODE=xxxx
      # 阿里短信服务（邮箱和短信至少二选一）
      - aliAccessKeyId=xxxx
      - aliAccessKeySecret=xxxx
      - aliSignName=xxxxx
      - aliTemplateCode=SMS_xxxx
      # token加密凭证（随便填，作为登录凭证）
      - TOKEN_KEY=xxxx
      - queueTask=1
      - parentUrl=https://hostname/api/openapi/startEvents
      # 和下方mongo镜像的username,password对应
      - MONGODB_URI=mongodb://username:passsword@0.0.0.0:27017/?authSource=admin
      - MONGODB_NAME=xxx
      - PG_HOST=0.0.0.0
      - PG_PORT=8100
      # 和下方PG镜像对应.
      - PG_USER=fastgpt # POSTGRES_USER
      - PG_PASSWORD=1234 # POSTGRES_PASSWORD
      - PG_DB_NAME=fastgpt # POSTGRES_DB
      - OPENAIKEY=sk-xxxxx
  nginx:
    image: nginx:alpine3.17
    container_name: nginx
    restart: always
    network_mode: host
    volumes:
      # 刚创建的文件
      - /root/fastgpt/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - /root/fastgpt/nginx/logs:/var/log/nginx
      # https证书，没有的话不填，对应的nginx.conf也要修改
      - /root/fastgpt/nginx/ssl/docgpt.key:/ssl/docgpt.key
      - /root/fastgpt/nginx/ssl/docgpt.pem:/ssl/docgpt.pem
  pg:
    image: ankane/pgvector
    container_name: pg
    restart: always
    ports:
      - 8100:5432
    environment:
      # 这里的配置只有首次运行生效。修改后，重启镜像是不会生效的。需要把持久化数据删除再重启，才有效果
      - POSTGRES_USER=fastgpt
      - POSTGRES_PASSWORD=1234
      - POSTGRES_DB=fastgpt
    volumes:
      # 刚创建的文件
      - /root/fastgpt/pg/init.sql:/docker-entrypoint-initdb.d/init.sh
      - /root/fastgpt/pg/data:/var/lib/postgresql/data
      - /etc/localtime:/etc/localtime:ro
  mongodb:
    image: mongo:6.0.4
    container_name: mongo
    restart: always
    ports:
      - 27017:27017
    environment:
      # 这里的配置只有首次运行生效。修改后，重启镜像是不会生效的。需要把持久化数据删除再重启，才有效果
      - MONGO_INITDB_ROOT_USERNAME=username
      - MONGO_INITDB_ROOT_PASSWORD=password
    volumes:
      - /root/fastgpt/mongo/data:/data/db
      - /root/fastgpt/mongo/logs:/var/log/mongodb
      - /etc/localtime:/etc/localtime:ro
```

#### 3. 运行 docker-compose

下面是一个辅助脚本，也可以直接 docker-compose up -d

**run.sh 运行文件**

```bash
#!/bin/bash
docker-compose pull
docker-compose up -d

echo "Docker Compose 重新拉取镜像完成！"

# 删除本地旧镜像
images=$(docker images --format "{{.ID}} {{.Repository}}" | grep fast-gpt)

# 将镜像 ID 和名称放入数组中
IFS=$'\n' read -rd '' -a image_array <<<"$images"

# 遍历数组并删除所有旧的镜像
for ((i=1; i<${#image_array[@]}; i++))
do
    image=${image_array[$i]}
    image_id=${image%% *}
    docker rmi $image_id
done
```

## 其他优化点

### Git Action 自动打包镜像

.github 里拥有一个 git 提交到 main 分支时自动打包 amd64 和 arm64 镜像的 actions。你仅需要提前在 git 配置好 session。

1. 创建账号 session: 头像 -> settings -> 最底部 Developer settings -> Personal access tokens -> tokens(classic) -> 创建新 session，把一些看起来需要的权限勾上。
2. 添加 session 到仓库: 仓库 -> settings -> Secrets and variables -> Actions -> 创建 secret
3. 填写 secret: Name-GH_PAT, Secret-第一步的 tokens

## 其他问题

### Mac 可能的问题

> 因为教程有部分镜像不兼容 arm64，所以写个文档指导新手如何快速在 mac 上面搭建 fast-gpt[如何在 mac 上面部署 fastgpt](./docs/mac.md)
> [![Star History Chart](https://api.star-history.com/svg?repos=c121914yu/FastGPT&type=Date)](https://star-history.com/#c121914yu/FastGPT&Date)
