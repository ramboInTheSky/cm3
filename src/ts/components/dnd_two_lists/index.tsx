import * as React from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {DnDDraggable} from './draggable'
import {
    Row,
    Col,
    ErrorBox,
    bind,
    Icon  
} from 'common_lib'
import {Textfield} from 'react-mdl'
import './index.css'

/* Interfaces and Types */
export interface DnDProps<T> {
    sources: T[]
    destinations: T[]
    itemsId: string
    itemsName: string
    itemsDescription?: string
    className: string
    sourcesName: string
    destinationName: string
    returnFn: Function
}

export interface DnDState<T>{
    sources: T[]
    unfilteredSources: T[]
    destinations: T[]
    unfilteredDestinations: T[],
    sourceFilter?: string,
    destinationFilter?: string
}

export class DnDTwoLists<T> extends React.Component<DnDProps<T>, DnDState<T>> {
    private unfilteredElementIndex:number = -1
    constructor(props: DnDProps<T>) {
        super(props)
        bind(this)
        this.state = {
            sources: Array.from(props.sources).sort(this.sortNames),
            destinations: Array.from(props.destinations).sort(this.sortNames),
            unfilteredDestinations: Array.from(props.destinations).sort(this.sortNames),
            unfilteredSources: Array.from(props.sources).sort(this.sortNames)
        }
    }
    
sortNames(a: any, b: any){
    var x = a.name.toLowerCase();
    var y = b.name.toLowerCase();
    if (x < y) {return -1;}
    if (x > y) {return 1;}
    return 0;
}

onDragStart(initial: any){
        document.body.classList.add('is-dragging')
        document.getElementsByClassName('draggable_modal-wrapper')[0].classList.add('transform_none_fix')
    }
onDragEnd(result: any){
    document.body.classList.remove('is-dragging')
    document.getElementsByClassName('draggable_modal-wrapper')[0].classList.remove('transform_none_fix')
    if (!result.destination) {
        return;
    }

    let sources: T[] = Array.from(this.state.sources)
    let unfilteredSources: T[] = Array.from(this.state.unfilteredSources)
    let destinations: T[] = Array.from(this.state.destinations)
    let unfilteredDestinations: T[] = Array.from(this.state.unfilteredDestinations)

    if(result.destination.droppableId == result.source.droppableId ){
        if(result.destination.droppableId.indexOf('source') != -1){
            sources = this.reorder(
                this.state.sources,
                result.source.index,
                result.destination.index
            )
            unfilteredSources = this.reorder(
                this.state.unfilteredSources,
                result.source.index,
                result.destination.index
            )
        }
        else{
                destinations = this.reorder(
                this.state.destinations,
                result.source.index,
                result.destination.index
            )
            unfilteredDestinations = this.reorder(
                this.state.unfilteredDestinations,
                result.source.index,
                result.destination.index
            )
        }
    }
    else{
        if(result.destination.droppableId.indexOf('destination') != -1){
            const [removed] = sources.splice(result.source.index, 1)
            destinations.splice(result.destination.index, 0, removed)

            this.unfilteredElementIndex = -1
            const unfilteredElement:T | undefined = unfilteredSources.find((item: any, index)=>{
                this.unfilteredElementIndex = index
                return item[this.props.itemsId] == result.draggableId
            })
            if(unfilteredElement && this.unfilteredElementIndex != -1){
                const [removed] = unfilteredSources.splice(this.unfilteredElementIndex, 1)
                unfilteredDestinations.splice(result.destination.index, 0, removed)
            }
        }
        else{
            const [removed] = destinations.splice(result.source.index, 1)
            sources.splice(result.destination.index, 0, removed)

            this.unfilteredElementIndex = -1
            const unfilteredElement:T | undefined = unfilteredDestinations.find((item: any, index)=>{
                this.unfilteredElementIndex = index
                return item[this.props.itemsId] == result.draggableId
            })
            if(unfilteredElement && this.unfilteredElementIndex != -1){
                const [removed] = unfilteredDestinations.splice(this.unfilteredElementIndex, 1)
                unfilteredSources.splice(result.destination.index, 0, removed)
            }
        }
    }

    this.props.returnFn(unfilteredDestinations)

    this.setState({
        sources,
        destinations,
        unfilteredSources,
        unfilteredDestinations
    })

    //workaround to fix scrolled placeholders not re-rendering this should not affect global re-render
    this.filterSources(this.state.sourceFilter)
    this.filterDestinations(this.state.destinationFilter)
}

    // a little function to help us with reordering the result
    reorder(list: T[], startIndex: number, endIndex: number ):T[]{
        const result = Array.from(list)
        const [removed] = result.splice(startIndex, 1)
        result.splice(endIndex, 0, removed)

        return result as T[]
    }

    getListStyle(isDraggingOver: any){
        return{
            // background: isDraggingOver ? '#eee' : '#fff',
            border: isDraggingOver ? '1px dashed #00746b' : '2px dashed #ececec',
            padding: 10,
        }
    }

    getItemStyle(draggableStyle: any, isDragging: any){
        return {
            // some basic styles to make the destinations look a bit nicer
            userSelect: 'none',
            cursor: 'pointer',
            // change background colour if dragging
            background: isDragging ? '#666' : '#fff',
            color: isDragging ? '#fff' : '#666',
            // styles we need to apply on draggables
            ...draggableStyle
        }
    }

    filterSources(val?: any){
        if(val){
            const sources = Array.from(this.state.unfilteredSources)
            const filtered = sources.filter((item: any)=>{
                    return item[this.props.itemsName].toLowerCase().includes(val.toLowerCase())
            })
            this.setState({
                sources: filtered,
                sourceFilter: val
            })
        }
        else{
            this.setState({
                sources: this.state.unfilteredSources,
                sourceFilter: val
            })
        }
    }

    filterDestinations(val?: any){
        if(val){
            const destinations = Array.from(this.state.unfilteredDestinations)
            const filtered = destinations.filter((item: any)=>{
                    return item[this.props.itemsName].toLowerCase().includes(val.toLowerCase())
            })
            this.setState({
                destinations: filtered,
                destinationFilter: val
            })
        }
        else{
            this.setState({
                destinations: this.state.unfilteredDestinations,
                destinationFilter: val
            })
        }
    }

    clearFilterSources(e: any){
        console.log(e)
        e.preventDefault()
        
        this.filterSources(undefined)
    }

    clearFilterDestinations(e: any){
        console.log(e)
        e.preventDefault()
        this.filterDestinations(undefined)
    }


    moveAllToDest(){
        let filtersArray = document.getElementsByClassName('acadia-draggableList-filter') as HTMLCollectionOf<HTMLInputElement>
        filtersArray[0].value = filtersArray[1].value = ''
        this.props.returnFn(this.state.unfilteredDestinations.concat(this.state.sources))
        
        this.setState({
            destinations: this.state.sources.concat(this.state.destinations), 
            unfilteredDestinations : this.state.unfilteredDestinations.concat(this.state.sources), 
            unfilteredSources: this.state.unfilteredSources.filter((item)=>{
                return this.state.sources.indexOf(item) == -1
            }), 
            sources: [] 
        })
        
    }

    moveAllToSource(){
        let filtersArray = document.getElementsByClassName('acadia-draggableList-filter') as HTMLCollectionOf<HTMLInputElement>
        filtersArray[0].value = filtersArray[1].value = ''
        this.props.returnFn(this.state.unfilteredDestinations.filter((item)=>{
                return this.state.destinations.indexOf(item) == -1
            }))

        this.setState({
            unfilteredSources: this.state.unfilteredSources.concat(this.state.destinations), 
            sources: this.state.sources.concat(this.state.destinations),
            destinations: [],
            unfilteredDestinations: this.state.unfilteredDestinations.filter((item)=>{
                return this.state.destinations.indexOf(item) == -1
            })
        })

    }

    filterArray(arr1: Array<T>, arr2: Array<T>):Array<T>{ //filter from arr1 elements that are in arr2
        return arr1.filter((item: any)=>{
            for(let i=0; i< arr2.length; i++){
                if((arr2[i] as any)._id === item._id){
                    return false
                }
            }
            return true
        })
    }

    render(){
        const {itemsId, itemsName, itemsDescription, className, sourcesName, destinationName} = this.props
        const {sources, destinations, sourceFilter, destinationFilter} = this.state
        const onDragStart = this.onDragStart
        const onDragEnd = this.onDragEnd
        const getListStyle = this.getListStyle
        const getItemStyle = this.getItemStyle
        const filterSources = this.filterSources
        const clearFilterSources = this.clearFilterSources
        const filterDestinations = this.filterDestinations
        const clearFilterDestinations = this.clearFilterDestinations
        const moveAllToDest = this.moveAllToDest
        const moveAllToSource = this.moveAllToSource
        const filterArray = this.filterArray
        // console.log('sources', sources)
        // console.log(this.state.unfilteredSources)
        // console.log('destinations', destinations)
        // console.log(this.state.unfilteredDestinations)
        // const sortedSources = Array.from(sources).sort(this.sortNames)
        return(
            <DragDropContext onDragStart={this.onDragStart} onDragEnd={this.onDragEnd}>
                <div>
                <div className="acadia-dnd_list-container">
                    <h2>{sourcesName}</h2>
                    <div>
                        <Textfield
                            label="Filter"
                            value={sourceFilter}
                            onChange={
                                (e: any)=>{
                                    filterSources(e.currentTarget.value)
                                    }}
                            className="acadia-draggableList-filter"
                        />
                       
                        <a className="acadia-draggableList-cancelFilter" onClick={clearFilterSources}><Icon name="times"/></a>
                    </div>
                    <div className="acadia-dnd_list">
                        
                        <Droppable droppableId={`${className}_source`} >
                        {(provided: any, snapshot: any) => (
                            <div
                                className={`acadia-dnd_list-placeholder${!sources || sources.length == 0?'-empty':''}`}
                                ref={provided.innerRef}
                                style={getListStyle(snapshot.isDraggingOver)}
                            >
                               <DnDDraggable snapshot={snapshot} sources={filterArray(sources, destinations)} itemsId={itemsId} itemsName={itemsName} itemsDescription={itemsDescription} getItemStyle={getItemStyle}/>
                            {sources.length ==0? <h2 style={{textAlign:'center'}}>Drop your items here</h2> : null}
                            {provided.placeholder}
                            </div>
                        )}
                        </Droppable>
                    </div>
                </div>

                <div className="acadia-dnd_list-container-separator">
                    <div onClick={(e)=>moveAllToSource()} style={{marginBottom:20}}> <Icon name="long-arrow-left"/> </div>
                    <div onClick={(e)=>moveAllToDest()}> <Icon name="long-arrow-right"/> </div>
                </div>


                <div className="acadia-dnd_list-container">
                    <h2>{destinationName}</h2>
                    <div>
                        <Textfield
                            label="Filter"
                            value={destinationFilter}
                            onChange={
                                (e: any)=>{
                                    filterDestinations(e.currentTarget.value)
                                    }}
                            className="acadia-draggableList-filter"
                        />
                        <a className="acadia-draggableList-cancelFilter" onClick={clearFilterDestinations}><Icon name="times"/></a>
                    </div>
                    <div className="acadia-dnd_list">
                        
                        <Droppable droppableId={`${className}_destination`} >
                        {(provided: any, snapshot: any) => (
                            <div
                                className={`acadia-dnd_list-placeholder${!destinations || destinations.length == 0?'-empty':''}`}
                                ref={provided.innerRef}
                                style={getListStyle(snapshot.isDraggingOver)}
                            >
                                <DnDDraggable snapshot={snapshot} sources={destinations} itemsId={itemsId} itemsName={itemsName} itemsDescription={itemsDescription} getItemStyle={getItemStyle}/>
                            {destinations.length ==0 ? <h2 style={{textAlign:'center'}}>Drop your items here</h2> : null}
                            {provided.placeholder}
                            </div>
                        )}
                        </Droppable>
                    </div>
                </div>
            </div>
        </DragDropContext>

        )
    }
}
