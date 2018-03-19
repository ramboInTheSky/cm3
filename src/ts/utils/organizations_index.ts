import {
    Organization,
    AccessGroup
} from '../models'

export function initEntityIfBlank(org: Organization): Organization {
    if (!org) {
        org = {
            _id: '',
            name: '',
            realm: '',
            hidden: false,
            created: '',
            modified: '',
            organizationAmpId: undefined,
            tradingPartyAmpId: undefined,
            emailList: undefined,
            customHttpPrefix: undefined,
            accessGroupId: undefined,
            serviceProvider: undefined,
            multiOrgServiceProvider: undefined,
            serviceProviderType: undefined,
            managingOrganizationAmpId: undefined,
            managingOrganizationName: undefined,
            dtccEnabled: undefined,
            autoAcceptPendingAssigned: undefined,
            defaultAllowIntracompanyAgreements: undefined,
            swiftMessageEmailNotification: undefined,
            allowServiceProviderPendingAssigned: undefined,
            twoVersusOneFirstPrecedence: undefined,
            allowPledgeActionsOnAccepted: undefined,
            allowAgreeCancel: undefined,
            hideMarginCallFields: undefined,
            disputeResolutionWorkflowEnabled: undefined
        }
    }
    return org
}

export function filterOrganizations(allOrgs: Array<Organization>, accessGroups: Array<AccessGroup>): Array<Organization>{
    let accessGroupsOrgsObj: any = {}
    for(let i = 0; i< accessGroups.length; i++){
        let array = accessGroups[i].orgAcl ? Object.keys(accessGroups[i].orgAcl as any) : []
        for(let j = 0; array && j < array.length; j++){
            accessGroupsOrgsObj[array[j]] = array[j]
        }
    }
    return allOrgs.filter((org)=>{
        return !!accessGroupsOrgsObj[org._id]
    })
}