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
  User,
  UserList,
  UserCreate, 
  UserUpdate
} from '../models/ResourceOwner'
import {
  settings,
  MODALS
} from '../../app.settings'
import * as download from 'downloadjs'

import { 
  stores
} from '../stores'
// re-export the user model for convenience
export {
  User,
  UserList
}

export interface LoginDetail{
  _id : string
  time : string
  ipAddress : string
  userAgent : string
  result : string
  resourceOwnerId : string
  username : string
  realm : string
}

export type UserReportParameterType = 'MISSING' | 'Business' | 'Support' | 'Service'


export class UsersStore extends RemoteStore < User | UserCreate | UserUpdate> {
  constructor() {
    super()
  }

  
  public isValidUserReportParameterType(param: any) : param is UserReportParameterType{
    return param
  }

  @observable
  loginDetails: Array<LoginDetail>

  currentOrgId?: string = undefined

  private static usersUrl: string = '/clientadmin/s/proxy?context=' + encodeURIComponent(settings.urls.users)
  private static userUrl: string = '/clientadmin/s/proxy?context=' + encodeURIComponent(settings.urls.users + '/id/') 
  private static usersReportUrl: string = '/clientadmin/s/proxy?context=' + encodeURIComponent(settings.urls.usersreport + '/') 

  @action
  public fetchDetails(id: string) {
    let me = this
    this.details = {} as User

    B3Fetch.fetch(UsersStore.usersUrl + id, {}, me).then(function (data: User) {
      me.details = data
    }).catch(function (reason) {
      console.log(reason.message)
    })
  }

@action
  public fetchLoginDetails(id: string) {
    let me = this
    this.loginDetails = []

    B3Fetch.fetch(UsersStore.usersUrl + '/loginevents?id=' + id, {}, me).then(function (data: Array<LoginDetail>) {
      me.loginDetails = data
    }).catch(function (reason) {
      console.log(reason.message)
    })
  }

  @action
  public fetchList(orgId?: string, suppressMessages?: boolean) {
    let me: any = this
    this.list = []
    this.currentOrgId = orgId
    const url = orgId? UsersStore.usersUrl + '?organizationId=' + orgId : UsersStore.usersUrl
    B3Fetch.fetch(url, {}, me).then(function (data: UserList) {
      if (data) {
        if (!data.resourceOwners || data.resourceOwners.length == 0 && !suppressMessages){
          stores.notifications.showWarningMessage('There are no Users available')
        }
        let list = data.resourceOwners
        list.forEach((item: User)=>{
          item.status = item.failedLoginLockout?'Locked':(item.enabled===true)?'Enabled': 'Disabled'
        })
        me.list = list
      }
      else if(!suppressMessages){
        stores.notifications.showErrorMessage('There have been issues downloading Users')
      }
    }).catch(function (reason) {
      console.log(reason.message)
    })
  }

  @action
  public getUsersReport(orgId?: string, userReportParams?: UserReportParameterType[]) {
    let me: any = this
    let url = orgId? UsersStore.usersReportUrl + orgId : UsersStore.usersReportUrl
    let argString = ''
    if(userReportParams && userReportParams.length > 0){
      argString = '?userType='
      userReportParams.map((item, index, array)=>{
        index == array.length - 1 ? argString += item : argString += `${item},` 
      })
      url +=encodeURIComponent(argString)
    }
    B3Fetch.fetch(url, {}, me).then(function (data: any) {
      if(data){
        return data.blob()
      }
      else{
        throw {message:'It has not been possible to generate a report'}
      }
    }).then(function(blob: Blob){
      const date: Date = new Date()
      const day: string = date.toLocaleDateString()
      const time: string = date.toLocaleTimeString()
      download(blob, 'User Report '+ day + ' ' + time+'.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    }).catch(function (reason) {
      console.log(reason.message)
    })
  }

 
  @action
  public saveUser(user: UserCreate | UserUpdate) {
    let me: any = this
    const modalActions = stores.modals
    const bodyObj: UserList = {
      resourceOwners: [user]
    }
    const anyUser = user as any
    const url= anyUser._id?UsersStore.usersUrl + '/update' : UsersStore.usersUrl + '/create'

    B3Fetch.fetch(url, {method: 'POST', body: JSON.stringify(bodyObj)}, me, true).then(function (data: any) {
           //close modal
      if(data && data.results[0].success){
        me.status = 'mutated'
        const newUser: User = data.results[0].resourceOwner
        modalActions.hideModal(MODALS.USER)
        if(me.list && me.list.length > 0){
          for(let i=0; i<me.list.length; i++){
            if(newUser._id == me.list[i]._id){
              me.list.splice(i, 1, newUser)
            }
          }
        }
        const user: User = data.results[0].resourceOwner
        if(url.indexOf('create') != -1){
          stores.notifications.showSuccess({
            title: 'Success',
            message: 'An activation email has been sent to '+user.email,
            position: 'tc',
            autoDismiss: 3
          })
        }
        else{
          stores.notifications.showSuccess({
            title: 'Success',
            message: 'The user '+ user.username + ' has been saved correctly',
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
  public updateUsers(entities: UserList) {
    let me: any = this

    B3Fetch.fetch(UsersStore.usersUrl + '/update', {method: 'POST', body: JSON.stringify(entities)}, me).then(function (data: any) {
      //close modal
      if(data && data.results[0].success){
        me.status = 'mutated'
      }
    }).catch(function (reason) {
      console.log(reason.message)
    })
  }

   @action
  public unlockUsers(entities: UserList) {
    let me: any = this

    B3Fetch.fetch(UsersStore.usersUrl + '/unlock', {method: 'POST', body: JSON.stringify(entities)}, me).then(function (data: any) {
      //close modal
      if(data && data.results[0].success){
        me.status = 'mutated'
      }
    }).catch(function (reason) {
      console.log(reason.message)
    })
  }

   @action
  public pwReset(entities: UserList) {
    let me: any = this

    B3Fetch.fetch(UsersStore.usersUrl + '/passwordresetemail', {method: 'POST', body: JSON.stringify(entities)}, me).then(function (data: any) {
      // close modal
      if(data && data.results[0].success){
        me.status = 'mutated'
      }
      
    }).catch(function (reason) {
      console.log(reason.message)
    })
  }

   @action
  public deleteUser(items: any) {
    let me: any = this
  
    B3Fetch.fetch(UsersStore.usersUrl + '/delete', {method: 'POST', body: JSON.stringify(items)}, me).then(function (data: any) {
      //close modal
      if(data && data.results[0].success){
        me.status = 'mutated'
        const newEntity: User = data.results[0].resourceOwner
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