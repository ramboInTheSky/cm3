/**
 * Created by _Alz on 03/01/2017.
 */
export const MODALS = {
    USER: 'user',
    ENTITY: 'entity',
    ACCESSGROUP: 'accessgroup',
    PASSWORDPOLICY: 'passwordpolicy',
    PERMISSIONGROUP: 'permissiongroup',
}
export const settings = {
    modules: [
        {name: 'Users', path: '/', icon:'users', permission:'manage:resourceowner:read'},
        {name: 'Legal Entities', path: '/r/entities', icon:'university', permission: 'manage:legalentity:read'},
        {name: 'Access Groups', path: '/r/accessgroups', icon:'key', permission: 'manage:accessgroup:read'},
        {name: 'Permission Groups', path: '/r/permissiongroups', icon:'user-md', permission: 'manage:permissiongroup:read'}
    ],
    newActions: [
         {name: 'User', path: '/', modal: MODALS.USER, permission:'manage:resourceowner:read, manage:resourceowner:create'},
         {name: 'Legal Entity', path: '/r/entities', modal: MODALS.ENTITY, permission: 'manage:legalentity:read, manage:legalentity:create'},
         {name: 'Access Group', path: '/r/accessgroups', modal: MODALS.ACCESSGROUP, permission: 'manage:accessgroup:read, manage:accessgroup:create'},
         {name: 'Permission Group', path: '/r/permissiongroups', modal: MODALS.PERMISSIONGROUP, permission: 'manage:permissiongroup:create, manage:permissiongroup:read'}
    ],
    options: {
        timeout: 10 //in seconds
    },
    urls: {
        users: '/identity/manage/services/resourceowner',
        usersreport: '/identity/reports/resourceowners/excel',
        permissiongroups: '/identity/manage/services/permissiongroup',
        permissions: '/identity/manage/services/permission',
        organizations: '/identity/manage/services/organization',
        entities: '/identity/manage/services/legalentity',
        accessgroups: '/identity/manage/services/accessgroup',
        expanaccessgroup: '/identity/manage/services/expandaccessgroup',
        passwordpolicies: '/identity/manage/services/passwordpolicy',
        userinfo: '/clientadmin/s/proxy?context=' + encodeURIComponent('/identity/oauth2/userinfo'), 
        expandacl: '/clientadmin/s/proxy?context=' + encodeURIComponent('/identity/manage/services/expandacl?slim=true'), 
        currencies: '/identity/manage/services/userinfo',
        logout: '/clientadmin/s/logout/sso',
        ping: '/clientadmin/s/ping'
    }
}

