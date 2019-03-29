import React, { Component } from 'react';
import { Dropdown, KebabToggle } from '@patternfly/react-core';
import { Flex, Box } from '@rebass/emotion';
import DashboardCard from './DashboardCard';
import theme from '../../../theme';
import { StyledBox, StyledConstants } from '@patternfly/react-styled-system';


class CardComponent extends Component<any, any> {
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
    const { space } = StyledConstants;
    const { dataList, title } = this.props;
    const { isOpen } = this.state;
    return (
      <StyledBox pb={space.md}>
        <Flex flexDirection="column" justifyContent="center">
          <DashboardCard width="20em" flex="1" m={10} p={10}>
              <Box ml="auto" textAlign="right" />
              <Box fontSize="2em" fontWeight="200" color={theme.colors.navy}>
                <React.Fragment>
                  {dataList.length || 0} {title}
                </React.Fragment>
              </Box>
          </DashboardCard>
        </Flex>
      </StyledBox>
    );
  }
}

export default CardComponent;
