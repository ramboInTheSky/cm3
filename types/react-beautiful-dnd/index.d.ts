declare module 'react-beautiful-dnd' {
  import * as React from 'react'

  export type Id = string

  export type DraggableId = Id

  export type DroppableId = Id

  export type TypeId = Id

  export type DraggableLocation = {
    droppableId: DroppableId
    index: number
  }

  // -------------------------

  export type DragStart = {
    draggableId: DraggableId
    type: TypeId
    source: DraggableLocation
  }

  export type DropResult = {
    draggableId: DraggableId,
    type: TypeId
    source: DraggableLocation
    destination?: DraggableLocation
  }

  export interface IDragDropContextProps {
    onDragStart?: (initial: DragStart) => void
    onDragEnd: (result: DropResult) => void
  }

  export class DragDropContext extends React.Component<IDragDropContextProps, {}> {}

  // -------------------------

  export type DroppableProvided = {
    innerRef: (element: HTMLElement | null) => any
    placeholder?: React.ReactElement<any>
  }

  export type DroppableStateSnapshot = {
    isDraggingOver: boolean
  }

  export interface IDroppableProps {
    droppableId: DroppableId
    type?: TypeId
    isDropDisabled?: boolean
    direction?: 'vertical' | 'horizontal'
    children: (provided: DroppableProvided, snapshot: DroppableStateSnapshot) => React.ReactElement<any>
  }

  export class Droppable extends React.Component<IDroppableProps, {}> {}

  // -------------------------

  export type NotDraggingStyle = {
    transform?: string
    transition: null | 'none'
  }

  export type DraggingStyle = {
    pointerEvents: 'none',
    position: 'fixed',
    width: number,
    height: number,
    boxSizing: 'border-box',
    top: number,
    left: number,
    margin: 0,
    transform?: string,
    transition: 'none',
    zIndex: any
  }
  export type DraggableStyle = DraggingStyle | NotDraggingStyle;

  export type DragHandleProps = {
    onMouseDown: (event: MouseEvent) => void
    onKeyDown: (event: KeyboardEvent) => void
    onClick: (event: MouseEvent) => void
    tabIndex: number
    'aria-grabbed': boolean
    draggable: boolean
    onDragStart: () => void
    onDrop: () => void
  }

  export type DraggableProps = {
    style?: DraggableStyle
    'data-react-beautiful-dnd-draggable': string
  }

  export type DraggableProvided = {
    // draggableStyle?: DraggableStyle, deprecated in 4.0.0
    draggableProps?: DraggableStyle
    dragHandleProps?: DragHandleProps

    //currently required (until react16)
    placeholder?: React.ReactElement<any>
    innerRef: (element?: HTMLElement | null) => any
  }

  export type DraggableStateSnapshot = {
    isDragging: boolean
  }

  export interface IDraggableProps {
    draggableId: DroppableId
    index: number
    isDragDisabled?: boolean
    disableInteractiveElementBlocking?: boolean
    children: (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => React.ReactElement<any>
  }

  export class Draggable extends React.Component<IDraggableProps, {}> {}
}