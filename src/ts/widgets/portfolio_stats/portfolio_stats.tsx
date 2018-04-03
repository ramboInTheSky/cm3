import * as React from 'react'
import { observer, inject } from 'mobx-react';
import { CommonStores } from 'common_lib'

import {
    bind
} from 'common_lib'

import {ProgressBar} from '../../components'
import { PortfolioStatsObject } from '../../models/portfolio'
import { Stores, StoreNames, PortfoliosStore } from '../../stores';
import './portfolio_stats.css'

export interface PortfolioStatsProps {

}
export interface PortfolioStatsState {
}

interface PortfolioStatsConnectedProps extends Partial<Stores> {
    portfolios: PortfoliosStore
    search: CommonStores.SearchStore
    modals: CommonStores.ModalStore
    notifications: CommonStores.NotificationStore
}

type _PortfolioStatsProps = PortfolioStatsProps & PortfolioStatsConnectedProps

@inject(
    StoreNames.portfolios,
    CommonStores.CommonStoreNames.search,
    CommonStores.CommonStoreNames.modals,
    CommonStores.CommonStoreNames.notifications
)
@observer // must be after @inject
class PortfolioStatsComponent extends React.Component<_PortfolioStatsProps, PortfolioStatsState>{
    constructor(props: _PortfolioStatsProps) {
        super(props)
        bind(this)
    }

    componentWillMount() {
        this.props.portfolios.fetchStats()
    }

    render() {
        const  stats  = this.props.portfolios.stats.stats
        const  metadata  = this.props.portfolios.stats.metadata
        const allKeys = stats ? Object.keys(stats.all) : null
        return (
            stats && allKeys ?
                allKeys.length ? allKeys.map((key, index: number) => {
                    const percentage = (stats.all[key] / stats.all.total * 100) 
                    return <ProgressBar key={index} index={index} label={metadata[key]} value={stats.all[key]} percentage={percentage} />
                }) : null
                : null
        )
    }
}

export const PortfolioStats: React.SFC<PortfolioStatsProps> = (props: _PortfolioStatsProps) => <PortfolioStatsComponent {...props} />
