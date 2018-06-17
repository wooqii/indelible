import * as React from 'react';
import * as style from './style.css';
import * as moment from 'moment';
import { inject, observer } from 'mobx-react';
import { PostStore, RouterStore } from 'app/stores';
import {
  Collapsible,
  CollapsibleItem,
  Modal,
  Row,
  Input,
  Navbar,
  NavItem,
  ProgressBar,
  Icon,
  Button
} from 'react-materialize';
import { PostModel } from 'app/models';
import { FBShareButton } from 'app/components';

const PostItem = observer(
  ({
    post,
    onClickVote
  }: {
    post: PostModel;
    onClickVote?: (post: PostModel) => any;
  }) => (
    <CollapsibleItem
      header={
        <div className={style.postItem}>
          <div
            className={style.vote}
            ref={(ref) => {
              if (ref && onClickVote) {
                ref.onclick = (event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onClickVote(post);
                };
              }
            }}
          >
            <Icon children={post.isVoted ? 'star' : 'star_border'} />
            {Number((post.vote && post.vote.votes) || post.isVoted ? 1 : 0)}
          </div>
          <div className={style.content}>
            <div>
              <div className={style.title}>{post.title}</div>
              <div className={style.timestamp}>
                {moment(post.timestamp).fromNow()}
              </div>
            </div>
            <div className={style.author}>{post.author}</div>
          </div>
          <div className={style.more}>
            {<Icon children="more_horiz" />}
            {post.pending && (
              <div className={style.progressbar}>
                <ProgressBar />
                {/* {post.transactionId} */}
              </div>
            )}
          </div>
        </div>
      }
      onSelect={() => {}}
      data-postId={post.id}
    >
      <div>
        {post.body}
        <FBShareButton href={window.location.href} />
      </div>
    </CollapsibleItem>
  )
);

class CreatePostModal extends React.PureComponent<
  {
    onSubmit?: (post: PostModel) => any;
    onCommplete?: () => any;
  },
  { open: boolean; title: string; body: string }
> {
  constructor(props) {
    super(props);
    this.state = {} as any;
  }

  onClickSubmit = (event) => {
    if (!this.state || !this.state.title || !this.state.body) {
      alert('Please fill the form');
    } else {
      const post = new PostModel({
        title: this.state.title,
        body: this.state.body
      });
      this.setState(
        { open: false, body: '', title: '' },
        () => this.props.onSubmit && this.props.onSubmit(post)
      );
    }
  };

  onChange = (event, value) =>
    this.setState({
      ...this.state,
      [event.currentTarget.name]: value
    });

  render() {
    return (
      <Modal
        header="Create post"
        fixedFooter
        actions={[<Button children="Submit" onClick={this.onClickSubmit} />]}
        open={this.state.open}
      >
        <Row>
          <Input
            s={12}
            name="title"
            placeholder="Enter post title"
            label="Title"
            value={this.state.title}
            onChange={this.onChange}
          />
          <Input
            s={12}
            name="body"
            placeholder="Say something..."
            type="textarea"
            label="Body"
            value={this.state.body}
            onChange={this.onChange}
          />
        </Row>
      </Modal>
    );
  }
}

@inject(PostStore.KEY, RouterStore.KEY)
@observer
export class Posts extends React.Component {
  modalRef = React.createRef<CreatePostModal>();

  componentDidMount() {
    this.props[PostStore.KEY].listen();
  }

  onClickCreate = () => {
    // workaround for react-materialize modal state issue
    // (since it's logic is based on jquery, here we can't receive close event)
    this.modalRef.current.setState({ open: false }, () =>
      this.modalRef.current.setState({ open: true })
    );
  };

  onClickVote = (post: PostModel) => {
    const postStore: PostStore = this.props[PostStore.KEY];
    postStore.votePost(post.id);
  };

  onClickRefresh = () => {
    const postStore: PostStore = this.props[PostStore.KEY];
    postStore.listen();
  };

  onSubmit = (post: PostModel) => {
    const postStore: PostStore = this.props[PostStore.KEY];
    postStore.createPost(post);
  };

  render() {
    const postStore: PostStore = this.props[PostStore.KEY];
    return (
      <>
        <Navbar
          className={style.header}
          brand="Indelible"
          right
          style={{ paddingLeft: 20 }}
        >
          <NavItem onClick={this.onClickRefresh}>
            <Icon>refresh</Icon>
          </NavItem>
          <NavItem onClick={() => {}}>
            <Icon>more_vert</Icon>
          </NavItem>
        </Navbar>
        <div style={{ marginTop: 24 }}>
          <Collapsible popout defaultActiveKey={1} accordion>
            {postStore.posts.map((post) => (
              <PostItem
                key={post.id}
                post={post}
                onClickVote={this.onClickVote}
              />
            ))}
          </Collapsible>
        </div>
        <Button
          floating
          large
          className="red"
          waves="light"
          icon="create"
          style={{ position: 'fixed', right: 24, bottom: 24 }}
          onClick={this.onClickCreate}
        />
        <CreatePostModal ref={this.modalRef} onSubmit={this.onSubmit} />
      </>
    );
  }
}
