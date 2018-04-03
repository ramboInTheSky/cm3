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
  PortfolioListResponseSummary,
  PortfolioSummary
} from '../models'
import {
  settings,
  MODALS,
  API_TOKEN
} from '../../app.settings'
import * as download from 'downloadjs'

import {
  stores
} from '../stores'
// re-export the portfolio model for convenience
export {
  PortfolioListResponseSummary,
  PortfolioSummary
}

export interface LoginDetail {
  _id: string
  time: string
  ipAddress: string
  userAgent: string
  result: string
  resourceOwnerId: string
  username: string
  realm: string
}



export class PortfoliosStore extends RemoteStore<PortfolioSummary> {
  private options: any = {}
  constructor() {
    super()
    this.options = {
      credentials: 'include',
      mode: 'cors',
      headers: {
        'X-TOKEN': API_TOKEN,
        'Content-Type': 'application/json;charset=UTF-8',
      }
    }
  }

  @observable
  stats: any

  private static portfoliosUrl: string = settings.urls.portfolio.portfolios_workflow_summary
  private static portfolioUrl: string = settings.urls.portfolio.portfolios_workflow
  private static portfolioStatsUrl: string = settings.urls.portfolio.portfolios_stats

  @action
  public fetchDetails(id: string) {
    let me: any = this
    this.details = {} as PortfolioSummary

    B3Fetch.fetch(PortfoliosStore.portfolioUrl + id, me.options, me).then(function (data: PortfolioSummary) {
      me.details = data
    }).catch(function (reason) {
      console.log(reason.message)
    })
  }

  @action
  public fetchList(suppressMessages?: boolean) {
    let me: any = this
    this.list = []
    const url = PortfoliosStore.portfoliosUrl
    B3Fetch.fetch(url, me.options, me).then(function (data: PortfolioListResponseSummary) {
      if (data) {
        if (!data.portfolioSummaries || data.portfolioSummaries.length == 0 && !suppressMessages) {
          stores.notifications.showWarningMessage('There are no Portfolios available')
        }
        me.list = data.portfolioSummaries
      }
      else if (!suppressMessages) {
        stores.notifications.showErrorMessage('There have been issues downloading Portfolios')
      }
    }).catch(function (reason) {
      console.log(reason.message)
    })
  }

  @action
  public fetchStats(suppressMessages?: boolean) {
    let me: any = this
    this.stats = []
    const url = PortfoliosStore.portfolioStatsUrl
    B3Fetch.fetch(url, me.options, me).then(function (data: any) {
      if (data) {
        me.stats = data
      }
      else if (!suppressMessages) {
        stores.notifications.showErrorMessage('There have been issues downloading Portfolio Stats')
      }
    }).catch(function (reason) {
      console.log(reason.message)
    })
  }

}