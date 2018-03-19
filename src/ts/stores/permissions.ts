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
  Permission,
  PermissionList,
  PermissionCreate, 
  PermissionUpdate
} from '../models'
import {
  settings,
  MODALS
} from '../../app.settings'

import { 
  stores
} from '../stores'
// re-export the Permission model for convenience
export {
  Permission,
  PermissionList
}


export class PermissionsStore extends RemoteStore < Permission | PermissionCreate | PermissionUpdate> {
  constructor() {
    super()
  }


  private static PermissionsUrl: string = '/clientadmin/s/proxy?context=' + encodeURIComponent(settings.urls.permissions)

  @action
  public fetchDetails(id: string) {
    let me = this
    this.details = {} as Permission

    B3Fetch.fetch(PermissionsStore.PermissionsUrl + id, {}, me).then(function (data: Permission) {
      me.details = data
    }).catch(function (reason) {
      console.log(reason.message)
    })
  }

  @action
  public fetchList(suppressMessages?: boolean) {
    let me: any = this
    this.list = []
    const url = PermissionsStore.PermissionsUrl
    B3Fetch.fetch(url, {}, me).then(function (data: PermissionList) {
      if (data) {
        if (!data.permissions || data.permissions.length == 0 && !suppressMessages){
          stores.notifications.showWarningMessage('There are no Permissions available')
        }
        else{
          me.list = data.permissions.sort()
        }
      }
      else if(!suppressMessages){
        stores.notifications.showErrorMessage('There have been issues downloading Permissions')
      }
    }).catch(function (reason) {
      console.log(reason.message)
    })
  }

 
  @action
  public savePermission(permission: PermissionCreate | PermissionUpdate, suppressNotifications?: boolean) {
    let me: any = this
    const modalActions = stores.modals
    const bodyObj: PermissionList = {
      permissions: [permission]
    }
    const anyPermission = Permission as any
    const url= anyPermission._id?PermissionsStore.PermissionsUrl + '/update' : PermissionsStore.PermissionsUrl + '/create'

    B3Fetch.fetch(url, {method: 'POST', body: JSON.stringify(bodyObj)}, me, true).then(function (data: any) {
           //close modal
      if(data && data.results[0].success){
        me.status = 'mutated'
        const newPermission: Permission = data.results[0].permission
        // modalActions.hideModal(MODALS.PERMISSION)
        if(me.list && me.list.length > 0){
          for(let i=0; i<me.list.length; i++){
            if(newPermission._id == me.list[i]._id){
              me.list.splice(i, 1, newPermission)
            }
          }
        }
        if(!suppressNotifications){
          stores.notifications.showSuccess({
            title: 'Success',
            message: 'The Permission '+ Permission.name + ' has been saved correctly',
            position: 'tc',
            autoDismiss: 3
          })
        }
      }
    }).catch(function (reason) {
      console.log(reason.message)
    })
  }

   
  @action
  public savePermissionsTemp(permissions:  Array<PermissionCreate> | Array<PermissionUpdate>) {
    let me: any = this
    const modalActions = stores.modals
    const bodyObj: PermissionList =  {permissions: permissions} 
    const anyPermission = permissions as any
    const url= anyPermission._id?PermissionsStore.PermissionsUrl + '/update' : PermissionsStore.PermissionsUrl + '/create'

    B3Fetch.fetch(url, {method: 'POST', body: JSON.stringify(bodyObj)}, me, true).then(function (data: any) {
      if(data.error){
        stores.notifications.showErrorMessage(JSON.stringify(data.results))
      }
      else{
        stores.notifications.showSuccessMessage(JSON.stringify(data.results))
      }
    }).catch(function (reason) {
      console.log(reason.message)
    })
  }
  

   @action
  public updatePermissions(entities: PermissionList) {
    let me: any = this

    B3Fetch.fetch(PermissionsStore.PermissionsUrl + '/update', {method: 'POST', body: JSON.stringify(entities)}, me).then(function (data: any) {
      //close modal
      if(data && data.results[0].success){
        me.status = 'mutated'
      }
    }).catch(function (reason) {
      console.log(reason.message)
    })
  }

  
   @action
  public deletePermission(items: any) {
    let me: any = this
  
    B3Fetch.fetch(PermissionsStore.PermissionsUrl + '/delete', {method: 'POST', body: JSON.stringify(items)}, me).then(function (data: any) {
      //close modal
      if(data && data.results[0].success){
        me.status = 'mutated'
        const newEntity: Permission = data.results[0].resourceOwner
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