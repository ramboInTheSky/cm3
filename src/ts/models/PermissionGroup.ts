export class PermissionGroup {
    created: string
    modified: string
    _id: string
    name: string
    description?: string
    permissionIds: Array<string>
}

export class PermissionGroupCreate {
    name: string = ''
    description?: string = ''
    permissionIds: Array<string> = []
}

export class PermissionGroupUpdate {
    _id: string = ''
    name: string = ''
    description?: string = ''
    permissionIds: Array<string> = []
}

export class PermissionGroupDelete {
    _id: string
}


export class PermissionGroupList {
    permissionGroups: Array < PermissionGroup | PermissionGroupCreate | PermissionGroupUpdate | PermissionGroupDelete  >
}