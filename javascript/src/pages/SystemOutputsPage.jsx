import React from 'react';
import Reflux from 'reflux';

import CurrentUserStore from 'stores/users/CurrentUserStore';

import PageHeader from 'components/common/PageHeader';
import OutputComponent from 'components/outputs/OutputsComponent';

const SystemOutputsPage = React.createClass({
  mixins: [Reflux.connect(CurrentUserStore)],
  render() {
    return (
      <span>
        <PageHeader title="Outputs in Cluster">
          <span>
            Graylog nodes can forward messages via outputs. Launch or terminate as many outputs as you want here
            <strong>and then assign them to streams to forward all messages of a stream in real-time.</strong>
          </span>

          <span>
            You can find output plugins in <a href="https://marketplace.graylog.org/" target="_blank">the Graylog Marketplace</a>.
          </span>
        </PageHeader>

        <OutputComponent permissions={this.state.currentUser.permissions}/>
      </span>
    );
  },
});

export default SystemOutputsPage;
