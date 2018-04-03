import * as React from 'react';
import { observer, inject } from 'mobx-react'

import {
    ModuleSettingModule,
    ModuleSettingNewActions,
    AppShell,
    bind,
    getLocalizedDate,
    Row,
    ActionBarAction,
    ActionBarCategories,
    Button
} from 'common_lib'

import { CommonStores } from 'common_lib'
import { Dashboard } from '../../components'
import { PortfolioStats } from '../../widgets/portfolio_stats'
import { Stores, StoreNames, PortfoliosStore } from '../../stores';
import { AppShellProps } from '../../models'
import './dashboard.css'

export interface DashboardPageProps extends AppShellProps {
    hasActionBar?: boolean
}

interface DashboardPageConnectedProps extends Partial<Stores> {
    search: CommonStores.SearchStore
    modals: CommonStores.ModalStore
    notifications: CommonStores.NotificationStore
}

type _DashboardPageProps = DashboardPageProps & DashboardPageConnectedProps

const simpleHOC = (WrappedComponent: React.ComponentClass) => (props: React.Props<any>) => (<WrappedComponent {...props} />)

@inject(
    CommonStores.CommonStoreNames.search,
    CommonStores.CommonStoreNames.modals,
    CommonStores.CommonStoreNames.notifications
)
@observer // must be after @inject
class DashboardPageComponent extends React.Component {

    render() {
        const layout: any = [
            { i: 'a', x: 0, y: 0, w: 6, h: 10, static: false, minW: 4, minH: 3, component: <PortfolioStats />, title: 'PORTFOLIO STATS' },
            { i: 'b', x: 6, y: 0, w: 6, h: 7, minW: 2, minH: 4, component: <PortfolioStats />, title: 'PORTFOLIO STATS' },
            { i: 'c', x: 4, y: 1, w: 8, h: 9, minW: 2, minH: 4, component: simpleHOC(PortfolioStats as any), title: 'PORTFOLIO STATS' },
            { i: 'd', x: 0, y: 1, w: 3, h: 9, minW: 2, minH: 4, component: <div>lallero</div>, title: 'A very very very much Longer Widget Title A very very very much Longer Widget Title' },
            { i: 'e', x: 0, y: 1, w: 3, h: 9, minW: 2, minH: 4, component: <div>lallero</div>, title: 'A very very very much Longer Widget Title' }
        ]
        return (
             <AppShell {...this.props as AppShellProps} overflow={true}>
                 <h1 className="acadia-page_title">Dashboard</h1>
                <Dashboard items={layout} persist={true} className="acadiasoft-dashboard-landingPage"/>
            </AppShell>
        );
    }
}

export const DashboardPage: React.SFC<DashboardPageProps> = (props: _DashboardPageProps) => <DashboardPageComponent {...props} />