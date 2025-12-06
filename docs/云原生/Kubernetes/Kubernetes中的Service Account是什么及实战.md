## Kubernetes 中的 Service Account 是什么

`Service Account` (SA) 是 Kubernetes 中用于**机器（进程/Pod）**的身份凭证，区别于 User Account（给人类用户使用的，如管理员通过 kubectl 操作集群）。

- 核心概念：
    - 身份标识：当一个 Pod 在 K8s 集群中运行时，它需要一个身份来与 `K8s API Server` 交互（例如：读取 Secret、监控其他 Pod 状态）。`Service Account` 就是这个身份。
    - 命名空间隔离：`Service Account` 是属于特定 `Namespace` 的。default namespace 下的 admin SA 和 dev namespace 下的 admin SA 是完全不同的两个身份。
    - 自动挂载：默认情况下，每个 Pod 创建时，K8s 会自动挂载该 `Namespace` 下的 `default Service Account` 的 Token 到 Pod 内部（通常在 /var/run/secrets/kubernetes.io/serviceaccount）。
    - RBAC 绑定：你可以通过 RBAC (Role-Based Access Control) 将权限（Role/ClusterRole）绑定到 Service Account 上，从而控制该 Pod 在 K8s 集群内部 能做什么操作。

##  Service Account 结构

 ```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-service-account
  namespace: default
secrets:
- name: my-service-account-token-xyz  # 自动创建
```

## AWS S3 基于 Service Account 授权的方案

### 为 EKS 集群配置 OIDC 提供者

```shell
# 检查集群是否已启用 OIDC
aws eks describe-cluster --name <cluster-name> --query "cluster.identity.oidc.issuer"

# 创建 OIDC 提供者（如果不存在）
eksctl utils associate-iam-oidc-provider --cluster <cluster-name> --approve
```
### 创建 IAM 策略（S3 访问权限）

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::my-bucket",
        "arn:aws:s3:::my-bucket/*"
      ]
    }
  ]
}
```


### 创建 IAM 策略

```
aws iam create-policy \
  --policy-name S3AccessPolicy \
  --policy-document file://s3-policy.json
```

### 创建 IAM 角色并配置信任关系

```json
# trust-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<AWS_ACCOUNT_ID>:oidc-provider/oidc.eks.<region>.amazonaws.com/id/<OIDC_ID>"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "oidc.eks.<region>.amazonaws.com/id/<OIDC_ID>:sub": "system:serviceaccount:<namespace>:<service-account-name>",
          "oidc.eks.<region>.amazonaws.com/id/<OIDC_ID>:aud": "sts.amazonaws.com"
        }
      }
    }
  ]
}
```

```
# 创建 IAM 角色
aws iam create-role \
  --role-name eks-s3-access-role \
  --assume-role-policy-document file://trust-policy.json

# 附加策略到角色
aws iam attach-role-policy \
  --role-name eks-s3-access-role \
  --policy-arn arn:aws:iam::<AWS_ACCOUNT_ID>:policy/S3AccessPolicy
```

### 创建 Kubernetes Service Account

```yaml
# s3-service-account.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: s3-access-sa
  namespace: default
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::<AWS_ACCOUNT_ID>:role/eks-s3-access-role
```

### 在 Pod 中使用该 Service Account

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: s3-access-pod
spec:
  serviceAccountName: s3-access-sa
  containers:
  - name: app
    image: my-app:latest
    env:
    - name: AWS_REGION
      value: us-west-2
```