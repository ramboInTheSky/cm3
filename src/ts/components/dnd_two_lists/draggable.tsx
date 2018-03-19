import * as React from 'react'
import { Draggable } from 'react-beautiful-dnd';

export interface DnDDraggableProps{
    sources: any
    itemsId: string
    getItemStyle: Function
    itemsDescription?: any
    itemsName: string
    snapshot: any
}

export class DnDDraggable extends React.PureComponent<DnDDraggableProps, {}> {

shouldComponentUpdate(nextProps: DnDDraggableProps){
    return nextProps.snapshot.isDraggingOver == this.props.snapshot.isDraggingOver
}

render(){
    const {sources, getItemStyle, itemsDescription, itemsId, itemsName} = this.props
    
    return(
        <div>
        {sources.map((item: any, index: number)=> (
            <Draggable key={item[itemsId] + index} draggableId={item[itemsId]} index={index}>
                {(provided: any, snapshot: any) => {
                    
                    return (
                    <div className="acadia-draggable_item">
                        <div
                            className="acadia-draggable_item-inner"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={getItemStyle(
                                provided.draggableProps.style,
                                snapshot.isDragging
                            )}
                            {...provided.dragHandleProps}
                        >
                            <p className="acadia-dnd-cardTitle">{item[itemsName]}</p>
                            {itemsDescription && item[itemsDescription]?
                            <p className="acadia-dnd-cardDescription">
                                {typeof item[itemsDescription] == 'object' ? item[itemsDescription].join(', ') : item[itemsDescription]}
                            </p>:null}
                        </div>
                        {provided.placeholder}
                    </div>
                )} }
            </Draggable>
        ))}
        </div>
    )


}

}