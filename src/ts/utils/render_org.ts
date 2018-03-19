import {
    Organization
} from '../models/Organization'
import {
    GridAPI
} from 'common_lib'

export function renderOrganization(organizationArray: Organization[], row: GridAPI.RowNode): string {
    if (organizationArray && organizationArray.length) {
        const retVal = organizationArray.filter((el) => {
            el._id === row.data._id
        })
        if (retVal.length >= 0) {
            return retVal.join(',')
        } else {
            return 'N/A'
        }
    } else {
        return 'N/A'
    }
}