import {
    ModuleSettingModule,
    ModuleSettingNewActions,
    AppShell
} from 'common_lib'

export * from './LegalEntity'
export * from './Organization'
export * from './ResourceOwner'
export * from './AccessGroup'
export * from './PermissionGroup'
export * from './Permission'

export interface AppShellProps{
    menu: ModuleSettingModule[];
    new: ModuleSettingNewActions[]
    title?: string
    logoutURL?: string
    userInfoURL?: string
}
