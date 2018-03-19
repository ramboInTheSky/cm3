import {
    User,
    UserList
} from '../models/ResourceOwner'

export * from './renderstatus'
export * from './render_org'

export function initUserIfBlank(user?: User): User {
    if (!user) {
      user = {
            _id: '',
            realm: '',
            username: '',
            created: '',
            modified: '',
            userAmpId: undefined,
            hashed: false,
            scopes: [],
            enabled: false,
            email: undefined,
            name: undefined,
            organizationId: undefined,
            organizationName: undefined,
            description : undefined,
            passwordPolicyId: undefined,
            passwordPolicyName: undefined,
            accessGroupId: undefined,
            accessGroupName: undefined,
            lastSuccessfulLogin: undefined,
            lastFailedLogin: undefined,
            organizationAmpId: undefined,
            tradingPartyAmpId: undefined,
            userType: undefined,
            permissionGroupIds: [],
            permissionGroupDelegationIds: []
        }
    }
    return user
}