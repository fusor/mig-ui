import React, { Component } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Title} from '@patternfly/react-core';
import theme from '../../../theme';
import Loader from 'react-loader-spinner';
import CardStatusComponent from './CardStatusComponent';
interface IState {
  isOpen: boolean;
}
interface IProps {
  title: string;
  dataList: any[];
  isFetching?: boolean;
  type?: string;
}

class CardComponent extends Component<IProps, IState> {
  state = {
    isOpen: false,
  };

  onToggle = isOpen => {
    this.setState({
      isOpen,
    });
  }

  onSelect = event => {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  }
  render() {
    const { dataList, title, isFetching, type } = this.props;
    const { isOpen } = this.state;
    return (
      <Card>
        <CardHeader>
          {dataList && !isFetching ? (
            <Title headingLevel="h3" size="md">
              {dataList.length || 0} {title}{' '}
            </Title>
          ) : (
              <Loader
                type="ThreeDots"
                color={theme.colors.navy}
                height="100"
                width="100"
              />
            )}
        </CardHeader>
        <CardBody>
          <CardStatusComponent dataList={dataList} type={type} />
        </CardBody>
        <CardFooter>
          <a href="#">View all {dataList.length} {type}</a>
        </CardFooter>
      </Card>
    );
  }
}

export default CardComponent;
