/**
 * Created by alessiofimognari on 18/05/2017.
 */
import * as React from 'react'
import { observer, inject } from 'mobx-react';
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
import {Textfield, Checkbox} from 'react-mdl'
// import { AutoComplete } from 'react-mdl-extra';
import cloneDeep from 'lodash/cloneDeep'
import {
    PermissionGroup,
    PermissionGroupCreate,
    PermissionGroupUpdate,
    Permission
} from '../../../models'
import { 
    Stores, 
    StoreNames, 
    PermissionGroupsStore, 
    CommonStores, 
    PermissionsStore, 
} from '../../../stores'
import * as utils from '../../../utils/roles_index'
import {disableAutofill} from '../../../utils/disable_chrome_autofill'
import {DnDTwoLists, DnDProps, DnDState} from '../../../components/dnd_two_lists'

type DnDType = new () => DnDTwoLists<Permission>
const DnD = DnDTwoLists as DnDType

/* Interfaces and Types */
export interface ModalProps {
    isVisible?: boolean
    data?: PermissionGroup
    saveHandler?: ()=>void
    cancelHandler?: ()=>void
    closeHandler?: ()=>void
    hasPermissionPerm?: boolean
}

export interface ModalState{
    role: PermissionGroup
    activeTab: number
    items: Permission[]
    sources: Permission[]
}

/* Store Props Interface */
export interface ModalConnectedProps extends Partial<Stores> {
    permissiongroups: PermissionGroupsStore
    permissions: PermissionsStore
    errors: CommonStores.ErrorStore
    userinfo: CommonStores.UserInfoStore
}


type _ModalProps = ModalProps & ModalConnectedProps

@inject(CommonStores.CommonStoreNames.errors, StoreNames.permissions, StoreNames.permissiongroups)
@observer // must be after @inject
class MyModalComponent extends React.Component<_ModalProps, ModalState> {
    private readonly ERROR_ID = 'ROLES_FORM'
    private filterData: boolean = true
    constructor(props: _ModalProps) {
        super(props)
        bind(this)
        this.state = {
            role: utils.initRoleIfBlank(props.data),//in case we're creating a new role
            activeTab: 1,
            items: [],
            sources: this.props.permissions.list as Permission[]
        }
    }

    componentWillMount() {
        if(this.props.hasPermissionPerm) this.props.permissions.fetchList(true)
    }

     componentWillReact(){
        disableAutofill()
        if(this.props.permissions.list && this.props.permissions.list.length >0 && this.state.sources.length == 0){
            this.setState({
                sources: Array.from(this.props.permissions.list as Permission[]),
            })
            if(this.props.data && this.props.data.permissionIds && this.filterData){
                this.filterSourceItems(this.props.data.permissionIds)
                this.filterData = false
            }
        }
    }

    componentWillReceiveProps(nextProps: _ModalProps, nextState: ModalState) {
        if (nextProps.isVisible && nextProps.isVisible === !this.props.isVisible) {
            this.props.permissions.fetchList(true)
            this.props.errors.clearValidation()
            this.setState({
                sources: [],
                activeTab: 1,
                items: [],
                role: nextProps.data && nextProps.data._id ? nextProps.data : new PermissionGroup()//,
                // items: nextProps.data && nextProps.data.permissionIds && nextProps.data.permissionIds.length > 0 ? [] : []
            })
            if(nextProps.data && nextProps.data.permissionIds){
                this.filterSourceItems(nextProps.data.permissionIds)
                this.filterData = true
            }
        }
    } 

    filterSourceItems(array: string[]){
        let items: Permission[] = []
        if(this.props.permissions.list && array){
            let sources: any[] = this.props.permissions.list.filter((item:Permission)=>{
                const isInArray = array.indexOf(item._id) != -1
                if(isInArray){
                    items.push(item)
                }
                return !isInArray
            })
            this.setState({items, sources})
        }
    }

    handleChange(role:PermissionGroup):void{
        this.setState({role})
    }
    

    save() {
        console.log(this.state.role)
       
        if (!this.state.role.name || this.state.role.name.trim() === '') {
            const error = {
                code: this.ERROR_ID,
                path: '',
                field_name: '/roles[0]/name', //TODO: please define based on API response's validation error
                message: 'Permission Group name is mandatory and must be provided.'
            }
            this.props.errors.raiseValidationError(this.ERROR_ID, [error])
            return false
        }
        this.props.errors.clearValidation()
        const me:any = this
        if(!this.state.role._id){
            let createRole: any = new PermissionGroupCreate()
            for(let key of Object.keys(createRole)){
                createRole[key] = me.state.role[key]
            }
            createRole.permissionIds = []
            if(this.state.items.length > 0){
                const idsArray = this.state.items.map((item)=>{return item._id})
                createRole.permissionIds = createRole.permissionIds && createRole.permissionIds.length ? createRole.permissionIds.concat(idsArray) : idsArray
            }
            this.props.permissiongroups.savePermissionGroup(createRole)
        }
        else{
            let updateRole: any = new PermissionGroupUpdate()
            for(let key of Object.keys(updateRole)){
                updateRole[key] = me.state.role[key]
            }
            updateRole.permissionIds = []
            if(this.state.items.length > 0){
                updateRole.permissionIds = this.state.items.map((item)=>item._id)
            }
            this.props.permissiongroups.savePermissionGroup(updateRole)
        }
        
        if (this.props.saveHandler) {
            this.props.saveHandler()
        }
        return true
    }

    changeTab(tabIndex: number):void{
        if(tabIndex>0 && tabIndex<3){
            this.setState({
                activeTab: tabIndex
            })
        }
    }

    isSaveButtonEnabled(){
        if(this.state.role.name && this.state.role.name.trim() != '' &&
            this.state.role.name && this.state.role.name != ''
        ){
            return true
        }
        return false
    }

     assignItems(items: any){
        this.setState({
            items
        })
    }

   
    render(): JSX.Element {
        const row = Row, col = Col
        const isVisible = this.props.isVisible || false
        const {role} = this.state
        const save = this.save
        const formErrors: any = null //errors? errors[this.ERROR_ID] : null
        const changeTab = this.changeTab
        // const orgs = [{id: 1, name: 'Org1'},{id: 2, name: 'Org2'},{id: 3, name: 'Org3'}]
        // const pw = [{id: 1, name: 'Pw1'},{id: 2, name: 'Pw2'},{id: 3, name: 'Pw3'}]
        const handleChange = this.handleChange
        const errors: any = this.props.errors? this.props.errors.validationErrors.get(this.ERROR_ID):null
        const permissionsLength = this.props.permissions.list? this.props.permissions.list.length : 0
        const isSaveButtonEnabled = this.isSaveButtonEnabled
        const assignItems = this.assignItems
        
        
        return (
            <DraggableModal
                {...this.props as any}
                ref="modal"
                title={role._id ? 'AMEND PERMISSION GROUP' : 'CREATE PERMISSION GROUP'}
                isVisible={isVisible}
                readOnly={false}
                animation="slide_top"
                enterTimeout={400}
                leaveTimeout={400}
                classNames="role_modal"
                saveHandler={save}
                saveButtonText={'SAVE PERMISSION GROUP'}
                isSaveButtonEnabled={isSaveButtonEnabled()}
                hideIcons={true}
                disabled={true}
            >
                {isVisible ?
                    <div className="acadia-role-new-form">
                        <div className='acadia-role__form'>
                            <Row className='acadia-form__section-offset'>

                                <Col flex={1} className='acadia-form__section'>
                                    <div className="acadia-vertical-tab-container">
                                        <Row>
                                            <div className={`acadia-vertical-tab ${this.state.activeTab == 1? 'active':''}`} onClick={()=>changeTab(1)}>
                                                <Icon name="id-card"/> 
                                            <span className="acadia-vertical-tab_tab_name">Permission Group Details</span> </div>
                                            {errors && this.state.activeTab != 1? <span className="acadia-exclamation_mark-icon"><Icon name="exclamation-circle"/></span> : null}
                                        </Row>
                                        <Row>
                                            <div className={`acadia-vertical-tab ${this.state.activeTab == 2? 'active':''}`} onClick={()=>changeTab(2)}><Icon name="university"/> 
                                            <span className="acadia-vertical-tab_tab_name">Permissions</span></div>
                                        </Row>
                                    </div>
                                    <div className="acadia-tab-navigation-arrows-wrapper">
                                        <div onClick={()=>changeTab(this.state.activeTab-1)}><Icon name="circle-thin"/><Icon name="angle-left" className="overlapped_icon-left"/> </div>
                                        <div onClick={()=>changeTab(this.state.activeTab+1)}><Icon name="circle-thin"/><Icon name="angle-right" className="overlapped_icon-right"/> </div>   
                                    </div>
                                </Col>
                                <div className='acadia-divider--vertical acadia-divider--vertical-modal' />

                                <Col flex={4} className='acadia-form__section role_modal_right_section'>
                                   
                                    <Row>
                                        {this.state.activeTab == 1?
                                        <Col>
                                            <Row>
                                                <Textfield
                                                    label="Name*"
                                                    onChange={
                                                        (e: any)=>{
                                                            role.name = (e.currentTarget.value)
                                                            handleChange(role)
                                                            }}
                                                    floatingLabel
                                                    value={role.name}
                                                   error={errors && errors['//roles[0]/name']?errors['//roles[0]/name'].message:null}
                                                />
                                            </Row>
                                            <Row>
                                                <Textfield
                                                    label="Description"
                                                    onChange={
                                                        (e: any)=>{
                                                            role.description = (e.currentTarget.value)
                                                            handleChange(role)
                                                            }}
                                                    floatingLabel
                                                    value={role.description}
                                                   error={errors && errors['//roles[0]/description']?errors['//roles[0]/description'].message:null}
                                                />
                                            </Row>
                                           
                                        </Col>
                                        :null}
                                        {this.state.activeTab == 2?
                                        <Col>
                                            
                                        <DnD
                                            sources={this.state.sources}
                                            destinations={this.state.items}
                                            itemsId="_id"
                                            itemsName="name"
                                            itemsDescription="tags"
                                            className="acadia-permissions-dnd"
                                            sourcesName="Available Permissions"
                                            destinationName="Selected Permissions"
                                            returnFn={assignItems}
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