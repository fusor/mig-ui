import React from 'react';
import { connect } from 'react-redux';
import { css } from '@emotion/core';
import { Flex, Box } from '@rebass/emotion';
import {
  Toolbar,
  ToolbarGroup,
  Button,
  ToolbarItem,
  Dropdown,
  ButtonVariant,
  DropdownItem,
  KebabToggle,
  DropdownToggle,
  Page,
  PageHeader,
  PageSidebar,
  Nav,
  NavList,
  NavExpandable,
  NavItem,
  PageSection,
  TextContent,
  Title,
  EmptyState,
  EmptyStateIcon,
} from '@patternfly/react-core';
import { BellIcon, CogIcon, AddCircleOIcon } from '@patternfly/react-icons';
import { authOperations } from '../auth/duck';
import { homeOperations } from './duck';
import DetailViewComponent from './DetailViewComponent';
import CardComponent from './components/CardComponent';
import AddClusterModal from './components/AddClusterModal';

interface IProps {
  loggingIn?: boolean;
  user: any;
  migrationClusterList: any[];
  fetchDataList: (dataType: string) => void;
  onLogout: () => void;
}

interface IState {
  isDropdownOpen?: boolean;
  isKebabDropdownOpen?: boolean;
  isNavOpen?: boolean;
  isModalOpen?: boolean;
  dataExists?: boolean;
  activeGroup: string;
  activeItem: string;
}

class HomeComponent extends React.Component<IProps, IState> {
  state = {
    isDropdownOpen: false,
    isKebabDropdownOpen: false,
    isNavOpen: false,
    activeGroup: 'grp-1',
    activeItem: 'grp-1_itm-1',
    dataExists: true,
    isModalOpen: false,
  };

  handleModalToggle = () => {
    this.setState(({ isModalOpen }) => ({
      isModalOpen: !isModalOpen,
    }));
  }

  componentDidMount() {
    this.props.fetchDataList('migrationClusterList');
    // this.props.fetchDataList("migrationPlansList");
    // this.props.fetchDataList("migrationStorageList");
  }

  onNavSelect = result => {
    this.setState({
      activeItem: result.itemId,
    });
  }

  onDropdownToggle = isDropdownOpen => {
    this.setState({
      isDropdownOpen,
    });
  }

  onDropdownSelect = event => {
    this.setState({
      isDropdownOpen: !this.state.isDropdownOpen,
    });
  }

  onKebabDropdownToggle = isKebabDropdownOpen => {
    this.setState({
      isKebabDropdownOpen,
    });
  }

  onKebabDropdownSelect = event => {
    this.setState({
      isKebabDropdownOpen: !this.state.isKebabDropdownOpen,
    });
  }

  kebabDropdownItems = [
    <DropdownItem key="0">
      <BellIcon /> Notifications
    </DropdownItem>,
    <DropdownItem key="1">
      <CogIcon /> Settings
    </DropdownItem>,
  ];

  userDropdownItems = [
    <DropdownItem key="0" onClick={this.props.onLogout}>
      Logout
    </DropdownItem>,
  ];

  render() {
    const { user } = this.props;
    const {
      isKebabDropdownOpen,
      isDropdownOpen,
      activeItem,
      activeGroup,
      isNavOpen,
    } = this.state;
    const PageNav = (
      <Nav onSelect={this.onNavSelect} aria-label="Nav">
        <NavList>
          <NavExpandable
            title="System Panel"
            groupId="grp-1"
            isActive={activeGroup === 'grp-1'}
            isExpanded
          >
            <NavItem
              to="#expandable-1"
              groupId="grp-1"
              itemId="grp-1_itm-1"
              isActive={activeItem === 'grp-1_itm-1'}
            >
              Overview
            </NavItem>
          </NavExpandable>
        </NavList>
      </Nav>
    );
    const PageToolbar = (
      <Toolbar>
        <ToolbarGroup>
          <ToolbarItem>
            <Button
              id="default-example-uid-01"
              aria-label="Notifications actions"
              variant={ButtonVariant.plain}
            >
              <BellIcon />
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <Button
              id="default-example-uid-02"
              aria-label="Settings actions"
              variant={ButtonVariant.plain}
            >
              <CogIcon />
            </Button>
          </ToolbarItem>
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarItem>
            <Dropdown
              isPlain
              position="right"
              onSelect={this.onKebabDropdownSelect}
              toggle={<KebabToggle onToggle={this.onKebabDropdownToggle} />}
              isOpen={isKebabDropdownOpen}
              dropdownItems={this.kebabDropdownItems}
            />
          </ToolbarItem>
          <ToolbarItem>
            <Dropdown
              isPlain
              position="right"
              onSelect={this.onDropdownSelect}
              isOpen={isDropdownOpen}
              toggle={
                <DropdownToggle onToggle={this.onDropdownToggle}>
                  <div>{user.username}</div>
                </DropdownToggle>}
              dropdownItems={this.userDropdownItems}
            />
          </ToolbarItem>
        </ToolbarGroup>
      </Toolbar>
    );
    const HeaderOverrideCss = css`
      background-color: #4d5057 !important;
      .pf-c-page__header-brand {
        background-color: #4d5057 !important;
      }
    `;
    const Header = (
      <PageHeader
        toolbar={PageToolbar}
        showNavToggle
        isNavOpen={isNavOpen}
        //@ts-ignore
        css={HeaderOverrideCss}
      />
    );
    const Sidebar = <PageSidebar nav={PageNav} isNavOpen={isNavOpen} />;

    return (
      <React.Fragment>
        {/* <BackgroundImage src={bgImages} /> */}
        <Page header={Header} sidebar={Sidebar}>
          <PageSection>
            <TextContent>
              <Flex justifyContent="center">
                <CardComponent
                  title="Clusters"
                  dataList={this.props.migrationClusterList}
                />
                <CardComponent title="Replication Repositories" dataList={[]} />
                <CardComponent title="Migration Plans" dataList={[]} />
              </Flex>
            </TextContent>
          </PageSection>
          <PageSection>
            <Flex justifyContent="center">
              {this.props.migrationClusterList.length > 0 ? (
                <Box flex="0 0 100%">
                  <DetailViewComponent />
                </Box>
              ) : (
                <Box>
                  <EmptyState>
                    <EmptyStateIcon icon={AddCircleOIcon} />
                    <Title size="lg">
                      Add source and target clusters for the migration
                    </Title>
                    <Button variant="primary" onClick={this.handleModalToggle}>
                      Add Cluster
                    </Button>
                  </EmptyState>
                  <AddClusterModal
                    isModalOpen={this.state.isModalOpen}
                    onHandleModalToggle={this.handleModalToggle}
                  />
                </Box>
              )}
            </Flex>
          </PageSection>
        </Page>
      </React.Fragment>
    );
  }
}

export default connect(
  state => ({
    loggingIn: state.auth.loggingIn,
    user: state.auth.user,
    migrationClusterList: state.home.migrationClusterList,
  }),
  dispatch => ({
    onLogout: () => console.debug('TODO: IMPLEMENT: user logged out.'),
    fetchDataList: dataType => dispatch(homeOperations.fetchDataList(dataType)),
  }),
)(HomeComponent);
