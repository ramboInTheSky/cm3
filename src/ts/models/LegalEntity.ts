export class LegalEntity {
  _id: string
  name: string
  organizationId: string
  organizationName: string
  counterpartyAmpId: string
  created: string
  modified: string
  enabled: boolean
  emailList: string
  serviceProviderEmailList?: string
  fundNumber?: string
  allowIntracompanyAgreements?: boolean
  emailEnabled?: boolean
  swiftMessageEmailNotifications?: boolean
  inactivityMonitorThreshold?: number
  legalEntityIdentifier?: string
  expectedCallTtlHours?: number
  dtccAccountMapping?: string
  shortName?: string
  isOrgServiceProvider?: boolean
  isOrgMultiServiceProvider?: boolean
}

export class LegalEntityUpdate{
  _id: string = ""
  name: string= ""
  organizationId: string= ""
  enabled: boolean = true
  emailList: string = ""
  serviceProviderEmailList: string= ""
  fundNumber: string= ""
  allowIntracompanyAgreements: boolean = true
  emailEnabled: boolean = true
  swiftMessageEmailNotifications: boolean = true
  inactivityMonitorThreshold: number = 0
  legalEntityIdentifier: string= ""
  expectedCallTtlHours: number = 0
  dtccAccountMapping: string= ""
  shortName: string= ""
}

export class LegalEntityCreate{
  name: string= ""
  organizationId: string= ""
  enabled: boolean = true
  emailList: string = ""
  serviceProviderEmailList: string= ""
  fundNumber: string= ""
  allowIntracompanyAgreements: boolean = true
  emailEnabled: boolean = true
  swiftMessageEmailNotifications: boolean = true
  inactivityMonitorThreshold: number = 0
  legalEntityIdentifier: string= ""
  expectedCallTtlHours: number = 0
  dtccAccountMapping: string= ""
  shortName: string= ""
}

export class LegalEntityList {
  legalEntities: Array< LegalEntity | LegalEntityUpdate | LegalEntityCreate>
}
