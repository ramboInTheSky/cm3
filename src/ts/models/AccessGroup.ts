export class AccessGroup {
  _id: string
  name: string
  serviceProviderGroupAmpId: string
  organizationId: string
  organizationName: string
  organizationAmpId?: string //missing from API
  tradingPartyAmpId?: string //missing from API
  created?: string
  modified?: string 
  orgLevel?: boolean //this is the "default" value
  orgAcl?: {} //how does it look like?
  enabled: boolean
}

export class AccessGroupCreate {
  name: string = ''
  organizationId: string = ''
  orgAcl?: {}  = ''
}

export class AccessGroupUpdate {
  _id: string = ''
  name: string = ''
  organizationId: string = ''
  orgAcl?: {}  = ''
}

export class AccessGroupDelete {
  _id: string = ''
}

export class AccessGroupList {
  accessGroups: Array<AccessGroup | AccessGroupCreate | AccessGroupUpdate | AccessGroupDelete>
}
