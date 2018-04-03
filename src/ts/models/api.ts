//request
export class ListApiRequest{
    offset: number = 0
    itemsPerPage: number = 2000
    sort: SortObj[] = []
    filters: FilterObj[] = []
    logic: FilterLogic
    workgroups: string[] = []
    responseType: string = 'list' 
    status?: string
}


//response
export interface ListApiResponse{
    pagination: Pagination
}

export class Pagination{
    offset: number
    itemsPerPage: number 
    limitReached: boolean
    totalItems: number
    sort: SortObj[]
    filter: FilterObj[]
    logic: FilterLogic
    workgroups: string[]
    workGroupFieldName?: string
}

export type FilterOperator = 'NT' | 'GT' | 'EQ' | 'SW' | 'GE' | 'EW' | 'CT' | 'BT' | 'LT' | 'LE'

export type FilterLogic = 'or' | 'and'

export interface FilterObj{
    field: string
    value: string
    operator: FilterOperator
    valueTo?: string
    type: 'string' | 'number' | 'date' | 'boolean'
}

export interface SortObj{
    field: string
    dir: 'asc' | 'desc'
} 
