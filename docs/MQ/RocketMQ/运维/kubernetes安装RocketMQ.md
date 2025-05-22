
## 安装minikubernetes

## 安装helm

```shell
 brew install helm
```

检验是否安装完成

```shell
helm version
```

## 下载 RocketMQ Helm 仓库

```shell
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

## 不熟

```shell
helm pull oci://registry-1.docker.io/apache/rocketmq --version 0.0.1
tar -zxvf rocketmq-0.0.1.tgz
```

## 修改配置

```shell
vim values.yaml
```

```shell
helm install rocketmq-demo ./rocketmq
```

查看状态
```shell
kubectl get pods -o wide -n default
```

## 释放

```shell
helm uninstall rocketmq-demo
```