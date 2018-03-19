
// first party
import { UsersStore } from './resourceowners'
import { LegalEntitiesStore } from './legalentities'
import { OrganizationsStore } from './organizations'
import { AccessGroupsStore } from './accessgroups'
import { PasswordPoliciesStore } from './passwordpolicies'
import { PermissionGroupsStore } from './permissiongroups'
import { PermissionsStore } from './permissions'
import { CommonStores } from 'common_lib'

// re-exports
export * from './resourceowners'
export * from './legalentities'
export * from './organizations'
export * from './accessgroups'
export * from './passwordpolicies'
export * from './permissiongroups'
export * from './permissions'
export {CommonStores} //for convenience

export interface Stores extends CommonStores.CommonStores{
  users: UsersStore
  legalentities: LegalEntitiesStore
  organizations: OrganizationsStore
  accessgroups: AccessGroupsStore
  passwordpolicies: PasswordPoliciesStore
  permissiongroups: PermissionGroupsStore
  permissions: PermissionsStore
}

type StoreNamesGuard = keyof Stores

export namespace StoreNames {
  export const users: StoreNamesGuard = 'users'
  export const legalentities: StoreNamesGuard = 'legalentities'
  export const organizations: StoreNamesGuard = 'organizations'
  export const accessgroups: StoreNamesGuard = 'accessgroups'
  export const passwordpolicies: StoreNamesGuard = 'passwordpolicies'
  export const permissiongroups: StoreNamesGuard = 'permissiongroups'
  export const permissions: StoreNamesGuard = 'permissions'
}

const localStores: Partial<Stores> = {
  users: new UsersStore(),
  legalentities: new LegalEntitiesStore(),
  organizations: new OrganizationsStore(),
  accessgroups: new AccessGroupsStore(),
  passwordpolicies: new PasswordPoliciesStore(),
  permissiongroups: new PermissionGroupsStore(),
  permissions: new PermissionsStore(),
}
//test comment
export const stores = {...localStores, ...CommonStores.stores}
