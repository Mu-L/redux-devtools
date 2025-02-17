import React, { Component } from 'react';
import { connect, ResolveThunks } from 'react-redux';
import { Container, Notification } from 'devui';
import { getActiveInstance } from '@redux-devtools/app/lib/reducers/instances';
import Settings from '@redux-devtools/app/lib/components/Settings';
import Actions from '@redux-devtools/app/lib/containers/Actions';
import Header from '@redux-devtools/app/lib/components/Header';
import { clearNotification } from '@redux-devtools/app/lib/actions';
import { StoreState } from '@redux-devtools/app/lib/reducers';
import { SingleMessage } from '../middlewares/api';
import { Position } from '../api/openWindow';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ResolveThunks<typeof actionCreators>;
interface OwnProps {
  readonly position: string;
}
type Props = StateProps & DispatchProps & OwnProps;

function sendMessage(message: SingleMessage) {
  chrome.runtime.sendMessage(message);
}

class App extends Component<Props> {
  openWindow = (position: Position) => {
    sendMessage({ type: 'OPEN', position });
  };
  openOptionsPage = () => {
    if (navigator.userAgent.indexOf('Firefox') !== -1) {
      sendMessage({ type: 'OPEN_OPTIONS' });
    } else {
      chrome.runtime.openOptionsPage();
    }
  };

  render() {
    const { position, options, section, theme, notification } = this.props;
    if (!position && (!options || !options.features)) {
      return (
        <div style={{ padding: '20px', width: '100%', textAlign: 'center' }}>
          No store found. Make sure to follow{' '}
          <a
            href="https://github.com/zalmoxisus/redux-devtools-extension#usage"
            target="_blank"
          >
            the instructions
          </a>
          .
        </div>
      );
    }

    let body;
    switch (section) {
      case 'Settings':
        body = <Settings />;
        break;
      default:
        body = <Actions />;
    }

    return (
      <Container themeData={theme}>
        <Header section={section} />
        {body}
        {notification && (
          <Notification
            type={notification.type}
            onClose={this.props.clearNotification}
          >
            {notification.message}
          </Notification>
        )}
      </Container>
    );
  }
}

function mapStateToProps(state: StoreState) {
  const instances = state.instances;
  const id = getActiveInstance(instances);
  return {
    options: instances.options[id],
    section: state.section,
    theme: state.theme,
    notification: state.notification,
  };
}

const actionCreators = {
  clearNotification,
};

export default connect(mapStateToProps, actionCreators)(App);
