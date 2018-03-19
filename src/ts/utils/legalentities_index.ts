import {
    LegalEntity
} from '../models/LegalEntity'

export * from './renderstatus'
export * from './render_org'

export function initEntityIfBlank(entity ? : LegalEntity): LegalEntity {
    if (!entity) {
        entity = {
            _id: '',
            name: '',
            organizationId: '',
            organizationName: '',
            counterpartyAmpId: '',
            created: '',
            modified: '',
            enabled: false,
            emailList: '',
            serviceProviderEmailList: undefined,
            fundNumber: undefined,
            allowIntracompanyAgreements: undefined,
            emailEnabled: undefined,
            swiftMessageEmailNotifications: undefined,
            inactivityMonitorThreshold: undefined,
            legalEntityIdentifier: undefined,
            expectedCallTtlHours: undefined,
            dtccAccountMapping: undefined,
            shortName: undefined,
            isOrgServiceProvider : undefined,
            isOrgMultiServiceProvider: undefined
        }
    }
    return entity
}

export function formatNumber (num?: any) {
    return num?num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"):null
}
