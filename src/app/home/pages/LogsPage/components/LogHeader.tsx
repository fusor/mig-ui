import React, { FunctionComponent } from 'react';
import {
  CardHeader,
  Grid,
  GridItem,
  TextContent,
  Text,
  TextVariants,
} from '@patternfly/react-core';
import { connect } from 'react-redux';
import { flatten } from 'lodash';
import { ILogSource, LogUnselected } from './LogsContainer';
import SimpleSelect from '../../../../common/components/SimpleSelect';
import { DefaultRootState } from '../../../../../configureStore';
import { logsFetchRequest } from '../../../../logs/duck/slice';
import { IPodContainer, IPodLogSource } from '@konveyor/lib-ui';

interface ISelectItem {
  label: any;
  value: any;
}

interface IProps {
  isFetchingLogs: boolean;
  report: any;
  cluster: string;
  logSource: any;
  setCluster: (item: any) => void;
  setLogSource: (item: any) => void;
  logsFetchRequest: (logPath: string) => void;
}

const LogHeader: FunctionComponent<IProps> = ({
  isFetchingLogs,
  report,
  cluster,
  logSource,
  setCluster,
  setLogSource,
  logsFetchRequest,
}) => {
  const clusters = Object.keys(report).map((cl) => cl);

  const logSources =
    report && report[cluster]
      ? flatten(
          report[cluster].map((pod: IPodLogSource, podIndex: number) =>
            pod.containers.map((container: IPodContainer, containerIndex) => ({
              label: `${pod.name}-${container.name}`,
              value: {
                podIndex,
                containerIndex,
              },
            }))
          )
        )
      : [];

  return (
    <span>
      {isFetchingLogs ? null : (
        <CardHeader>
          <Grid hasGutter>
            <GridItem span={2}>
              <TextContent>
                <Text component={TextVariants.p}>Select cluster:</Text>
              </TextContent>
            </GridItem>
            <GridItem span={4}>
              <SimpleSelect
                id="selectCluster"
                onChange={(clusterSelected) => {
                  setCluster(clusterSelected);
                  setLogSource({
                    label: null,
                    value: {
                      podIndex: LogUnselected,
                      logIndex: LogUnselected,
                    },
                  });
                }}
                value={cluster}
                placeholderText="Select cluster..."
                options={clusters}
              />
            </GridItem>
            <GridItem span={6}></GridItem>

            <GridItem span={2}>
              <TextContent>
                <Text component={TextVariants.p}>Select Pod Source:</Text>
              </TextContent>
            </GridItem>
            <GridItem span={4}>
              <SimpleSelect
                id="selectPod"
                onChange={(logSelection) => {
                  const foundLogSelection = logSources.find(
                    (source: any) => source?.label === logSelection
                  );
                  setLogSource(foundLogSelection);
                  //@ts-ignore
                  const logStore: ILogSource = foundLogSelection.value;
                  logsFetchRequest(
                    report[cluster][logStore.podIndex].containers[logStore.containerIndex].log
                  );
                }}
                value={logSource.label}
                placeholderText="Select pod..."
                options={logSources.map((logSource: any) => logSource?.label)}
              />
            </GridItem>
          </Grid>
        </CardHeader>
      )}
    </span>
  );
};

export default connect(
  (state: DefaultRootState) => ({
    report: state.logs.report,
    isFetchingLogs: state.logs.isFetchingLogs,
  }),
  (dispatch) => ({
    logsFetchRequest: (logPath: string) => dispatch(logsFetchRequest(logPath)),
  })
)(LogHeader);
