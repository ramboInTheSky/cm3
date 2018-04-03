import * as React from 'react'
import './progressbar.css'

export interface ProgressBarProps {
    index: number
    label: string
    value: number
    percentage: number
}

export const ProgressBar = (props: any): JSX.Element => {
    const {index, label, value, percentage} = props
    return (
        <div key={index} className="progress-item-wrapper">
            <span className="progress-label" >
                {label}
            </span>
            <span className="progress-bar-wrapper">
                <span className="progress-bar" style={{ width: percentage+ '%' }}>
                    {value}
                </span>
            </span>
        </div>
    )
}