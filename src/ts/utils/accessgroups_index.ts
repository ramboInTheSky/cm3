import {
    AccessGroup
} from '../models/AccessGroup'

export * from './renderstatus'
export * from './render_org'

export function initEntityIfBlank(accessGroup ? : AccessGroup): AccessGroup {
    if (!accessGroup) {
        accessGroup = {
            _id: '',
            name: '',
            organizationId: '',
            organizationName: '',
            organizationAmpId: undefined,
            created: undefined,
            modified: undefined,
            serviceProviderGroupAmpId:'',
            tradingPartyAmpId: undefined,
            orgLevel: undefined,
            orgAcl: undefined,
            enabled: true
        }
    }
    return accessGroup
}

