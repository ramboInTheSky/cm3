export function renderStatus(status: {value:boolean, locked?:boolean}) {
  if(!status.locked)
    return status.value === true ? 'Active' : 'Disabled'
  else  
    return status.value === true ? 'Locked' : 'Disabled'
}

export function renderStatusIcon(status: {value:boolean, locked?:boolean}) {
  const noShowNegative: boolean = (status as any).colDef && (status as any).colDef.field == "orgLevel"
  if(!status.locked)
    return status.value === true ? '<i title="Enabled" class="fa fa-check active_icon"></i>' : (noShowNegative? '' : '<i title="Disabled" class="fa fa-ban negative-red"></i>')
  else
    return status.value === true ? '<i title="Enabled" class="fa fa-lock negative-red"></i>' : (noShowNegative? '' : '<i title="Disabled" class="fa fa-ban negative-red"></i>')
}

export function renderYesNo(status: {value:boolean}) {
  return status.value === true ? 'Yes' : 'No'
}