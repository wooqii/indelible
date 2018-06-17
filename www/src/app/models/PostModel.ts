import { observable } from 'mobx';

type Prop<T> = Partial<Pick<T, Extract<keyof T, string | number>>>;

type Vote = {
  voter: string;
  postId: string;
  votes: number;
};

export class PostModel {
  public id: number;
  public author: string;
  public title: string;
  public body: string;
  public timestamp: Date;

  @observable public vote?: Vote;
  @observable public isVoted: boolean;
  @observable public pending: boolean;
  @observable public transactionId: string;

  constructor(props: Prop<PostModel>) {
    Object.keys(props).forEach((key) => (this[key] = props[key]));
    if (this.timestamp && !Number.isNaN(this.timestamp as any)) {
      this.timestamp = new Date(Number(this.timestamp));
    } else {
      this.timestamp = new Date();
    }
    if (!this.id) {
      this.id = PostModel.generateId();
    }
  }

  static nextId = 1;
  static generateId() {
    return this.nextId++;
  }

  static ABI = require('./PostModelABI.json');
}

export default PostModel;
