/**
 * Created by alessiofimognari on 18/05/2017.
 */
import * as React from 'react'
import { observer, inject } from 'mobx-react';
// import cloneDeep from 'lodash/cloneDeep'
import {
    Row,
    Col,
    // Button,
    Tag,
    Select,
    ErrorBox,
    DraggableModal,
    bind,
    Icon,
    AcadiaAutoComplete as AutoComplete
} from 'common_lib'
import {convertScopesArraytoMap, ScopesMap} from '../../../utils/scopes'
import {Textfield, Checkbox} from 'react-mdl'
// import { AutoComplete } from 'react-mdl-extra';
import {
    User,
    UserCreate,
    UserUpdate,
    PermissionGroup,
    Organization
} from '../../../models'
import { 
    Stores, 
    StoreNames, 
    UsersStore, 
    CommonStores, 
    AccessGroupsStore, 
    PasswordPoliciesStore, 
    OrganizationsStore,
    PermissionGroupsStore 
} from '../../../stores'
import * as utils from '../../../utils/users_index'
import {filterOrganizations} from '../../../utils/organizations_index'
import {AccessGroupTree} from '../../../components/accessgroup_treeview'
import {disableAutofill} from '../../../utils/disable_chrome_autofill'
import {DnDTwoLists, DnDProps, DnDState} from '../../../components/dnd_two_lists'

type DnDType = new () => DnDTwoLists<PermissionGroup>
const DnD = DnDTwoLists as DnDType


/* Interfaces and Types */
export interface ModalProps {
    isVisible?: boolean
    data?: User
    saveHandler?: ()=>void
    cancelHandler?: ()=>void
    closeHandler?: ()=>void
    organizations: OrganizationsStore
    userinfo: CommonStores.UserInfoStore
}

export interface ModalState{
    user: User
    activeTab: number
    roles: PermissionGroup[]
    sourceRoles: PermissionGroup[]
    sourceDelegations: PermissionGroup[]
    orgs?: Array<Organization>
    delegations?: Array<PermissionGroup>
}

/* Store Props Interface */
export interface ModalConnectedProps extends Partial<Stores> {
    users: UsersStore
    accessgroups: AccessGroupsStore
    passwordpolicies: PasswordPoliciesStore
    errors: CommonStores.ErrorStore
    permissiongroups: PermissionGroupsStore
}


type _ModalProps = ModalProps & ModalConnectedProps

@inject(CommonStores.CommonStoreNames.errors, StoreNames.accessgroups, StoreNames.passwordpolicies, StoreNames.organizations, StoreNames.permissiongroups)
@observer // must be after @inject
class MyModalComponent extends React.Component<_ModalProps, ModalState> {
    private readonly ERROR_ID = 'USER_FORM'
    private scopes: ScopesMap
    constructor(props: _ModalProps) {
        super(props)
        bind(this)
        this.state = {
            user: utils.initUserIfBlank(props.data),//in case we're creating a new user
            activeTab: 1,
            roles: [],
            delegations: [],
            sourceDelegations: this.props.permissiongroups.list as PermissionGroup[],
            sourceRoles: this.props.permissiongroups.list as PermissionGroup[]
        }
    }

    componentWillMount() {
        if(!this.props.accessgroups.list) this.props.accessgroups.fetchList(true)
        if(!this.props.passwordpolicies.list) this.props.passwordpolicies.fetchList(true)
        if(!this.props.permissiongroups.list && this.hasPerm('manage:permissiongroup:read')) this.props.permissiongroups.fetchList(true)
    }

    componentDidMount(){
        this.initModal(this.props.data)
    }

    componentWillReact(){
        disableAutofill()
    }

    componentWillReceiveProps(nextProps: _ModalProps, nextState: ModalState) {
        if (nextProps.isVisible && nextProps.isVisible === !this.props.isVisible) {
            this.props.errors.clearValidation()
            this.initModal(nextProps.data)
            this.setState({
                activeTab: 1
            })
        }
    } 

    initModal(data?: User){
        let tempUser = utils.initUserIfBlank(data)
        let roles: PermissionGroup[] = []
        let delegations: PermissionGroup[] = []
        if (tempUser.accessGroupId){
            this.handleChangeAccessGroup(tempUser, tempUser.accessGroupId)
        }
        else if (tempUser.organizationId){
            this.handleChangeOrganization(tempUser, tempUser.organizationId)
        }
        //use the user's default org
        else if(this.props.organizations.list && this.props.userinfo.details && this.props.userinfo.details.tampid){
            this.handleChangeOrganization(tempUser, this.props.userinfo!.details.tampid)
        }
        //otherwise the first one on the list
        else if(this.props.organizations.list && this.props.organizations.list.length >0 && this.props.organizations.list[0]){
            this.handleChangeOrganization(tempUser, this.props.organizations.list[0]._id)
        }
        if(tempUser.passwordPolicyId){
            this.handleChangePasswordPolicy(tempUser, tempUser.passwordPolicyId)
        }
        else if(this.props.passwordpolicies.list && this.props.passwordpolicies.list.length >0 && this.props.passwordpolicies.list[0]){
            this.handleChangePasswordPolicy(tempUser, this.props.passwordpolicies.list[0]._id)
        }
        if(tempUser.permissionGroupIds && tempUser.permissionGroupIds.length > 0 && this.props.permissiongroups.list){
            let sourceRoles: any[] = this.props.permissiongroups.list.filter((item:PermissionGroup)=>{
                const isInArray = tempUser.permissionGroupIds!.indexOf(item._id) != -1
                if(isInArray){
                    roles.push(item)
                }
                return !isInArray
            })
            this.setState({
                roles,
                sourceRoles
            })
        }
        else{
            this.setState({
                roles: [],
                sourceRoles: this.props.permissiongroups.list as PermissionGroup[]
            })
        }
        if(tempUser.permissionGroupDelegationIds && tempUser.permissionGroupDelegationIds.length > 0 && this.props.permissiongroups.list){
            let sourceDelegations: any[] = this.props.permissiongroups.list.filter((item:PermissionGroup)=>{
                const isInArray = tempUser.permissionGroupDelegationIds!.indexOf(item._id) != -1
                if(isInArray){
                    delegations.push(item)
                }
                return !isInArray
            })
            this.setState({
                delegations,
                sourceDelegations
            })
        }
        else{
            this.setState({
                delegations: [],
                sourceDelegations: this.props.permissiongroups.list as PermissionGroup[]
            })
        }
        if(this.props.accessgroups.list && this.props.accessgroups.list.length > 0 && this.props.organizations.list && this.props.organizations.list.length > 0){
            const orgs = filterOrganizations(this.props.organizations.list, this.props.accessgroups.list)
            this.setState({
                orgs
            })
        }
        
        this.handleChange(tempUser)
    }

    handleChange(user:User):void{
        this.props.errors.clearValidation()
        this.setState({user})
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
    
    handleChangeAccessGroup(user: User, accessGroupId?: string){
        if(accessGroupId){
            if(this.props.accessgroups.list){
                user.accessGroupId =  accessGroupId
                user.accessGroupName = this.props.accessgroups.list.filter(
                    (item)=>{
                        return item._id == accessGroupId
                    })[0].name
                //call the service to retrieve the accessgroups
                this.props.accessgroups.fetchExpandedDetails(accessGroupId, true)
            }
        }
        else{
            this.props.accessgroups.expandedDetails = null
            this.setState({})
        }
    }

    handleChangeOrganization(user: User, orgId: string){
        if(this.props.organizations.list){
            user.organizationId =  orgId
            let org = this.props.organizations.list.filter(
                (item)=>{
                    return item._id == orgId
                })[0]
            user.organizationName = org? org.name : undefined
            const accessGroupObj = this.props.accessgroups.list? this.props.accessgroups.list.filter((item)=>{
                return item.organizationId == orgId
            }): undefined
            if(accessGroupObj && accessGroupObj.length > 0){
                this.handleChangeAccessGroup(user, accessGroupObj[0]._id )
            }

        }
    }

    handleChangePasswordPolicy(user: User, passwordPolicyId: string){
        if(this.props.passwordpolicies.list){
            user.passwordPolicyId =  passwordPolicyId
            user.passwordPolicyName = this.props.passwordpolicies.list.filter(
                (item)=>{
                    return item._id == passwordPolicyId
                })[0].name
        }
    }
    
    validateEmail(email: string) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    save() {
        const me: any = this
        console.log(this.state.user)
        // if (!this.state.user.userType || this.state.user.userType === '') {
        //     const error = {
        //         code: this.ERROR_ID,
        //         path: '',
        //         field_name: '/users[0]/userType', //TODO: please define based on API response's validation error
        //         message: 'User Type is mandatory and must be provided.'
        //     }
        //     this.props.errors.raiseValidationError(this.ERROR_ID, [error])
        //     return false
        // }
        if (!this.state.user.organizationId || this.state.user.organizationId === '') {
            const error = {
                code: this.ERROR_ID,
                path: '',
                field_name: '/users[0]/organization', //TODO: please define based on API response's validation error
                message: 'Organization is mandatory and must be provided.'
            }
            this.props.errors.raiseValidationError(this.ERROR_ID, [error])
            return false
        }
        if (!this.state.user.username || this.state.user.username.trim() === '') {
            const error = {
                code: this.ERROR_ID,
                path: '',
                field_name: '/users[0]/username', //TODO: please define based on API response's validation error
                message: 'Username is mandatory and must be provided.'
            }
            this.props.errors.raiseValidationError(this.ERROR_ID, [error])
            return false
        }
        //  if (this.state.user.username.indexOf(' ')!= -1) {
        //     const error = {
        //         code: this.ERROR_ID,
        //         path: '',
        //         field_name: '/users[0]/username', //TODO: please define based on API response's validation error
        //         message: 'Username must be provided as a single string of characters.'
        //     }
        //     this.props.errors.raiseValidationError(this.ERROR_ID, [error])
        //     return false
        // }
         if (!this.state.user.email || this.state.user.email === '' || !this.validateEmail(this.state.user.email)) {
            const error = {
                code: this.ERROR_ID,
                path: '',
                field_name: '/users[0]/email', //TODO: please define based on API response's validation error
                message: 'A valid Email is mandatory and must be provided.'
            }
            this.props.errors.raiseValidationError(this.ERROR_ID, [error])
            return false
        }
         if (!this.state.user.name || this.state.user.name === '') {
            const error = {
                code: this.ERROR_ID,
                path: '',
                field_name: '/users[0]/name', //TODO: please define based on API response's validation error
                message: 'Full Name is mandatory and must be provided.'
            }
            this.props.errors.raiseValidationError(this.ERROR_ID, [error])
            return false
        }
            this.props.errors.clearValidation()
            if(!this.state.user._id){
                let createUser: any = new UserCreate()
                for(let key of Object.keys(createUser)){
                    createUser[key] = me.state.user[key]
                }
                //TODO : temp
                createUser.realm = createUser.realm? createUser.realm : this.state.user.organizationName as any
                createUser.scopes = [],
                createUser.permissionGroupIds = this.state.roles.map((item)=>(item._id))
                createUser.permissionGroupDelegationIds = this.state.delegations? this.state.delegations.map((item)=>(item._id)) : []
                createUser.userType = createUser.userType != ''? createUser.userType : null
                //TODO: end temp
                this.props.users.saveUser(createUser as any)
            }
            else{
                let updateUser: any = new UserUpdate()
                for(let key of Object.keys(updateUser)){
                    updateUser[key] = me.state.user[key]
                }
                updateUser.permissionGroupIds = this.state.roles.map((item)=>(item._id))
                updateUser.permissionGroupDelegationIds = this.state.delegations? this.state.delegations.map((item)=>(item._id)) : []
                updateUser.userType = updateUser.userType != ''? updateUser.userType : null
                this.props.users.saveUser(updateUser)
            }
            
            if (this.props.saveHandler) {
                this.props.saveHandler()
            }
            return true
    }

    changeTab(tabIndex: number):void{
        if(tabIndex>0 && tabIndex<5){
            this.setState({
                activeTab: tabIndex
            })
        }
    }

    isSaveButtonEnabled(){
        if(this.state.user.username && this.state.user.username.trim() != '' &&
            this.state.user.email && this.state.user.email != '' &&
            this.state.user.name && this.state.user.name != '' &&
            this.state.user.organizationId && this.state.user.organizationId != '' &&
            this.state.user.passwordPolicyId && this.state.user.passwordPolicyId != '' //&&
            // this.state.user.userType && this.state.user.userType != ''
        ){
            return true
        }
        return false
    }

    enableDisable(){
        let user = this.state.user
        this.setState({
            user: {...user, enabled:!user.enabled}
        })
    }

    assignRole(roles: any){
        this.setState({
            roles
        })
    }

    assignDelegation(delegations: any){
        this.setState({
            delegations
        })
    }

   
    render(): JSX.Element {
        const row = Row, col = Col
        const isVisible = this.props.isVisible || false
        const {user, orgs} = this.state
        const save = this.save
        const formErrors: any = null //errors? errors[this.ERROR_ID] : null
        const changeTab = this.changeTab
        // const orgs = [{id: 1, name: 'Org1'},{id: 2, name: 'Org2'},{id: 3, name: 'Org3'}]
        // const pw = [{id: 1, name: 'Pw1'},{id: 2, name: 'Pw2'},{id: 3, name: 'Pw3'}]
        const handleChange = this.handleChange
        const handleChangePasswordPolicy = this.handleChangePasswordPolicy
        const handleChangeAccessGroup = this.handleChangeAccessGroup
        const errors: any = this.props.errors? this.props.errors.validationErrors.get(this.ERROR_ID):null
        const accessgroups = user.organizationId? (this.props.accessgroups.list? this.props.accessgroups.list.filter((item)=>{
            return item.organizationId == user.organizationId
        }) : []): []
        const passwordpolicies = this.props.passwordpolicies.list
        const expandedAccessGroup = this.props.accessgroups.expandedDetails
        const isSaveButtonEnabled = this.isSaveButtonEnabled
        const handleChangeOrganization = this.handleChangeOrganization
        const enableDisable = this.enableDisable
        const assignRole = this.assignRole
        const assignDelegation = this.assignDelegation
        const userTypes = [{name:'Service'}, {name:'Business'}, {name:"Support"}]
        return (
            <DraggableModal
                {...this.props as any}
                ref="modal"
                title={user._id ? 'AMEND USER' : 'CREATE USER'}
                isVisible={isVisible}
                readOnly={false}
                animation="slide_top"
                enterTimeout={400}
                leaveTimeout={400}
                classNames="user_modal"
                saveHandler={save}
                saveButtonText={'SAVE USER'}
                isSaveButtonEnabled={isSaveButtonEnabled()}
                hideIcons={true}
                disabled={true}

            >
                {isVisible ?
                    <div className="acadia-user-new-form">
                        <div className='acadia-user__form'>
                            <Row className='acadia-form__section-offset'>

                                <Col flex={1} className='acadia-form__section'>
                                    <div className="acadia-vertical-tab-container">
                                        <Row>
                                            <div className={`acadia-vertical-tab acadia-vertical-tab-s ${this.state.activeTab == 1? 'active':''}`} onClick={()=>changeTab(1)}>
                                                <Icon name="id-card"/> 
                                            <span className="acadia-vertical-tab_tab_name">User Details</span> </div>
                                            {errors && this.state.activeTab != 1? <span className="acadia-exclamation_mark-icon"><Icon name="exclamation-circle"/></span> : null}
                                        </Row>
                                        <Row>
                                            <div className={`acadia-vertical-tab acadia-vertical-tab-m ${this.state.activeTab == 2? 'active':''}`} onClick={()=>changeTab(2)}><Icon name="university"/> 
                                            <span className="acadia-vertical-tab_tab_name">Access Groups</span></div>
                                        </Row>
                                        <Row>
                                            <div className={`acadia-vertical-tab acadia-vertical-tab-s ${this.state.activeTab == 3? 'active':''}`} onClick={()=>changeTab(3)}><Icon name="tasks"/> 
                                            <span className="acadia-vertical-tab_tab_name"> Permission Groups </span></div>
                                        </Row>
                                        <Row>
                                            <div className={`acadia-vertical-tab acadia-vertical-tab-s ${this.state.activeTab == 4? 'active':''}`} onClick={()=>changeTab(4)}><Icon name="tasks"/> 
                                            <span className="acadia-vertical-tab_tab_name"> Delegation Groups</span></div>
                                        </Row>
                                    </div>
                                    <div className="acadia-tab-navigation-arrows-wrapper">
                                        <div onClick={()=>changeTab(this.state.activeTab-1)}><Icon name="circle-thin"/><Icon name="angle-left" className="overlapped_icon-left"/> </div>
                                        <div onClick={()=>changeTab(this.state.activeTab+1)}><Icon name="circle-thin"/><Icon name="angle-right" className="overlapped_icon-right"/> </div>   
                                    </div>
                                </Col>
                                <div className='acadia-divider--vertical acadia-divider--vertical-modal' />

                                <Col flex={4} className='acadia-form__section user_modal_right_section'>
                                   
                                    <Row>
                                        {this.state.activeTab == 1?
                                        <Col>
                                            
                                            <Row>
                                                <Textfield
                                                    label="Username*"
                                                    onChange={
                                                        (e: any)=>{
                                                            user.username = (e.currentTarget.value)
                                                            if(true){
                                                                this.props.errors.clearValidation(this.ERROR_ID)
                                                            }
                                                            handleChange(user)
                                                            }}
                                                    floatingLabel
                                                    error={errors && errors['//users[0]/username']?errors['//users[0]/username'].message:null}
                                                    value={user.username}
                                                />
                                            </Row>
                                             <Row>
                                                <AutoComplete
                                                    label={'User Type'}                                                    
                                                    floatingLabel
                                                    items={userTypes}
                                                    valueIndex={'name'}
                                                    dataIndex={'name'}
                                                    value={user.userType}
                                                    onChange={
                                                        (value: any)=>{
                                                                user.userType = value
                                                                handleChange(user)
                                                            }}  
                                                    error={errors && errors['//users[0]/userType']?errors['//users[0]/userType'].message:null}                                                
                                                    />
                                        
                                            </Row>
                                            <Row>
                                                <Textfield
                                                    label="Full Name*"
                                                    onChange={
                                                        (e: any)=>{
                                                            user.name = (e.currentTarget.value)
                                                            handleChange(user)
                                                            }}
                                                    floatingLabel
                                                    value={user.name}
                                                   error={errors && errors['//users[0]/name']?errors['//users[0]/name'].message:null}
                                                />
                                            </Row>
                                            <Row>
                                                <Textfield
                                                    label="Email*"
                                                    type="email"
                                                    onBlur={
                                                        (e: any)=>{
                                                            const val = e.currentTarget.value
                                                            const isErr = !this.validateEmail(val)
                                                            if(isErr){
                                                                  const error = {
                                                                    code: this.ERROR_ID,
                                                                    path: '',
                                                                    field_name: '/users[0]/email', //TODO: please define based on API response's validation error
                                                                    message: 'A valid Email is mandatory and must be provided.'
                                                                }
                                                                this.props.errors.raiseValidationError(this.ERROR_ID, [error])
                                                            }
                                                        }
                                                    }
                                                    onChange={
                                                        (e: any)=>{
                                                            user.email = (e.currentTarget.value)
                                                            handleChange(user)
                                                            }}
                                                    floatingLabel
                                                    value={user.email}
                                                   error={errors && errors['//users[0]/email']?errors['//users[0]/email'].message:null}
                                                />
                                            </Row>
                                            <Row>
                                                <Textfield
                                                    label="Description"
                                                    onChange={
                                                        (e: any)=>{
                                                            user.description = (e.currentTarget.value)
                                                            handleChange(user)
                                                            }}
                                                    value={user.description}
                                                    floatingLabel
                        
                                                />
                                            </Row>
                                            <Row>
                                                <AutoComplete
                                                    label={'Password Policy*'}                                                    
                                                    floatingLabel
                                                    items={passwordpolicies}
                                                    valueIndex={'_id'}
                                                    dataIndex={'name'}
                                                    value={user.passwordPolicyId}
                                                    onChange={
                                                        (value: any)=>{
                                                                handleChangePasswordPolicy(user, value)
                                                                handleChange(user)
                                                            }}  
                                                    error={!passwordpolicies || passwordpolicies.length == 0? 'There are no Password Policies in the system, please create one first.': null}                                                
                                                    />
                                        
                                            </Row>
                                            {user._id?
                                            <Row>
                                                <Checkbox 
                                                label={'Enable User'}
                                                onChange={
                                                    (e: any)=>{
                                                        enableDisable()
                                                        }}
                                                checked={user.enabled}
                                                disabled={!user._id}
                                                />
                                            </Row>
                                            : null}
                                        </Col>
                                        :null}
                                        {this.state.activeTab == 2?
                                        <Col>
                                            <Row>
                                                <AutoComplete
                                                    label={'Organization*'}                                                    
                                                    floatingLabel
                                                    items={orgs}
                                                    valueIndex={'_id'}
                                                    dataIndex={'name'} 
                                                     onChange={
                                                        (value: any)=>{
                                                            handleChangeOrganization(user, value)
                                                            handleChange(user)
                                                            }}   
                                                    value={user.organizationId}                                              
                                                    />
                                        
                                            </Row>
                                            <Row>
                                                <AutoComplete
                                                    label={'Organization and Entities Access*'}                                                    
                                                    floatingLabel
                                                    items={accessgroups}
                                                    valueIndex={'_id'}
                                                    dataIndex={'name'} 
                                                     onChange={
                                                        (value: any)=>{
                                                            handleChangeAccessGroup(user, value)
                                                            handleChange(user)
                                                            }}   
                                                    value={user.accessGroupId}                                              
                                                    />
                                        
                                            </Row>
                                            <AccessGroupTree accessgroup={expandedAccessGroup}/>
                                        </Col>
                                        :null}
                                        {this.state.activeTab == 3?
                                        <Col>
                                            <DnD
                                                sources={this.state.sourceRoles as PermissionGroup[]}
                                                destinations={this.state.roles as PermissionGroup[]}
                                                itemsId="_id"
                                                itemsName="name"
                                                itemsDescription="description"
                                                className="acadia-permissions-dnd"
                                                sourcesName="Available Permission Groups"
                                                destinationName="Selected Permission Groups"
                                                returnFn={assignRole}
                                            />
                                        </Col>
                                        :null}
                                        {this.state.activeTab == 4?
                                        <Col>
                                            <DnD
                                                sources={this.state.sourceDelegations as PermissionGroup[]}
                                                destinations={this.state.delegations as PermissionGroup[]}
                                                itemsId="_id"
                                                itemsName="name"
                                                itemsDescription="description"
                                                className="acadia-delegations-dnd"
                                                sourcesName="Available Permission Groups"
                                                destinationName="Selected Permission Groups"
                                                returnFn={assignDelegation}
                                            />
                                        </Col>
                                        :null}
                                    </Row>
                                </Col>
                            </Row>
                        </div>
                    </div>
                    :
                    <div></div>
                }
            </DraggableModal>
        )
    }
}



 export const Modal : React.SFC<ModalProps> = (props: _ModalProps) => <MyModalComponent {...props}/>