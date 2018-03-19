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
    ActionBarCategories
} from 'common_lib'
// import {AppShell} from '../../components/app_shell'
import {
    Organization,
    LegalEntity,
    LegalEntityList,
    LegalEntityUpdate
} from '../../models'
import {convertScopesArraytoMap, ScopesMap} from '../../utils/scopes'
import * as utils from '../../utils/legalentities_index'
import {Grid, GridAPI, CommonStores} from 'common_lib'
import {settings, MODALS} from '../../../app.settings'
import {Detail} from './detail'
import {Modal} from './forms/modal'
import {AppShellProps} from '../../models'
import { Stores, StoreNames, LegalEntitiesStore, OrganizationsStore} from '../../stores';
import './index.css'

export interface LegalEntitiesProps extends AppShellProps{
    hasActionBar?: boolean
}

export interface LegalEntitiesState {
    columnDefs: Array<GridAPI.ColDef>
    detailData: LegalEntity
    showDetail: boolean
    modalData: LegalEntity
}

export interface LegalEntitiesConnectedProps extends Partial<Stores>{
  legalentities: LegalEntitiesStore
  search: CommonStores.SearchStore
  modals: CommonStores.ModalStore
  organizations: OrganizationsStore
  userinfo: CommonStores.UserInfoStore
  notifications: CommonStores.NotificationStore
}

type _LegalEntitiesProps = LegalEntitiesProps & LegalEntitiesConnectedProps 

@inject(StoreNames.legalentities, 
    StoreNames.organizations, 
    CommonStores.CommonStoreNames.search, 
    CommonStores.CommonStoreNames.modals, 
    CommonStores.CommonStoreNames.notifications, 
    CommonStores.CommonStoreNames.userinfo)
@observer // must be after @inject
class LegalEntitiesComponent extends React.Component< _LegalEntitiesProps, LegalEntitiesState>{
    private scopes: ScopesMap
    constructor(props: _LegalEntitiesProps){
        super(props)
        bind(this)
        this.state = {
            detailData: utils.initEntityIfBlank(),
            modalData: utils.initEntityIfBlank(),
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
                    suppressMovable: true
                }, {
                    headerName: "Long Name",
                    field: "name",
                    minWidth: 130,
                    enableRowGroup: true
                }, {
                    headerName: "Entity ID",
                    field: "_id",
                    minWidth: 130,
                    enableRowGroup: true,
                    hide: true
                }, {
                    headerName: "Legal Entity Identifier",
                    field: "legalEntityIdentifier",
                    minWidth: 180,
                    enableRowGroup: true 
                }, {
                    headerName: "Short Name",
                    field: "shortName",
                    minWidth: 130,
                    enableRowGroup: true 
                }, {
                    headerName: "Organization",
                    field: "organizationName",
                    minWidth: 130,
                    enableRowGroup: true 
                }, {
                    headerName: "Organization ID",
                    field: "organizationId",
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
                    headerName: "Status",
                    field: "enabled",
                    minWidth: 100,
                    cellRenderer: utils.renderStatusIcon,
                    cellStyle: {'font-size': '20px'},
                    enableRowGroup: true,
                    cellClass: "textAlignCenter",
                    keyCreator: this.statusKeyCreator,
                    filterParams: {values:['Enabled', 'Disabled']}
                }, {
                    headerName: "Counterparty AMP ID",
                    field: "counterpartyAmpId",
                    minWidth: 160,
                    hide: true,
                    enableRowGroup: true
                }, {
                    headerName: "Email List",
                    field: "emailList",
                    minWidth: 130,
                    hide: true
                }, {
                    headerName: "Service Provider Email List",
                    field: "serviceProviderEmailList",
                    minWidth: 190,
                    hide: true
                }, {
                    headerName: "Fund Number",
                    field: "fundNumber",
                    minWidth: 130,
                    hide: true
                }, {
                    headerName: "Inactivity Monitor Threshold",
                    field: "inactivityMonitorThreshold",
                    minWidth: 190,
                    hide: true,
                    cellClass: "textAlignRight",
                    filter: 'number',
                    cellRenderer: (item:GridAPI.RowNode)=>utils.formatNumber(item.data.inactivityMonitorThreshold),
                }, {
                    headerName: "Expected Call Time To Live",
                    field: "expectedCallTtlHours",
                    minWidth: 190,
                    hide: true,
                    cellClass: "textAlignRight",
                    filter: 'number',
                    cellRenderer: (item:GridAPI.RowNode)=>utils.formatNumber(item.data.expectedCallTtlHours),
                }, {
                    headerName: "Email Enabled",
                    field: "emailEnabled",
                    minWidth: 130,
                    hide: true,
                    cellClass: "textAlignCenter",
                    cellRenderer: (item:GridAPI.RowNode)=>utils.renderYesNo({value:item.data.emailEnabled}),
                    keyCreator: this.yesnoKeyCreator,
                    filterParams: {values:['Yes', 'No']}
                }, {
                    headerName: "Intracompany Agreements",
                    field: "allowIntracompanyAgreements",
                    minWidth: 180,
                    hide: true,
                    cellClass: "textAlignCenter",
                    cellRenderer: (item:GridAPI.RowNode)=>utils.renderYesNo({value:item.data.allowIntracompanyAgreements})
                }, {
                    headerName: "SWIFT Email Notifications",
                    field: "swiftMessageEmailNotifications",
                    minWidth: 190,
                    hide: true,
                    cellClass: "textAlignCenter",
                    cellRenderer: (item:GridAPI.RowNode)=>utils.renderYesNo({value:item.data.swiftMessageEmailNotifications}),
                    keyCreator: this.yesnoKeyCreator,
                    filterParams: {values:['Yes', 'No']}
                }
            ]
        }
    }

    statusKeyCreator(params: any){
        if(params.value === true){
            return 'Enabled'
        }
        return 'Disabled'
    }
    yesnoKeyCreator(params: any){
        if(params.value === true){
            return 'Yes'
        }
        return 'No'
    }

    componentWillMount(){
        this.props.notifications.clearNotifications()
        if(!this.props.organizations.list) this.props.organizations.fetchList()
        const tampId = this.props.userinfo.details? this.props.userinfo.details.tampid : null
        //removing tamp from the legalentities call in order to download all entities in case of ServiceProvider org
        if(!this.props.legalentities.list) this.props.legalentities.fetchList()
        if(!this.props.userinfo.details) this.props.userinfo.fetchDetails(this.props.userInfoURL)
        this.populateAdditionalInfo()
    }

    componentWillReact(){
        this.props.notifications.clearNotifications()
        if(!this.props.organizations.list && !this.props.organizations.isLoading) this.props.organizations.fetchList()
        if(!this.scopes && !this.props.userinfo.details && !this.props.userinfo.isLoading) this.props.userinfo.fetchDetails(this.props.userInfoURL)
        const tampId = this.props.userinfo.details? this.props.userinfo.details.tampid : null
        this.scopes = this.props.userinfo.details? convertScopesArraytoMap(this.props.userinfo.details.scope) : {}
        //removing tamp from the legalentities call in order to download all entities in case of ServiceProvider org
        if((!this.props.legalentities.list && !this.props.legalentities.isLoading) || this.props.legalentities.status == 'mutated') this.props.legalentities.fetchList()
        this.populateAdditionalInfo()
    }

    populateAdditionalInfo(){
        if(this.props.organizations.list && this.props.organizations.list.length > 0 && this.props.legalentities.list){
            this.props.legalentities.list.map((entity: any)=>{
                const org = this.props.organizations.list!.filter((org)=>{
                    return org._id === entity.organizationId
                })[0]
                if(org){
                    entity.organizationName = org.name
                    entity.isOrgServiceProvider = org.serviceProvider
                    entity.isOrgMultiServiceProvider = org.multiOrgServiceProvider
                }
            })
        }
        if(this.state.showDetail && this.props.legalentities.list && this.props.legalentities.list.length > 0){
            const newDataItem = this.props.legalentities.list.filter( (item: LegalEntity) => { 
                    return item._id === this.state.detailData._id
                })[0] as LegalEntity
            this.setState({
                detailData: newDataItem || this.state.detailData
            })
        }
        if (this.state.showDetail && this.props.legalentities.list && this.props.legalentities.list.length > 0) {
            const newDataItem = this.props.legalentities.list.filter((item: LegalEntity) => {
                return item._id === this.state.detailData._id
            })[0] as LegalEntity
            this.setState({
                detailData: newDataItem || this.state.detailData
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
        this.props.modals.hideModal(MODALS.ENTITY)
    }

    editItem(items: GridAPI.RowNode[]){
        let item = new Object(items[0].data )
        this.setState({
            modalData: item as any
        })
        this.props.modals.showModal(MODALS.ENTITY, true)
    }
    
    saveCallback(): void {
        // this.closeDetail()
        this.setState({
            modalData: utils.initEntityIfBlank()
        })
    }

    refreshData(){
        // this.closeDetail()
        this.props.legalentities.list = undefined
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
    enableDisableItem(rows: GridAPI.RowNode[]){
        let obj:LegalEntityList = {legalEntities:[]}
        if(rows.length && rows.length > 0){
            if(rows.length == 1){
                const item = this.getUpdateEntity(rows[0].data)
                obj.legalEntities.push({...item, enabled: !item.enabled})
                this.props.legalentities.updateLegalEntities(obj)
            }
            else{
                let countEnabled =0
                let countDisabled =0
                for(let i=0; i<rows.length; i++){
                    if(rows[i].data.enabled){
                        countEnabled++
                    }
                    else{
                        countDisabled++
                    }
                }
                if(countEnabled>countDisabled){
                    for(let j=0; j<rows.length; j++){
                        if(rows[j].data.enabled){
                            let updateEntity: LegalEntityUpdate = this.getUpdateEntity(rows[j].data)
                            obj.legalEntities.push({...updateEntity, enabled: false})
                        }
                    }
                }
                else{
                    for(let j=0; j<rows.length; j++){
                        if(!rows[j].data.enabled){
                            let updateEntity: LegalEntityUpdate = this.getUpdateEntity(rows[j].data)
                            obj.legalEntities.push({...updateEntity, enabled: true})
                        }
                    }
                }
                this.props.legalentities.updateLegalEntities(obj)
            }
        }
        return false
    }

    getUpdateEntity(item: any){
        let updateEntity: any = new LegalEntityUpdate()
        for(let key of Object.keys(updateEntity)){
            updateEntity[key] = item[key]
        }
        return updateEntity
    }

    isEnabled(rows: GridAPI.RowNode[]):boolean{
        if(rows.length && rows.length > 0){
            if(rows.length == 1){
                if(rows[0].data.enabled){
                    return rows[0].data.enabled === true
                }
            }
            else{
                let countEnabled =0
                let countDisabled =0
                for(let i=0; i<rows.length; i++){
                    if(rows[i].data.enabled){
                        countEnabled++
                    }
                    else{
                        countDisabled++
                    }
                }
                if(countEnabled>countDisabled){
                    return true
                }
                else{
                    return false
                }
            }
        }
        return false
    }

    getActionBarItems(){
        const hasAct = this.hasPerm('manage:legalentity:update')
        const hasDelete = this.hasPerm('manage:legalentity:delete')
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
                            name: 'Amend Entity',
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
                            name: 'Delete Entity',
                            fn: (selectedRows: GridAPI.RowNode[])=>{},
                            // icon: <i className="fa fa-trash-o"></i>,
                            disabled: (selectedRows: GridAPI.RowNode[])=>{
                                return selectedRows.length == 0 || selectedRows.length > 1
                            },
                            isShown: ()=>false,
                            // buttonType:'red'
                        },
                        {
                            type: 'icon',
                            iconName: 'check-circle-o',
                            name: 'Enable Entity',
                            fn: (selectedRows: GridAPI.RowNode[])=>{ 
                                this.enableDisableItem(selectedRows) 
                            },
                            // icon: <i className="fa fa-check-circle-o"></i>,
                            disabled: (selectedRows: GridAPI.RowNode[])=>{
                                return selectedRows.length == 0 
                            },
                            isShown: (selectedRows: GridAPI.RowNode[])=>{
                                return hasAct && !this.isEnabled(selectedRows)
                            }
                        },
                        {
                            type: 'icon',
                            iconName: 'ban',
                            name: 'Disable Entity',
                            fn: (selectedRows: GridAPI.RowNode[])=>{ 
                                this.enableDisableItem(selectedRows) 
                            },
                            // icon: <i className="fa fa-ban"></i>,
                            disabled: (selectedRows: GridAPI.RowNode[])=>{
                                return selectedRows.length == 0 
                            },
                            isShown: (selectedRows: GridAPI.RowNode[])=>{
                                return hasAct && this.isEnabled(selectedRows)
                            },
                            // buttonType:'red'
                        }
                    ]
                }
            }
        }
        return actions
    }

    render(): JSX.Element {
        const hasPerm = this.hasPerm
        const {columnDefs, detailData, showDetail, modalData} = this.state
        const {legalentities, search, hasActionBar, modals} = this.props
        const closeDetail = this.closeDetail
        const toggleDetail = this.toggleDetail
        const ModalCloseCallback = this.ModalCloseCallback
        const saveCallback = this.saveCallback
        const openDetail = this.openDetail
        const userOrgId = this.props.userinfo.details?this.props.userinfo.details.tampid:null
        const orgTrigger = this.props.organizations.list? this.props.organizations.list.length:0
        const trigger = this.props.legalentities.list? this.props.legalentities.list.length:0
        const status = this.props.legalentities.status
        const actions = this.getActionBarItems()
        return (
            <AppShell {...this.props}>
                {hasPerm('manage:legalentity:read')?
                <div className="alessio">
                    <h1 className="acadia-page_title">Entities</h1>
                    <div className="landingPage">
                        <Grid
                            columnDefs={columnDefs}
                            rawData={Array.from(legalentities.list as any)}
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
                        isVisible={modals.modals.get(MODALS.ENTITY as any)}
                        saveHandler={saveCallback}
                        closeHandler={ModalCloseCallback}
                        cancelHandler={ModalCloseCallback}
                        data={modalData}
                    />
                </div>
                : <div className="not_authorised_message" >You are not entitled to see Entities information.</div>}
            </AppShell>
        )
    }
}




 export const LegalEntities : React.SFC<LegalEntitiesProps> = (props: _LegalEntitiesProps) => <LegalEntitiesComponent {...props}/>

