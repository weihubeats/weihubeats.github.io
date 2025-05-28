

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
            cleanImmediately = false;

            String commitLogStorePath = DefaultMessageStore.this.getMessageStoreConfig().getStorePathCommitLog();
            String[] storePaths = commitLogStorePath.trim().split(MixAll.MULTI_PATH_SPLITTER);
            Set<String> fullStorePath = new HashSet<>();
            double minPhysicRatio = 100;
            String minStorePath = null;
            for (String storePathPhysic : storePaths) {
                double physicRatio = UtilAll.getDiskPartitionSpaceUsedPercent(storePathPhysic);
                if (minPhysicRatio > physicRatio) {
                    minPhysicRatio = physicRatio;
                    minStorePath = storePathPhysic;
                }
                if (physicRatio > getDiskSpaceCleanForciblyRatio()) {
                    fullStorePath.add(storePathPhysic);
                }
            }
            DefaultMessageStore.this.commitLog.setFullStorePaths(fullStorePath);
            if (minPhysicRatio > getDiskSpaceWarningLevelRatio()) {
                boolean diskFull = DefaultMessageStore.this.runningFlags.getAndMakeDiskFull();
                if (diskFull) {
                    DefaultMessageStore.LOGGER.error("physic disk maybe full soon " + minPhysicRatio +
                        ", so mark disk full, storePathPhysic=" + minStorePath);
                }

                cleanImmediately = true;
                return true;
            } else if (minPhysicRatio > getDiskSpaceCleanForciblyRatio()) {
                cleanImmediately = true;
                return true;
            } else {
                boolean diskOK = DefaultMessageStore.this.runningFlags.getAndMakeDiskOK();
                if (!diskOK) {
                    DefaultMessageStore.LOGGER.info("physic disk space OK " + minPhysicRatio +
                        ", so mark disk ok, storePathPhysic=" + minStorePath);
                }
            }

            String storePathLogics = StorePathConfigHelper
                .getStorePathConsumeQueue(DefaultMessageStore.this.getMessageStoreConfig().getStorePathRootDir());
            double logicsRatio = UtilAll.getDiskPartitionSpaceUsedPercent(storePathLogics);
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