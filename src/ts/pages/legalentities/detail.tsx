/**
 * Created by alessiofimognari on 09/02/2017.
 */
import * as React from 'react'
import {SliderDetailPanel, SliderDetailSection, Row, Col, bind, getLocalizedDate} from 'common_lib'
import {
    LegalEntity,
    LegalEntityList
} from '../../models/LegalEntity'
import * as utils from '../../utils/legalentities_index'

export interface DetailProps{
    data: LegalEntity
    isVisible?: boolean
    closeDetailCallback?:()=>void
    className?: string
}
export interface DetailState{
    data: LegalEntity
    isVisible?: boolean
}

export class Detail extends React.Component<DetailProps, DetailState> {

  constructor(props: DetailProps) {  
    super(props)
    this.state = {
      data: props.data,
      isVisible: props.isVisible
    }
    bind(this)
  }

  componentWillReceiveProps(newProps: DetailProps) {
    this.setState({
      isVisible: newProps.isVisible,
      data: newProps.data
    })
  }

  closeDetail() {
    this.setState({
      isVisible: false
    })
    if (this.props.closeDetailCallback) {
      this.props.closeDetailCallback()
    }
  }

  

  renderContent(data: LegalEntity){
    const renderTime = getLocalizedDate
    const renderStatus = utils.renderStatus
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
              <span className='text-strong'>Entity Long Name</span>
              <span className='aam-sub-heading'>
                        {data.name}
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
            <Row className='aam_row_height'>
              <span className='text-strong'>Status</span>
              <span className='aam-sub-heading'>
                        {renderStatus({value: data.enabled})}
                      </span>
            </Row>
          </Col>
        </SliderDetailSection>

        <SliderDetailSection sectionName='References' isOpen={true} key="identifications">
          <Col flex={1} className='aam-detail__column'>
            <Row className='aam_row_height'>
              <span className='text-strong'>Legal Entity Identifier</span>
              <span className='aam-sub-heading word-break-all'>
                        {data.legalEntityIdentifier}
                      </span>
            </Row>
            <Row className='aam_row_height'>
              <span className='text-strong'>Entity Short Name</span>
              <span className='aam-sub-heading'>
                        {data.shortName}
                      </span>
            </Row>
            <Row className='aam_row_height'>
              <span className='text-strong'>Fund Number</span>
              <span className='aam-sub-heading'>
                        {data.fundNumber}
                      </span>
            </Row>
            <Row className='aam_row_height'>
              <span className='text-strong'>Entity ID</span>
              <span className='aam-sub-heading'>
                        {data._id}
                      </span>
            </Row>
            <Row className='aam_row_height'>
              <span className='text-strong'>Counterparty AMP ID</span>
              <span className='aam-sub-heading'>
                        {data.counterpartyAmpId}
                      </span>
            </Row>
            <Row className='aam_row_height'>
              <span className='text-strong'>Organization  ID</span>
              <span className='aam-sub-heading'>
                        {data.organizationId}
                      </span>
            </Row>
          </Col>
        </SliderDetailSection>

        <SliderDetailSection sectionName='Contacts' isOpen={true} key="contacts">
          <Col flex={1} className='aam-detail__column'>
            <Row className='aam_row_height'>
              <span className='text-strong'>Email List</span>
              <span className='aam-sub-heading word-break-all'>
                        {data.emailList}
                      </span>
            </Row>
            {data.isOrgServiceProvider || data.isOrgMultiServiceProvider?
            <Row className='aam_row_height'>
              <span className='text-strong'>Service Provider Email List</span>
              <span className='aam-sub-heading'>
                        {data.serviceProviderEmailList}
                      </span>
            </Row>
            : null}
            <Row className='aam_row_height'>
              <span className='text-strong'>Email Enabled</span>
              <span className='aam-sub-heading'>
                         {utils.renderYesNo({value: data.emailEnabled || false})}
                      </span>
            </Row>
          </Col>
        </SliderDetailSection>

        <SliderDetailSection sectionName='Settings' isOpen={true} key="settings">
          <Col flex={1} className='aam-detail__column'>
            <Row className='aam_row_height'>
              <span className='text-strong'>Inactivity Monitor Threshold</span>
              <span className='aam-sub-heading word-break-all'>
                        {utils.formatNumber(data.inactivityMonitorThreshold)} {data.inactivityMonitorThreshold?' min':null}
                      </span>
            </Row>
            <Row className='aam_row_height'>
              <span className='text-strong'>Expected Call Time to Live</span>
              <span className='aam-sub-heading'>
                        {utils.formatNumber(data.expectedCallTtlHours)}{data.expectedCallTtlHours? ' hours': null}
                      </span>
            </Row>
            <Row className='aam_row_height'>
              <span className='text-strong'>Intracompany Agreements</span>
              <span className='aam-sub-heading'>
                        {utils.renderYesNo({value: data.allowIntracompanyAgreements || false})}
                      </span>
            </Row>
            <Row className='aam_row_height'>
              <span className='text-strong'>Swift Message Email Notifications</span>
              <span className='aam-sub-heading'>
                {utils.renderYesNo({value: data.swiftMessageEmailNotifications || false})}
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
