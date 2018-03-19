/**
 * Created by alessiofimognari on 09/02/2017.
 */
import * as React from 'react'
import { observer, inject } from 'mobx-react';
import {SliderDetailPanel, SliderDetailSection, Row, Col, bind, getLocalizedDate} from 'common_lib'
import {
    User,
    UserList,
    PermissionGroup
} from '../../models'
import { 
    Stores, 
    StoreNames, 
    AccessGroupsStore,
    UsersStore,
    CommonStores, 
    PermissionGroupsStore
} from '../../stores'
import * as utils from '../../utils/users_index'
import {AccessGroupTree} from '../../components/accessgroup_treeview'
import {MODALS} from '../../../app.settings'

export interface DetailProps{
    data: User
    isVisible?: boolean
    closeDetailCallback?:()=>void
    className?: string
}
export interface DetailState{
    data: User
    isVisible?: boolean,
    expandedPermissionGroups?: PermissionGroup[]
    expandedDelegationGroups?: PermissionGroup[]
}
/* Store Props Interface */
export interface DetailConnectedProps extends Partial<Stores> {
    accessgroups: AccessGroupsStore
    users: UsersStore
    modals: CommonStores.ModalStore
    permissiongroups: PermissionGroupsStore
}

type _DetailProps = DetailProps & DetailConnectedProps

@inject(StoreNames.accessgroups, StoreNames.users, CommonStores.CommonStoreNames.modals, StoreNames.permissiongroups)
@observer // must be after @inject
class DetailComponent extends React.Component<_DetailProps, DetailState> {

  constructor(props: _DetailProps) {  
    super(props)
    bind(this)
    this.state = {
      data: props.data,
      isVisible: props.isVisible,
      expandedPermissionGroups: undefined,
      expandedDelegationGroups: undefined
    }
    
  }

  componentWillReceiveProps(newProps: DetailProps) {
      if (JSON.stringify(newProps.data) != JSON.stringify(this.props.data) ){
        if(newProps.isVisible){
          this.props.users.fetchLoginDetails(newProps.data._id)
          if(newProps.data.accessGroupId){
            this.props.accessgroups.fetchExpandedDetails2(newProps.data.accessGroupId, true)
          }
          this.props.permissiongroups.fetchPermissionGroupsByIds(newProps.data.permissionGroupIds, true)
          this.props.permissiongroups.fetchDelegationGroupsByIds(newProps.data.permissionGroupDelegationIds, true)
        }
      this.setState({
        data: newProps.data,
        isVisible: newProps.isVisible
      })
    }
  }

  shouldComponentUpdate(newProps: DetailProps){
    return newProps.data._id !== this.props.data._id
  }

  componentWillReact(){
    // this.setState({
    //   expandedPermissionGroups: this.props.permissiongroups.expandedDetails
    // })
  }

  closeDetail() {
    
    if (this.props.closeDetailCallback) {
      this.props.closeDetailCallback()
    }
    else{
      this.setState({
        isVisible: false
      })
    }
  }

  

  renderContent(data: User){
    const renderTime = getLocalizedDate
    const renderStatus = utils.renderStatus
    const {className} = this.props
    const successfulLoginDetailsArray = this.props.users.loginDetails && this.props.users.loginDetails.length > 0?this.props.users.loginDetails.filter((item)=> item.result == 'Success' ): null
    const failedLoginDetailsArray = this.props.users.loginDetails && this.props.users.loginDetails.length > 0?this.props.users.loginDetails.filter((item)=> item.result != 'Success' ): null
    const lastSuccessfulLoginEvent = successfulLoginDetailsArray && successfulLoginDetailsArray.length > 0? successfulLoginDetailsArray[0] : null
    const lastFailedLoginEvent = failedLoginDetailsArray && failedLoginDetailsArray.length > 0? failedLoginDetailsArray[0] : null
    return(
      <div className={className || ''}>
        <SliderDetailSection sectionName='Details' isOpen={true} key="details">
          <Col flex={1} className='aam-detail__column'>
          <Row className='aam_row_height'>
              <span className='text-strong'>Organization</span>
              <span className='aam-sub-heading'>
                        {data.organizationName}
                      </span>
            </Row>
            <Row className='aam_row_height'>
              <span className='text-strong'>Username</span>
              <span className='aam-sub-heading'>
                        {data.username}
                      </span>
            </Row>
            <Row className='aam_row_height'>
              <span className='text-strong'>User Type</span>
              <span className='aam-sub-heading'>
                        {data.userType}
                      </span>
            </Row>
            <Row className='aam_row_height'>
              <span className='text-strong'>Description</span>
              <span className='aam-sub-heading'>
                        {data.description}
                      </span>
            </Row>
            <Row className='aam_row_height'>
              <span className='text-strong'>Full Name</span>
              <span className='aam-sub-heading'>
                        {data.name}
                      </span>
            </Row>
            <Row className='aam_row_height'>
              <span className='text-strong'>Email</span>
              <span className='aam-sub-heading'>
                        {data.email}
                      </span>
            </Row>
            <Row className='aam_row_height'>
              <span className='text-strong'>Password Policy</span>
              <span className='aam-sub-heading'>
                        {data.passwordPolicyName}
                      </span>
            </Row>
            <Row className='aam_row_height'>
              <span className='text-strong'>Status</span>
              <span className='aam-sub-heading'>
                        {renderStatus({value: data.enabled, locked: data.failedLoginLockout})}
                      </span>
            </Row>
          </Col>
        </SliderDetailSection>


        <SliderDetailSection sectionName='Activity' isOpen={true} key="activity">
          <Col flex={1} className='aam-detail__column'>            
            <Row className='aam_row_height'>
              <span className='text-strong'>Date Created</span>
              <span className='aam-sub-heading'>
                        {renderTime(data.created, true)}
                      </span>
            </Row>
            <Row className='aam_row_height'>
              <span className='text-strong'>Date Modified</span>
              <span className='aam-sub-heading'>
                        {renderTime(data.modified, true)}
                      </span>
            </Row>
            {lastSuccessfulLoginEvent? 
            <div>
            <Row className='aam_row_height'>
              <span className='text-strong'>Last Successful Login</span>
              <span className='aam-sub-heading'>
                        {renderTime(lastSuccessfulLoginEvent.time, true)}
                      </span>
            </Row>
            <div className="indent_1">
            <Row className='aam_row_height'>
              <span className='text-strong'>IP Address</span>
              <span className='aam-sub-heading'>
                        {lastSuccessfulLoginEvent.ipAddress}
                      </span>
            </Row>
            <Row className='aam_row_height'>
              <span className='text-strong'>Browser</span>
              <span className='aam-sub-heading textAlignRight'>
                        {lastSuccessfulLoginEvent.userAgent}
                      </span>
            </Row>
            </div>
            </div> : 
            <Row className='aam_row_height'>
              <span className='text-strong'>Last Successful Login</span>
              <span className='aam-sub-heading'>
                        -
                      </span>
            </Row>
            }
            {lastFailedLoginEvent? 
            <div>
            <Row className='aam_row_height'>
              <span className='text-strong'>Last Failed Login</span>
              <span className='aam-sub-heading'>
                        {renderTime(lastFailedLoginEvent.time, true)}
                      </span>
            </Row>
            <div className="indent_1">
            <Row className='aam_row_height'>
              <span className='text-strong'>IP Address</span>
              <span className='aam-sub-heading'>
                        {lastFailedLoginEvent.ipAddress}
                      </span>
            </Row>
            <Row className='aam_row_height'>
              <span className='text-strong'>Browser</span>
              <span className='aam-sub-heading textAlignRight'>
                        {lastFailedLoginEvent.userAgent}
                      </span>
            </Row>
            </div>
            </div> : 
            <Row className='aam_row_height'>
              <span className='text-strong'>Last Failed Login</span>
              <span className='aam-sub-heading'>
                        -
                      </span>
            </Row>
            }
          </Col>
        </SliderDetailSection>

        <SliderDetailSection sectionName='References' isOpen={true} key="identification">
          <Col flex={1} className='aam-detail__column'>            
            <Row className='aam_row_height'>
              <span className='text-strong'>User ID</span>
              <span className='aam-sub-heading'>
                        {data._id}
                      </span>
            </Row>
            <Row className='aam_row_height'>
              <span className='text-strong'>User AMP ID</span>
              <span className='aam-sub-heading'>
                        {data.userAmpId}
                      </span>
            </Row>
            <Row className='aam_row_height'>
              <span className='text-strong'>Organization ID</span>
              <span className='aam-sub-heading'>
                       {data.organizationId}
                      </span>
            </Row>
            <Row className='aam_row_height'>
              <span className='text-strong'>Organization AMP ID</span>
              <span className='aam-sub-heading'>
                        {data.organizationAmpId}
                      </span>
            </Row>
            <Row className='aam_row_height'>
              <span className='text-strong'>Trading Party AMP ID</span>
              <span className='aam-sub-heading'>
                        {data.tradingPartyAmpId}
                      </span>
            </Row>
            <Row className='aam_row_height'>
              <span className='text-strong'>Access Group ID</span>
              <span className='aam-sub-heading'>
                        {data.accessGroupId}
                      </span>
            </Row>
          </Col>
        </SliderDetailSection>

        <SliderDetailSection sectionName='User Access' isOpen={true} key="access">
          <Col flex={1} className='aam-detail__column'>            
            <Row className='aam_row_height'>
              <span className='text-strong'>Access Group Name</span>
              <span className='aam-sub-heading'>
                        {data.accessGroupName}
                      </span>
            </Row>
            <Row className='aam_row_height acadia-no_bottom_border'>
              <span className='text-strong'>Organizations And Entities</span>
              <span className='aam-sub-heading'>
                        </span>
            </Row>
            <Row className='aam_row_height'>
              <span className='text-strong'>
                {data.accessGroupId?<AccessGroupTree accessgroup={this.props.accessgroups.expandedDetails2} className="acadia-accessgroup-expanded-detail_wrapper_lite"/> : null}
              </span>
              <span className='aam-sub-heading'>
              </span>
            </Row>
          </Col>
        </SliderDetailSection>

        <SliderDetailSection sectionName='Permission Groups' isOpen={true} key="entitlements">
          <Col flex={1} className='aam-detail__column'>            
               {this.props.permissiongroups.expandedDetails? this.props.permissiongroups.expandedDetails.map((item: PermissionGroup)=> (
                  <Row key={item._id} className='aam_row_height'>
                    <span className='text-strong'>
                      {item.name}
                    </span>
                    <span className='aam-sub-heading'>
                      {item.description}
                    </span>
                  </Row>
                )): null}
          </Col>
        </SliderDetailSection>

         <SliderDetailSection sectionName='Delegation Groups' isOpen={true} key="delegation">
          <Col flex={1} className='aam-detail__column'>            
               {this.props.permissiongroups.expandedDelegationDetails? this.props.permissiongroups.expandedDelegationDetails.map((item: PermissionGroup)=> (
                  <Row key={item._id} className='aam_row_height'>
                    <span className='text-strong'>
                      {item.name}
                    </span>
                    <span className='aam-sub-heading'>
                      {item.description}
                    </span>
                  </Row>
                )): null}
          </Col>
        </SliderDetailSection>

        {data.scopes && data.scopes.length && data.scopes.length > 0?
        <SliderDetailSection sectionName='Legacy Scopes' isOpen={true} key="scopes">
          <Col flex={1} className='aam-detail__column'>         
            <Row className='aam_row_height'>  
              <span className='text-strong'>
                  Assigned Scopes
                </span>
                
                    <span className='aam-sub-heading'>
                      <ul>
                       {data.scopes.sort().map((item: string, index: number)=> (
                     <li key={index}> {item}</li>
                        ))}
                        </ul>
                    </span>
              
              </Row> 
          </Col>
        </SliderDetailSection>
        : null}
        
      </div>
    )
  }

  render() {
    const data = utils.initUserIfBlank(this.state.data)
    const closeDetail = this.closeDetail
    const renderContent = this.renderContent
    const {isVisible} = this.state
    return (
      this.props.className == 'aam-tooltipDetailView'? renderContent(data) :
      <Col>
        <Row>
          <SliderDetailPanel
            className="detail_panel"
            isVisible={isVisible || false}
            from_dir="right"
            enterTimeout={400}
            leaveTimeout={400}
            headerText={data.username || ''}
            closeDetail={closeDetail}
          >
            {renderContent(data)}
          </SliderDetailPanel>
        </Row>
      </Col>
    )
  }

}
 export const Detail : React.SFC<DetailProps> = (props: _DetailProps) => <DetailComponent {...props}/>