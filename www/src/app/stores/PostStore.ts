import { observable, runInAction } from 'mobx';
import { PostModel } from 'app/models';
import { getWeb3Instance } from 'app/utils/web3';

export class PostStore {
  public static KEY = 'post';
  public defaultAccount: string;
  public coinbase: string;
  public contract: any;

  constructor(fixtures: PostModel[] = []) {
    this.posts = fixtures;

    const web3 = getWeb3Instance();
    this.defaultAccount = web3.eth.defaultAccount;
    this.coinbase = web3.eth.coinbase;
    this.contract = web3.eth
      .contract(PostModel.ABI)
      .at('0x5d934d138d4a047e28e11a62486d8a108e3c2c82');
  }

  @observable public posts: Array<PostModel>;

  listen() {
    this.contract
      .Posting(
        { author: this.defaultAccount },
        { fromBlock: 0, toBlock: 'latest' }
      )
      .watch((err, res) => {
        if (err) {
          console.error(err);
        } else if (res.args) {
          const transactionId = res.transactionHash;
          runInAction(() => {
            const existing = this.posts.find(
              (post) => post.transactionId === transactionId
            );
            if (existing) {
              existing.id = res.args.id;
              existing.pending = false;
            } else {
              this.posts.push(new PostModel(res.args));
              this.posts = this.posts.sort(
                (lv: any, rv: any) => rv.timestamp - lv.timestamp
              );
            }
          });
        }
      });

    this.contract
      .Voting(null, {
        fromBlock: 0,
        toBlock: 'latest'
      })
      .watch((err, res) => {
        if (err) {
          console.error(err);
        } else if (res.args) {
          const postId = res.args.postId;
          const updatePost = () => {
            const existingPost = this.posts.find((post) => post.id === postId);
            if (existingPost) {
              runInAction(() => {
                existingPost.vote = res.args;
                existingPost.isVoted =
                  existingPost.isVoted || res.args.voter === this.coinbase;
              });
            } else {
              setTimeout(updatePost, 500);
            }
          };
          updatePost();
        }
      });
  }

  createPost(post: PostModel) {
    this.contract.create.sendTransaction(
      post.title,
      post.body,
      (post.timestamp || new Date()).valueOf(),
      { from: this.coinbase },
      (err, res) => {
        if (res) {
          runInAction(() => {
            post.pending = true;
            post.transactionId = res;
            post.author = this.coinbase;
            this.posts.push(post);
            this.posts = this.posts.sort(
              (lv: any, rv: any) => rv.timestamp - lv.timestamp
            );
          });
        }
      }
    );
  }

  votePost(postId: PostModel['id']) {
    this.contract.vote.sendTransaction(
      postId,
      { from: this.coinbase },
      (err, res) => {
        if (res) {
          const existing = this.posts.find((post) => post.id === postId);
          if (existing) {
            runInAction(() => {
              existing.isVoted = true;
            });
          }
        }
      }
    );
  }
}
