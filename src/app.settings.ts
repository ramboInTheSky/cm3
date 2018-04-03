/**
 * Created by _Alz on 03/01/2017.
 */
export const MODALS = {
    PORTFOLIO: 'PORTFOLIO'
}

export let API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJQcm90b0NvbGwiLCJpYXQiOjE1MjAyNTI4MjMyOTEsImV4cCI6MTU1MTc4ODgyMzI5MSwic3ViIjoiYWxlc3Npb21paGlydGVzdCJ9.2iGJHSEO-JRWf-CgsGk45almXsET5gdgbqMAa366ZTo'
const root = 'http://10.10.173.22:8080'

export const settings = {
    
    modules: [
        {name: 'Dashboard', path: '/', icon:'users', permission:''},
        {name: 'Portfolios', path: '/r/portfolios', icon:'users', permission:''},
    ],
    newActions: [
         {name: 'Portfolio', path: '/', modal: MODALS.PORTFOLIO, permission:''},
    ],
    options: {
        timeout: 10 //in seconds
    },
    urls: {
        portfolio: {
            portfolios_stats: root + '/portfolios/summary/stats/?workgroups=[]',
            portfolios_workflow_summary: root + '/portfolios/workflow/summary/',
            portfolios_workflow: root + '/portfolios/workflow/'
        }
    }
}

