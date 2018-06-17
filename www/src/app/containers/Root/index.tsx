import * as React from 'react';

export class Root extends React.Component<any, any> {
  render() {
    return (
      <div style={{ width: '100%', height: '100%' }}>{this.props.children}</div>
    );
  }
}
