/* eslint-disable camelcase */
import { Store_RenderContext } from './store';
// import { Store_RenderContext, Store_WebProjectAnnotations } from './store';
import type { ClientAPI_RenderContextWithoutStoryContext } from './client-api';
// import { ArgsStoryFn } from './csf';

export interface CoreClient_PreviewError {
  message?: string;
  stack?: string;
}

export interface CoreClient_RequireContext {
  keys: () => string[];
  (id: string): any;
  resolve(id: string): string;
}
export type CoreClient_LoaderFunction = () => void | any[];
export type Loadable =
  | CoreClient_RequireContext
  | CoreClient_RequireContext[]
  | CoreClient_LoaderFunction;

export type { Store_RenderContext as RenderContext, ClientAPI_RenderContextWithoutStoryContext };

// The function used by a framework to render story to the DOM
export type CoreClient_RenderStoryFunction = (context: Store_RenderContext) => void;
