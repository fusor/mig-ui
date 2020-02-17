import React from 'react';
import {
  Bullseye,
  EmptyState,
  Title,
  TextContent,
  TextList,
  TextListItem,
  Grid,
  GridItem
} from '@patternfly/react-core';
import { Spinner } from '@patternfly/react-core/dist/esm/experimental';
import Select from 'react-select';
import TargetsTable from './TargetsTable';

interface IProps {
  values: any;
  errors: any;
  touched: any;
  handleBlur: any;
  handleChange: any;
  setFieldValue: any;
  setFieldTouched: any;
  clusterList: any;
  storageList: any;
  onWizardLoadingToggle: (isLoading) => void;
}
interface IState {
  clusterOptions: any[];
  storageOptions: any[];
  targetCluster: any;
  selectedStorage: any;
  isLoading: boolean;
}
class MigTargetForm extends React.Component<IProps, IState> {
  state = {
    clusterOptions: [],
    storageOptions: [],
    targetCluster: null,
    selectedStorage: null,
    isLoading: false,
  };
  populateClusterDropdown() {
    const myClusterOptions: any = [];
    const len = this.props.clusterList.length;
    for (let i = 0; i < len; i++) {
      if (this.props.clusterList[i].MigCluster.metadata.name !== this.props.values.sourceCluster) {
        myClusterOptions.push({
          label: this.props.clusterList[i].MigCluster.metadata.name,
          value: this.props.clusterList[i].MigCluster.metadata.name,
        });
      }
    }
    this.setState({ clusterOptions: myClusterOptions });
  }
  populateStorageDropdown() {
    const myStorageOptions: any = [];
    const len = this.props.storageList.length;
    for (let i = 0; i < len; i++) {
      myStorageOptions.push({
        label: this.props.storageList[i].MigStorage.metadata.name,
        value: this.props.storageList[i].MigStorage.metadata.name,
      });
    }
    this.setState({ storageOptions: myStorageOptions });
  }

  componentDidMount() {
    this.populateClusterDropdown();
    this.populateStorageDropdown();
  }
  render() {
    const { errors, touched, setFieldValue, setFieldTouched, values } = this.props;
    const { clusterOptions, storageOptions } = this.state;

    return (
      <Grid gutter="md">
        <TextContent>
          <TextList component="dl">
            <TextListItem component="dt">Replication repository</TextListItem>
            <Select
              name="selectedStorage"
              onChange={option => {
                setFieldValue('selectedStorage', option.value);
                const matchingRepo = this.props.storageList.filter(
                  item => item.MigStorage.metadata.name === option.value
                );

                this.setState({
                  selectedStorage: matchingRepo[0],
                });
              }}
              options={storageOptions}
            />

            {errors.targetCluster && touched.targetCluster && (
              <div id="feedback">{errors.targetCluster}</div>
            )}
            <TextListItem component="dt">Target Cluster</TextListItem>
            <Select
              name="targetCluster"
              onChange={option => {
                this.setState({ isLoading: true });
                this.props.onWizardLoadingToggle(true);

                setFieldValue('targetCluster', option.value);
                const matchingCluster = this.props.clusterList.filter(
                  c => c.MigCluster.metadata.name === option.value
                );

                this.setState({
                  targetCluster: matchingCluster[0],
                });
                setFieldTouched('targetCluster');
                setTimeout(() => {
                  this.setState(() => ({ isLoading: false }));
                  this.props.onWizardLoadingToggle(false);
                }, 500);
              }}
              options={clusterOptions}
            />

            {errors.targetCluster && touched.targetCluster && (
              <div id="feedback">{errors.targetCluster}</div>
            )}
          </TextList>
        </TextContent>
        {/* values.targetCluster !== null && */}
        {this.state.isLoading ? (
          <Bullseye>
            <EmptyState variant="small">
              <div className="pf-c-empty-state__icon">
                <Spinner size="xl" />
              </div>
              <Title headingLevel="h2" size="xl">
                Loading...
              </Title>
            </EmptyState>
          </Bullseye>
        ) : (
            <Grid gutter="md">
              <GridItem>
                <TargetsTable values={values} />
              </GridItem>
            </Grid>
          )}
      </Grid>
    );
  }
}

export default MigTargetForm;
