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
    Organization,
    User,
    UserList,
    UserUpdate,
    UserCreate,
    UserDelete,
    UserSendPasswordReset
} from '../../models'
import { convertScopesArraytoMap, ScopesMap } from '../../utils/scopes'
import * as utils from '../../utils/users_index'
import { filterOrganizations } from '../../utils/organizations_index'
import { Grid, GridAPI } from 'common_lib'
import { settings, MODALS } from '../../../app.settings'
import { Detail } from './detail'
import { Modal } from './forms/modal'
import { CheckboxPanel, CheckboxPanelEntry } from '../../components/checkbox_panel'
import { CommonStores } from 'common_lib'
import { AppShellProps } from '../../models'

import { Stores, StoreNames, UsersStore, OrganizationsStore, AccessGroupsStore, PasswordPoliciesStore, UserReportParameterType } from '../../stores';

import './index.css'

export interface UsersProps extends AppShellProps {
    hasActionBar?: boolean
}

export interface UsersState {
    columnDefs: Array<GridAPI.ColDef>
    detailData: User
    showDetail: boolean
    modalData: User
    selectedOrgId?: string
    orgsInFilter?: Array<Organization>
    disableUserOnPwdResetEmail?: boolean
    showReportCheckboxPane: boolean
}

interface UsersConnectedProps extends Partial<Stores> {
    users: UsersStore
    search: CommonStores.SearchStore
    modals: CommonStores.ModalStore
    organizations: OrganizationsStore
    userinfo: CommonStores.UserInfoStore
    notifications: CommonStores.NotificationStore
    accessgroups: AccessGroupsStore
    passwordpolicies: PasswordPoliciesStore
}

type _UserProps = UsersProps & UsersConnectedProps

@inject(StoreNames.users,
    CommonStores.CommonStoreNames.search,
    CommonStores.CommonStoreNames.modals,
    StoreNames.organizations,
    StoreNames.accessgroups,
    StoreNames.passwordpolicies,
    CommonStores.CommonStoreNames.notifications,
    CommonStores.CommonStoreNames.userinfo)
@observer // must be after @inject
class UsersComponent extends React.Component<_UserProps, UsersState>{

    public static defaultProps: Partial<UsersProps> = {
        hasActionBar: true
    }

    private scopes: ScopesMap
    private loggedUserName: string
    private tampId: string
    constructor(props: _UserProps) {
        super(props)
        bind(this)
        this.state = {
            showReportCheckboxPane: false,
            detailData: new User(),
            modalData: utils.initUserIfBlank(),
            showDetail: false,
            selectedOrgId: this.tampId,
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
                    headerName: "Username",
                    field: "username",
                    minWidth: 130,
                    enableRowGroup: true,
                }, {
                    headerName: "User ID",
                    field: "_id",
                    minWidth: 130,
                    enableRowGroup: true,
                    hide: true,
                    filter: 'text'
                }, {
                    headerName: "Organization ID",
                    field: "organizationId",
                    minWidth: 130,
                    enableRowGroup: true,
                    hide: true,
                    filter: 'text'
                }, {
                    headerName: "User AMP ID",
                    field: "userAmpId",
                    minWidth: 130,
                    enableRowGroup: true,
                    hide: true
                }, {
                    headerName: "User Type",
                    field: "userType",
                    minWidth: 130,
                    enableRowGroup: true
                }, {
                    headerName: "Created",
                    field: "created",
                    minWidth: 130,
                    enableRowGroup: false,
                    cellRenderer: (item: GridAPI.RowNode) => getLocalizedDate(item.data.created, true),
                    filter: 'date',
                    hide: true,
                    cellClass: "textAlignRight"
                }, {
                    headerName: "Modified",
                    field: "modified",
                    minWidth: 130,
                    cellRenderer: (item: GridAPI.RowNode) => getLocalizedDate(item.data.modified, true),
                    filter: 'date',
                    hide: true,
                    enableRowGroup: false,
                    cellClass: "textAlignRight"
                }, {
                    headerName: "Description",
                    field: "description",
                    minWidth: 130,
                    hide: true
                }, {
                    headerName: "Realm",
                    field: "realm",
                    minWidth: 130,
                    enableRowGroup: true
                }, {
                    //     headerName: "Scopes",
                    //     field: "scopes",
                    //     minWidth: 130,
                    //     enableRowGroup: true,
                    //     hide: true
                    //     //cellRenderer: (item:GridAPI.RowNode)=>utils.renderScopes([], item), //TODO
                    // }, {
                    headerName: "Organization",
                    field: "organizationName",
                    minWidth: 130,
                    enableRowGroup: true
                }, {
                    headerName: "Full Name",
                    field: "name",
                    minWidth: 130,
                    enableRowGroup: true
                }, {
                    headerName: "Email",
                    field: "email",
                    minWidth: 130,
                    enableRowGroup: true
                }, {
                    headerName: "Organization AMP ID",
                    field: "organizationAmpId",
                    minWidth: 150,
                    enableRowGroup: true,
                    hide: true
                }, {
                    headerName: "Trading Party AMP ID",
                    field: "tradingPartyAmpId",
                    minWidth: 150,
                    enableRowGroup: true,
                    hide: true
                }, {
                    headerName: "Password Policy",
                    field: "passwordPolicyName",
                    minWidth: 130,
                    enableRowGroup: true,
                    hide: true
                }, {
                    headerName: "Access Group Name",
                    field: "accessGroupName",
                    minWidth: 130,
                    enableRowGroup: true,
                    hide: true
                }, {
                    headerName: "Access Group ID",
                    field: "accessGroupId",
                    minWidth: 130,
                    enableRowGroup: true,
                    hide: true
                }, {
                    headerName: "Status",
                    field: "status",
                    minWidth: 100,
                    cellRenderer: (item: any) => {
                        return utils.renderStatusIcon({ value: item.data.enabled, locked: item.data.failedLoginLockout })
                    },
                    cellStyle: { 'font-size': '20px' },
                    enableRowGroup: true,
                    cellClass: "textAlignCenter",
                }
            ]
        }
    }

    hasOrgFilter(): boolean {
        if (this.props.organizations.list && this.props.userinfo.details) {
            const tampId = this.props.userinfo.details.tampid
            let myOrg: any = this.props.organizations.list.filter(function (item) {
                return item._id === tampId
            })
            return !this.props.userinfo.details.tampid || (myOrg.length && myOrg.length > 0 && myOrg[0].serviceProvider)
        }
        return true
    }

    componentWillMount() {
        this.props.userinfo.fetchDetails(this.props.userInfoURL)
        // this.props.notifications.clearNotifications()
        if (!this.props.organizations.list) this.props.organizations.fetchList(true)
        // if(!this.props.accessgroups.list) this.props.accessgroups.fetchList(true)
        // if(!this.props.passwordpolicies.list) this.props.passwordpolicies.fetchList(true)
        // const tampId = this.props.userinfo.details? this.props.userinfo.details.tampid : null
        // if(!this.props.users.list) this.props.users.fetchList(tampId, true)
        // if(!this.props.userinfo.details) this.props.userinfo.fetchDetails(this.props.userInfoURL)
        // this.populateAdditionalInfo()
    }

    componentWillReact() {
        this.props.notifications.clearNotifications()
        if (this.props.userinfo.details) {
            this.tampId = this.props.userinfo.details.tampid
            this.scopes = convertScopesArraytoMap(this.props.userinfo.details.scope)
            const me = this
            // setTimeout(function () {
            if (me.hasPerm('manage:resourceowner:read') && (!me.props.users.list && !me.props.users.isLoading) || me.props.users.status == 'mutated') {
                me.props.users.fetchList(me.state.selectedOrgId || me.tampId)
            }
            // })
        }
        else {
            this.props.userinfo.fetchDetails(this.props.userInfoURL)
        }

        if (!this.props.organizations.list && !this.props.organizations.isLoading) {
            this.props.organizations.fetchList(true)
        }
        if (!this.props.accessgroups.list && !this.props.accessgroups.isLoading) {
            this.props.accessgroups.fetchList(true)
        }
        if (!this.props.passwordpolicies.list && !this.props.passwordpolicies.isLoading) {
            this.props.passwordpolicies.fetchList(true)
        }
        this.populateAdditionalInfo()
    }

    populateAdditionalInfo() {
        if (this.props.users.list && this.props.organizations.list && this.props.organizations.list.length > 0) {
            this.props.users.list.map((user: any) => {
                if (user.organizationId) {
                    const org = this.props.organizations.list!.filter((org) => {
                        return org._id === user.organizationId
                    })[0]
                    if (org) {
                        user.organizationName = org.name
                        user.organizationAmpId = org.organizationAmpId
                        user.tradingPartyAmpId = org.tradingPartyAmpId
                    }
                }
            })
        }
        if (this.props.users.list && this.props.accessgroups.list && this.props.accessgroups.list.length > 0) {
            this.props.users.list.map((user: any) => {
                if (user.accessGroupId) {
                    user.accessGroupName = this.props.accessgroups.list!.filter((accessgroup) => {
                        return accessgroup._id === user.accessGroupId
                    })[0].name
                }
            })
        }
        if (this.props.users.list && this.props.passwordpolicies.list && this.props.passwordpolicies.list.length > 0) {
            this.props.users.list.map((user: any) => {
                if (user.passwordPolicyId) {
                    user.passwordPolicyName = this.props.passwordpolicies.list!.filter((pwp) => {
                        return pwp._id === user.passwordPolicyId
                    })[0].name
                }
            })
        }
        if (!this.state.orgsInFilter && this.props.accessgroups.list && this.props.accessgroups.list.length > 0 && this.props.organizations.list && this.props.organizations.list.length > 0) {
            const orgsInFilter = filterOrganizations(this.props.organizations.list, this.props.accessgroups.list)
            this.setState({
                orgsInFilter
            })
        }
        if (this.state.showDetail && this.props.users.list && this.props.users.list.length > 0) {
            const newDataItem = this.props.users.list.filter((item: User) => {
                return item._id === this.state.detailData._id
            })[0] as User
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
        this.setState({
            showDetail: false,
            detailData: utils.initUserIfBlank()
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

    ModalCloseCallback(): void {
        this.setState({
            modalData: utils.initUserIfBlank()
        })
        this.props.modals.hideModal(MODALS.USER)
    }

    editItem(items: GridAPI.RowNode[]) {
        let user = items[0].data
        this.setState({
            modalData: user
        })
        this.props.modals.showModal(MODALS.USER, true)
    }

    copyUser(items: GridAPI.RowNode[]) {
        let copiedUser: any = new UserCreate()
        for (let key of Object.keys(copiedUser)) {
            copiedUser[key] = items[0].data[key]
        }
        copiedUser.name = ''
        copiedUser.email = ''
        copiedUser.username = ''
        copiedUser.description = ''
        copiedUser.enabled = false
        this.setState({
            modalData: copiedUser as any
        })
        this.props.modals.showModal(MODALS.USER, true)
    }

    saveCallback(): void {
        //this.closeDetail()
        this.setState({
            modalData: utils.initUserIfBlank()
        })
    }

    refreshData() {
        // this.closeDetail()
        this.props.users.fetchList(this.props.users.currentOrgId)
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
        // if(gridElement)gridElement.style.height = window.innerHeight - 170

        setTimeout(function () {
            let item: any = document.querySelector('.not_authorised_message')
            if (item) {
                item.style.display = 'block'
            }
        }, 1000)
        const userDisplay = this.props.userinfo.userDisplay
        this.loggedUserName = userDisplay && userDisplay.length ? this.props.userinfo.userDisplay.substring(0, this.props.userinfo.userDisplay.indexOf('@')) : ''
    }

    sendPasswordReset(rows: GridAPI.RowNode[]) {
        let obj: UserList = { resourceOwners: [] }
        for (let j = 0; j < rows.length; j++) {
            let item: UserSendPasswordReset = new UserSendPasswordReset()
            item._id = rows[j].data._id
            item.email = rows[j].data.email
            obj.resourceOwners.push(item)
        }
        const user: any = obj.resourceOwners[0]
        const uid = this.props.notifications.showWarning({
            title: 'Password Reset',
            position: 'tc',
            //   dismissible: false,
            autoDismiss: 0,
            message: `Are you sure you want to send a password reset email to: ${user.email}`,
            children:
            <div className="notification-action-wrapper">
                <Button type="secondary" className="aam-notification-action-button"
                    onClick={(item: any) => {
                        {/*let notification: any = this.props.notifications.getNotification(uid)
                          if(notification){
                              notification.remove()
                          }*/}
                    }}>
                    CANCEL
              </Button>
                <Button type="primary" className="aam-notification-action-button"
                    onClick={() => this.props.users.pwReset(obj)}>
                    SEND
              </Button>
                <Button type="primary" className="aam-notification-action-button"
                    onClick={() => {
                        user.enabled = user.enabled === undefined ? false : !user.enabled
                        this.props.users.pwReset(obj)
                    }}>
                    SEND AND DISABLE USER
              </Button>
            </div>
        })

    }

    enableDisableItem(rows: GridAPI.RowNode[]) {
        let obj: UserList = { resourceOwners: [] }
        if (rows.length && rows.length > 0) {
            if (rows.length == 1) {
                const item = this.getUpdateEntity(rows[0].data)
                obj.resourceOwners.push({ ...item, enabled: !item.enabled })
                this.props.users.updateUsers(obj)
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
                    for (let j = 0; j < rows.length; j++) {
                        if (rows[j].data.enabled && rows[j].data.username != this.loggedUserName) {
                            let updateEntity: UserUpdate = this.getUpdateEntity(rows[j].data)
                            obj.resourceOwners.push({ ...updateEntity, enabled: false })
                        }
                    }
                }
                else {
                    for (let j = 0; j < rows.length; j++) {
                        if (!rows[j].data.enabled && rows[j].data.username != this.loggedUserName) {
                            let updateEntity: UserUpdate = this.getUpdateEntity(rows[j].data)
                            obj.resourceOwners.push({ ...updateEntity, enabled: true })
                        }
                    }
                }
                this.props.users.updateUsers(obj)
            }
        }
        return false
    }

    unlockItems(rows: GridAPI.RowNode[]) {
        let obj: UserList = { resourceOwners: [] }
        if (rows.length && rows.length > 0) {
            for (let j = 0; j < rows.length; j++) {
                if (rows[j].data.enabled && rows[j].data.failedLoginLockout) {
                    obj.resourceOwners.push({ _id: rows[j].data._id } as any)
                }
            }
            this.props.users.unlockUsers(obj)
        }
        return false
    }

    deleteItems(items: GridAPI.RowNode[]) {
        let obj: UserList = { resourceOwners: [] }
        let names: string[] = []
        // const loggedUserName = this.props.userinfo.userDisplay.substring(0, this.props.userinfo.userDisplay.indexOf('@'))
        for (let i = 0; i < items.length; i++) {
            if (items[i].data.username != this.loggedUserName) {
                let deleteAG: UserDelete = new UserDelete()
                deleteAG._id = items[i].data._id
                obj.resourceOwners.push(deleteAG)
                names.push(items[i].data.name)
            }
        }
        if (names.length > 0) {
            this.props.notifications.showWarning({
                title: 'Delete User',
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
                        onClick={() => this.props.users.deleteUser(obj)}>
                        Yes
                </Button>
                </div>
            })
        }
        else {
            this.props.notifications.showError({
                title: 'Error',
                position: 'tc',
                autoDismiss: 3,
                message: `You cannot delete yourself`
            })
        }
    }

    getUpdateEntity(item: any) {
        let updateEntity: any = new UserUpdate()
        for (let key of Object.keys(updateEntity)) {
            updateEntity[key] = item[key]
        }
        return updateEntity
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

    isLocked(rows: GridAPI.RowNode[]): boolean {
        if (rows.length && rows.length > 0) {
            for (let i = 0; i < rows.length; i++) {
                if (rows[i].data.enabled && rows[i].data.failedLoginLockout) {
                    return true
                }
            }
        }
        return false
    }

    renderPanel() {
        const { showReportCheckboxPane } = this.state

        const checkboxes: CheckboxPanelEntry[] = [
            { label: 'Business', value: 'Business', checked: true, required: false },
            { label: 'Service', value: 'Service', checked: true },
            { label: 'Support', value: 'Support', checked: true },
            { label: 'Unspecified', value: 'MISSING', checked: true, }

            // { label: 'alessio is the besttest of the best', value: 'MISSING' },
            // { label: 'zxc', value: 'MISSING' },
            // { label: 'lallero', value: 'MISSING' },
            // { label: 'zv', value: 'MISSING' },

            // { label: 'rgh', value: 'MISSING' },
            // { label: 'drg', value: 'MISSING' },
            // { label: 'zx', value: 'MISSING' },
            // { label: 'alessio is the best ', value: 'MISSING' },

            // { label: 'dfhgsdf', value: 'MISSING' },
            // { label: 'sdfhs', value: 'MISSING' },
            // { label: 'tghs is a very long one that I am not sure how it is going to be rendered', value: 'MISSING' },
            // { label: 'xzvczsdgf', value: 'lalldero' },
            // { label: 'zxc', value: 'MISSING' },
            // { label: 'Unspecified', value: 'MISSING' },
            // { label: 'zxczxc', value: 'MISSING' },
            // { label: 'Unspecified', value: 'MISSING' },
            // { label: 'sdfbgsdf', value: 'MISSING' },
            // { label: 'Unspecified', value: 'MISSING' },
            // { label: 'zxcvsdthj', value: 'MISSING' },
            // { label: 'Unspecified', value: 'MISSING' },
            // { label: 'ghjcified', value: 'MISSING' },
            // { label: 'Unspecified:::', value: 'MISSING' },
            // { label: 'sdfgsdfg', value: 'MISSING' },
            // { label: 'b,h', value: 'MISSING' },
            // { label: 'I could realy pass here anything HAHAHAHAHAHAHAHA', value: 'MISSING' },
            // { label: 'ftvjbr', value: 'MISSING' },
            // { label: 'Unspevtyjr rtyjvrtcified', value: 'MISSING' },
            // { label: 'Unspecvrty rt yjy rtjyrtyj rjutuyj ryu ified', value: 'MISSING' },
            // { label: 'Unspecit yh tfied', value: 'MISSING' },
            // { label: 'Unspecit yh tfied', value: 'MISSING' },
            // { label: 'dfg yh tfied', value: 'MISSING' },
            // { label: 'Unspecit yh tfied', value: 'MISSING' },
            // { label: 'fgh yh tfied', value: 'MISSING' },
            // { label: 'fgh yh tfied', value: 'MISSING' },
            // { label: 'fgh yh tfied', value: 'MISSING' },
            // { label: 'Unspecit yh tfied', value: 'MISSING' },
            // { label: 'bn yh tfied', value: 'MISSING' },
            // { label: 'sdfhs yh tfied', value: 'MISSING' },
            // { label: ' vbngjhg yh tfied', value: 'MISSING' },
            // { label: 'rghfghfghfgh yh tfied', value: 'MISSING' },
        ]

        const validateFn = (array: CheckboxPanelEntry[], title: string) => {
            if (array && array.length > 0) {
                const isConfirmEnabled = array.reduce((lastValue: boolean, item) => {
                    return lastValue || item.checked
                }, false)
                return isConfirmEnabled || false
            }
            return false
        }

        const cancelFn = (array: CheckboxPanelEntry[], title: string) => {
            //TODO:: REMOVE SETTIMEOUT AND FIND OUT WHY setState is not working here (maybe the closure won't preserve the context for some reason)
            setTimeout(() => this.setState({ showReportCheckboxPane: false }))
        }

        const acceptFn = (array: CheckboxPanelEntry[], title: string) => {
            //TODO:: REMOVE SETTIMEOUT AND FIND OUT WHY setState is not working here (maybe the closure won't preserve the context for some reason)
            setTimeout(() => this.setState({ showReportCheckboxPane: false }))
            let argumentsArray: UserReportParameterType[] = []
            console.log(this.props.users.isValidUserReportParameterType('suca'))
            if (array && array.length) {
                array.map((item) => {
                    item.checked && this.props.users.isValidUserReportParameterType(item.value) ? argumentsArray.push(item.value) : null
                })
            }
            this.props.users.getUsersReport(this.props.userinfo.details.tampid || this.state.selectedOrgId, argumentsArray)
        }


        return (
            <CheckboxPanel
                title="Included User Types" //mandatory
                items={checkboxes} //mandatory
                itemsPerRow={2} //optional, defaults to 2
                show={showReportCheckboxPane} //mandatory
                allowDuplicates={false} //optional, defaults to FALSE
                persistSelection={false} //optional, defaults to FALSE
                cancelFn={cancelFn} //mandatory (with optional params pointing to internal state objects) this coud popup a confirmation dialog in other circumstances
                validateFn={validateFn} //mandatory (with optional params pointing to internal state objects) this coud popup an error dialog/pane/inlinebox/errorBox/React16-ErrorBoundary etc
                acceptFn={acceptFn} /> //mandatory (with optional params pointing to internal state objects) 
        )
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
                        {
                            type: 'icon',
                            iconName: 'file-excel-o',
                            name: 'Extract Users Report',
                            fn: (selectedRows: GridAPI.RowNode[]) => {
                                this.setState({ showReportCheckboxPane: true })
                            },
                            // icon: <i className="fa fa-file-excel-o"></i>,
                            disabled: (selectedRows: GridAPI.RowNode[]) => {
                                return false
                            },
                            isShown: (selectedRows: GridAPI.RowNode[]) => {
                                return hasReport && (this.props.userinfo.details.tampid || this.state.selectedOrgId)
                            },
                            child: this.renderPanel()
                            // buttonType:'secondary'
                        }
                    ]
                },
                actions: {
                    position: 'right',
                    items: [
                        {
                            type: 'icon',
                            iconName: 'pencil-square-o',
                            name: 'Amend User',
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
                            iconName: 'files-o',
                            name: 'Copy User',
                            fn: (selectedRows: GridAPI.RowNode[]) => {
                                this.copyUser(selectedRows)
                            },
                            // icon: <i className="fa fa-files-o"></i>,
                            disabled: (selectedRows: GridAPI.RowNode[]) => {
                                return selectedRows.length == 0 || selectedRows.length > 1
                            },
                            isShown: () => hasCreate
                        },
                        {
                            type: 'icon',
                            iconName: 'unlock',
                            name: 'Unlock User',
                            fn: (selectedRows: GridAPI.RowNode[]) => {
                                this.unlockItems(selectedRows)
                            },
                            // icon: <i className="fa fa-unlock"></i>,
                            disabled: (selectedRows: GridAPI.RowNode[]) => {
                                return selectedRows.length == 0
                            },
                            isShown: (selectedRows: GridAPI.RowNode[]) => {
                                return hasAct && this.isLocked(selectedRows)
                            }
                        },
                        {
                            type: 'icon',
                            iconName: 'check-circle-o',
                            name: 'Enable User',
                            fn: (selectedRows: GridAPI.RowNode[]) => {
                                this.enableDisableItem(selectedRows)
                            },
                            // icon: <i className="fa fa-check-circle-o"></i>,
                            disabled: (selectedRows: GridAPI.RowNode[]) => {
                                return selectedRows.length == 0
                            },
                            isShown: (selectedRows: GridAPI.RowNode[]) => {
                                return hasAct && !this.isEnabled(selectedRows)
                            }
                        },
                        {
                            type: 'icon',
                            iconName: 'ban',
                            name: 'Disable User',
                            fn: (selectedRows: GridAPI.RowNode[]) => {
                                this.enableDisableItem(selectedRows)
                            },
                            icon: <i className="fa fa-ban"></i>,
                            disabled: (selectedRows: GridAPI.RowNode[]) => {
                                return selectedRows.length == 0 || (selectedRows.length == 1 && selectedRows[0].data.username == this.loggedUserName)
                            },
                            isShown: (selectedRows: GridAPI.RowNode[]) => {
                                return (hasAct && this.isEnabled(selectedRows)) || (selectedRows.length == 1 && selectedRows[0].data.username == this.loggedUserName)
                            },
                            // buttonType:'red'
                        },
                        {
                            type: 'icon',
                            iconName: 'trash-o',
                            name: 'Delete User',
                            fn: (selectedRows: GridAPI.RowNode[]) => {
                                this.deleteItems(selectedRows)
                            },
                            // icon: <i className="fa fa-trash-o"></i>,
                            disabled: (selectedRows: GridAPI.RowNode[]) => {
                                return selectedRows.length == 0 || (selectedRows.length == 1 && selectedRows[0].data.username == this.loggedUserName)
                            },
                            isShown: () => hasDelete,
                            buttonType: 'red'
                        },
                        {
                            type: 'icon',
                            iconName: 'key',
                            name: 'Send Password Reset',
                            fn: (selectedRows: GridAPI.RowNode[]) => {
                                this.sendPasswordReset(selectedRows)
                            },
                            icon: <i className="fa fa-key"></i>,
                            disabled: (selectedRows: GridAPI.RowNode[]) => {
                                return selectedRows.length == 0 || selectedRows.length > 1
                            },
                            isShown: () => hasAct
                        }
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
                        //     currentValue: this.state.selectedOrgId || this.props.users.currentOrgId,
                        //     error: undefined
                        // }
                    ]
                }
            }
        }
        return actions
    }

    handleChangeOrg(value: string) {
        this.props.users.fetchList(value)
        this.setState({ selectedOrgId: value })
    }

    render(): JSX.Element {
        const hasPerm = this.hasPerm
        const { columnDefs, detailData, showDetail, modalData, orgsInFilter, showReportCheckboxPane } = this.state
        const { users, search, hasActionBar, modals } = this.props
        const userlist = users.list
        const closeDetail = this.closeDetail
        const toggleDetail = this.toggleDetail
        const ModalCloseCallback = this.ModalCloseCallback
        const saveCallback = this.saveCallback
        const openDetail = this.openDetail
        const userOrgId = this.props.userinfo.details ? this.props.userinfo.details.tampid : null
        const usersLength = this.props.users.list ? this.props.users.list.length : 0
        const orgLength = this.props.organizations.list ? this.props.organizations.list.length : 0
        const status = this.props.users.status
        const actions = this.getActionBarItems()
        const hasOrgFilter = this.hasOrgFilter
        let options = Array.from(orgsInFilter as any || [])
        options.splice(0, 0, { _id: '', name: '(none)' })




        return (
            <AppShell {...this.props} >
                {hasPerm('manage:resourceowner:read') ?
                    <div className="alessio">
                        <h1 className="acadia-page_title">Users</h1>
                        {hasOrgFilter() ?
                            <div className="acadia-filter-top">
                                <AutoComplete
                                    label='Choose Organization'
                                    items={options}
                                    valueIndex='_id'
                                    dataIndex='name'
                                    value={this.state.selectedOrgId || this.props.users.currentOrgId}
                                    onChange={
                                        (value: any) => {
                                            closeDetail()
                                            if (value == "" && this.tampId) {
                                                this.handleChangeOrg(this.tampId)
                                            }
                                            else if (value == "") {
                                                this.handleChangeOrg("")
                                            }
                                            else {
                                                //check the value is an orgId
                                                const me = this
                                                let myOrg: any
                                                if (me.props.organizations.list) {
                                                    myOrg = me.props.organizations.list.filter(function (item) {
                                                        return item._id === value
                                                    })
                                                }
                                                if (myOrg && myOrg.length > 0) {
                                                    this.handleChangeOrg(value)
                                                }
                                            }
                                        }
                                    }
                                />
                            </div>
                            : null}

                        <Row className="landingPage">
                            <Grid
                                columnDefs={columnDefs}
                                rawData={Array.from(users.list as any)}
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
                        <Modal
                            {...this.props as any}
                            isVisible={modals.modals.get(MODALS.USER as any)}
                            saveHandler={saveCallback}
                            closeHandler={ModalCloseCallback}
                            cancelHandler={ModalCloseCallback}
                            data={modalData}
                        />
                    </div>
                    : <div className="not_authorised_message" >You are not entitled to see Users information.</div>}
            </AppShell>
        )
    }
}

export const Users: React.SFC<UsersProps> = (props: _UserProps) => <UsersComponent {...props} />
