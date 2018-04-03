import { ListApiResponse, WorkItem, DataDictionaryObject, StatisticsObject } from './'

export class Portfolio {
    portfolioId?: number
    agreementId?: number
    workGroupCode?: string = ''
    agreementCode?: string = ''
    agreementName?: string = ''
    agreementType?: string = ''
    countryCode?: string = ''
    valuationDate?: string = ''
    businessDate?: string = ''
    notificationTime?: string = ''
    disputeTime?: string = ''
    finalState?: string = ''
    currency?: string = ''
    timeZone?: string = ''
    valuationAgent?: string = ''
    assetPriceSet?: string = ''
    fxRateSet?: string = ''
    partyACode?: string = ''
    partyBCode?: string = ''
    principalCode?: string = ''
    includedTransactionCount?: number
    evaluationMethod?: string = ''
    totalExposure?: number
    independentAmount?: number
    thresholdAmount?: number
    creditSupportAmount?: number
    deliveryReturn?: number
    minimumTransferAmount?: number
    roundingAmount?: number
    callAmount?: number
    currentCoverageRatio?: number
    cashCollateral?: number
    nonCashCollateral?: number
    creditSupportBalance?: number
    minimumHeldCollateral?: number
    excessCollateral?: number
    totalTransfer?: number
    projectedCoverageRation?: number
    nonNettedObligationUs?: number
    nonNettedObligationThem?: number
    nonNettedCollateralUs?: number
    nonNettedCollateralThem?: number
    nonNettedExposureUs?: number
    nonNettedExposureThem?: number
    excludedTransactionCount?: number
    exceptionTransactionCount?: number
    productSummaryCount?: number
    // workItem?: WorkItem
}

export interface PortfolioSummary extends WorkItem {
    //-WorkItem properties here-
    portfolioSummary: Portfolio
}

export interface PortfolioListResponseSummary extends ListApiResponse {
    //pagination: Pagination here
    portfolioSummaries: PortfolioSummary[]
}

export interface PortfolioListResponse {
    //pagination: Pagination here
    portfolios: Portfolio[]
}

export interface PortfolioStatsObject {
    metadata: DataDictionaryObject
    stats: {
        all: StatisticsObject
        completed: StatisticsObject
        inProgress: StatisticsObject
        open: StatisticsObject
        summary: StatisticsObject
    }
}

