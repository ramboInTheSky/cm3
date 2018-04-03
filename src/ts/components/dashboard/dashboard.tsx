import * as React from 'react'
import { Responsive, WidthProvider, Layout, Layouts } from 'react-grid-layout';

// import { PortfolioStats } from '../../widgets/portfolio_stats'

import { Widget } from '../../components'

import './dashboard.css'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'


export interface DashboardItem {
    component: Function | JSX.Element
    title: string
    i: string
}

type DashboardEnhancedItem = DashboardItem & Layout

export interface DashboardProps {
    className: string
    items: DashboardEnhancedItem[]
    persist?: boolean
}
export interface DashboardState {
    layout: Layout[]
    components: DashboardItem[]

}

const ResponsiveDashboard = WidthProvider(Responsive)

export class Dashboard extends React.Component<DashboardProps, DashboardState>{
    constructor(props: DashboardProps) {
        super(props)
        const { layout, components } = this.splitProps(props.items)

        this.state = {
            layout: this.tryGetStateFromLocalStorage(layout, components),
            components
        }
    }

    splitProps(items: DashboardEnhancedItem[]) {
        let layout: Layout[] = []
        let components: DashboardItem[] = []
        if (items && items.length) {
            layout = items.reduce((acc: any, current: any) => {
                const dashboardComponent: DashboardItem = { 
                    component: current.component, 
                    title: current.title, 
                    i: current.i 
                }
                //make a temp item short of those 
                let tempItem = { ...current }
                components.push(dashboardComponent)

                delete tempItem.component
                delete tempItem.title
                return acc.concat([tempItem])
            }, [])
        }
        return ({ layout, components })
    }

    tryGetStateFromLocalStorage(propsLayout: Layout[], propsComponents: DashboardItem[]): Layout[] {
        if (this.props.persist) {
            const serializedState = localStorage.getItem('dashboardLayout')
            if (serializedState) {
                try {
                    const savedLayout = JSON.parse(serializedState)
                    const newLayout: Layout[] = propsComponents.map((item: DashboardItem, index: number) => {

                        const layoutItem = savedLayout.filter((layout: Layout) => layout.i === item.i)
                        if (layoutItem.length) {
                            return layoutItem[0]
                        }
                        else {
                            const newItems = propsLayout.filter((layout: Layout) => {
                                return layout.i === item.i
                            })
                            if(newItems.length){
                                return newItems[0]
                            }
                        }
                    })

                    return newLayout
                }
                catch (e) {
                    console.log(e)
                }
            }
        }
        return propsLayout
    }

    trySetLayoutToLocalStorage(layout: Layout[]) {
        if (this.props.persist) {
            try {
                const serializedState = JSON.stringify(layout)
                localStorage.setItem('dashboardLayout', serializedState)
            }
            catch (e) {
                console.log(e)
            }
        }
    }

    onLayoutChange(layout: any, layouts: Layouts) {
        this.trySetLayoutToLocalStorage(layout);
        this.setState({ layout });
    }

    resetLayout() {
        const layout = {} as any
        this.setState({ layout });
    }

    applySameLayoutToLayouts(layout: Layout[]): Layouts {
        return ({
            lg: layout,
            md: layout,
            sm: layout,
            xs: layout
        })
    }

    render() {
        // layout is an array of objects
        // const layout = [
        //     { i: 'a', x: 0, y: 0, w: 6, h: 10, static: false, minW: 4, minH: 3 },
        //     { i: 'b', x: 6, y: 0, w: 6, h: 7, minW: 2, minH: 4 },
        //     { i: 'c', x: 4, y: 1, w: 8, h: 9, minW: 2, minH: 4 },
        //     { i: 'd', x: 0, y: 1, w: 3, h: 9, minW: 2, minH: 4 }
        // ]
        const { className } = this.props
        const { layout, components } = this.state
        const applySameLayoutToLayouts = this.applySameLayoutToLayouts.bind(this)
        const onLayoutChange = this.onLayoutChange.bind(this)
        return (
            <ResponsiveDashboard className={`layout ${className? className : ''}`} layouts={applySameLayoutToLayouts(layout)} rowHeight={30} breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }} onLayoutChange={(layout:Layout, layouts: Layouts) =>
                onLayoutChange(layout, layouts)
            }>
                {components && components.length ?
                    components.map((item, index: number) => {
                        return <Widget key={item.i} title={item.title}>
                            {typeof item.component === 'function' ? item.component() : item.component}
                        </Widget>
                    })
                    : <span style={{ textAlign: 'center' }}>There are no items</span>}
            </ResponsiveDashboard>
        )
    }
}