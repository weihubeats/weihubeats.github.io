## 镜像管理

镜像我们使用 podman 不使用 docker

docker 收费

## 


```
# 1. 安装 minikube
brew install minikube

# 2. 安装 kubernetes-cli (kubectl) 用于管理集群
brew install kubectl

minikube start --driver=podman --apiserver-names="host.docker.internal"

# 查看 minikube 运行状态
minikube status

# 查看集群节点
kubectl get nodes


# 1. 创建一个名为 my-nginx 的部署，并指定运行 3 个 Pod 副本
kubectl create deployment my-nginx --image=nginx:alpine --replicas=3

# 2. （可选）为这组 Pod 创建一个 Service，方便以后访问
kubectl expose deployment my-nginx --port=80 --type=NodePort

```


因为 Kuboard 位于容器内部，无法读取你 Mac 上的本地路径（如 ~/.minikube/profiles/...），所以我们需要将本地 Kubeconfig 中所有引用的证书文件内容，转换并嵌入到配置文件中。
1. 生成不带外部文件路径的 Kubeconfig
在 Mac 终端运行以下命令，导出扁平化（内联证书数据）的配置：

```
kubectl config view --flatten > ~/Desktop/minikube-kubeconfig.yaml
```

这会在你的桌面上生成一个 minikube-kubeconfig.yaml 文件，并且所有的证书文件（client-certificate 等）都会被自动转换成 base64 编码的数据（以 ...-data 结尾）。

2. 修改 API Server 地址

用文本编辑器打开你桌面的 minikube-kubeconfig.yaml。
找到 clusters 下的 server 配置：
•	原配置可能类似于：server: `https://127.0.0.1:49157（端口因启动而异）`
•	修改为：将 IP 替换为宿主机域名，但保留原来的端口号：
server: https://host.docker.internal:49157


第三步：在 Kuboard 界面中导入
	1.	打开 Kuboard 网页管理界面（如 `http://localhost:80`）。
	2.	使用管理员账号登录（默认用户名 admin，密码 Kuboard123）。
	3.	点击 「添加集群」 或 「导入集群」。
	4.	选择导入方式为 「Kubeconfig」。
	5.	填写集群信息：
•	集群名称：例如 minikube
•	描述：本地测试集群
	6.	导入配置：将你在第二步修改好的 ~/Desktop/minikube-kubeconfig.yaml 文件的全部内容复制，粘贴到 Kuboard 的 Kubeconfig 输入框中。
	7.	点击 「确定 / 保存」。