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
import {
    AccessGroup,
    AccessGroupCreate,
    AccessGroupUpdate,
    Organization
} from '../../../models'
import { 
    Stores, 
    StoreNames, 
    CommonStores, 
    AccessGroupsStore, 
    OrganizationsStore,
    LegalEntitiesStore
} from '../../../stores'
import * as utils from '../../../utils/accessgroups_index'
import {filterOrganizations} from '../../../utils/organizations_index'
import {AccessGroupTree} from '../../../components/accessgroup_treeview'
import {disableAutofill} from '../../../utils/disable_chrome_autofill'
import cloneDeep from 'lodash/cloneDeep'
/* Interfaces and Types */
export interface ModalProps {
    isVisible?: boolean
    data?: AccessGroup
    saveHandler?: ()=>void
    cancelHandler?: ()=>void
    closeHandler?: ()=>void
    showOrgOnBehalfOf?: boolean
}

export interface ModalState{
    accessGroup: AccessGroup
    activeTab: number
    selectedOrgId?: string
    isAllEntitiesSelected?: boolean
    orgEntities?: Array<any>
    currentAcl: any
    allChecked?: boolean
    orgs?: Array<Organization>
    // orgs2?: Array<Organization>
}

/* Store Props Interface */
export interface ModalConnectedProps extends Partial<Stores> {
    accessgroups: AccessGroupsStore
    errors: CommonStores.ErrorStore
    legalentities: LegalEntitiesStore
    organizations: OrganizationsStore
    userinfo: CommonStores.UserInfoStore
}


type _ModalProps = ModalProps & ModalConnectedProps

@inject(CommonStores.CommonStoreNames.errors, StoreNames.accessgroups, StoreNames.organizations, StoreNames.legalentities)
@observer // must be after @inject
class MyModalComponent extends React.Component<_ModalProps, ModalState> {
    private readonly ERROR_ID = 'ACCESSGROUP_FORM'
    private newEntities = true
    private modifiedOrgs = false
    // private modifiedOrgOnBehalfOf = false
    constructor(props: _ModalProps) {
        super(props)
        bind(this)
        this.state = {
            accessGroup: utils.initEntityIfBlank(props.data),//in case we're creating a new user
            activeTab: 1,
            selectedOrgId: undefined,
            isAllEntitiesSelected: true,
            orgEntities: undefined,
            currentAcl: undefined,
            allChecked: false
        }
    }

    componentDidUpdate(){
         let entitiesWrapper: any = document.querySelector('.acadia-accessgroup-expanded-detail_wrapper')
         if(entitiesWrapper && this.props.showOrgOnBehalfOf){
             entitiesWrapper.style.maxHeight = '340'
         }
    }

    componentWillReact(){
        if(this.props.legalentities.list && this.props.legalentities.isLoaded && this.newEntities){
            this.newEntities = false
            const acl = this.state.selectedOrgId && this.state.currentAcl?this.state.currentAcl[this.state.selectedOrgId]:null
            const orgEntities = this.props.legalentities.list?this.props.legalentities.list.map((entity: any)=>{
                entity.checked = acl && acl.indexOf(entity._id) != -1? true :false
                // console.log(entity.name + ' ' +entity.checked)
                return entity
            }): undefined
            if(orgEntities){
                this.setState({orgEntities})
            }
        }
        disableAutofill() 
        if(!this.state.orgs) this.initModal(this.props.data)
        // if(this.props.accessgroups.secondaryAGList && this.props.accessgroups.secondaryAGList.length > 0 && this.state.orgs && this.modifiedOrgOnBehalfOf) {
        //     const orgs2 = filterOrganizations(this.state.orgs, this.props.accessgroups.secondaryAGList)
        //     this.modifiedOrgOnBehalfOf = false
        //     this.setState({orgs2})
        // }
    }

    componentWillReceiveProps(nextProps: _ModalProps, nextState: ModalState) {
        if ((nextProps.isVisible && nextProps.isVisible === !this.props.isVisible) || this.modifiedOrgs) {
            this.initModal(nextProps.data)
            const orgId = this.state.accessGroup.organizationId
            if(!this.modifiedOrgs){
                this.setState({
                    activeTab: 1,
                    selectedOrgId: orgId,
                    currentAcl: undefined,
                    isAllEntitiesSelected: true
                })
            }

            if(this.modifiedOrgs === true){ 
                this.modifiedOrgs = false
            }
        }
        if(!nextProps.data || !nextProps.data.orgAcl){
            this.props.accessgroups.expandedDetails = undefined
        }
    } 

    initModal(data?: AccessGroup){
        let tempAccessGroup = utils.initEntityIfBlank(data)
        let orgs: any
        //use the user's default org
        if(!tempAccessGroup.organizationId && this.props.organizations.list && this.props.userinfo.details && this.props.userinfo.details.tampid){
            tempAccessGroup.organizationId = this.props.userinfo!.details.tampid
            this.handleChangeOrganization(tempAccessGroup.organizationId)
        }
        //otherwise the first one on the list
        // else if(!tempAccessGroup.organizationId && this.props.organizations.list && this.props.organizations.list.length >0 && this.props.organizations.list[0]){
        //     tempAccessGroup.organizationId = this.props.organizations.list[0]._id
        //     this.handleChangeOrganization(tempAccessGroup.organizationId)
        // }
        if(tempAccessGroup._id){
            this.props.accessgroups.fetchExpandedDetails(tempAccessGroup._id)
        }
        else{
            this.props.accessgroups.expandedDetails = null
        }
        if(this.props.accessgroups.list && this.props.accessgroups.list.length > 0 && this.props.organizations.list && this.props.organizations.list.length > 0){
            orgs = filterOrganizations(this.props.organizations.list, this.props.accessgroups.list)
        }
        this.props.accessgroups.expandacl = undefined
        const acl = tempAccessGroup.orgAcl
        this.setState({
            accessGroup:tempAccessGroup,
            currentAcl: acl,
            orgs,
            // orgs2: orgs
            // selectedOrgId: tempAccessGroup._id?undefined:tempAccessGroup.organizationId
        })
    }

    handleChange(accessGroup:AccessGroup):void{
        this.props.errors.clearValidation()
        this.setState({accessGroup})
    }
    
    handleChangeOrganization(orgId: string){
        this.props.errors.clearValidation()
        //call entities
        this.props.legalentities.fetchList(orgId, true)
        this.newEntities = true
        this.setState({
            selectedOrgId: orgId
        })
    }

    handleChangeOrganizationOnBehalf(orgId: string){
        let accessGroup = cloneDeep(this.state.accessGroup)
        accessGroup.organizationId = orgId
        // accessGroup.orgAcl = {}
        // this.props.accessgroups.fetchSecondaryList(orgId)
        // this.modifiedOrgOnBehalfOf = true
        // this.emptyAccessGroupTree()
        this.setState({
            accessGroup
        })
    }

    emptyAccessGroupTree(){
        let currentAcl = {}
        let expandedAcl = []
        this.props.accessgroups.expandedDetails = []
        this.props.accessgroups.getAcl({})
        this.modifiedOrgs = true
        this.setState({
            currentAcl
        })
    }

    handleDeleteOrganization(e: any, orgId: string ){
        let acl = this.state.currentAcl
        let expandedAcl = this.props.accessgroups.expandedDetails
        if(acl && acl[orgId]){
            delete acl[orgId]
        }
        if(expandedAcl){
            expandedAcl = expandedAcl.filter((item: any)=>{
                return item.organization._id != orgId
            })
        }
        const me:any = this
        if(this.state.accessGroup.orgAcl && me.state.accessGroup.orgAcl[orgId]){
            delete me.state.accessGroup.orgAcl[orgId]
        }
        // if(this.state.accessGroup._id && acl != undefined){
        //     let updateAccessGroup: AccessGroupUpdate = new AccessGroupUpdate()
        //     for(let key of Object.keys(updateAccessGroup)){
        //         updateAccessGroup[key] = this.state.accessGroup[key]
        //     }
        //     updateAccessGroup.orgAcl = acl
        //     this.props.accessgroups.saveAccessGroup(updateAccessGroup, true)
        // }
        // else{
            this.props.accessgroups.getAcl(acl)
            this.props.accessgroups.expandedDetails = expandedAcl
        // }
        this.modifiedOrgs = true
        this.setState({
            currentAcl: acl
        })
    }
    

    handleAddOrganization(orgEntities: any){
        let atLeastOneChecked = false
        if(orgEntities){
            for(let i=0; i< orgEntities.length; i++){
                if(orgEntities[i].checked === true)
                    atLeastOneChecked = true
            }
        }
        if(!atLeastOneChecked && !this.state.isAllEntitiesSelected){
            const error = {
                code: this.ERROR_ID,
                path: '',
                field_name: '/accessGroup[0]/orgAcl', //TODO: please define based on API response's validation error
                message: 'Please select at least one entity.'
            }
            this.props.errors.raiseValidationError(this.ERROR_ID, [error])
        }

        if(atLeastOneChecked || this.state.isAllEntitiesSelected){
            this.props.errors.clearValidation()
            
            let acl = this.state.currentAcl || (this.state.accessGroup.orgAcl?this.state.accessGroup.orgAcl : {})
            acl[this.state.selectedOrgId!] = []
            if(this.state.isAllEntitiesSelected){
                acl[this.state.selectedOrgId!].push('*')
            }
            else if(orgEntities){
                for(let i=0; i< orgEntities.length; i++){
                    if(orgEntities[i].checked)
                        acl[this.state.selectedOrgId!].push(orgEntities[i]._id)
                }
            }
            this.props.accessgroups.getAcl(acl)
            this.setState({
                selectedOrgId: undefined,
                currentAcl: acl
            })
        }
    }


    save() {
        console.log(this.state.accessGroup)
        // if (!this.state.accessGroup.organizationId || this.state.accessGroup.organizationId === '') {
        //     const error = {
        //         code: this.ERROR_ID,
        //         path: '',
        //         field_name: '/accessGroup[0]/organization', //TODO: please define based on API response's validation error
        //         message: 'Organization is mandatory and must be provided.'
        //     }
        //     this.props.errors.raiseValidationError(this.ERROR_ID, [error])
        //     return false
        // }
         if (!this.state.accessGroup.name || this.state.accessGroup.name === '') {
            const error = {
                code: this.ERROR_ID,
                path: '',
                field_name: '/accessGroup[0]/name', //TODO: please define based on API response's validation error
                message: 'Name is mandatory and must be provided.'
            }
            this.props.errors.raiseValidationError(this.ERROR_ID, [error])
            return false
        }
        if ((this.state.accessGroup.orgAcl && Object.keys(this.state.accessGroup.orgAcl).length == 0) && (!this.state.currentAcl || Object.keys(this.state.currentAcl).length == 0)) {
            const error = {
                code: this.ERROR_ID,
                path: '',
                field_name: '/accessGroup[0]/orgAcl', //TODO: please define based on API response's validation error
                message: 'Organization Access is mandatory and must be provided.'
            }
            this.props.errors.raiseValidationError(this.ERROR_ID, [error])
            return false
        }
            this.props.errors.clearValidation()
            const me:any = this
            if(!this.state.accessGroup._id){
                let createAccessGroup: any = new AccessGroupCreate()
                for(let key of Object.keys(createAccessGroup)){
                    createAccessGroup[key] = me.state.accessGroup[key]
                } 
                createAccessGroup.orgAcl = this.state.currentAcl
                createAccessGroup.organizationId = createAccessGroup.organizationId || this.props.userinfo.details.tampid
                this.props.accessgroups.saveAccessGroup(createAccessGroup as any)
            }
            else{
                let updateAccessGroup: any = new AccessGroupUpdate()
                for(let key of Object.keys(updateAccessGroup)){
                    updateAccessGroup[key] = me.state.accessGroup[key]
                }
                if(this.state.accessGroup && this.state.accessGroup.orgAcl && Object.keys(this.state.accessGroup.orgAcl).length == 0)
                    updateAccessGroup.orgAcl = this.state.currentAcl
                this.props.accessgroups.saveAccessGroup(updateAccessGroup)
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
        if(this.state.accessGroup.name && this.state.accessGroup.name != '' &&
            (this.state.accessGroup.orgAcl || this.state.currentAcl)
        ){
            return true
        }
        return false
    }

    selectAllEntities(entitiesArray: any, value: boolean){
        // if(entitiesArray && entitiesArray.length && entitiesArray.length > 0){
        //     entitiesArray.map((entity)=>{
        //         entity.checked = value
        //         return entity
        //     })
        // }
        this.setState({isAllEntitiesSelected: value})
    }

    selectAllCurrentEntities(entitiesArray: any, value: boolean){
        if(entitiesArray && entitiesArray.length && entitiesArray.length > 0){
            entitiesArray.map((entity: any)=>{
                entity.checked = value
                return entity
            })
        }
        this.setState({allChecked: value})
    }

    addEntity(id: string){
        let allSame = false
        let allSameValue
        const orgEntities = this.state.orgEntities?this.state.orgEntities.map((entity, index)=>{
            if(id == entity._id){
                entity.checked = !entity.checked
                // console.log(id, entity.checked)
            }
            if( index > 0 && entity.checked === this.state.orgEntities![index-1].checked){
                allSame = true
                allSameValue = entity.checked
            }
            return entity
        }):undefined
        this.setState({
            orgEntities,
            allChecked: allSame?allSameValue:( this.state.allChecked? !this.state.allChecked : this.state.allChecked)
        })
    }

    clearOrganization(){
        this.setState({
            selectedOrgId: undefined
        })
    }

   
    render(): JSX.Element {
        const row = Row, col = Col
        const isVisible = this.props.isVisible || false
        const {accessGroup, orgEntities, orgs} = this.state
        const save = this.save
        const formErrors: any = null //errors? errors[this.ERROR_ID] : null
        const changeTab = this.changeTab
        // const orgs = [{id: 1, name: 'Org1'},{id: 2, name: 'Org2'},{id: 3, name: 'Org3'}]
        // const pw = [{id: 1, name: 'Pw1'},{id: 2, name: 'Pw2'},{id: 3, name: 'Pw3'}]
        const handleChange = this.handleChange
        const errors: any = this.props.errors? this.props.errors.validationErrors.get(this.ERROR_ID):null
        const handleDeleteOrganization = this.handleDeleteOrganization
        // const orgs = this.props.organizations.list
        const isSaveButtonEnabled = this.isSaveButtonEnabled
        const handleChangeOrganization = this.handleChangeOrganization
        const selectAllEntities = this.selectAllEntities
        const selectAllCurrentEntities = this.selectAllCurrentEntities
        const handleAddOrganization = this.handleAddOrganization
        const addEntity = this.addEntity
        const referenceToEntities = this.props.legalentities.list? this.props.legalentities.list.length : 0
        const referenceToAg2 = this.props.accessgroups.secondaryAGList? this.props.accessgroups.secondaryAGList.length : 0
        const referencetoAcl = this.props.accessgroups.expandacl?this.props.accessgroups.expandacl:this.props.accessgroups.expandedDetails
        const clearOrganization = this.clearOrganization
        const handleChangeOrganizationOnBehalf = this.handleChangeOrganizationOnBehalf
        const showOrgOnBehalfOf = this.props.showOrgOnBehalfOf
        return (
            <DraggableModal
                {...this.props as any}
                ref="modal"
                title={accessGroup._id ? 'AMEND ACCESS GROUP' : 'CREATE ACCESS GROUP'}
                isVisible={isVisible}
                readOnly={false}
                animation="slide_top"
                enterTimeout={400}
                leaveTimeout={400}
                classNames="accessgroup_modal"
                saveHandler={save}
                saveButtonText={'SAVE ACCESS GROUP'}
                isSaveButtonEnabled={isSaveButtonEnabled()}
                hideIcons={true}
            >
                {isVisible ?
                
                    <div className="acadia-accessGroup-new-form">
                        <div className='acadia-accessGroup__form'>
                            <Row className='acadia-form__section-offset'>
                               <Col flex={1} className='acadia-form__section'>
                                    <div className="acadia-vertical-tab-container">
                                        <Row>
                                            <div className={`acadia-vertical-tab acadia-vertical-tab-xl ${this.state.activeTab == 1? 'active':''}`} onClick={()=>changeTab(1)}>
                                                <Icon name="file-text-o"/> 
                                            <span className="acadia-vertical-tab_tab_name">Access Group Details</span> </div>
                                        </Row>
                                        <Row>
                                            <div className={`acadia-vertical-tab acadia-vertical-tab-s ${this.state.activeTab == 2? 'active':''}`} onClick={()=>changeTab(2)}><Icon name="university"/> 
                                            <span className="acadia-vertical-tab_tab_name">Assignments</span></div>
                                            {errors && this.state.activeTab != 2? <span className="acadia-exclamation_mark-icon"><Icon name="exclamation-circle"/></span> : null}
                                        </Row>
                                    
                                    </div>
                                   <div className="acadia-tab-navigation-arrows-wrapper">
                                        <div onClick={()=>changeTab(this.state.activeTab-1)}><Icon name="circle-thin"/><Icon name="angle-left" className="overlapped_icon-left"/> </div>
                                        <div onClick={()=>changeTab(this.state.activeTab+1)}><Icon name="circle-thin"/><Icon name="angle-right" className="overlapped_icon-right"/> </div>   
                                    </div>
                                </Col>
                                <div className='acadia-divider--vertical acadia-divider--vertical-modal' />

                                <Col flex={4} className='acadia-form__section accessGroup_modal_right_section'>
                                   
                                    <Row>
                                        {this.state.activeTab == 1?
                                        <Col>
                                            {accessGroup.orgLevel?
                                            <Row>
                                                <span className="acadia-default-access_group-info"><Icon name="info-circle"/>&nbsp;Default Access Group</span>
                                                </Row>
                                            :null}
                                            <Row>
                                                <Textfield
                                                    label="Name*"
                                                    onChange={
                                                        (e: any)=>{
                                                            accessGroup.name = (e.currentTarget.value)
                                                            handleChange(accessGroup)
                                                            }}
                                                    floatingLabel
                                                    value={accessGroup.name}
                                                   error={errors && errors['//accessGroup[0]/name']?errors['//accessGroup[0]/name'].message:null}
                                                />
                                            </Row>
                                        </Col>
                                        :null}
                                        {this.state.activeTab == 2?
                                        <Col>
                                        {showOrgOnBehalfOf?
                                            <Row>
                                                <AutoComplete
                                                    label={'On Behalf Of Organization*'}                                                    
                                                    floatingLabel
                                                    items={orgs || []}
                                                    valueIndex={'_id'}
                                                    dataIndex={'name'} 
                                                     onChange={
                                                        (value: any)=>{
                                                            handleChangeOrganizationOnBehalf(value)
                                                            }}   
                                                    value={this.state.accessGroup.organizationId}  
                                                    error={errors && errors['//accessGroup[0]/orgAcl']?errors['//accessGroup[0]/orgAcl'].message:null} 
                                                    autocomplete="new-password"                                         
                                                    />
                                                </Row>
                                                : null }
                                            <Row>
                                                <AutoComplete
                                                    label={'Organization*'}                                                    
                                                    floatingLabel
                                                    items={orgs || []}
                                                    valueIndex={'_id'}
                                                    dataIndex={'name'} 
                                                     onChange={
                                                        (value: any)=>{
                                                            handleChangeOrganization(value)
                                                            }}   
                                                    value={this.state.selectedOrgId}  
                                                    error={errors && errors['//accessGroup[0]/orgAcl']?errors['//accessGroup[0]/orgAcl'].message:null} 
                                                    autocomplete="new-password"                                         
                                                    />
                                            </Row>
                                            {this.state.selectedOrgId?
                                            <div className="acadia-accessgroup-expanded-detail_wrapper">
                                                <Row className="acadia-ca-checkbox-row">
                                                    <Checkbox 
                                                    label={'Include All Current And Future Entities'}
                                                    onChange={
                                                        (e: any)=>{
                                                            selectAllEntities(orgEntities, !this.state.isAllEntitiesSelected)
                                                        }}
                                                    checked={this.state.isAllEntitiesSelected}
                                                    title="Future Entities added to this Organization will be automatically included in this Access Group"
                                                    />
                                                    {/*<i className={`material-icons acadia-add-item-icon${this.state.selectedOrgId?'':'-disabled'}`}  onClick={(e)=>{
                                                                handleAddOrganization(orgEntities)
                                                            }}>add_circle_outline</i>*/}
                                                    {this.state.isAllEntitiesSelected? 
                                                    <div className="functional_button">
                                                         <div className="clear_button" onClick={(e)=>clearOrganization()}>
                                                            CLEAR
                                                        </div>
                                                        <div className="add_button" onClick={(e)=>handleAddOrganization(orgEntities)}>
                                                            ADD
                                                        </div>
                                                    </div> 
                                                    : null}       
                                                </Row>
                                                <div className='acadia-divider--horizonal' />
                                                
                                                {!this.state.isAllEntitiesSelected?
                                                <Col className={`${this.state.isAllEntitiesSelected?'allEntitiesSelected':null}`}>
                                                    {orgEntities?
                                                    <div className="acadia-accessgroup-expanded-toggle_all">
                                                        <a onClick={(e)=>{!this.state.isAllEntitiesSelected?selectAllCurrentEntities(orgEntities, !this.state.allChecked) : null}}> Select/Deselect All</a>
                                                        {!this.state.isAllEntitiesSelected? 
                                                        <div className="functional_button org_entities_functional_button">
                                                            <div className="clear_button" onClick={(e)=>clearOrganization()}>
                                                                CLEAR
                                                            </div>
                                                            <div className="add_button" onClick={(e)=>handleAddOrganization(orgEntities)}>
                                                                ADD
                                                            </div>
                                                        </div> 
                                                        : null}
                                                    </div>
                                                    :null}
                                                    
                                                    {orgEntities?orgEntities.map((item)=>{
                                                        return <Checkbox 
                                                                    key={item._id}
                                                                    label={item.name}
                                                                    onChange={
                                                                        (e: any)=>{
                                                                            addEntity(item._id)
                                                                        }}
                                                                    checked={item.checked}
                                                                    disabled={this.state.isAllEntitiesSelected}
                                                                />
                                                    }):null}
                                                </Col>
                                                : 
                                                <Col>
                                                    {orgEntities?orgEntities.map((item)=>{
                                                        return <li className="entityelement"
                                                                    key={item._id}
                                                                >
                                                                - {item.name}
                                                                </li>
                                                    }):null}
                                                </Col>
                                                }
                                            </div>
                                           :<div>
                                               <AccessGroupTree accessgroup={referencetoAcl as any} deleteOrgFn={handleDeleteOrganization}/>
                                            </div>}
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