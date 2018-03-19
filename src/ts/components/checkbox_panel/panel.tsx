import * as React from 'react'
import {
    Row,
    Col,
    Button,
    bind
} from 'common_lib'
import { Textfield, Checkbox } from 'react-mdl'
import { CSSTransitionGroup } from 'react-transition-group'

import './index.css'

//properies
interface CheckboxPanelProps {
    acceptFn: (checkboxItemsArray?: CheckboxPanelEntry[], title?: string) => void
    cancelFn: (checkboxItemsArray?: CheckboxPanelEntry[], title?: string) => void
    show: boolean
    items: CheckboxPanelEntry[],
    validateFn: (checkboxItemsArray?: CheckboxPanelEntry[], title?: string) => boolean
    animation?: AnimationDescriptor
    title: string
    persistSelection?: boolean
    allowDuplicates?: boolean
    itemsPerRow?: number
}

//input array interface to be exported for use in type safety
export interface CheckboxPanelEntry {
    label: string
    value: string
    required?: boolean
    checked?: boolean
}

//TODO: to be migrated to some acadia animation HOC
export interface AnimationDescriptor {
    type: 'slide_right' | 'slide_top' | 'default' | 'slide_in'
    enterTimeout: number
    leaveTimeout: number
}

//internal component state
interface CheckboxPanelState {
    checkboxItemsArray: CheckboxPanelEntry[],
    isConfirmEnabled: boolean
}

export class CheckboxPanel extends React.Component<CheckboxPanelProps, CheckboxPanelState>{
    constructor(props: CheckboxPanelProps) {
        super(props)
        bind(this)
        const checkboxItemsArray = this.sanitizeList(props.items)
        this.state = {
            checkboxItemsArray: checkboxItemsArray,
            isConfirmEnabled: this.validateCheckboxes(checkboxItemsArray)
        }
    }

    sanitizeList(items: CheckboxPanelEntry[]): CheckboxPanelEntry[] {
        const { allowDuplicates } = this.props
        let returnArray

        if (!allowDuplicates) {
            //remove duplicates
            returnArray = items.filter((entry, index, self) =>
                index === self.findIndex((t) => (
                    t.label === entry.label
                ))
            )
        }
        else {
            returnArray = [...items]
        }
        //add checked property to all items defaulting to false if absent
        return returnArray.map((item) => ({ ...item, checked: !!item.checked }))
    }

    validateCheckboxes(checkboxItemsArray?: CheckboxPanelEntry[], title?: string): boolean {
        return this.props.validateFn(checkboxItemsArray || this.state.checkboxItemsArray, this.props.title)
    }

    componentWillReceiveProps(nextProps: CheckboxPanelProps) {
        const { persistSelection, show, items } = this.props
        if (!persistSelection) {
            if (nextProps.show && nextProps.show !== show) {
                //reinitialize
                const checkboxItemsArray = this.sanitizeList(items)
                const isConfirmEnabled = this.validateCheckboxes(checkboxItemsArray)
                this.setState({
                    checkboxItemsArray,
                    isConfirmEnabled
                })
            }
        }
    }

    toggleCheckbox(label: string) {
        const { checkboxItemsArray } = this.state
        const changingElementIndex = checkboxItemsArray.findIndex((el) => label === el.label)
        const newCheckboxItemsArray = checkboxItemsArray.map((item, currentIndex) => changingElementIndex == currentIndex ? { ...item, checked: !item.checked } : item)
        const isConfirmEnabled = this.validateCheckboxes(newCheckboxItemsArray)
        this.setState({
            isConfirmEnabled,
            checkboxItemsArray: newCheckboxItemsArray
        })
    }

    computeGrid(items: CheckboxPanelEntry[]): any[] {
        const { itemsPerRow } = this.props
        let retArray: CheckboxPanelEntry[][] = []
        const len = items.length
        const step = itemsPerRow || 2
        //return a [N x step] 
        for(let i=0, iteration=0; i<len; i += step, iteration++){
            retArray[iteration] = ( items.slice(i, i+step) )
        }
        return retArray
    }


    render() {
        const toggleCheckbox = this.toggleCheckbox
        const { checkboxItemsArray, isConfirmEnabled } = this.state
        const { cancelFn, show, animation, acceptFn, title } = this.props
        const checkboxes = this.computeGrid(checkboxItemsArray)




        // console.log(checkboxes)
        return (
            <CSSTransitionGroup
                transitionName={`aam_animations-${animation ? animation.type : 'default'}`}
                transitionEnterTimeout={animation ? animation.enterTimeout : 250}
                transitionLeaveTimeout={animation ? animation.leaveTimeout : 250}
            >{show ?
                <div className="acadia-checkbox-pane">
                    <span className="acadia-checkbox-pane--header">{title}</span>
                    {checkboxes && checkboxes.length ? checkboxes.map((row, i) => {
                        return (
                            <Row key={`acadia-checkbox-pane--row${i}`} className="acadia-checkbox-pane--row">
                                {row.map((checkboxItem: CheckboxPanelEntry) => {
                                    return (
                                        <Col key={`acadia-checkbox-pane--cell${checkboxItem.label}`} className="acadia-checkbox-pane--cell">
                                            <Checkbox
                                                title={checkboxItem.label}
                                                label={checkboxItem.label}
                                                onChange={
                                                    (e: any) => {
                                                        toggleCheckbox(checkboxItem.label)
                                                    }
                                                }
                                                checked={checkboxItem.checked}
                                            />
                                        </Col>
                                    )
                                })}
                            </Row>
                        )
                    }) : null}


                    <Row className="acadia-checkbox-pane--footer">
                        <Button onClick={(e: Event)=>cancelFn(checkboxItemsArray, title)} type="secondary">CANCEL</Button>
                        <Button onClick={(e: Event) => acceptFn(checkboxItemsArray, title)} disabled={!isConfirmEnabled}>YES</Button>
                    </Row>
                </div>
                : null}
            </CSSTransitionGroup>
        )
    }
}

