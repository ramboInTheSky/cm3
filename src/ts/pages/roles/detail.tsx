/**
 * Created by alessiofimognari on 09/02/2017.
 */
import * as React from 'react'
import { observer, inject } from 'mobx-react';
import {SliderDetailPanel, SliderDetailSection, Row, Col, bind, getLocalizedDate} from 'common_lib'
import {
    PermissionGroup,
    PermissionGroupList
} from '../../models'
import { 
    Stores, 
    StoreNames, 
    AccessGroupsStore
} from '../../stores'
import * as utils from '../../utils/roles_index'
import {AccessGroupTree} from '../../components/accessgroup_treeview'

export interface DetailProps{
    data: PermissionGroup
    isVisible?: boolean
    closeDetailCallback?:()=>void
    className?: string
    permissionsLookupObj?: {[key:string]:string}
}
export interface DetailState{
    data: PermissionGroup
    isVisible?: boolean
}
/* Store Props Interface */
export interface DetailConnectedProps extends Partial<Stores> {
    accessgroups: AccessGroupsStore
}

type _DetailProps = DetailProps & DetailConnectedProps

@inject(StoreNames.accessgroups)
@observer // must be after @inject
class DetailComponent extends React.Component<_DetailProps, DetailState> {

  constructor(props: _DetailProps) {  
    super(props)
    this.state = {
      data: props.data,
      isVisible: props.isVisible
    }
    bind(this)
  }

  componentWillReceiveProps(newProps: DetailProps) {
    // if (JSON.stringify(newProps.data) != JSON.stringify(this.props.data) ){
    this.setState({
        isVisible: newProps.isVisible,
        data: newProps.data
      })
    // }
  }

  // componentWillReceiveProps(newProps: DetailProps) {
  //   this.setState({
  //     isVisible: newProps.isVisible,
  //     data: newProps.data
  //   })
  // }

  closeDetail() {
    this.setState({
      isVisible: false
    })
    if (this.props.closeDetailCallback) {
      this.props.closeDetailCallback()
    }
  }

  getPermissionNames(permissionIds: Array<string>){
    let permissionNames: string[] = []
    for(let i=0; i< permissionIds.length; i++){
      if(this.props.permissionsLookupObj){
        permissionNames.push(this.props.permissionsLookupObj[permissionIds[i]])
      }
    }
    return permissionNames.sort()
  }
  

  renderContent(data: PermissionGroup){
    const renderTime = getLocalizedDate
    const renderStatus = utils.renderStatus
    const {className, permissionsLookupObj} = this.props
    const getPermissionNames = this.getPermissionNames
    return(
      <div className={className || ''}>
        <SliderDetailSection sectionName='Details' isOpen={true} key="details">
          <Col flex={1} className='aam-detail__column'>
          
            <Row className='aam_row_height'>
              <span className='text-strong'>Name</span>
              <span className='aam-sub-heading'>
                        {data.name}
                      </span>
            </Row>
            <Row className='aam_row_height'>
              <span className='text-strong'>Description</span>
              <span className='aam-sub-heading'>
                        {data.description}
                      </span>
            </Row>
            <Row className='aam_row_height'>
              <span className='text-strong'>Permissions</span>
              <span className='aam-sub-heading'>
                        {data.permissionIds && data.permissionIds.length > 0 ? getPermissionNames(data.permissionIds).join(', '): '-' }
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
           
          </Col>
        </SliderDetailSection>

        <SliderDetailSection sectionName='References' isOpen={true} key="identification">
          <Col flex={1} className='aam-detail__column'>            
            <Row className='aam_row_height'>
              <span className='text-strong'>Permission Group ID</span>
              <span className='aam-sub-heading'>
                        {data._id}
                      </span>
            </Row>
           
          </Col>
        </SliderDetailSection>
        
      </div>
    )
  }

  render() {
    const data = utils.initRoleIfBlank(this.state.data)
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
            headerText={data.name || ''}
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