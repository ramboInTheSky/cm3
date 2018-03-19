export function disableAutofill(){
    setTimeout(()=>{
            let inputItems: HTMLInputElement = document.querySelector('.mdl-autocomplete .mdl-textfield__input') as any
            if(inputItems){
                inputItems.autocomplete = 'off'
            }
        }, 100)
}