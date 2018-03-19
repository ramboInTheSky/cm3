export interface ScopesMap {
    [key: string]: string
}

export function convertScopesArraytoMap(array: Array < string > ): ScopesMap {
      if (array && typeof array == 'object') {
        let map: ScopesMap = {}
        if(array.length>0){
            for (let i = 0; i < array.length; i++) {
                map[array[i]] = array[i]
            }
            return map
        }
    }
    return {}
}

export function hasPerm(scopes:ScopesMap, perm: string): boolean{
    if (scopes)
        return !!scopes[perm] || !!scopes['*:*']

    return false
}

export const scopes = [
    "manage:*",
    "manage:app:*",
    "manage:app:read",
    "manage:app:create",
    "manage:app:update",
    "manage:app:delete",
    "manage:path:*",
    "manage:path:read",
    "manage:path:create",
    "manage:path:update",
    "manage:path:delete",
    "manage:oauth2client:*",
    "manage:oauth2client:read",
    "manage:oauth2client:create",
    "manage:oauth2client:update",
    "manage:oauth2client:delete",
    "manage:organization:*",
    "manage:organization:read",
    "manage:organization:create",
    "manage:organization:update",
    "manage:legalentity:*",
    "manage:legalentity:read",
    "manage:legalentity:create",
    "manage:accessgroup:*",
    "manage:accessgroup:read",
    "manage:accessgroup:create",
    "manage:accessgroup:update",
    "manage:resourceowner:*",
    "manage:resourceowner:read",
    "manage:resourceowner:create",
    "manage:resourceowner:update",
    "manage:resourceowner:delete",
    "manage:resourceowner:setpassword",
    "manage:passwordpolicy:*",
    "manage:passwordpolicy:read",
    "manage:passwordpolicy:create",
    "manage:passwordpolicy:update",
    "manage:passwordpolicy:delete",
    "manage:permissiongroup:create",
    "manage:permissiongroup:update",
    "manage:permissiongroup:delete",
    "manage:permissiongroup:read",
    "manage:permission:create",
    "manage:permission:update",
    "manage:permission:delete",
    "manage:permission:read"
]

