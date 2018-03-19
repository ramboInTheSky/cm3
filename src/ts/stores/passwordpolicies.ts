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
  PasswordPolicy,
  PasswordPolicyList
} from '../models/PasswordPolicy'
import {
  settings,
  MODALS
} from '../../app.settings'

import {
  stores  
} from '../stores'
// re-export the passwordPolicy model for convenience
export {
  PasswordPolicy,
  PasswordPolicyList
}


export class PasswordPoliciesStore extends RemoteStore < PasswordPolicy > {
  constructor() {
    super()
  }

  private static passwordPoliciesUrl: string = '/clientadmin/s/proxy?context=' + encodeURIComponent(settings.urls.passwordpolicies)
  private static passwordPolicyUrl: string = '/clientadmin/s/proxy?context=' + encodeURIComponent(settings.urls.passwordpolicies + '/id/') 

  @action
  public fetchDetails(id: string) {
    let me = this
    this.details = {} as PasswordPolicy

    B3Fetch.fetch(PasswordPoliciesStore.passwordPoliciesUrl + id, {}, me).then(function (data: PasswordPolicy) {
      me.details = data
    }).catch(function (reason) {
      console.log(reason.message)
    })
  }


  @action
  public fetchList(suppressMessages?:boolean) {
    let me = this
    this.list = []

    B3Fetch.fetch(PasswordPoliciesStore.passwordPoliciesUrl, {}, me).then(function (data: PasswordPolicyList) {
      if (data) {
        if ((!data.passwordPolicies || data.passwordPolicies.length == 0) && !suppressMessages){
          stores.notifications.showWarningMessage('There are no Password Policies available')
        }
        me.list = data.passwordPolicies
      }
      else{
        if(!suppressMessages){
          stores.notifications.showErrorMessage('There have been issues downloading Password Policies')
        }
      }
    }).catch(function (reason) {
      console.log(reason.message)
    })
  }

  //TODO
  @action
  public savePasswordPolicy(passwordPolicy: PasswordPolicy) {
    let me = this
    const modalActions = stores.modals
    const bodyObj: PasswordPolicyList = {
      passwordPolicies: [passwordPolicy]
    }
    const url= passwordPolicy._id?PasswordPoliciesStore.passwordPoliciesUrl + '/update' : PasswordPoliciesStore.passwordPoliciesUrl + '/create'

    B3Fetch.fetch(url, {method: 'POST', body: JSON.stringify(bodyObj)}, me).then(function (data: PasswordPolicyList) {
      // me.list = [...me.list, data.passwordPolicies]
      //close modal
      if(data)
        modalActions.hideModal(MODALS.PASSWORDPOLICY)
    }).catch(function (reason) {
      console.log(reason.message)
    })
  }

}