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
// import {AppShell} from '../../components/app_shell'
import {
    PermissionGroup,
    PermissionCreate,
    Permission,
    PermissionGroupList,
    PermissionGroupDelete
} from '../../models'
import { convertScopesArraytoMap, ScopesMap } from '../../utils/scopes'
import * as utils from '../../utils/roles_index'
import { scopes as scopesArray } from '../../utils/scopes'
import { Grid, GridAPI } from 'common_lib'
import { settings, MODALS } from '../../../app.settings'
import { Detail } from './detail'
import { Modal } from './forms/modal'
import { CommonStores } from 'common_lib'
import { AppShellProps } from '../../models'
import cloneDeep from 'lodash/cloneDeep'
import { Stores, StoreNames, PermissionGroupsStore, PermissionsStore } from '../../stores';

import './index.css'

export interface permissiongroupsProps extends AppShellProps {
    hasActionBar?: boolean
}

export interface permissiongroupsState {
    columnDefs: Array<GridAPI.ColDef>
    detailData: PermissionGroup
    showDetail: boolean
    modalData: PermissionGroup
}

interface permissiongroupsConnectedProps extends Partial<Stores> {
    permissiongroups: PermissionGroupsStore
    search: CommonStores.SearchStore
    modals: CommonStores.ModalStore
    userinfo: CommonStores.UserInfoStore
    notifications: CommonStores.NotificationStore
    permissions: PermissionsStore
}

type _RoleProps = permissiongroupsProps & permissiongroupsConnectedProps

@inject(StoreNames.permissiongroups, StoreNames.permissions,
    CommonStores.CommonStoreNames.search,
    CommonStores.CommonStoreNames.modals,
    CommonStores.CommonStoreNames.notifications,
    CommonStores.CommonStoreNames.userinfo)
@observer // must be after @inject
class PermissionGroupsComponent extends React.Component<_RoleProps, permissiongroupsState>{

    public static defaultProps: Partial<permissiongroupsProps> = {
        hasActionBar: true
    }
    private permissionsLookupObj: { [key: string]: string } = {}
    private scopes: ScopesMap
    constructor(props: _RoleProps) {
        super(props)
        bind(this)
        this.state = {
            detailData: new PermissionGroup(),
            modalData: utils.initRoleIfBlank(),
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
                    headerName: "Permission Group ID",
                    field: "_id",
                    minWidth: 160,
                    enableRowGroup: true,
                    hide: true,
                    filter: 'text'
                }, {
                    headerName: "Name",
                    field: "name",
                    minWidth: 130,
                    enableRowGroup: true
                }, {
                    headerName: "Description",
                    field: "description",
                    minWidth: 200,
                    enableRowGroup: true
                }, {
                    headerName: "Created",
                    field: "created",
                    minWidth: 130,
                    enableRowGroup: false,
                    cellRenderer: (item: GridAPI.RowNode) => getLocalizedDate(item.data.created, true),
                    filter: 'date',
                    cellClass: "textAlignRight"
                }, {
                    headerName: "Modified",
                    field: "modified",
                    minWidth: 130,
                    cellRenderer: (item: GridAPI.RowNode) => getLocalizedDate(item.data.modified, true),
                    filter: 'date',
                    enableRowGroup: false,
                    cellClass: "textAlignRight"
                }
            ]
        }
    }

    componentWillMount() {
        this.props.userinfo.fetchDetails(this.props.userInfoURL)
        // this.createStandardPermissions()
    }

    componentWillReact() {
        this.props.notifications.clearNotifications()
        if (this.props.userinfo.details) {
            this.scopes = convertScopesArraytoMap(this.props.userinfo.details.scope)
        }
        else {
            this.props.userinfo.fetchDetails(this.props.userInfoURL)
        }

        if ((!this.props.permissiongroups.list && !this.props.permissiongroups.isLoading) || this.props.permissiongroups.status == 'mutated') this.props.permissiongroups.fetchList()
        if ((this.hasPerm('manage:permission:read') && !this.props.permissions.list && !this.props.permissions.isLoading) || this.props.permissions.status == 'mutated') this.props.permissions.fetchList(true)
        if (this.props.permissions.list && this.props.permissions.list.length && Object.keys(this.permissionsLookupObj).length == 0) {
            for (let i = 0; i < this.props.permissions.list.length; i++) {
                this.permissionsLookupObj[(this.props.permissions.list[i] as Permission)._id] = this.props.permissions.list[i].name
            }
        }
        if (this.state.showDetail && this.props.permissiongroups.list && this.props.permissiongroups.list.length > 0) {
            const newDataItem = this.props.permissiongroups.list.filter((item: PermissionGroup) => {
                return item._id === this.state.detailData._id
            })[0] as PermissionGroup
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
        this.setState({ showDetail: false })
    }

    toggleDetail(node: GridAPI.RowNode): void {
        if (this.state.showDetail) {
            this.closeDetail()
        }
        else {
            this.openDetail(node)
        }
    }

    ModalCloseCallback(): void {
        this.setState({
            modalData: utils.initRoleIfBlank()
        })
        this.props.modals.hideModal(MODALS.PERMISSIONGROUP)
    }

    editItem(items: GridAPI.RowNode[]) {
        let item = items[0].data
        this.setState({
            modalData: item
        })
        this.props.modals.showModal(MODALS.PERMISSIONGROUP, true)
    }

    enableDisableItem(items: GridAPI.RowNode[]) {
        const role = items[0].data
        // this.props.permissiongroups.saveRole({...role, enabled: role.enabled})
    }

    saveCallback(): void {
        // this.closeDetail()
        this.setState({
            modalData: utils.initRoleIfBlank()
        })
    }

    refreshData() {
        // this.closeDetail()
        this.props.permissiongroups.fetchList()
    }

    hasPerm(perm: string): boolean {
        if (this.scopes)
            return !!this.scopes[perm] || !!this.scopes['*:*']
        else if (this.props.userinfo.details) {
            this.scopes = convertScopesArraytoMap(this.props.userinfo.details.scope)
            return !!this.scopes[perm] || !!this.scopes['*:*']
        }
        return false
    }

    componentDidUpdate() {
        let gridElement: any = document.querySelector('.acadia-grid-container-col')
        // if(gridElement)gridElement.style.height = window.innerHeight - 180

        setTimeout(function () {
            let item: any = document.querySelector('.not_authorised_message')
            if (item) {
                item.style.display = 'block'
            }
        }, 1000)
    }

    isEnabled(rows: GridAPI.RowNode[]): boolean {
        if (rows.length && rows.length > 0) {
            if (rows.length == 1) {
                if (rows[0].data.enabled) {
                    return rows[0].data.enabled === true
                }
            }
            else {
                let countEnabled = 0
                let countDisabled = 0
                for (let i = 0; i < rows.length; i++) {
                    if (rows[i].data.enabled) {
                        countEnabled++
                    }
                    else {
                        countDisabled++
                    }
                }
                if (countEnabled > countDisabled) {
                    return true
                }
                else {
                    return false
                }
            }
        }
        return false
    }

    isMyRole(rows: GridAPI.RowNode[]): boolean {
        // console.log(rows)
        return false
    }

    deleteItems(items: GridAPI.RowNode[]) {
        // console.log(items)
        let obj: PermissionGroupList = { permissionGroups: [] }
        let names: string[] = []
        for (let i = 0; i < items.length; i++) {
            if (!items[i].data.orgLevel) {
                let deleteRole: PermissionGroupDelete = new PermissionGroupDelete()
                deleteRole._id = items[i].data._id
                obj.permissionGroups.push(deleteRole)
                names.push(items[i].data.name)
            }
        }
        if (names.length > 0) {
            this.props.notifications.showWarning({
                title: 'Delete Permission Group',
                position: 'tc',
                autoDismiss: 0,
                message: `Are you sure you want to delete: ${names.length == 1 ? names[0] : names.join(', ')}`,
                children:
                <div className="notification-action-wrapper">

                    <Button type="secondary" className="aam-notification-action-button"
                        onClick={() => { }}>
                        No
                </Button>
                    <Button className="aam-notification-action-button"
                        onClick={() => {
                            this.props.permissiongroups.deletePermissionGroup(obj)
                        }}>
                        Yes
                </Button>
                </div>
            })
        }
    }

    getActionBarItems() {
        const hasAct = this.hasPerm('manage:permissiongroup:update')
        const hasDelete = this.hasPerm('manage:permissiongroup:delete')
        const hasCreate = this.hasPerm('manage:permissiongroup:create')
        const hasPermissionCreate = this.hasPerm('manage:permission:create')
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
                            isShown: () => true,
                            // buttonType: 'secondary'
                        }
                    ]
                },
                actions: {
                    position: 'right',
                    items: [
                        // {
                        //     name: 'Create a set of test permissions',
                        //     fn: (selectedRows: GridAPI.RowNode[])=>{ 
                        //         this.createStandardPermissions() 
                        //     },
                        //     icon: <i className="fa fa-user-secret"></i>,
                        //     disabled: undefined,
                        //     isShown: ()=>{
                        //         return hasPermissionCreate && (!this.props.permissions.list || this.props.permissions.list.length < 5) && !this.props.userinfo.details.tampid
                        //     },
                        //     buttonType: undefined
                        // },
                        {
                            type: 'icon',
                            iconName: 'pencil-square-o',
                            name: 'Amend Permission Group',
                            fn: (selectedRows: GridAPI.RowNode[]) => {
                                this.editItem(selectedRows)
                            },
                            // icon: <i className="fa fa-pencil-square-o"></i>,
                            disabled: (selectedRows: GridAPI.RowNode[]) => {
                                return selectedRows.length == 0 || selectedRows.length > 1
                            },
                            isShown: () => hasAct
                        },
                        {
                            type: 'icon',
                            iconName: 'trash-o',
                            name: 'Delete Permission Group',
                            fn: (selectedRows: GridAPI.RowNode[]) => {
                                this.deleteItems(selectedRows)
                            },
                            // icon: <i className="fa fa-trash-o"></i>,
                            disabled: (selectedRows: GridAPI.RowNode[]) => {
                                return selectedRows.length == 0 || this.isMyRole(selectedRows)
                            },
                            isShown: () => hasDelete,
                            // buttonType:'red'
                        }
                    ]
                }
            }
        }
        return actions
    }

    createStandardPermissions() {
        let permissions = new Array();
        let scopes = cloneDeep(scopesArray)
        if (this.props.permissions.list && this.props.permissions.list.length > 0) {
            for (let i = 0; i < this.props.permissions.list.length; i++) {
                let index = scopes.indexOf(this.props.permissions.list[i].name)
                if (index != -1) {
                    scopes.splice(index, 1)
                }
            }
        }
        let iterations = 0
        const me = this
        for (let i = 0; i < scopes.length; i++ , iterations++) {
            let perm = new PermissionCreate()
            perm.name = scopes[i]
            perm.description = scopes[i]
            perm.tags = [scopes[i], 'alessio', 'temp', 'auto generated', 'client admin generated']
            permissions.push(perm)
        }
        me.props.permissions.savePermissionsTemp(permissions)
        me.props.permissions.fetchList()
    }


    render(): JSX.Element {
        const hasPerm = this.hasPerm
        const { columnDefs, detailData, showDetail, modalData } = this.state
        const { permissiongroups, search, hasActionBar, modals } = this.props
        const closeDetail = this.closeDetail
        const toggleDetail = this.toggleDetail
        const ModalCloseCallback = this.ModalCloseCallback
        const saveCallback = this.saveCallback
        const refreshData = this.refreshData
        const editItem = hasPerm('manage:permissiongroup:update') ? this.editItem : null
        const enableDisableItem = hasPerm('manage:permissiongroup:update') ? this.enableDisableItem : null
        const openDetail = this.openDetail
        const roleOrgId = this.props.userinfo.details ? this.props.userinfo.details.tampid : null
        const trigger = this.props.permissiongroups.list && this.props.permissiongroups.list.length > 0
        const actions = this.getActionBarItems()
        return (
            <AppShell {...this.props}>
                {hasPerm('manage:permissiongroup:read') ?
                    <div className="alessio">
                        <h1 className="acadia-page_title">Permission Groups</h1>
                        <Row className="landingPage">
                            <Grid
                                columnDefs={columnDefs}
                                rawData={Array.from(permissiongroups.list as any)}
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
                            closeDetailCallback={closeDetail}
                            permissionsLookupObj={this.permissionsLookupObj}>
                        </Detail>
                        <Modal
                            {...this.props as any}
                            isVisible={modals.modals.get(MODALS.PERMISSIONGROUP as any)}
                            saveHandler={saveCallback}
                            closeHandler={ModalCloseCallback}
                            cancelHandler={ModalCloseCallback}
                            data={modalData}
                            hasPermissionPerm={hasPerm('manage:permission:read')}
                        />
                    </div>
                    : <div className="not_authorised_message" >You are not entitled to see permissiongroups information.</div>}
            </AppShell>
        )
    }
}




export const Roles: React.SFC<permissiongroupsProps> = (props: _RoleProps) => <PermissionGroupsComponent {...props} />
