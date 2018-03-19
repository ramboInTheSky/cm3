export class Organization {
  _id: string
  name: string
  realm: string
  hidden: boolean
  created: string
  modified: string
  organizationAmpId?: string
  tradingPartyAmpId?: string
  emailList?: string
  customHttpPrefix?: string
  accessGroupId?: string
  serviceProvider?: boolean
  multiOrgServiceProvider?: boolean
  serviceProviderType?: 'BUSINESS' | 'SETTLEMENT'
  managingOrganizationAmpId?: string
  managingOrganizationName?: string
  dtccEnabled?: boolean
  autoAcceptPendingAssigned?: boolean
  defaultAllowIntracompanyAgreements?: boolean
  swiftMessageEmailNotification?: boolean
  allowServiceProviderPendingAssigned?: boolean
  twoVersusOneFirstPrecedence?: boolean
  allowPledgeActionsOnAccepted?: boolean
  allowAgreeCancel?: boolean
  hideMarginCallFields?: boolean
  disputeResolutionWorkflowEnabled?: boolean
}

export class OrganizationList {
  organizations: Organization[]
}