import * as React from 'react';

export const FBShareButton = ({ href }: { href: string }) => (
  <iframe
    src={`https://www.facebook.com/plugins/share_button.php?href=${href}&layout=button&size=small&mobile_iframe=true&width=72&height=20&appId`}
    width="72"
    height="20"
    style={{
      border: 'none',
      overflow: 'hidden',
      display: 'block',
      float: 'right'
    }}
    scrolling="no"
  />
);
