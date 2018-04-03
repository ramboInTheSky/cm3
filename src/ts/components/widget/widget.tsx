import * as React from 'react'
import './widget.css'

export interface WidgetProps {
    title: string
    children: JSX.Element
}

export const Widget = (props: WidgetProps): JSX.Element => {
    const { title, children, ...rest } = props
    return (
        <div {...rest} className="widget">
            <span className="widget-header">
                <span>{title}</span>
            </span>
            <span className="widget-body">
                {children}
            </span>
        </div>
    )
}