/* eslint-disable camelcase */
import global from 'global';

import { Channel } from '@storybook/channels';
import { SET_CONFIG } from '@storybook/core-events';
import type { API } from '@storybook/api';
import type {
  Addon_Collection,
  Addon_Config,
  Addon_Elements,
  Addon_Loaders,
  Addon_Type,
  Addon_Types,
} from '@storybook/types';
import { Addon_TypesEnum } from '@storybook/types';
import { logger } from '@storybook/client-logger';
import { mockChannel } from './storybook-channel-mock';

export { Addon_Type as Addon, Addon_TypesEnum as types };

export function isSupportedType(type: Addon_Types): boolean {
  return !!Object.values(Addon_TypesEnum).find((typeVal) => typeVal === type);
}

export type Types = Addon_TypesEnum | string;

export class AddonStore {
  constructor() {
    this.promise = new Promise((res) => {
      this.resolve = () => res(this.getChannel());
    }) as Promise<Channel>;
  }

  private loaders: Addon_Loaders<API> = {};

  private elements: Addon_Elements = {};

  private config: Addon_Config = {};

  private channel: Channel | undefined;

  private serverChannel: Channel | undefined;

  private promise: any;

  private resolve: any;

  getChannel = (): Channel => {
    // this.channel should get overwritten by setChannel. If it wasn't called (e.g. in non-browser environment), set a mock instead.
    if (!this.channel) {
      this.setChannel(mockChannel());
    }

    return this.channel;
  };

  getServerChannel = (): Channel => {
    if (!this.serverChannel) {
      throw new Error('Accessing non-existent serverChannel');
    }

    return this.serverChannel;
  };

  ready = (): Promise<Channel> => this.promise;

  hasChannel = (): boolean => !!this.channel;

  hasServerChannel = (): boolean => !!this.serverChannel;

  setChannel = (channel: Channel): void => {
    this.channel = channel;
    this.resolve();
  };

  setServerChannel = (channel: Channel): void => {
    this.serverChannel = channel;
  };

  getElements = (type: Types): Addon_Collection => {
    if (!this.elements[type]) {
      this.elements[type] = {};
    }
    return this.elements[type];
  };

  addPanel = (name: string, options: Addon_Type): void => {
    this.add(name, {
      type: Addon_TypesEnum.PANEL,
      ...options,
    });
  };

  add = (name: string, addon: Addon_Type) => {
    const { type } = addon;
    const collection = this.getElements(type);
    collection[name] = { id: name, ...addon };
  };

  setConfig = (value: Addon_Config) => {
    Object.assign(this.config, value);
    if (this.hasChannel()) {
      this.getChannel().emit(SET_CONFIG, value);
    }
  };

  getConfig = () => this.config;

  register = (name: string, registerCallback: (api: API) => void): void => {
    if (this.loaders[name]) {
      logger.warn(`${name} was loaded twice, this could have bad side-effects`);
    }
    this.loaders[name] = registerCallback;
  };

  loadAddons = (api: any) => {
    Object.values(this.loaders).forEach((value) => value(api));
  };
}

// Enforce addons store to be a singleton
const KEY = '__STORYBOOK_ADDONS';

function getAddonsStore(): AddonStore {
  if (!global[KEY]) {
    global[KEY] = new AddonStore();
  }
  return global[KEY];
}

// Exporting this twice in order to to be able to import it like { addons } instead of 'addons'
// prefer import { addons } from '@storybook/addons' over import addons from '@storybook/addons'
//
// See public_api.ts

export const addons = getAddonsStore();
