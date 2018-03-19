/**
 * Created by alessiofimognari on 11/05/2017.
 */
import * as React from 'react'
import { observer, inject } from 'mobx-react';
import {
    AppShell,
    bind,
    getLocalizedDate, 
    Row,
    ActionBarAction,
    ActionBarCategories,
    Button
} from 'common_lib'
// import {AppShell} from '../../components/app_shell'
import {
    Organization,
    AccessGroup,
    AccessGroupDelete,
    AccessGroupList
} from '../../models'
import {convertScopesArraytoMap, ScopesMap} from '../../utils/scopes'
import * as utils from '../../utils/accessgroups_index'
import {Grid, GridAPI, CommonStores} from 'common_lib'
import {settings, MODALS} from '../../../app.settings'
import {Detail} from './detail'
import {Modal} from './forms/modal'
import {AppShellProps} from '../../models'
import { Stores, StoreNames, AccessGroupsStore, OrganizationsStore} from '../../stores';
import './index.css'

export interface AccessGroupsProps extends AppShellProps{
    hasActionBar?: boolean
}

export interface AccessGroupsState {
    columnDefs: Array<GridAPI.ColDef>
    detailData: AccessGroup
    showDetail: boolean
    modalData: AccessGroup
    additionalInfoRetrieved: boolean
}

export interface AccessGroupsConnectedProps extends Partial<Stores>{
  accessgroups: AccessGroupsStore
  search: CommonStores.SearchStore
  modals: CommonStores.ModalStore
  organizations: OrganizationsStore
  notifications: CommonStores.NotificationStore
  userinfo: CommonStores.UserInfoStore
}

type _AccessGroupsProps = AccessGroupsProps & AccessGroupsConnectedProps 

@inject(CommonStores.CommonStoreNames.notifications, StoreNames.accessgroups, CommonStores.CommonStoreNames.userinfo, CommonStores.CommonStoreNames.search, CommonStores.CommonStoreNames.modals, StoreNames.organizations)
@observer // must be after @inject
class AccessGroupsComponent extends React.Component< _AccessGroupsProps, AccessGroupsState>{
    private scopes: ScopesMap
    constructor(props: _AccessGroupsProps){
        super(props)
        bind(this)
        this.state = {
            detailData: utils.initEntityIfBlank(),
            modalData: utils.initEntityIfBlank(),
            showDetail: false,
            additionalInfoRetrieved : false,
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
                    suppressMovable: true
                }, {
                    headerName: "Name",
                    field: "name",
                    minWidth: 130,
                    enableRowGroup: true
                }, {
                    headerName: "Organization",
                    field: "organizationName",
                    minWidth: 130,
                    enableRowGroup: true
                }, {
                    headerName: "Access Group ID",
                    field: "_id",
                    minWidth: 130,
                    enableRowGroup: true,
                    hide: true
                }, {
                    headerName: "Created",
                    field: "created",
                    minWidth: 130,
                    enableRowGroup: false,
                    cellRenderer: (item:GridAPI.RowNode)=>getLocalizedDate(item.data.created, true),
                    filter: 'date',
                    cellClass: "textAlignRight"
                }, {
                    headerName: "Modified",
                    field: "modified",
                    minWidth: 130,
                    cellRenderer: (item:GridAPI.RowNode)=>getLocalizedDate(item.data.modified, true),
                    filter: 'date',
                    enableRowGroup: false,
                    cellClass: "textAlignRight"
                }, {
                    headerName: "Default",
                    field: "orgLevel",
                    minWidth: 100,
                    cellRenderer: utils.renderStatusIcon,
                    cellStyle: {'font-size': '20px', 'text-align': 'center'},
                    enableRowGroup: true,
                    cellClass: "textAlignCenter",
                    keyCreator: this.statusKeyCreator,
                    filterParams: {values:['Default', 'Common']}
                }, {
                    headerName: "Service Provider Group AMP ID",
                    field: "serviceProviderGroupAmpId",
                    minWidth: 190,
                    hide: true,
                    enableRowGroup: true
                }, {
                    headerName: "Organization ID",
                    field: "organizationId",
                    minWidth: 130,
                    hide: true
                }, {
                    headerName: "Organization AMP ID",
                    field: "organizationAmpId",
                    minWidth: 160,
                    hide: true
                }, {
                    headerName: "Trading Party AMP ID",
                    field: "tradingPartyAmpId",
                    minWidth: 160,
                    hide: true
                }
            ]
        }
    }

     statusKeyCreator(params: any){
        if(params.value === true){
            return 'Default'
        }
        return 'Common'
    }

    componentWillMount(){
        this.props.notifications.clearNotifications()
        if(!this.props.organizations.list) this.props.organizations.fetchList(true)
        if(!this.props.accessgroups.list) this.props.accessgroups.fetchList()
        if(!this.props.userinfo.details) this.props.userinfo.fetchDetails(this.props.userInfoURL)
        this.populateAdditionalInfo()
    }

    componentWillReact(){
        this.props.notifications.clearNotifications()
        if(!this.props.userinfo.details && !this.props.userinfo.isLoading) this.props.userinfo.fetchDetails(this.props.userInfoURL)
        const tampId = this.props.userinfo.details? this.props.userinfo.details.tampid : null
        this.scopes = this.props.userinfo.details? convertScopesArraytoMap(this.props.userinfo.details.scope) : {}
        if(!this.props.organizations.list && !this.props.organizations.isLoading) this.props.organizations.fetchList(true, tampId)
        if(!this.props.accessgroups.list || this.props.accessgroups.status == 'mutated') this.props.accessgroups.fetchList()
        this.populateAdditionalInfo()
    }

    populateAdditionalInfo(){ 
        if(this.props.accessgroups.list && this.props.organizations.list && this.props.organizations.list.length > 0){
            this.props.accessgroups.list!.map((ag)=>{
                const org = this.props.organizations.list!.filter((org)=>{
                    return org._id === ag.organizationId
                })[0]
                if(org){
                    ag.organizationName = org.name
                    ag.tradingPartyAmpId = org.tradingPartyAmpId
                    ag.organizationAmpId = org.organizationAmpId
                }
            })
        }
        if(this.state.showDetail && this.props.accessgroups.list && this.props.accessgroups.list.length > 0){
            const newDataItem = this.props.accessgroups.list.filter( (item: AccessGroup) => { 
                    return item._id === this.state.detailData._id
                })[0] as AccessGroup
            this.setState({
                detailData: newDataItem || this.state.detailData
            })
        }
        else{
            this.setState({}) //TODO: are you sure?
        }
        
    }

    openDetail(node: GridAPI.RowNode): void {
        this.setState({
            showDetail: true,
            detailData: node.data
        })
    }

    closeDetail(): void {
        this.setState({showDetail: false})
    }

    toggleDetail(node: GridAPI.RowNode): void{
        if(this.state.showDetail){
            this.closeDetail()
        }
        else{
            this.openDetail(node)
        }
    }

    ModalCloseCallback(): void {
        this.setState({
            modalData: utils.initEntityIfBlank()
        })
        this.props.modals.hideModal(MODALS.ACCESSGROUP)
    }

    editItem(items: GridAPI.RowNode[]){
        let item = items[0].data
        this.setState({
            modalData: item
        })
        this.props.modals.showModal(MODALS.ACCESSGROUP, true)
    }

    deleteItems(items: GridAPI.RowNode[]){
        console.log(items)
        let obj:AccessGroupList = {accessGroups:[]}
        let names: string[] = []
        for(let i=0; i<items.length; i++){
            if(!items[i].data.orgLevel){
                let deleteAG: AccessGroupDelete = new AccessGroupDelete()
                deleteAG._id = items[i].data._id
                obj.accessGroups.push(deleteAG)
                names.push(items[i].data.name)
            }
        }
        if(names.length > 0){
            this.props.notifications.showWarning({
            title: 'Delete Access Group',
            position: 'tc',
            autoDismiss: 0,
            message: `Are you sure you want to delete: ${names.length == 1?names[0]:names.join(', ')}`,
            children:
                <div className="notification-action-wrapper">
                
                <Button type="secondary" className="aam-notification-action-button"
                        onClick={ () => {} }>
                    No
                </Button>
                <Button className="aam-notification-action-button"
                        onClick={ () => this.props.accessgroups.deleteAccessGroups(obj) }>
                    Yes
                </Button>
                </div>
            })
        }
    }
    
    saveCallback(): void {
        // this.closeDetail()
        this.setState({
            modalData: utils.initEntityIfBlank()
        })
    }

    refreshData(){
        // this.closeDetail()
        this.props.accessgroups.list = undefined
        this.setState({})
    }

    hasPerm(perm: string): boolean{
        if (this.scopes)
            return !!this.scopes[perm] || !!this.scopes['*:*']
        else if(this.props.userinfo.details){
             this.scopes = convertScopesArraytoMap(this.props.userinfo.details.scope) 
             return !!this.scopes[perm] || !!this.scopes['*:*']
        }
        return false
    }

    componentDidUpdate(){
         let gridElement: any = document.querySelector('.acadia-grid-container-col')
        // if(gridElement)gridElement.style.height = window.innerHeight - 180

        setTimeout(function(){
            let item: any = document.querySelector('.not_authorised_message')
            if(item){
                item.style.display = 'block'
            }
        }, 1000)
    }

    isOneDefault(rows: GridAPI.RowNode[]):boolean{
        if(rows.length && rows.length > 0){
            for(let i=0; i<rows.length; i++){
                if(rows[i].data.orgLevel){
                    return true
                }
            }
        }
        return false
    }

    getActionBarItems(){
        const hasAct = this.hasPerm('manage:accessgroup:update')
        const hasDelete = this.hasPerm('manage:accessgroup:delete')
        const actions: ActionBarCategories = {
            categories:{
                grid_features:{
                    position: 'left',
                    items:[
                        {
                            type: 'icon',
                            iconName: 'refresh',
                            name: 'Refresh Grid',
                            fn:  this.refreshData,
                            // icon: <i className="fa fa-refresh"></i>,
                            disabled: undefined,
                            isShown: ()=>true,
                            // buttonType: 'secondary'
                        }
                    ]
                },
                actions:{
                    position:'right',
                    items:[
                        {
                            type: 'icon',
                            iconName: 'pencil-square-o',
                            name: 'Amend Access Group',
                            fn: (selectedRows: GridAPI.RowNode[])=>{ 
                                this.editItem(selectedRows) 
                            },
                            // icon: <i className="fa fa-pencil-square-o"></i>,
                            disabled: (selectedRows: GridAPI.RowNode[])=>{
                                return selectedRows.length == 0 || selectedRows.length > 1
                            },
                            isShown: ()=>hasAct
                        },
                        {
                            type: 'icon',
                            iconName: 'trash-o',
                            name: 'Delete Access Group',
                            fn: (selectedRows: GridAPI.RowNode[])=>{
                                this.deleteItems(selectedRows)
                            },
                            // icon: <i className="fa fa-trash-o"></i>,
                            disabled: (selectedRows: GridAPI.RowNode[])=>{
                                return selectedRows.length == 0  || this.isOneDefault(selectedRows)
                            },
                            isShown: ()=>hasDelete,
                            // buttonType:'red'
                        }
                    ]
                }
            }
        }
        return actions
    }

    showOrgOnBehalfOf(): boolean{
        if(this.props.organizations.list && this.props.userinfo.details){
            const tampId = this.props.userinfo.details.tampid
            let myOrg:any =  this.props.organizations.list.filter(function(item){
                                return item._id === tampId
                            })
            return !this.props.userinfo.details.tampid || ( myOrg.length && myOrg.length > 0 && myOrg[0].serviceProvider )
        }
        return false
    }


    render(): JSX.Element {
        const hasPerm = this.hasPerm
        const {columnDefs, detailData, showDetail, modalData} = this.state
        const {accessgroups, search, hasActionBar, modals} = this.props
        const closeDetail = this.closeDetail
        const toggleDetail = this.toggleDetail
        const ModalCloseCallback = this.ModalCloseCallback
        const saveCallback = this.saveCallback
        const refreshData = this.refreshData
        const editItem = hasPerm('manage:accessgroup:update')?this.editItem: undefined
        const openDetail = this.openDetail
        const trigger = this.props.accessgroups.list && this.props.accessgroups.list.length > 0 && this.props.organizations.list && this.props.organizations.list.length > 0
        const userOrgId = this.props.userinfo.details?this.props.userinfo.details.tampid:null
        const actions = this.getActionBarItems()
        const showOrgOnBehalfOf = this.showOrgOnBehalfOf
        return (
            <AppShell {...this.props}>
                {hasPerm('manage:accessgroup:read')?
                <div className="alessio">
                    <h1 className="acadia-page_title">Access Groups</h1>
                <div className="landingPage">
                    <Grid
                            columnDefs={columnDefs}
                            rawData={Array.from(accessgroups.list as any)}
                            searchValue={search.value}
                            doubleClickFn={toggleDetail}
                            isReduced={this.state.showDetail}
                            openDetail={openDetail}
                            actions={actions}
                            onColumnVisible={()=>this.refreshData()}
                            noDataPlaceholder={true}
                            >
                        </Grid>
                    </div>
                    <Detail
                        data={detailData}
                        isVisible={showDetail}
                        closeDetailCallback={closeDetail}>
                        </Detail>
                        <Modal
                            {...this.props as any}
                            isVisible={modals.modals.get(MODALS.ACCESSGROUP as any)}
                            saveHandler={saveCallback}
                            closeHandler={ModalCloseCallback}
                            cancelHandler={ModalCloseCallback}
                            data={modalData}
                            showOrgOnBehalfOf={showOrgOnBehalfOf()}
                        />
                        </div>
                : <div className="not_authorised_message" >You are not entitled to see Access Groups information.</div>}
            </AppShell>
        )
    }
}




 export const AccessGroups : React.SFC<AccessGroupsProps> = (props: _AccessGroupsProps) => <AccessGroupsComponent {...props}/>

