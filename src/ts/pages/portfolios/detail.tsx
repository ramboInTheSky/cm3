/**
 * Created by alessiofimognari on 09/02/2017.
 */
import * as React from 'react'
import { observer, inject } from 'mobx-react';
import { SliderDetailPanel, SliderDetailSection, Row, Col, bind, getLocalizedDate } from 'common_lib'
import {
  Portfolio,
  PortfolioSummary,
  PortfolioListResponseSummary
} from '../../models'
import {
  Stores,
  StoreNames,
  CommonStores,
  PortfoliosStore
} from '../../stores'
import { MODALS } from '../../../app.settings'

export interface DetailProps {
  data: PortfolioSummary
  isVisible?: boolean
  closeDetailCallback?: () => void
  className?: string
}
export interface DetailState {
  data: PortfolioSummary
  isVisible?: boolean
}
/* Store Props Interface */
export interface DetailConnectedProps extends Partial<Stores> {
  portfolios: PortfoliosStore
}

type _DetailProps = DetailProps & DetailConnectedProps

@inject(StoreNames.portfolios, CommonStores.CommonStoreNames.modals)
@observer // must be after @inject
class DetailComponent extends React.Component<_DetailProps, DetailState> {

  constructor(props: _DetailProps) {
    super(props)
    bind(this)
    this.state = {
      data: props.data || {} as PortfolioSummary,
      isVisible: props.isVisible
    }

  }

  componentWillReceiveProps(newProps: DetailProps) {
    if (JSON.stringify(newProps.data) != JSON.stringify(this.props.data)) {
      if (newProps.isVisible) {
        //fetch additional items
      }
      this.setState({
        data: newProps.data,
        isVisible: newProps.isVisible
      })
    }
  }

  shouldComponentUpdate(newProps: DetailProps) {
    // const { portfolioId } = this.props.data.portfolioSummary
    // return newProps.data.portfolioSummary.portfolioId !== portfolioId
    return true
  }

  componentWillReact() {

  }

  closeDetail() {
    if (this.props.closeDetailCallback) {
      this.props.closeDetailCallback()
    }
    else {
      this.setState({
        isVisible: false
      })
    }
  }



  renderContent(data: Portfolio) {
    const renderTime = getLocalizedDate
    const { className } = this.props
    return (
      data?
      <div className={className || ''}>
        <SliderDetailSection sectionName='Details' isOpen={true} key="details">
          <Col flex={1} className='aam-detail__column'>

            <Row className='aam_row_height'>
              <span className='text-strong'>Workgroup</span>
              <span className='aam-sub-heading'>
                {data.workGroupCode}
              </span>
            </Row>
            
          </Col>
        </SliderDetailSection>

        <SliderDetailSection sectionName='Exposure' isOpen={true} key="exposure">
          <Col flex={1} className='aam-detail__column'>

            <Row className='aam_row_height'>
              <span className='text-strong'>Total Exposure</span>
              <span className='aam-sub-heading'>
                {data.totalExposure}
              </span>
            </Row>
            
          </Col>
        </SliderDetailSection>

      </div>
      : <div></div>
    )
  }

  render() {
    const closeDetail = this.closeDetail
    const renderContent = this.renderContent
    const { isVisible, data={} as PortfolioSummary } = this.state
    const header = data && data.portfolioSummary && data.portfolioSummary.portfolioId ? `ID: ${data.portfolioSummary.portfolioId.toString()}` : ''
    return (
        <Col>
          <Row>
            <SliderDetailPanel
              className="detail_panel"
              isVisible={isVisible || false}
              from_dir="right"
              enterTimeout={400}
              leaveTimeout={400}
              headerText={header}
              closeDetail={closeDetail}
            >
              {renderContent(data.portfolioSummary)}
            </SliderDetailPanel>
          </Row>
        </Col>
    )
  }

}
export const Detail: React.SFC<DetailProps> = (props: _DetailProps) => <DetailComponent {...props} />