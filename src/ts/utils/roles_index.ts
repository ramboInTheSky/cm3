import {
    PermissionGroup,
    PermissionGroupList
} from '../models/PermissionGroup'

export * from './renderstatus'
export * from './render_org'

export function initRoleIfBlank(role?: PermissionGroup): PermissionGroup {
    if (!role) {
      role = {
            _id: '',
            name: '',
            created: '',
            modified: '',
           description: '',
           permissionIds: []
        }
    }
    return role
}