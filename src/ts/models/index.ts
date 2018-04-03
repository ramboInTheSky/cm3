import {
    ModuleSettingModule,
    ModuleSettingNewActions,
    AppShell
} from 'common_lib'

export interface AppShellProps{
    menu: ModuleSettingModule[];
    new: ModuleSettingNewActions[]
    title?: string
    logoutURL?: string
    userInfoURL?: string
    showLastLogin?: boolean
}

export interface DataDictionaryObject {
    [key: string]: string
}

export interface StatisticsObject{
    [key: string] : number
    total: number
}

export * from './api'
export * from './portfolio'
export * from './workitem'