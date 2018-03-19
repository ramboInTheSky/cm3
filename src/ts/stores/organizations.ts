// third party
import { observable, computed, action } from 'mobx'

// first party
import { B3Fetch, Status, RemoteStore } from 'common_lib'
import { Organization, OrganizationList } from '../models/Organization'
import {settings} from '../../app.settings'
// re-export the user model for convenience
export { Organization, OrganizationList }

export class OrganizationsStore extends RemoteStore<Organization>{

  private static organizationsUrl: string = '/clientadmin/s/proxy?context=' + encodeURIComponent(settings.urls.organizations);

  
  @action
  public fetchList(suppressNotifications?: boolean, orgId?: string) {
    var me = this
    this.list = []
    const url = orgId? OrganizationsStore.organizationsUrl + '?all=true&id=' + orgId : OrganizationsStore.organizationsUrl + '?all=true'
    B3Fetch.fetch(url, {}, me).then(function (data: OrganizationList) {
          me.list = data.organizations
      }).catch(function (reason) {
        console.log(reason.message)
      })
  }
   
}
