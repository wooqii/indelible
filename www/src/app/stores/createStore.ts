import { History } from 'history';
import { PostModel } from 'app/models';
import { PostStore } from './PostStore';
import { RouterStore } from './RouterStore';

export function createStores(history: History, defaultPosts?: PostModel[]) {
  const postStore = new PostStore(defaultPosts);
  const routerStore = new RouterStore(history);
  return {
    [PostStore.KEY]: postStore,
    [RouterStore.KEY]: routerStore
  };
}
