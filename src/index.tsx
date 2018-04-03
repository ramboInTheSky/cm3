/*third party*/
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';
import {BrowserRouter as Router, Route, Redirect} from 'react-router-dom'
// mobx
import { Provider } from 'mobx-react';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';

/* import ag-grid-enterprise to use advanced features */
import {LicenseManager} from "ag-grid-enterprise/main"
LicenseManager.setLicenseKey('Acadiasoft_MultiApp_3Devs2_SaaS_16_June_2018__MTUyOTEwMzYwMDAwMA==c46386c3d53f3c0e683822082942139b')

/*third party styles*/
import './css/vendor.css'
import 'react-mdl/extra/material.js';
import 'react-mdl/extra/material.css';

/*first party styles*/
import './css/index.css'

/*First Party*/
import {settings} from './app.settings'
import { stores } from './ts/stores';
import {AppShellProps} from './ts/models'

import {Portfolios} from './ts/pages/portfolios'
import {DashboardPage} from './ts/pages/dashboard'


const history = createBrowserHistory();
const mobxSyncedHistory = syncHistoryWithStore(history, stores.routing);

const appShellProps: AppShellProps = {
    menu: settings.modules,
    new:settings.newActions,
    title:"collateral manager",
    userInfoURL: '',
    logoutURL: '',
    showLastLogin: true
}

ReactDOM.render(
    <Provider {...stores}>
        <Router basename="/collateralmanager">
            <div>
                <Route exact path="/" component={() => <DashboardPage {...appShellProps} />}/>
                <Route exact path="/r/portfolios" component={() => <Portfolios hasActionBar={true} {...appShellProps} />}/>

                {/*<Route exact path="/r/entities/:orgId" component={(props) => <Entities {...props} />} />*/}
            </div>
        </Router>
    </Provider>,
    document.getElementById('app') as HTMLElement //could have used the "!" operator but let's be explicit
);


