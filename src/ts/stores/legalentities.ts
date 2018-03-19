// third party
import { observable, computed, action } from 'mobx'

// first party
import { B3Fetch, Status, RemoteStore } from 'common_lib'
import { LegalEntity, LegalEntityList, LegalEntityUpdate, LegalEntityCreate } from '../models/LegalEntity'
import {settings, MODALS} from '../../app.settings'
import {
  stores
} from '../stores'
// re-export the entities model for convenience
export { LegalEntity, LegalEntityList }

export class LegalEntitiesStore extends RemoteStore < LegalEntity | LegalEntityUpdate | LegalEntityCreate > {
  constructor() {
    super()
  }

  private static legalEntitiesUrl: string = '/clientadmin/s/proxy?context=' + encodeURIComponent(settings.urls.entities);
  private static legalEntity: string = '/clientadmin/s/proxy?context=' + encodeURIComponent(settings.urls.entities + '/id/');

  @action
  public fetchDetails(id: string) {
    var me = this
    this.details = {} as LegalEntity

    B3Fetch.fetch(LegalEntitiesStore.legalEntity + id, {}, me).then(function (data: LegalEntity) {
          me.details = data
      }).catch(function (reason) {
        console.log(reason.message)
      })

  }
  @action
  public fetchList(orgId?: string, suppressMessages?: boolean) {
    var me = this
    this.list = []
    this.status = 'loading'
    const url = orgId? LegalEntitiesStore.legalEntitiesUrl + '?organizationId='+orgId : LegalEntitiesStore.legalEntitiesUrl
    B3Fetch.fetch(url, {}, me).then(function (data: LegalEntityList) {
       if (data) {
        if (!data.legalEntities || data.legalEntities.length == 0 && !suppressMessages){
          stores.notifications.showWarningMessage('There are no Entities available')
        }
        me.list = data.legalEntities
      }
      else{
        stores.notifications.showErrorMessage('There have been issues downloading Entities')
      }
      }).catch(function (reason) {
        console.log(reason.message)
      })

  }
  

  @action
  public saveLegalEntity(entity: LegalEntity | LegalEntityUpdate | LegalEntityCreate) {
    let me: any = this
    const modalActions = stores.modals
    const bodyObj: LegalEntityList = {
      legalEntities: [entity]
    }
    const anyEntity = entity as any
    const url= anyEntity._id?LegalEntitiesStore.legalEntitiesUrl + '/update' : LegalEntitiesStore.legalEntitiesUrl + '/create'

    B3Fetch.fetch(url, {method: 'POST', body: JSON.stringify(bodyObj)}, me).then(function (data: any) {
      //close modal
      if(data && data.results[0].success){
        
        const newEntity: LegalEntity = data.results[0].legalEntity
        modalActions.hideModal(MODALS.ENTITY)
        if(me.list && me.list.length > 0){
          for(let i=0; i<me.list.length; i++){
            if(newEntity._id == me.list[i]._id){
              me.list.splice(i, 1, newEntity)
            }
          }
          me.status = 'mutated'
        }
      }
    }).catch(function (reason) {
      console.log(reason.message)
    })
  }

  @action
  public updateLegalEntities(entities: LegalEntityList) {
    let me: any = this

    B3Fetch.fetch(LegalEntitiesStore.legalEntitiesUrl + '/update', {method: 'POST', body: JSON.stringify(entities)}, me).then(function (data: any) {
      //close modal
      if(data && data.results[0].success){
        me.status = 'mutated'
      }
    }).catch(function (reason) {
      console.log(reason.message)
    })
  }

}
