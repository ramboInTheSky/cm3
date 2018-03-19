// third party
import { observable, computed, action } from 'mobx'

// first party
import { B3Fetch, Status, RemoteStore } from 'common_lib'
import { AccessGroup, AccessGroupList, AccessGroupCreate, AccessGroupUpdate } from '../models/AccessGroup'
import {settings, MODALS} from '../../app.settings'
import {
  stores
} from '../stores'
// re-export the entities model for convenience
export { AccessGroup, AccessGroupList, AccessGroupUpdate }

export class AccessGroupsStore extends RemoteStore < AccessGroup > {
  constructor() {
    super()
  }

  @observable
    expandedDetails: any

  @observable
    expandedDetails2: any

  @observable
    secondaryAGList: any

  @observable
    expandacl?: {}

  private static accessGroupsUrl: string = '/clientadmin/s/proxy?context=' + encodeURIComponent(settings.urls.accessgroups)
  private static accessGroup: string = '/clientadmin/s/proxy?context=' + encodeURIComponent(settings.urls.accessgroups + '?id/')
  private static expandAccessGroup: string = '/clientadmin/s/proxy?context=' + encodeURIComponent(settings.urls.expanaccessgroup)
  private static expandacl: string = settings.urls.expandacl

  @action
  public fetchDetails(id: string) {
    var me = this
    this.details = {} as AccessGroup

    B3Fetch.fetch(AccessGroupsStore.accessGroup + id, {}, me).then(function (data: AccessGroup) {
          me.details = data
      }).catch(function (reason: any) {
        console.log(reason.message)
      })

  }
  @action
  public fetchExpandedDetails(id: string, slim?: boolean) {
    var me = this
    this.expandedDetails = {} as any

    B3Fetch.fetch(AccessGroupsStore.expandAccessGroup + '/'+id +(slim?'?slim=true':''), {}, me).then(function (data: any) {
          me.expandedDetails = data
      }).catch(function (reason: any) {
        console.log(reason.message)
      })

  }

  @action
  public fetchExpandedDetails2(id: string, slim?: boolean) {
    var me = this
    this.expandedDetails2 = {} as any

    B3Fetch.fetch(AccessGroupsStore.expandAccessGroup + '/'+id +(slim?'?slim=true':''), {}, me).then(function (data: any) {
          me.expandedDetails2 = data
      }).catch(function (reason: any) {
        console.log(reason.message)
      })

  }

  @action
  public fetchList(suppressMessages?: boolean) {
    var me: any = this
    this.list = []
 
    B3Fetch.fetch(AccessGroupsStore.accessGroupsUrl, {}, me).then(function (data: AccessGroupList) {
       if (data) {
        if ((!data.accessGroups || data.accessGroups.length == 0) && !suppressMessages){
          stores.notifications.showWarningMessage('There are no Access Groups available')
        }
        me.list = data.accessGroups
      }
      else{
        if(!suppressMessages){
          stores.notifications.showErrorMessage('There have been issues downloading Access Groups')
        }
      }
      }).catch(function (reason: any) {
        console.log(reason.message)
      })

  }

  @action
  public fetchSecondaryList(orgId: string) {
    var me: any = this
    this.secondaryAGList = []
 
    B3Fetch.fetch(AccessGroupsStore.accessGroupsUrl + '?organizationId=' + orgId, {}, me).then(function (data: AccessGroupList) {
       if (data) {
        me.secondaryAGList = data.accessGroups
      }
      }).catch(function (reason: any) {
        console.log(reason.message)
      })

  }

  //  @action
  // public saveAccessGroup(accessGroup: AccessGroup) {
  //   var me = this
  //   this.details = undefined
  //   const bodyMessage = JSON.stringify({accessGroups:[accessGroup]})
  //   B3Fetch.fetch(AccessGroupsStore.accessGroupsUrl, {method:'POST', body: bodyMessage}, me).then(function (data: AccessGroup) {
  //       me.details = data     
  //     }).catch(function (reason: any) {
  //       console.log(reason.message)
  //     })
  // }

   @action
  public getAcl(acl: any) {
    let me: any = this
  
    B3Fetch.fetch(AccessGroupsStore.expandacl, {method: 'POST', body: JSON.stringify(acl)}, me, true).then(function (data: any) {
      //close modal
      if(data ){
        me.expandacl = data
      }
    }).catch(function (reason: any) {
      console.log(reason.message)
    })
  }

   @action
  public deleteAccessGroups(items: any) {
    let me: any = this
  
    B3Fetch.fetch(AccessGroupsStore.accessGroupsUrl + '/delete', {method: 'POST', body: JSON.stringify(items)}, me).then(function (data: any) {
      //close modal
      if(data && data.results[0].success){
        me.status = 'mutated'
        const newEntity: AccessGroup = data.results[0].accessGroup
        if(me.list && me.list.length > 0){
          for(let i=0; i<me.list.length; i++){
            if(newEntity._id == me.list[i]._id){
              me.list.splice(i, 1)
            }
          }
        }
      }
    }).catch(function (reason: any) {
      console.log(reason.message)
    })
  }

  @action
  public saveAccessGroup(accessGroup: AccessGroup | AccessGroupCreate | AccessGroupUpdate, noCloseModal?: boolean) {
    let me: any = this
    const modalActions = stores.modals
    const bodyObj: AccessGroupList = {
      accessGroups: [accessGroup]
    }
    const anyAccessGroup = accessGroup as any
    const url= anyAccessGroup._id?AccessGroupsStore.accessGroupsUrl + '/update' : AccessGroupsStore.accessGroupsUrl + '/create'

    B3Fetch.fetch(url, {method: 'POST', body: JSON.stringify(bodyObj)}, me).then(function (data: any) {
      //close modal
      if(data && data.results[0].success){
        me.status = 'mutated'
        const newEntity: AccessGroup = data.results[0].accessGroup
        if(!noCloseModal)modalActions.hideModal(MODALS.ACCESSGROUP)
        if(me.list && me.list.length > 0){
          for(let i=0; i<me.list.length; i++){
            if(newEntity._id == me.list[i]._id){
              me.list.splice(i, 1, newEntity)
            }
          }
        }
      }
    }).catch(function (reason: any) {
      console.log(reason.message)
    })
  }

}
