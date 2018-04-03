/**
 * Created by alessiofimognari on 11/05/2017.
 */
import * as React from 'react'
import { observer, inject } from 'mobx-react';
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
import { AutoComplete } from 'react-mdl-extra'
import { Checkbox } from 'react-mdl'
// import {AppShell} from '../../components/app_shell'
import {
    PortfolioSummary,
    Portfolio
} from '../../models'
import { Grid, GridAPI } from 'common_lib'
import { settings, MODALS } from '../../../app.settings'
import { Detail } from './detail'
import { CheckboxPanel, CheckboxPanelEntry } from '../../components/checkbox_panel'
import { CommonStores } from 'common_lib'
import { AppShellProps } from '../../models'

import { Stores, StoreNames, PortfoliosStore } from '../../stores';

import './portfolios.css'

export interface PortfoliosProps extends AppShellProps {
    hasActionBar?: boolean
}

export interface PortfoliosState {
    columnDefs: Array<GridAPI.ColDef>
    detailData: PortfolioSummary
    showDetail: boolean
    modalData: Portfolio
    selectedOrgId?: string
}

interface PortfoliosConnectedProps extends Partial<Stores> {
    portfolios: PortfoliosStore
    search: CommonStores.SearchStore
    modals: CommonStores.ModalStore
    notifications: CommonStores.NotificationStore
}

type _PortfolioProps = PortfoliosProps & PortfoliosConnectedProps

@inject(
    StoreNames.portfolios,
    CommonStores.CommonStoreNames.search,
    CommonStores.CommonStoreNames.modals,
    CommonStores.CommonStoreNames.notifications
)
@observer // must be after @inject
class PortfoliosComponent extends React.Component<_PortfolioProps, PortfoliosState>{

    public static defaultProps: Partial<PortfoliosProps> = {
        hasActionBar: true
    }

    constructor(props: _PortfolioProps) {
        super(props)
        bind(this)
        this.state = {
            detailData: {} as PortfolioSummary,
            modalData: new Portfolio(),
            showDetail: false,
            columnDefs: [
                {
                    headerName: 'Row Selection',
                    minWidth: 35,
                    maxWidth: 35,
                    checkboxSelection: true,
                    headerCheckboxSelection: true,
                    headerCheckboxSelectionFilteredOnly: true,
                    suppressSorting: true,
                    suppressMenu: true,
                    pinned: 'left',
                    suppressMovable: true,
                    field: 'staleIndicator',
                    // }, {
                    //     headerName: 'Item Info',

                    //     minWidth: 35,
                    //     enableRowGroup: true,
                }, {
                    headerName: 'Portfolio ID',
                    field: 'portfolioSummary.portfolioId',
                    minWidth: 130,
                    enableRowGroup: true,
                    hide: false,
                    filter: 'number'
                }, {
                    headerName: 'Workgroup',
                    field: 'workGroupShortName',
                    minWidth: 130,
                    enableRowGroup: true,
                    hide: false,
                    filter: 'text'
                }, {
                    headerName: 'Process Step',
                    field: 'processShortName',
                    minWidth: 130,
                    enableRowGroup: true,
                    hide: false
                }, {
                    headerName: 'Work-Item Id',
                    field: 'workItemId',
                    minWidth: 130,
                    enableRowGroup: true,
                    filter: 'number'
                }, {
                    headerName: 'Agreement Code',
                    field: 'portfolioSummary.agreementCode',
                    minWidth: 130,
                    enableRowGroup: true,
                    filter: 'text'
                }, {
                    headerName: 'Agreement Type',
                    field: 'portfolioSummary.agreementType',
                    minWidth: 130,
                    enableRowGroup: true
                }, {
                    headerName: 'Valuation Date',
                    field: 'portfolioSummary.valuationDate',
                    minWidth: 130,
                    enableRowGroup: true,
                    cellRenderer: (item: GridAPI.RowNode) => getLocalizedDate(item.data.created),
                    filter: 'date',
                    hide: false,
                    cellClass: 'textAlignRight',
                }, {
                    headerName: 'Business Date',
                    field: 'portfolioSummary.businessDate',
                    minWidth: 130,
                    cellRenderer: (item: GridAPI.RowNode) => getLocalizedDate(item.data.modified),
                    filter: 'date',
                    hide: false,
                    enableRowGroup: false,
                    cellClass: 'textAlignRight'
                }, {
                    headerName: 'Portfolio Valuation',
                    field: 'portfolioSummary.portfolioValuation',
                    minWidth: 130,
                    enableRowGroup: true,
                    cellClass: 'textAlignRight',
                    filter: 'number'
                }, {
                    headerName: 'Currency',
                    field: 'portfolioSummary.currency',
                    minWidth: 130,
                    hide: false
                }, {
                    headerName: 'Margin Call Direction',
                    field: 'portfolioSummary.marginCallDirection',
                    minWidth: 130,
                    enableRowGroup: true,
                    hide: false
                    //cellRenderer: (item:GridAPI.RowNode)=>utils.renderScopes([], item), //TODO
                }, {
                    headerName: 'Minimum Transfer Amount',
                    field: 'portfolioSummary.minimumTransferAmount',
                    minWidth: 130,
                    enableRowGroup: true,
                    cellClass: 'textAlignRight',
                    filter: 'number'
                }, {
                    headerName: 'Collateral Valuation',
                    field: 'portfolioSummary.collateralValuation',
                    minWidth: 130,
                    enableRowGroup: true,
                    cellClass: 'textAlignRight',
                    filter: 'number'
                }, {
                    headerName: 'Their Initial Margin Call',
                    field: 'portfolioSummary.nonNettedNetExposureUs',
                    minWidth: 130,
                    enableRowGroup: true,
                    cellClass: 'textAlignRight',
                    filter: 'number'
                }, {
                    headerName: 'Threshold',
                    field: 'portfolioSummary.threshold',
                    minWidth: 150,
                    enableRowGroup: true,
                    hide: false,
                    cellClass: 'textAlignRight',
                    filter: 'number'
                }, {
                    headerName: 'Total Transfer',
                    field: 'portfolioSummary.totalTransfer',
                    minWidth: 150,
                    enableRowGroup: true,
                    hide: false,
                    cellClass: 'textAlignRight',
                    filter: 'number'
                }, {
                    headerName: 'Our Initial Margin Call',
                    field: 'portfolioSummary.nonNettedNetExposureThem',
                    minWidth: 130,
                    enableRowGroup: true,
                    hide: false,
                    cellClass: 'textAlignRight',
                    filter: 'number'
                }, {
                    headerName: 'Cash Flow Exposure',
                    field: 'portfolioSummary.cashFlowExposure',
                    minWidth: 130,
                    enableRowGroup: true,
                    hide: false,
                    cellClass: 'textAlignRight',
                    filter: 'number'
                }, {
                    headerName: 'Reconcile Status',
                    field: 'portfolioSummary.reconcileStatus',
                    minWidth: 130,
                    enableRowGroup: true,
                    hide: false,
                    cellClass: 'textAlignRight',
                    filter: 'number'
                }, {
                    headerName: 'Delivered IM Collateral',
                    field: 'portfolioSummary.nonNettedCollaterlaUs',
                    minWidth: 130,
                    enableRowGroup: true,
                    hide: false,
                    cellClass: 'textAlignRight',
                    filter: 'number'
                }, {
                    headerName: 'Received IM Collateral',
                    field: 'portfolioSummary.nonNettedCollaterlaThem',
                    minWidth: 130,
                    enableRowGroup: true,
                    hide: false,
                    cellClass: 'textAlignRight',
                    filter: 'number'
                }, {
                    headerName: 'Netted Our Call',
                    field: 'portfolioSummary.nettedOurCall',
                    minWidth: 130,
                    enableRowGroup: true,
                    hide: false,
                    cellClass: 'textAlignRight',
                    filter: 'number'
                }, {
                    headerName: 'Netted Their Call',
                    field: 'portfolioSummary.nettedTheirCall',
                    minWidth: 130,
                    enableRowGroup: true,
                    hide: false,
                    cellClass: 'textAlignRight',
                    filter: 'number'
                    // }, {
                    //     headerName: 'Status',
                    //     field: 'status',
                    //     minWidth: 100,
                    //     cellRenderer: (item: any) => {
                    //         return utils.renderStatusIcon({ value: item.data.enabled, locked: item.data.failedLoginLockout })
                    //     },
                    //     cellStyle: { 'font-size': '20px' },
                    //     enableRowGroup: true,
                    //     cellClass: 'textAlignCenter',
                }
            ]
        }
    }


    componentWillMount() {
        // this.props.userinfo.fetchDetails(this.props.userInfoURL)
         /*if(me.hasPerm('manage:resourceowner:read')*/this.props.portfolios.fetchList()
    }

    componentWillReact() {
        this.props.notifications.clearNotifications()
        // const tampId = this.props.userinfo.details? this.props.userinfo.details.tampid : null
        if (/*me.hasPerm('manage:resourceowner:read') && */ this.props.portfolios.status == 'mutated') {
            this.props.portfolios.fetchList()
        }
        this.populateAdditionalInfo()
    }

    populateAdditionalInfo() {
        const { detailData, showDetail } = this.state
        const { list } = this.props.portfolios
        //aggregate data from other stores
        //////not needed yet
        //set new detail item if it has changed
        if (showDetail && detailData && list && list.length) {
            const newDataItem = list.filter((item: PortfolioSummary) => {
                return item.portfolioSummary.portfolioId === detailData.portfolioSummary.portfolioId
            })[0] as PortfolioSummary
            this.setState({
                detailData: newDataItem || detailData
            })
        }
    }


    openDetail(node: GridAPI.RowNode): void {
        this.setState({
            showDetail: true,
            detailData: node.data
        })
    }

    closeDetail(): void {
        this.setState({
            showDetail: false,
            detailData: {} as PortfolioSummary
        })
    }

    toggleDetail(node: GridAPI.RowNode): void {
        if (this.state.showDetail) {
            this.closeDetail()
        }
        else {
            this.openDetail(node)
        }
    }


    refreshData() {
        // this.closeDetail()
        this.props.portfolios.fetchList()
    }

    hasPerm(perm: string): boolean {
        // if (this.scopes)
        //     return !!this.scopes[perm] || !!this.scopes['*:*']
        // else if (this.props.userinfo.details) {
        //     this.scopes = convertScopesArraytoMap(this.props.userinfo.details.scope)
        //     return !!this.scopes[perm] || !!this.scopes['*:*']
        // }
        // return false
        return true
    }

    componentDidUpdate() {
        // let gridElement: any = document.querySelector('.acadia-grid-container-col')

        setTimeout(function () {
            let item: any = document.querySelector('.not_authorised_message')
            if (item) {
                item.style.display = 'block'
            }
        }, 1000)
        // const userDisplay = this.props.userinfo.userDisplay
        // this.loggedPortfolioName = userDisplay && userDisplay.length ? this.props.userinfo.userDisplay.substring(0, this.props.userinfo.userDisplay.indexOf('@')) : ''
    }


    getActionBarItems() {
        const hasAct = this.hasPerm('manage:resourceowner:update')
        const hasDelete = this.hasPerm('manage:resourceowner:delete')
        const hasCreate = this.hasPerm('manage:resourceowner:create')
        const hasReport = this.hasPerm('reports:resourceowners')
        const actions: ActionBarCategories = {
            categories: {
                grid_features: {
                    position: 'left',
                    items: [
                        {
                            type: 'icon',
                            iconName: 'refresh',
                            name: 'Refresh Grid',
                            fn: this.refreshData,
                            // icon: <i className="fa fa-refresh"></i>,
                            disabled: undefined,
                            isShown: () => true,
                            // buttonType: 'secondary'
                        },
                        // {
                        //     type: 'icon',
                        //     iconName: 'file-excel-o',
                        //     name: 'Extract Portfolios Report',
                        //     fn: (selectedRows: GridAPI.RowNode[]) => {
                        //         this.setState({ showReportCheckboxPane: true })
                        //     },
                        //     // icon: <i className="fa fa-file-excel-o"></i>,
                        //     disabled: (selectedRows: GridAPI.RowNode[]) => {
                        //         return false
                        //     },
                        //     isShown: (selectedRows: GridAPI.RowNode[]) => {
                        //         return hasReport && (this.props.userinfo.details.tampid || this.state.selectedOrgId)
                        //     },
                        //     child: this.renderPanel()
                        //     // buttonType:'secondary'
                        // }
                    ]
                },
                actions: {
                    position: 'right',
                    items: [
                        // {
                        //     type: 'icon',
                        //     iconName: 'pencil-square-o',
                        //     name: 'Amend Portfolio',
                        //     fn: (selectedRows: GridAPI.RowNode[]) => {
                        //         this.editItem(selectedRows)
                        //     },
                        //     // icon: <i className="fa fa-pencil-square-o"></i>,
                        //     disabled: (selectedRows: GridAPI.RowNode[]) => {
                        //         return selectedRows.length == 0 || selectedRows.length > 1
                        //     },
                        //     isShown: () => hasAct
                        // },
                        // {
                        //     type: 'icon',
                        //     iconName: 'files-o',
                        //     name: 'Copy Portfolio',
                        //     fn: (selectedRows: GridAPI.RowNode[]) => {
                        //         this.copyPortfolio(selectedRows)
                        //     },
                        //     // icon: <i className="fa fa-files-o"></i>,
                        //     disabled: (selectedRows: GridAPI.RowNode[]) => {
                        //         return selectedRows.length == 0 || selectedRows.length > 1
                        //     },
                        //     isShown: () => hasCreate
                        // },
                        // {
                        //     type: 'icon',
                        //     iconName: 'unlock',
                        //     name: 'Unlock Portfolio',
                        //     fn: (selectedRows: GridAPI.RowNode[]) => {
                        //         this.unlockItems(selectedRows)
                        //     },
                        //     // icon: <i className="fa fa-unlock"></i>,
                        //     disabled: (selectedRows: GridAPI.RowNode[]) => {
                        //         return selectedRows.length == 0
                        //     },
                        //     isShown: (selectedRows: GridAPI.RowNode[]) => {
                        //         return hasAct && this.isLocked(selectedRows)
                        //     }
                        // },
                        // {
                        //     type: 'icon',
                        //     iconName: 'check-circle-o',
                        //     name: 'Enable Portfolio',
                        //     fn: (selectedRows: GridAPI.RowNode[]) => {
                        //         this.enableDisableItem(selectedRows)
                        //     },
                        //     // icon: <i className="fa fa-check-circle-o"></i>,
                        //     disabled: (selectedRows: GridAPI.RowNode[]) => {
                        //         return selectedRows.length == 0
                        //     },
                        //     isShown: (selectedRows: GridAPI.RowNode[]) => {
                        //         return hasAct && !this.isEnabled(selectedRows)
                        //     }
                        // },
                        // {
                        //     type: 'icon',
                        //     iconName: 'ban',
                        //     name: 'Disable Portfolio',
                        //     fn: (selectedRows: GridAPI.RowNode[]) => {
                        //         this.enableDisableItem(selectedRows)
                        //     },
                        //     icon: <i className="fa fa-ban"></i>,
                        //     disabled: (selectedRows: GridAPI.RowNode[]) => {
                        //         return selectedRows.length == 0 || (selectedRows.length == 1 && selectedRows[0].data.username == this.loggedPortfolioName)
                        //     },
                        //     isShown: (selectedRows: GridAPI.RowNode[]) => {
                        //         return (hasAct && this.isEnabled(selectedRows)) || (selectedRows.length == 1 && selectedRows[0].data.username == this.loggedPortfolioName)
                        //     },
                        //     // buttonType:'red'
                        // },
                        // {
                        //     type: 'icon',
                        //     iconName: 'trash-o',
                        //     name: 'Delete Portfolio',
                        //     fn: (selectedRows: GridAPI.RowNode[]) => {
                        //         this.deleteItems(selectedRows)
                        //     },
                        //     // icon: <i className="fa fa-trash-o"></i>,
                        //     disabled: (selectedRows: GridAPI.RowNode[]) => {
                        //         return selectedRows.length == 0 || (selectedRows.length == 1 && selectedRows[0].data.username == this.loggedPortfolioName)
                        //     },
                        //     isShown: () => hasDelete,
                        //     buttonType: 'red'
                        // },
                        // {
                        //     type: 'icon',
                        //     iconName: 'key',
                        //     name: 'Send Password Reset',
                        //     fn: (selectedRows: GridAPI.RowNode[]) => {
                        //         this.sendPasswordReset(selectedRows)
                        //     },
                        //     icon: <i className="fa fa-key"></i>,
                        //     disabled: (selectedRows: GridAPI.RowNode[]) => {
                        //         return selectedRows.length == 0 || selectedRows.length > 1
                        //     },
                        //     isShown: () => hasAct
                        // }
                        // },
                        // {
                        //     type: 'select',
                        //     name: 'Choose Organization',
                        //     fn: (value: string)=>{ 
                        //         if (value == "" && this.tampId){
                        //             this.handleChangeOrg(this.tampId)
                        //         }
                        //         else{
                        //             //check the value is an orgId
                        //             const me = this
                        //             let myOrg: any
                        //             if(me.props.organizations.list){
                        //                 myOrg =  me.props.organizations.list.filter(function(item){
                        //                                     return item._id === value
                        //                                 })
                        //             }
                        //             if(myOrg && myOrg.length > 0){
                        //                 this.handleChangeOrg(value) 
                        //             }
                        //         }
                        //     },
                        //     isShown: (selectedRows: GridAPI.RowNode[])=>{
                        //         const me = this
                        //         let myOrg: any
                        //         if(me.props.organizations.list){
                        //             myOrg =  me.props.organizations.list.filter(function(item){
                        //                                 return item._id === me.props.userinfo.details.tampid
                        //                             })
                        //         }
                        //         return !me.props.userinfo.details.tampid || ( myOrg!.length > 0 && myOrg![0].serviceProvider )
                        //     },
                        //     options: Array.from(this.props.organizations.list || []),
                        //     valueIndex: '_id',
                        //     dataIndex: 'name',
                        //     currentValue: this.state.selectedOrgId || this.props.portfolios.currentOrgId,
                        //     error: undefined
                        // }
                    ]
                }
            }
        }
        return actions
    }

    render(): JSX.Element {
        const hasPerm = this.hasPerm
        const { columnDefs, detailData, showDetail, modalData } = this.state
        const { portfolios, search, hasActionBar, modals } = this.props
        const portfolioslist = portfolios.list
        const closeDetail = this.closeDetail
        const toggleDetail = this.toggleDetail
        const openDetail = this.openDetail
        const portfoliosLength = this.props.portfolios.list ? this.props.portfolios.list.length : 0
        const actions = this.getActionBarItems()

        return (
            <AppShell {...this.props} >
                {hasPerm('manage:resourceowner:read') ?
                    <div className="alessio">
                        <h1 className="acadia-page_title">Portfolios</h1>
                        <Row className="landingPage">
                            <Grid
                                columnDefs={columnDefs}
                                rawData={Array.from(portfolioslist as any)}
                                searchValue={search.value}
                                doubleClickFn={toggleDetail}
                                isReduced={this.state.showDetail}
                                openDetail={openDetail}
                                actions={actions}
                                onColumnVisible={() => this.refreshData()}
                                noDataPlaceholder={true}
                            >
                            </Grid>
                        </Row>
                        <Detail
                            data={detailData}
                            isVisible={showDetail}
                            closeDetailCallback={closeDetail}>
                        </Detail>
                    </div>
                    : <div className="not_authorised_message" >You are not entitled to see Portfolios information.</div>}
            </AppShell>
        )
    }
}

export const Portfolios: React.SFC<PortfoliosProps> = (props: _PortfolioProps) => <PortfoliosComponent {...props} />
