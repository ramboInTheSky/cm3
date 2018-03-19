// third party
import {
  observable,
  computed,
  action
} from 'mobx'

// first party
import {
  B3Fetch,
  Status,
  RemoteStore
} from 'common_lib'
import {
  PermissionGroup,
  PermissionGroupList,
  PermissionGroupCreate, 
  PermissionGroupUpdate
} from '../models'
import {
  settings,
  MODALS
} from '../../app.settings'

import { 
  stores
} from '../stores'
// re-export the PermissionGroup model for convenience
export {
  PermissionGroup,
  PermissionGroupList
}


export class PermissionGroupsStore extends RemoteStore < PermissionGroup | PermissionGroupCreate | PermissionGroupUpdate> {
  constructor() {
    super()
  }

  @observable
    expandedDetails: any
    
  @observable
    expandedDelegationDetails: any

  private static PermissionGroupsUrl: string = '/clientadmin/s/proxy?context=' + encodeURIComponent(settings.urls.permissiongroups)

  @action
  public fetchDetails(id: string) {
    let me = this
    this.details = {} as PermissionGroup

    B3Fetch.fetch(PermissionGroupsStore.PermissionGroupsUrl + id, {}, me).then(function (data: PermissionGroup) {
      me.details = data
    }).catch(function (reason) {
      console.log(reason.message)
    })
  }

  @action
  public fetchPermissionGroupsByIds(permissionGroupIds?: string[], suppressMessages?: boolean) {
    let me = this
    if(!permissionGroupIds){
      me.expandedDetails = []
    }
    
    me.status = 'loading'
    let bodyObj = {permissionGroupIds}
    B3Fetch.fetch(PermissionGroupsStore.PermissionGroupsUrl+'/expandpermissiongroup', {method: 'POST', body: JSON.stringify(bodyObj)}, me, suppressMessages).then(function (data: any) {
        me.expandedDetails = data.expandedPermissionGroups || []
    }).catch(function (reason) {
      console.log(reason.message)
    })
  }

  @action
  public fetchDelegationGroupsByIds(permissionGroupIds?: string[], suppressMessages?: boolean) {
    let me = this
    if(!permissionGroupIds){
      me.expandedDelegationDetails = []
    }
    
    me.status = 'loading'
    let bodyObj = {permissionGroupIds}
    B3Fetch.fetch(PermissionGroupsStore.PermissionGroupsUrl+'/expandpermissiongroup', {method: 'POST', body: JSON.stringify(bodyObj)}, me, suppressMessages).then(function (data: any) {
        me.expandedDelegationDetails = data.expandedPermissionGroups || []
    }).catch(function (reason) {
      console.log(reason.message)
    })
  }

  @action
  public fetchList(suppressMessages?: boolean) {
    let me: any = this
    this.list = []
    const url = PermissionGroupsStore.PermissionGroupsUrl
    B3Fetch.fetch(url, {}, me).then(function (data: PermissionGroupList) {
      if (data) {
        if (!data.permissionGroups || data.permissionGroups.length == 0 && !suppressMessages){
          stores.notifications.showWarningMessage('There are no Permission Groups available')
        }
        else{
          me.list = data.permissionGroups.sort()
        }
      }
      else if(!suppressMessages){
        stores.notifications.showErrorMessage('There have been issues downloading Permission Groups')
      }
    }).catch(function (reason) {
      console.log(reason.message)
    })
  }

 
  @action
  public savePermissionGroup(permissionGroup: PermissionGroupCreate | PermissionGroupUpdate) {
    let me: any = this
    const modalActions = stores.modals
    const bodyObj: PermissionGroupList = {
      permissionGroups: [permissionGroup]
    }
    const anyPermissionGroup = permissionGroup as any
    const url= anyPermissionGroup._id?PermissionGroupsStore.PermissionGroupsUrl + '/update' : PermissionGroupsStore.PermissionGroupsUrl + '/create'

    B3Fetch.fetch(url, {method: 'POST', body: JSON.stringify(bodyObj)}, me, true).then(function (data: any) {
           //close modal
      if(data && data.results[0].success){
        me.status = 'mutated'
        const newPermissionGroup: PermissionGroup = data.results[0].permissionGroup
        modalActions.hideModal(MODALS.PERMISSIONGROUP)
        if(me.list && me.list.length > 0){
          for(let i=0; i<me.list.length; i++){
            if(newPermissionGroup._id == me.list[i]._id){
              me.list.splice(i, 1, newPermissionGroup)
            }
          }
        }
        stores.notifications.showSuccess({
          title: 'Success',
          message: 'The Permission Group '+ permissionGroup.name + ' has been saved correctly',
          position: 'tc',
          autoDismiss: 3
        })
      }
    }).catch(function (reason) {
      console.log(reason.message)
    })
  }
  

   @action
  public updatePermissionGroups(entities: PermissionGroupList) {
    let me: any = this

    B3Fetch.fetch(PermissionGroupsStore.PermissionGroupsUrl + '/update', {method: 'POST', body: JSON.stringify(entities)}, me).then(function (data: any) {
      //close modal
      if(data && data.results[0].success){
        me.status = 'mutated'
      }
    }).catch(function (reason) {
      console.log(reason.message)
    })
  }

  
   @action
  public deletePermissionGroup(items: any) {
    let me: any = this
  
    B3Fetch.fetch(PermissionGroupsStore.PermissionGroupsUrl + '/delete', {method: 'POST', body: JSON.stringify(items)}, me).then(function (data: any) {
      //close modal
      if(data && data.results[0].success){
        me.status = 'mutated'
        const newEntity: PermissionGroup = data.results[0].permissionGroup
        if(me.list && me.list.length > 0){
          for(let i=0; i<me.list.length; i++){
            if(newEntity._id == me.list[i]._id){
              me.list.splice(i, 1)
            }
          }
        }
      }
    }).catch(function (reason) {
      console.log(reason.message)
    })
  }
  

}