/**
 * Created by alessiofimognari on 09/02/2017.
 */
import * as React from 'react'
import { observer, inject } from 'mobx-react';
import {SliderDetailPanel, SliderDetailSection, Row, Col, bind, getLocalizedDate} from 'common_lib'
import {
    AccessGroup,
    AccessGroupList
} from '../../models/AccessGroup'
import { 
    Stores, 
    StoreNames, 
    AccessGroupsStore
} from '../../stores'
import * as utils from '../../utils/accessgroups_index'
import {AccessGroupTree} from '../../components/accessgroup_treeview'

export interface DetailProps{
    data: AccessGroup
    isVisible?: boolean
    closeDetailCallback?:()=>void
    className?: string
}
export interface DetailState{
    data: AccessGroup
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
    if (newProps.isVisible && newProps.isVisible === !this.props.isVisible) {  
      
    }
    if(newProps.data._id){
        this.props.accessgroups.fetchExpandedDetails(newProps.data._id, true)
      }
    this.setState({
        isVisible: newProps.isVisible,
        data: newProps.data
      })
  }

  componentWillReact(){
    
  }

  closeDetail() {
    this.setState({
      isVisible: false
    })
    if (this.props.closeDetailCallback) {
      this.props.closeDetailCallback()
    }
  }

  

  renderContent(data: AccessGroup){
    const renderTime = getLocalizedDate
    const renderYesNo = utils.renderYesNo
    const {className} = this.props
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
              <span className='text-strong'>Name</span>
              <span className='aam-sub-heading'>
                        {data.name}
                      </span>
            </Row>
             <Row className='aam_row_height'>
              <span className='text-strong'>Default</span>
              <span className='aam-sub-heading'>
                        {renderYesNo({value: data.orgLevel || false})}
                      </span>
            </Row>
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
              <span className='text-strong'>Access Group ID</span>
              <span className='aam-sub-heading word-break-all'>
                        {data._id}
                      </span>
            </Row>
            <Row className='aam_row_height'>
              <span className='text-strong'>Service Provider Group AMP ID</span>
              <span className='aam-sub-heading'>
                        {data.serviceProviderGroupAmpId}
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
          </Col>
        </SliderDetailSection>

        <SliderDetailSection sectionName='Assignments' isOpen={true} key="assignments">
          <Col flex={1} className='aam-detail__column'>
            <Row className='aam_row_height'>
              <span className='text-strong'>
                <AccessGroupTree accessgroup={this.props.accessgroups.expandedDetails} className="acadia-accessgroup-expanded-detail_wrapper_lite"/>
              </span>
              <span className='aam-sub-heading'>
                        </span>
            </Row>
          </Col>
        </SliderDetailSection>

      </div>
    )
  }

  render() {
    const data = utils.initEntityIfBlank(this.state.data)
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