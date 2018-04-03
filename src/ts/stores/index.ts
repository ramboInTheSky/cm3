
// first party
import { PortfoliosStore } from './portfolios'

import { CommonStores } from 'common_lib'

// re-exports
export * from './portfolios'


export {CommonStores} //for convenience

export interface Stores extends CommonStores.CommonStores{
  portfolios: PortfoliosStore
}

type StoreNamesGuard = keyof Stores

export namespace StoreNames {
  export const portfolios: StoreNamesGuard = 'portfolios'
}

const localStores: Partial<Stores> = {
  portfolios: new PortfoliosStore()
}
//test comment
export const stores = {...localStores, ...CommonStores.stores}
