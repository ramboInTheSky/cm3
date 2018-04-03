export interface WorkItem {
    workItemId: number
    workItemVersionID: string
    busObjId: number
    busObjVersionId: string
    assignor: string
    assignee: string
    updateUserId: null
    updateOwner: null
    updateTimestamp: string
    processStep: string
    lockUserId?: string
    staleIndicator?: 'Y' | 'N'
    editable: true
}