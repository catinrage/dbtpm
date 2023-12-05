import { writable, type Writable } from 'svelte/store';

const bridgeList: Record<string, Writable<Record<string, unknown>>> = {};

function bridge(name: string) {
  if (bridgeList[name]) return bridgeList[name];
  bridgeList[name] = writable({});
  return bridgeList[name];
}

export default bridge;
