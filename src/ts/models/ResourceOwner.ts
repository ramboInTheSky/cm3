export class User {
    created: string
    enabled: boolean
    hashed: boolean
    modified: string
    realm: string
    scopes: Array < string >
    userAmpId?: string
    username: string
    _id: string
    name?: string
    email?: string
    organizationId?: string
    organizationName?: string
    organizations?: string
    description?: string
    passwordPolicyId?: string
    passwordPolicyName?: string
    accessGroupId?: string
    accessGroupName?: string
    lastSuccessfulLogin?: string
    lastFailedLogin?: string
    organizationAmpId?: string
    tradingPartyAmpId?: string
    userType?: string
    failedLoginLockout?: boolean
    status?: string
    permissionGroupIds?: Array<string>
    permissionGroupDelegationIds?: Array<string>
}

export class UserCreate{
    realm: string = ""
    username: string= ""
    name?: string= ""
    description?: string= ""
    email?: string= ""
    scopes: Array<string> = ['*:*']
    enabled: boolean = false
    organizationId?: string = ""
    accessGroupId?: string = ""
    passwordPolicyId?: string = ""
    permissionGroupIds?: Array<string> = []
    permissionGroupDelegationIds?: Array<string> = []
    userType?: string = ''
}

export class UserUpdate{
    _id: string = ""
    realm: string = ""
    username: string = ""
    name: string = ""
    description: string = ""
    email: string = ""
    scopes: Array<string> = []
    enabled: boolean = false
    organizationId: string = ""
    accessGroupId: string = ""
    passwordPolicyId: string = ""
    permissionGroupIds?: Array<string> = []
    permissionGroupDelegationIds?: Array<string> = []
    userType?: string = ''
}

export class UserDelete{
    _id: string = ""
}

export class UserSendPasswordReset{
    _id: string = ""
    email: string = ""
}

export class UserList {
    resourceOwners: Array < User | UserCreate | UserUpdate | UserDelete | UserSendPasswordReset >
}