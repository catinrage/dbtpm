// See https://kit.svelte.dev/docs/types#app

import type { Writable } from 'svelte/store';

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
  }

  declare namespace svelteHTML {
    interface HTMLAttributes<T> {
      'on:press'?: CompositionEventHandler<T>;
    }
  }
}

export {};
