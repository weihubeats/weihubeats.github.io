

## 核心配置

- diskMaxUsedSpaceRatio
- diskSpaceWarningLevelRatio
- diskSpaceCleanForciblyRatio


## diskMaxUsedSpaceRatio

- 默认值 75%
- 作用 磁盘超过75%进行文件删除


## diskSpaceCleanForciblyRatio


- 默认值 85%

磁盘空间强制清洁率


核心方法

```java
        private boolean isSpaceToDelete() {
            // 是否立即清理标志
            cleanImmediately = false;
            // 获取commitLog 存储路径
            String commitLogStorePath = DefaultMessageStore.this.getMessageStoreConfig().getStorePathCommitLog();
            // 拆分为多个存储路径(支持多磁盘)
            String[] storePaths = commitLogStorePath.trim().split(MixAll.MULTI_PATH_SPLITTER);
            // 记录已满的磁盘路径
            Set<String> fullStorePath = new HashSet<>();
            // 最小物理磁盘使用率（初始100%）
            double minPhysicRatio = 100;
            // 使用率最低的磁盘路径
            String minStorePath = null;
            for (String storePathPhysic : storePaths) {
                // 计算当前磁盘使用率
                double physicRatio = UtilAll.getDiskPartitionSpaceUsedPercent(storePathPhysic);

                // 记录最小使用率的磁盘
                if (minPhysicRatio > physicRatio) {
                    minPhysicRatio = physicRatio;
                    minStorePath = storePathPhysic;
                }
                // 标记超过强制清理阈值的磁盘 即与 diskSpaceCleanForciblyRatio(默认85%)对比
                if (physicRatio > getDiskSpaceCleanForciblyRatio()) {
                    fullStorePath.add(storePathPhysic);
                }
            }
            // 将已满磁盘路径同步给CommitLog
            DefaultMessageStore.this.commitLog.setFullStorePaths(fullStorePath);
            // 与 diskSpaceWarningLevelRatio(默认90%)进行对比 磁盘是否已满
            if (minPhysicRatio > getDiskSpaceWarningLevelRatio()) {
                // 超过预警阈值：标记磁盘满 + 立即清理
                boolean diskFull = DefaultMessageStore.this.runningFlags.getAndMakeDiskFull();
                if (diskFull) {
                    DefaultMessageStore.LOGGER.error("physic disk maybe full soon " + minPhysicRatio +
                        ", so mark disk full, storePathPhysic=" + minStorePath);
                }

                cleanImmediately = true;
                return true;
            } else if (minPhysicRatio > getDiskSpaceCleanForciblyRatio()) { // 超过强制清理阈值：立即清理（不标记磁盘满）
                cleanImmediately = true;
                return true;
            } else {
                // 磁盘正常：恢复可写状态
                boolean diskOK = DefaultMessageStore.this.runningFlags.getAndMakeDiskOK();
                if (!diskOK) {
                    DefaultMessageStore.LOGGER.info("physic disk space OK " + minPhysicRatio +
                        ", so mark disk ok, storePathPhysic=" + minStorePath);
                }
            }

            // 获取ConsumeQueue存储路径
            String storePathLogics = StorePathConfigHelper
                .getStorePathConsumeQueue(DefaultMessageStore.this.getMessageStoreConfig().getStorePathRootDir());
            double logicsRatio = UtilAll.getDiskPartitionSpaceUsedPercent(storePathLogics);
            // 与 diskSpaceWarningLevelRatio(默认90%)进行对比 磁盘是否已满
            if (logicsRatio > getDiskSpaceWarningLevelRatio()) {
                boolean diskOK = DefaultMessageStore.this.runningFlags.getAndMakeDiskFull();
                if (diskOK) {
                    DefaultMessageStore.LOGGER.error("logics disk maybe full soon " + logicsRatio + ", so mark disk full");
                }

                cleanImmediately = true;
                return true;
            } else if (logicsRatio > getDiskSpaceCleanForciblyRatio()) {
                cleanImmediately = true;
                return true;
            } else {
                boolean diskOK = DefaultMessageStore.this.runningFlags.getAndMakeDiskOK();
                if (!diskOK) {
                    DefaultMessageStore.LOGGER.info("logics disk space OK " + logicsRatio + ", so mark disk ok");
                }
            }
            //  diskMaxUsedSpaceRatio 默认 75%
            double ratio = DefaultMessageStore.this.getMessageStoreConfig().getDiskMaxUsedSpaceRatio() / 100.0;
            int replicasPerPartition = DefaultMessageStore.this.getMessageStoreConfig().getReplicasPerDiskPartition();
            // Only one commitLog in node
            if (replicasPerPartition <= 1) {
                if (minPhysicRatio < 0 || minPhysicRatio > ratio) {
                    DefaultMessageStore.LOGGER.info("commitLog disk maybe full soon, so reclaim space, " + minPhysicRatio);
                    return true;
                }

                if (logicsRatio < 0 || logicsRatio > ratio) {
                    DefaultMessageStore.LOGGER.info("consumeQueue disk maybe full soon, so reclaim space, " + logicsRatio);
                    return true;
                }
                return false;
            } else {
                long majorFileSize = DefaultMessageStore.this.getMajorFileSize();
                long partitionLogicalSize = UtilAll.getDiskPartitionTotalSpace(minStorePath) / replicasPerPartition;
                double logicalRatio = 1.0 * majorFileSize / partitionLogicalSize;

                if (logicalRatio > DefaultMessageStore.this.getMessageStoreConfig().getLogicalDiskSpaceCleanForciblyThreshold()) {
                    // if logical ratio exceeds 0.80, then clean immediately
                    DefaultMessageStore.LOGGER.info("Logical disk usage {} exceeds logical disk space clean forcibly threshold {}, forcibly: {}",
                        logicalRatio, minPhysicRatio, cleanImmediately);
                    cleanImmediately = true;
                    return true;
                }

                boolean isUsageExceedsThreshold = logicalRatio > ratio;
                if (isUsageExceedsThreshold) {
                    DefaultMessageStore.LOGGER.info("Logical disk usage {} exceeds clean threshold {}, forcibly: {}",
                        logicalRatio, ratio, cleanImmediately);
                }
                return isUsageExceedsThreshold;
            }
        }

```

如果磁盘超过85%,会将路径丢到 `CommitLog`中的`fullStorePaths`中

来看看对`fullStorePaths`属性会做什么操作

