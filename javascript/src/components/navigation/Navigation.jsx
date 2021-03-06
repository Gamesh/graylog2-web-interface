import React from 'react';
import { Navbar, CollapsibleNav, Nav, NavBrand, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import PermissionsMixin from 'util/PermissionsMixin';
import Routes from 'routing/Routes';

import GlobalThroughput from 'components/throughput/GlobalThroughput';
import UserMenu from 'components/navigation/UserMenu';

const Navigation = React.createClass({
  mixins: [PermissionsMixin],

  propTypes: {
    requestPath: React.PropTypes.string.isRequired,
    permissions: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,

    loginName: React.PropTypes.string.isRequired,
    fullName: React.PropTypes.string.isRequired,
    permissions: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
  },

  _isActive(prefix) {
    return this.props.requestPath.indexOf(prefix) === 0;
  },

  _systemTitle() {
    let suffix = '';

    if (this._isActive('/system') || this._isActive('/system?page=')) {
      suffix = ' / Overview';
    }
    if (this._isActive('/system/nodes') || this._isActive('/system/radios')) {
      suffix = ' / Nodes';
    }
    if (this._isActive('/system/inputs')) {
      suffix = ' / Inputs';
    }
    if (this._isActive('/system/outputs')) {
      suffix = ' / Outputs';
    }
    if (this._isActive('/system/indices')) {
      suffix = ' / Indices';
    }
    if (this._isActive('/system/logging')) {
      suffix = ' / Logging';
    }
    if (this._isActive('/system/users')) {
      suffix = ' / Users';
    }
    if (this._isActive('/system/roles')) {
      suffix = ' / Roles';
    }
    if (this._isActive('/system/contentpacks')) {
      suffix = ' / Content Packs';
    }
    if (this._isActive('/system/grokpatterns')) {
      suffix = ' / Grok Patterns';
    }
    if (this._isActive('/system/collectors')) {
      suffix = ' / Collectors';
    }

    return 'System' + suffix;
  },

  render() {
    const logoUrl = require('images/toplogo.png');
    const brand = (
      <LinkContainer to={Routes.HOME}>
        <img src={logoUrl}/>
      </LinkContainer>);
    return (
      <Navbar inverse fluid fixedTop toggleNavKey={0}>
        <NavBrand>{brand}</NavBrand>
        <CollapsibleNav eventKey={0}>
          <Nav navbar>
            {this.isPermitted(this.props.permissions, ['SEARCHES_ABSOLUTE', 'SEARCHES_RELATIVE', 'SEARCHES_KEYWORD']) &&
              <LinkContainer to={Routes.SEARCH}>
                <NavItem to="search">Search</NavItem>
              </LinkContainer>
            }
            <LinkContainer to={Routes.STREAMS}>
              <NavItem>Streams</NavItem>
            </LinkContainer>

            <LinkContainer to={Routes.DASHBOARDS}>
              <NavItem >Dashboards</NavItem>
            </LinkContainer>

            {this.isPermitted(this.props.permissions, ['SOURCES_READ']) &&
              <LinkContainer to={Routes.SOURCES}>
                <NavItem>Sources</NavItem>
              </LinkContainer>
            }
            <NavDropdown navItem title={this._systemTitle()} id="system-menu-dropdown">
              <LinkContainer to={Routes.SYSTEM.OVERVIEW}>
                <MenuItem>Overview</MenuItem>
              </LinkContainer>
              <LinkContainer to={Routes.SYSTEM.NODES}>
                <MenuItem>Nodes</MenuItem>
              </LinkContainer>
              {this.isPermitted(this.props.permissions, ['INPUTS_READ']) &&
                <LinkContainer to={Routes.SYSTEM.INPUTS}>
                  <MenuItem>Inputs</MenuItem>
                </LinkContainer>
              }
              {this.isPermitted(this.props.permissions, ['COLLECTORS_READ']) &&
                <LinkContainer to={Routes.SYSTEM.COLLECTORS}>
                  <MenuItem>Collectors</MenuItem>
                </LinkContainer>
              }
              {this.isPermitted(this.props.permissions, ['OUTPUTS_READ']) &&
                <LinkContainer to={Routes.SYSTEM.OUTPUTS}>
                  <MenuItem>Outputs</MenuItem>
                </LinkContainer>
              }
              {this.isPermitted(this.props.permissions, ['USERS_READ']) &&
                <LinkContainer to={Routes.SYSTEM.USERS.LIST}>
                  <MenuItem>Users</MenuItem>
                </LinkContainer>
              }
              {this.isPermitted(this.props.permissions, ['ROLES_READ']) &&
                <LinkContainer to={Routes.SYSTEM.ROLES}>
                  <MenuItem>Roles</MenuItem>
                </LinkContainer>
              }
              {this.isPermitted(this.props.permissions, ['DASHBOARDS_CREATE', 'INPUTS_CREATE', 'STREAMS_CREATE']) &&
              <LinkContainer to={Routes.SYSTEM.CONTENTPACKS.LIST}>
                <MenuItem>Content Packs</MenuItem>
              </LinkContainer>
              }
              {this.isPermitted(this.props.permissions, ['INPUTS_EDIT']) &&
              <LinkContainer to={Routes.SYSTEM.GROKPATTERNS}>
                <MenuItem>Grok Patterns</MenuItem>
              </LinkContainer>
              }
            </NavDropdown>
          </Nav>

          <Nav navbar>
            <LinkContainer to={Routes.SYSTEM.OVERVIEW}>
              <NavItem className="notification-badge-link">
                <span className="badge" style={{backgroundColor: '#ff3b00'}} id="notification-badge"></span>
              </NavItem>
            </LinkContainer>
          </Nav>

          <Nav navbar right>
            <LinkContainer to={Routes.SYSTEM.NODES}>
              <NavItem>
                <GlobalThroughput />
              </NavItem>
            </LinkContainer>
            <UserMenu fullName={this.props.fullName} loginName={this.props.loginName}/>
          </Nav>
        </CollapsibleNav>
      </Navbar>
    );
  },
});

export default Navigation;
