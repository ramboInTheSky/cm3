// Dependencies.
import * as React from 'react'
import {Icon, bind} from 'common_lib'

import './index.css'

interface LegalEntityLite{
    name: string
    _id: string
}

interface OrgLite{
    name: string
    _id: string
}

export interface AccessGroupTreeProps{
    className?: string
    accessgroup: Array<{
        organization: OrgLite
        allLegalEntities: boolean
        legalEntities: Array<LegalEntityLite>
    }>
    deleteOrgFn?: Function
}

export interface AccessGroupTreeState{
    isOrgHidden : {
        [key: string]: boolean
    }
}

export class AccessGroupTree extends React.Component<AccessGroupTreeProps, AccessGroupTreeState>{
    constructor(props: AccessGroupTreeProps){
        super(props)
        bind(this)
        this.state = {
            isOrgHidden: {}
        }
    }

    toggleSection(e:any, id:string){
        let isOrgHidden = this.state.isOrgHidden
        isOrgHidden[id]? isOrgHidden[id] = false : isOrgHidden[id] = true
        this.setState({
            isOrgHidden
        })
    }

    toggleAll(e:any){
        e.preventDefault()
        let isOrgHidden = this.state.isOrgHidden
        if(isOrgHidden && this.props.accessgroup){
            const isFirstHidden = isOrgHidden[this.props.accessgroup[0].organization._id] === true
            for(let i=0; i<this.props.accessgroup.length; i++){
                isFirstHidden? isOrgHidden[this.props.accessgroup[i].organization._id] = false : isOrgHidden[this.props.accessgroup[i].organization._id] = true
            }
        }
        this.setState({
            isOrgHidden
        })
    }

    render(): JSX.Element{
        const {accessgroup, className} = this.props
        const {isOrgHidden} = this.state
        const toggleSection = this.toggleSection
        const toggleAll = this.toggleAll
        const deleteOrg = this.props.deleteOrgFn
        return(
            <div className={className || 'acadia-accessgroup-expanded-detail_wrapper'}>
            {accessgroup && accessgroup.length > 0?
            <div className="acadia-accessgroup-expanded-toggle_all">
            <a onClick={(e)=>toggleAll(e)}> Collapse/Expand All</a>
            </div>
            :null}
            {accessgroup && accessgroup.length > 0 ?accessgroup.map((item)=>{
                return (
                <div key={item.organization._id} className="acadia-accessgroup-expanded-detail_container">
                    
                    <div className="acadia-accessgroup-expanded-detail_organization" onClick={(e)=>toggleSection(e, item.organization._id)}> 
                        <Icon name={`${!isOrgHidden[item.organization._id]?'chevron-down':'chevron-up'}`}/>{item.organization.name} 
                        {item.allLegalEntities?<span>&emsp;(Includes All Legal Entities)</span>: null}
                        {deleteOrg?<div className="acadia-accessgroup-expanded-detail_organization-remove" onClick={(e)=>{deleteOrg!(e, item.organization._id)}}><Icon name="trash-o"/></div>: null}
                    </div>
                    
                    
                    {!isOrgHidden[item.organization._id]?
                    <div>
                        <div className="acadia-accessgroup-expanded-detail_entities-container">
                        {item.legalEntities.length? item.legalEntities.map((entity)=>{
                        return (
                            <div key={entity._id} className="acadia-accessgroup-expanded-detail_entities-item">
                                -&nbsp;{entity.name}
                            </div>
                        )}) : null}                                                 
                        </div>
                    </div>
                    : null}
                </div> 
                )
            }) : null}
            </div>
        )
        
    }
}