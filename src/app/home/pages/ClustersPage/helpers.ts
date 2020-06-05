// TODO add type annotations for args?
export const getClusterInfo = (cluster, migMeta, associatedPlans) => {
  const clusterName = cluster.MigCluster.metadata.name;
  const associatedPlanCount = associatedPlans[clusterName];
  const planText = associatedPlanCount === 1 ? 'plan' : 'plans';
  // TODO move this out to render logic?

  const isHostCluster = cluster.MigCluster.spec.isHostCluster;
  const clusterAzureResourceGroup = cluster.MigCluster.spec.azureResourceGroup;

  return {
    clusterName,
    clusterStatus: !cluster.MigCluster.status
      ? null
      : cluster.MigCluster.status.conditions.filter((c) => c.type === 'Ready').length > 0,
    clusterUrl: isHostCluster ? migMeta.clusterApi : cluster.MigCluster.spec.url,
    clusterSvcToken:
      !isHostCluster && cluster.Secret.data.saToken ? atob(cluster.Secret.data.saToken) : null,
    clusterRequireSSL: !cluster.MigCluster.spec.insecure,
    clusterCABundle: cluster.MigCluster.spec.caBundle,
    associatedPlanCount,
    isHostCluster,
    clusterIsAzure: !!clusterAzureResourceGroup,
    clusterAzureResourceGroup,
  };
};

export type IClusterInfo = ReturnType<typeof getClusterInfo>;
