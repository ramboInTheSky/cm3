export class Permission {
    created: string
    modified: string
    _id: string
    name: string
    description?: string
    tags?: Array<string>
}

export class PermissionCreate {
    name: string
    description?: string
    tags?: Array<string>
}

export class PermissionUpdate {
    _id: string
    name: string
    description?: string
    tags?: Array<string>
}

export class PermissionDelete {
    _id: string
}


export class PermissionList {
    permissions: Array < Permission | PermissionCreate | PermissionUpdate | PermissionDelete  >
}