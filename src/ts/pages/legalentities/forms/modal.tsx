/**
 * Created by alessiofimognari on 18/05/2017.
 */
import * as React from 'react'
import { observer, inject } from 'mobx-react';
import cloneDeep from 'lodash/cloneDeep'
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
import {Textfield, Checkbox, Chip} from 'react-mdl'
// import { AutoComplete } from 'react-mdl-extra';
import {
    LegalEntity,
    LegalEntityUpdate,
    LegalEntityCreate,
    Organization
} from '../../../models'
import { 
    Stores, 
    StoreNames, 
    LegalEntitiesStore, 
    CommonStores, 
    OrganizationsStore,
    AccessGroupsStore 
} from '../../../stores'
import * as utils from '../../../utils/legalentities_index'
import {filterOrganizations} from '../../../utils/organizations_index'
import {disableAutofill} from '../../../utils/disable_chrome_autofill'
/* Interfaces and Types */
export interface ModalProps {
    isVisible?: boolean
    data?: LegalEntity
    saveHandler?: ()=>void
    cancelHandler?: ()=>void
    closeHandler?: ()=>void
    
}

export interface ModalState{
    legalEntity: LegalEntity
    activeTab: number
    emailListValue: string
    orgs?: Array<Organization>
}

/* Store Props Interface */
export interface ModalConnectedProps extends Partial<Stores> {
    legalentities: LegalEntitiesStore
    errors: CommonStores.ErrorStore
    accessgroups: AccessGroupsStore
    organizations: OrganizationsStore
    userinfo: CommonStores.UserInfoStore
}


type _ModalProps = ModalProps & ModalConnectedProps

@inject(CommonStores.CommonStoreNames.errors, StoreNames.accessgroups, StoreNames.passwordpolicies, StoreNames.organizations, StoreNames.legalentities, StoreNames.accessgroups)
@observer // must be after @inject
class MyModalComponent extends React.Component<_ModalProps, ModalState> {
    private readonly ERROR_ID = 'ENTITY_FORM'
    constructor(props: _ModalProps) {
        super(props)
        bind(this)
        this.state = {
            legalEntity: utils.initEntityIfBlank(props.data),//in case we're creating a new legalEntity
            activeTab: 1,
            emailListValue: ''
        }
    }

    componentWillMount() {
        if(!this.props.accessgroups.list) this.props.accessgroups.fetchList(true)
    }

    componentDidMount(){
        this.initModal(this.props.data)
    }

    componentWillReact(){
        disableAutofill()
    }

    componentWillReceiveProps(nextProps: _ModalProps, nextState: ModalState) {
        if (nextProps.isVisible && nextProps.isVisible === !this.props.isVisible) {
            this.initModal(nextProps.data)
            this.setState({
                activeTab: 1
            })
        }
    }

    initModal(data?: LegalEntity){
        let tempLegalEntity = utils.initEntityIfBlank(data)
        //use the user's default org
        if(!tempLegalEntity.organizationId && this.props.organizations.list && this.props.userinfo.details && this.props.userinfo.details.tampid){
            this.handleChangeOrganization(tempLegalEntity, this.props.userinfo!.details.tampid)
        }
        //in case of admin
        else if(!tempLegalEntity.organizationId && this.props.organizations.list && this.props.organizations.list.length > 0 && this.props.organizations.list[0]){
            this.handleChangeOrganization(tempLegalEntity, this.props.organizations.list[0]._id)
        }
        if(this.props.accessgroups.list && this.props.accessgroups.list.length > 0 && this.props.organizations.list && this.props.organizations.list.length > 0){
            const orgs = filterOrganizations(this.props.organizations.list, this.props.accessgroups.list)
            this.setState({
                orgs
            })
        }
        
        this.handleChange(tempLegalEntity)
    }

    handleChange(legalEntity:LegalEntity):void{
        this.props.errors.clearValidation()
        this.setState({
            legalEntity,
            emailListValue: ''
        })
    }

    handleChangeOrganization(legalEntity: LegalEntity, orgId: string){
        if(this.props.organizations.list){
            legalEntity.organizationId =  orgId
            const org = this.props.organizations.list!.filter((org)=>{
                    return org._id === orgId
                })[0]
            if(org){
                legalEntity.organizationName = org.name
                legalEntity.isOrgServiceProvider = org.serviceProvider
                legalEntity.isOrgMultiServiceProvider = org.multiOrgServiceProvider
            }             
        }
    }

    save() {
        console.log(this.state.legalEntity)
        if (!this.state.legalEntity.organizationId || this.state.legalEntity.organizationId === '') {
            const error = {
                code: this.ERROR_ID,
                path: '',
                field_name: '/legalEntities[0]/organizationId', //TODO: please define based on API response's validation error
                message: 'Organization is mandatory and must be provided.'
            }
            this.props.errors.raiseValidationError(this.ERROR_ID, [error])
            return false
        }
        if (!this.state.legalEntity.name || this.state.legalEntity.name.trim() === '') {
            const error = {
                code: this.ERROR_ID,
                path: '',
                field_name: '/legalEntities[0]/name', //TODO: please define based on API response's validation error
                message: 'Legal Entity Name is mandatory and must be provided.'
            }
            this.props.errors.raiseValidationError(this.ERROR_ID, [error])
            return false
        }
        if (!this.state.legalEntity.emailList || this.state.legalEntity.emailList.trim() === '') {
            const error = {
                code: this.ERROR_ID,
                path: '',
                field_name: '/legalEntities[0]/emailList', //TODO: please define based on API response's validation error
                message: 'Email list is mandatory and must be provided.'
            }
            this.props.errors.raiseValidationError(this.ERROR_ID, [error])
            return false
        }
            this.props.errors.clearValidation()
            const me:any = this
             if(this.state.legalEntity._id){
                let updateEntity: any = new LegalEntityUpdate()
                for(let key of Object.keys(updateEntity)){
                    updateEntity[key] = me.state.legalEntity[key]
                }
                if(updateEntity.shortName == ''){
                    delete updateEntity.shortName
                }
                if(updateEntity.inactivityMonitorThreshold && updateEntity.inactivityMonitorThreshold.toString().indexOf(',')!=-1){
                    updateEntity.inactivityMonitorThreshold = updateEntity.inactivityMonitorThreshold.replace(/,/g, '')
                }
                if(updateEntity.expectedCallTtlHours && updateEntity.expectedCallTtlHours.toString().indexOf(',')!=-1){
                    updateEntity.expectedCallTtlHours = updateEntity.expectedCallTtlHours.replace(/,/g, '')
                }
                updateEntity.enabled = me.state.legalEntity == false? false:true
                this.props.legalentities.saveLegalEntity(updateEntity)
            }
            else{
                let createEntity: any = new LegalEntityCreate()
                for(let key of Object.keys(createEntity)){
                    createEntity[key] = me.state.legalEntity[key]
                }
                if(createEntity.shortName == ''){
                    delete createEntity.shortName
                }
                if(createEntity.inactivityMonitorThreshold && createEntity.inactivityMonitorThreshold.toString().indexOf(',')!=-1){
                    createEntity.inactivityMonitorThreshold = createEntity.inactivityMonitorThreshold.replace(/,/g, '')
                }
                if(createEntity.expectedCallTtlHours && createEntity.expectedCallTtlHours.toString().indexOf(',')!=-1){
                    createEntity.expectedCallTtlHours = createEntity.expectedCallTtlHours.replace(/,/g, '')
                }
                createEntity.enabled = me.state.legalEntity == false? false:true
                this.props.legalentities.saveLegalEntity(createEntity)
            }
            if (this.props.saveHandler) {
                this.props.saveHandler()
            }
            return true
        
    }

    changeTab(tabIndex: number):void{
        if(tabIndex>0 && tabIndex<4){
            this.setState({
                activeTab: tabIndex
            })
        }
    }

    isSaveButtonEnabled(){
        if(this.state.legalEntity.name && this.state.legalEntity.name.trim() != '' &&
            this.state.legalEntity.organizationId && this.state.legalEntity.organizationId != '' &&
            (this.state.legalEntity.emailList && this.state.legalEntity.emailList.length > 0)
        ){
            return true
        }
        return false
    }

    testEmail(value: string){
        const emailRegex = new RegExp("([_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*\\@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,}))(((;|,|; |, | ;| ; | , | ,){1}[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*\\@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,}))*)")
        return emailRegex.test(value)
    }

    addEmailItem(legalEntity: any, ref: string){
        const tempValueArray = legalEntity[ref] && legalEntity[ref]!= ''?legalEntity[ref].split(','):[]
        let emailListRef = this.refs[ref] as any
        const value = emailListRef.inputRef.value
        if(this.testEmail(value)){
            tempValueArray.push(value)
            legalEntity[ref] = tempValueArray.join(',')
            emailListRef.inputRef.value = null
            this.handleChange(legalEntity)
            return true
        }
        else{
             const error = {
                code: this.ERROR_ID,
                path: '',
                field_name: '/legalEntities[0]/'+ref, //TODO: please define based on API response's validation error
                message: 'Please provide a valid email address'
            }
            this.props.errors.raiseValidationError(this.ERROR_ID, [error])
            return false
        }
    }

    toggleCheckbox(itemString: string){
        let legalEntity: any = this.state.legalEntity
        if(!legalEntity[itemString]){
            legalEntity[itemString] = true
        }
        else if(typeof legalEntity[itemString] === 'boolean'){
            legalEntity[itemString] = !legalEntity[itemString] 
        }
        this.setState({
                legalEntity
            })
    }

   
    render(): JSX.Element {
        const row = Row, col = Col
        const isVisible = this.props.isVisible || false
        const {legalEntity, orgs} = this.state
        const save = this.save
        const formErrors: any = null //errors? errors[this.ERROR_ID] : null
        const changeTab = this.changeTab
        // const orgs = [{id: 1, name: 'Org1'},{id: 2, name: 'Org2'},{id: 3, name: 'Org3'}]
        // const pw = [{id: 1, name: 'Pw1'},{id: 2, name: 'Pw2'},{id: 3, name: 'Pw3'}]
        const handleChange = this.handleChange
        const errors: any = this.props.errors? this.props.errors.validationErrors.get(this.ERROR_ID):null
        // const orgs = this.props.organizations.list
        const isSaveButtonEnabled = this.isSaveButtonEnabled
        const handleChangeOrganization = this.handleChangeOrganization
        const emailList = legalEntity.emailList? legalEntity.emailList.split(',') : []
        const spEmailList = legalEntity.serviceProviderEmailList? legalEntity.serviceProviderEmailList.split(',') : []
        const addItem = this.addEmailItem
        const toggleCheckbox = this.toggleCheckbox
        const formatNumber = utils.formatNumber
        return (
            <DraggableModal
                {...this.props as any}
                ref="modal"
                title={legalEntity._id ? 'AMEND ENTITY' : 'CREATE ENTITY'}
                isVisible={isVisible}
                readOnly={false}
                animation="slide_top"
                enterTimeout={400}
                leaveTimeout={400}
                classNames="legalEntity_modal"
                saveHandler={save}
                saveButtonText={'SAVE ENTITY'}
                isSaveButtonEnabled={isSaveButtonEnabled()}
                hideIcons={true}
            >
                {isVisible ?
                    <div className="acadia-legalEntity-new-form">
                        <div className='acadia-legalEntity__form'>
                            <Row className='acadia-form__section-offset'>

                                <Col flex={1} className='acadia-form__section'>
                                    <div className="acadia-vertical-tab-container">
                                        <Row>
                                            <div className={`acadia-vertical-tab acadia-vertical-tab-s ${this.state.activeTab == 1? 'active':''}`} onClick={()=>changeTab(1)}>
                                                <Icon name="file-text-o"/> 
                                            <span className="acadia-vertical-tab_tab_name">Entity Details</span> </div>
                                        </Row>
                                        <Row>
                                            <div className={`acadia-vertical-tab acadia-vertical-tab-m ${this.state.activeTab == 2? 'active':''}`} onClick={()=>changeTab(2)}><Icon name="address-book-o"/> 
                                            <span className="acadia-vertical-tab_tab_name">Entity Contacts</span></div>
                                             {errors && errors['//legalEntities[0]/emailList'] && this.state.activeTab != 2? <span className="acadia-exclamation_mark-icon"><Icon name="exclamation-circle"/></span> : null}
                                        </Row>
                                        <Row>
                                            <div className={`acadia-vertical-tab acadia-vertical-tab-l ${this.state.activeTab == 3? 'active':''}`} onClick={()=>changeTab(3)}><Icon name="cogs"/> 
                                            <span className="acadia-vertical-tab_tab_name"> Additional Settings </span></div>
                                            {errors && (errors['//legalEntities[0]/inactivityMonitorThreshold'] || errors['//legalEntities[0]/expectedCallTtlHours']) &&this.state.activeTab != 3? <span className="acadia-exclamation_mark-icon"><Icon name="exclamation-circle"/></span> : null}
                                        </Row>
                                    
                                    </div>
                                    <div className="acadia-tab-navigation-arrows-wrapper">
                                        <div onClick={()=>changeTab(this.state.activeTab-1)}><Icon name="circle-thin"/><Icon name="angle-left" className="overlapped_icon-left"/> </div>
                                        <div onClick={()=>changeTab(this.state.activeTab+1)}><Icon name="circle-thin"/><Icon name="angle-right" className="overlapped_icon-right"/> </div>   
                                    </div>
                                </Col>
                               <div className='acadia-divider--vertical acadia-divider--vertical-modal' />

                                <Col flex={4} className='acadia-form__section legalEntity_modal_right_section'>
                                   
                                    <Row>
                                        {this.state.activeTab == 1?
                                        <Col>
                                            <Row>
                                                <AutoComplete
                                                    label={'Organization*'}                                                    
                                                    floatingLabel
                                                    items={orgs || []}
                                                    valueIndex={'_id'}
                                                    dataIndex={'name'} 
                                                     onChange={
                                                        (value: any)=>{
                                                            handleChangeOrganization(legalEntity, value)
                                                            handleChange(legalEntity)
                                                            }}   
                                                    value={legalEntity.organizationId}                                              
                                                    />
                                        
                                            </Row>
                                            <Row>
                                                <Textfield
                                                    label="Long Name*"
                                                    onChange={
                                                        (e: any)=>{
                                                            legalEntity.name = (e.currentTarget.value)
                                                            if(true){
                                                                this.props.errors.clearValidation(this.ERROR_ID)
                                                            }
                                                            handleChange(legalEntity)
                                                            }}
                                                    floatingLabel
                                                    error={errors && errors['//legalEntities[0]/name']?errors['//legalEntities[0]/name'].message:null}
                                                    value={legalEntity.name}
                                                />
                                            </Row>
                                            <Row>
                                                <Textfield
                                                    label="Short Name"
                                                    onChange={
                                                        (e: any)=>{
                                                            legalEntity.shortName = (e.currentTarget.value)
                                                            handleChange(legalEntity)
                                                            }}
                                                    floatingLabel
                                                    value={legalEntity.shortName}
                                                   error={errors && errors['//legalEntities[0]/shortName']?errors['//legalEntities[0]/shortName'].message:null}
                                                />
                                            </Row>
                                            <Row>
                                                <Textfield
                                                    label="Legal Entity Identifier"
                                                    onBlur={ (e: any)=>{
                                                        let val = e.currentTarget.value
                                                        const letterNumber = /^[0-9a-zA-Z]+$/
                                                        if((val.indexOf(' ') == -1 && val.match(letterNumber) && val.length <= 20) || val == ''){
                                                            this.props.errors.clearValidation()
                                                        }
                                                    }}
                                                    onChange={
                                                        (e: any)=>{
                                                            let val = e.currentTarget.value
                                                            const letterNumber = /^[0-9a-zA-Z]+$/
                                                            if(val.length > 20 && val != ''){
                                                                const error = {
                                                                    code: this.ERROR_ID,
                                                                    path: '',
                                                                    field_name: '/legalEntities[0]/lei', 
                                                                    message: 'Legal Entity Identifier cannot be longer than 20 characters'
                                                                }
                                                                this.props.errors.raiseValidationError(this.ERROR_ID, [error])
                                                            }
                                                            else if(!val.match(letterNumber) && val != ''){
                                                                const error = {
                                                                    code: this.ERROR_ID,
                                                                    path: '',
                                                                    field_name: '/legalEntities[0]/lei', 
                                                                    message: 'Legal Entity Identifier can only contain alphanumeric values'
                                                                }
                                                                this.props.errors.raiseValidationError(this.ERROR_ID, [error])
                                                            }
                                                            else if(val.indexOf(' ')!=-1 && val != ''){
                                                                const error = {
                                                                    code: this.ERROR_ID,
                                                                    path: '',
                                                                    field_name: '/legalEntities[0]/lei', 
                                                                    message: 'Legal Entity Identifier must be provided as a single string of characters'
                                                                }
                                                                this.props.errors.raiseValidationError(this.ERROR_ID, [error])
                                                            }
                                                            else{
                                                                legalEntity.legalEntityIdentifier = val.toUpperCase()
                                                                handleChange(legalEntity)
                                                            }
                                                            }}
                                                    value={legalEntity.legalEntityIdentifier}
                                                    floatingLabel
                                                    error={errors && errors['//legalEntities[0]/lei']?errors['//legalEntities[0]/lei'].message:null}
                                                />
                                            </Row>
                                           
                                            <Row>
                                                <Checkbox 
                                                label={'Enable Entity'}
                                                onChange={
                                                    (e: any)=>{
                                                        toggleCheckbox('enabled')
                                                        }}
                                                checked={legalEntity.enabled}
                                                />
                                            </Row>
                                        </Col>
                                        :null}
                                        {this.state.activeTab == 2?
                                        <Col>
                                            <Row>
                                                <Textfield
                                                    label="Email List*"
                                                    type="email"
                                                    floatingLabel
                                                    ref="emailList"
                                                    onKeyUp={
                                                        e=>{
                                                            if(e.keyCode == 13){
                                                                addItem(legalEntity, 'emailList')
                                                            }
                                                        }
                                                    }
                                                     error={errors && errors['//legalEntities[0]/emailList']?errors['//legalEntities[0]/emailList'].message:null}
                                                />
                                                <a className="acadia-add-item-icon" onClick={(e)=>{
                                                        e.preventDefault()
                                                        addItem(legalEntity, 'emailList')
                                                    }}><Icon name="plus" /></a>
                                            </Row>
                                            <div className="acadia-chip-col">
                                                {emailList.map((item, i)=>{
                                                    return <Chip key={i} className="acadia-chip" onClose={e => { 
                                                        emailList.splice(i,1)
                                                        legalEntity.emailList = emailList.join(',')
                                                        handleChange(legalEntity)
                                                        }}>{item}</Chip>
                                                })}
                                                
                                            </div>
                                            {legalEntity.isOrgServiceProvider || legalEntity.isOrgMultiServiceProvider?
                                            <div>
                                                <Row>
                                                    <Textfield
                                                        label="Service Provider Email List"
                                                        type="email"
                                                        floatingLabel
                                                        ref="serviceProviderEmailList"
                                                        onKeyUp={
                                                            e=>{
                                                                if(e.keyCode == 13){
                                                                    addItem(legalEntity, 'serviceProviderEmailList')
                                                                }
                                                            }
                                                        }
                                                        error={errors && errors['//legalEntities[0]/serviceProviderEmailList']?errors['//legalEntities[0]/serviceProviderEmailList'].message:null}
                                                    />
                                                    <a className="acadia-add-item-icon" onClick={(e)=>{
                                                        e.preventDefault()
                                                        addItem(legalEntity, 'serviceProviderEmailList')
                                                    }}><Icon name="plus" /></a>
                                                </Row>
                                                <div className="acadia-chip-col-last">
                                                    {spEmailList.map((item, i)=>{
                                                        return <Chip key={i} className="acadia-chip" onClose={e => { 
                                                            spEmailList.splice(i,1)
                                                            legalEntity.serviceProviderEmailList = spEmailList.join(',')
                                                            handleChange(legalEntity)
                                                            }}>{item}</Chip>
                                                    })}
                                                    
                                                </div>
                                            </div>
                                            : null}
                                            <Row>
                                                <Checkbox 
                                                label={'Enable Email'}
                                                onChange={
                                                    (e: any)=>{
                                                       toggleCheckbox('emailEnabled')
                                                        }}
                                                checked={legalEntity.emailEnabled}
                                                />
                                            </Row>
                                        </Col>
                                        :null}

                                        {this.state.activeTab == 3?
                                        <Col>
                                            <Row>
                                                <Textfield
                                                    label="Fund Number"
                                                    onChange={
                                                        (e: any)=>{
                                                            legalEntity.fundNumber = (e.currentTarget.value)
                                                            handleChange(legalEntity)
                                                            }}
                                                    value={legalEntity.fundNumber}
                                                    floatingLabel
                                                />
                                            </Row>
                                            <Row>
                                                <Textfield
                                                    label="Inactivity Monitor Threshold (Mins)"
                                                    onBlur={(e: any)=> {
                                                        let val = e.currentTarget.value
                                                        if(val.indexOf(',') != -1){
                                                            val = val.replace(/,/g, '')
                                                        }
                                                        const regex = /^(0|[1-9][0-9]*)$/
                                                        if(regex.test(val) || val ==""){
                                                            this.props.errors.clearValidation()
                                                        }
                                                    }}
                                                    onChange={
                                                        (e: any)=>{
                                                            let val = e.currentTarget.value
                                                            if(val.indexOf(',') != -1){
                                                                val = val.replace(/,/g, '')
                                                            }
                                                            const regex = /^(0|[1-9][0-9]*)$/
                                                            if(regex.test(val) || val ==""){
                                                                if(parseInt(val) > 2000000000){
                                                                    const error = {
                                                                        code: this.ERROR_ID,
                                                                        path: '',
                                                                        field_name: '/legalEntities[0]/inactivityMonitorThreshold', 
                                                                        message: 'Value can not exceed 2,000,000,000'
                                                                    }
                                                                    this.props.errors.raiseValidationError(this.ERROR_ID, [error])
                                                                }
                                                                else{
                                                                    legalEntity.inactivityMonitorThreshold = formatNumber(val)
                                                                    handleChange(legalEntity)
                                                                }
                                                            }
                                                            else{
                                                                const error = {
                                                                    code: this.ERROR_ID,
                                                                    path: '',
                                                                    field_name: '/legalEntities[0]/inactivityMonitorThreshold', 
                                                                    message: 'Value can only be an integer'
                                                                }
                                                                this.props.errors.raiseValidationError(this.ERROR_ID, [error])
                                                            }
                                                        }}
                                                    value={formatNumber(legalEntity.inactivityMonitorThreshold) || undefined}
                                                    floatingLabel
                                                    error={errors && errors['//legalEntities[0]/inactivityMonitorThreshold']?errors['//legalEntities[0]/inactivityMonitorThreshold'].message:null}
                                                />
                                            </Row>
                                            <Row>
                                                <Textfield
                                                    label="Expected Call Time To Live (Hours)"
                                                    onBlur={(e: any)=> {
                                                        let val = e.currentTarget.value
                                                        if(val.indexOf(',') != -1){
                                                            val = val.replace(/,/g, '')
                                                        }
                                                        const regex = /^(0|[1-9][0-9]*)$/
                                                        if(regex.test(val) || val ==""){
                                                            this.props.errors.clearValidation()
                                                        }
                                                    }}
                                                    onChange={
                                                        (e: any)=>{
                                                            let val = e.currentTarget.value
                                                            if(val.indexOf(',') != -1){
                                                                val = val.replace(/,/g, '')
                                                            }
                                                            const regex = /^(0|[1-9][0-9]*)$/
                                                            if(regex.test(val) || val ==""){
                                                                if(parseInt(val) > 2000000000){
                                                                    const error = {
                                                                        code: this.ERROR_ID,
                                                                        path: '',
                                                                        field_name: '/legalEntities[0]/expectedCallTtlHours', 
                                                                        message: 'Value can not exceed 2,000,000,000'
                                                                    }
                                                                    this.props.errors.raiseValidationError(this.ERROR_ID, [error])
                                                                }
                                                                else{
                                                                    legalEntity.expectedCallTtlHours = formatNumber(val)
                                                                    handleChange(legalEntity)
                                                                }
                                                            }
                                                            else{
                                                                const error = {
                                                                    code: this.ERROR_ID,
                                                                    path: '',
                                                                    field_name: '/legalEntities[0]/expectedCallTtlHours', 
                                                                    message: 'Value can only be an integer'
                                                                }
                                                                this.props.errors.raiseValidationError(this.ERROR_ID, [error])
                                                            }
                                                        }}
                                                    value={formatNumber(legalEntity.expectedCallTtlHours) || undefined}
                                                    floatingLabel
                                                    error={errors && errors['//legalEntities[0]/expectedCallTtlHours']?errors['//legalEntities[0]/expectedCallTtlHours'].message:null}
                                                />
                                            </Row>
                                            <Row className="acadia-ca-checkbox-row">
                                                <Checkbox 
                                                label={'Allow Intracompany Agreements'}
                                                onChange={
                                                    (e: any)=>{
                                                        toggleCheckbox('allowIntracompanyAgreements')
                                                        }}
                                                checked={legalEntity.allowIntracompanyAgreements}
                                                />
                                            </Row>
                                            <Row className="acadia-ca-checkbox-row">
                                                <Checkbox 
                                                label={'Swift Message Email Notifications'}
                                                onChange={
                                                    (e: any)=>{
                                                        toggleCheckbox('swiftMessageEmailNotifications')
                                                        }}
                                                checked={legalEntity.swiftMessageEmailNotifications}
                                                />
                                            </Row>
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