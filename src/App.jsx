import './style/App.scss';
// import react libraries including those providing capabilities related to state management
import * as React from 'react';

import { useState } from "react";
//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';
//FOR sharing data across components
import { AppContext } from './Context';

// import react libraries providing capabilities related to authentication using PKCE mechanism
import { AuthContext, AuthProvider } from "react-oauth2-code-pkce";
import jwtDecode from 'jwt-decode';

//FOR SENDING REST CALLS
import axios  from 'axios';
import http from 'http';
import https from 'https';

import { ErrorBoundary } from "react-error-boundary";



// MUI components
import { Button,
    Box,
    Stack,
    FormGroup,
    FormControlLabel,
    Switch,
    IconButton,
    Drawer,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Snackbar,
    Alert,
    TextField,
    Typography,
  } from '@mui/material';
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from '@mui/icons-material/Refresh';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';


import Header from './Header';
import CallsList from './CallsList';
import AppLibrary from './AppLibrary';
//Sample address: http://localhost:5000/?id=55&action=view
const queryParams = new URLSearchParams(window.location.search);

//check for login errors
const urlError = queryParams.get('error');
if (urlError) {
  console.log('URL error: ' + urlError);
}

const urlErrorDescription = decodeURIComponent(queryParams.get('error_description'));
if (urlErrorDescription) {
  console.log('URL error: ' + urlErrorDescription);
}

//end parameters

const stateVar = 'library_app_state';

  

// create authentication service connected to CPS (note use of env variables)

//we declare the authConfig at the level of the Wrapper below

// create a react app
function App(props) { 
    const {authConfig, setAuthConfig} = props;
    // init auth service
    // eslint-disable-next-line no-unused-vars
    const {tokenData, token, login, logOut, idToken, idTokenData, error, loginInProgress} = React.useContext(AuthContext);

    //create custom instance of AXIOS  - since other JS API could interfere...
    const myAxios = axios.create({
        httpAgent: new http.Agent({ keepAlive: true }),
        httpsAgent: new https.Agent({ keepAlive: true }),
        timeout: 120000,
      });
    // add state variables

    //this is the application context shared between components

    //eslint-disable-next-line
    const [appCtx, setAppCtx] = useState({
      simple: false,
      debug: (process.env.REACT_APP_DEBUG==='true' ? true : false),
    }); //for storing the app values that we will share across all components

    
    //knowing if the application loaded for the first time
    const [firstLoad, setFirstLoad] = useState(true);
    
    //these are for storing the calls running through the application
    const [callArray, setCallArray] = useState([]);
    const [numberOfCalls, setNumberOfCalls] = useState(0);
    const [currentCall, setCurrentCall] = useState({});

    //for reading the groups and roles from the IDToken
    const [groups, setGroups] = useState([]);
    const [roles, setRoles] = useState([]);


    
    //settings for the debug panel
    const [pause, setPause] = useState(Number(localStorage.getItem('lib-pause') ?? 0));
    const [showBorder, setShowBorder] = useState(localStorage.getItem('lib-show-border') === 'true');
    const [saveOutput, setSaveOutput] = useState(localStorage.getItem('lib-save-data') === 'true');
    const [debugPanel, setDebugPanel] = useState(localStorage.getItem('lib-debug-panel') === 'true');
    const [limitNr, setLimitNr] = useState(((isNaN(Number(process.env.REACT_APP_CALL_NUMBER)) ? 0 : Number(process.env.REACT_APP_CALL_NUMBER))));

    //for exporting calls to postman
    const [showExport, setShowExport] = useState(false);
    const [expVariable, setExpVariable] = useState(false);
    const [expVariableName, setExpVariableName] = useState('access_token');
    const [expClientId, setExpClientId] = useState('');
    const [expClientSecret, setExpClientSecret] = useState('');
    const [expPassword, setExpPassword] = useState('');
    const [expAuth, setExpAuth] = useState(true);

    
    
    //for showing the status of the call
    const [showSnackBar, setShowSnackBar] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState("");
    const [snackBarSeverity, setSnackBarSeverity] = useState("success");

    //for showing when we run a call
    const [showBackdrop, setBackdrop] = useState(false);

    //login settings
    const [appDetailsOpen, setAppDetailsOpen] = useState(false);
    const [appClientId, setAppClientId] = useState(localStorage.getItem('lib-appclientid') ?? process.env.REACT_APP_CLIENT_ID);
    const [baseUrl, setBaseUrl] = useState(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL);
    const [redirectUrl, setRedirectUrl] = useState(localStorage.getItem('lib-appredirecturl') ?? process.env.REACT_APP_REDIRECT_URI);
    const [appTenantId, setAppTenantId] = useState(localStorage.getItem('lib-apptenantid') ?? process.env.REACT_APP_TENANT_ID);

    //close the snackbar message
    const handleSnackBarClose = () => {
        setShowSnackBar(false);
        setSnackBarMessage("");
      }
    
    // create login and logout methods
    const doLogin = () => {
      let updatedValue = {extraAuthParameters: {}};
      setAuthConfig (authConfig => ({
            ...authConfig,
            ...updatedValue
          }));

    }; 
    
    // login with new parameters
    const doLoginWithCustomIds = (new_client_id, new_tenant_id) => {
        localStorage.setItem('lib-appclientid', new_client_id);
        localStorage.setItem('lib-apptenantid', new_tenant_id);
        let updatedValue = {
            extraAuthParameters: {},
            clientId: new_client_id,
            authorizationEndpoint: (localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL) + '/tenants/' + (new_tenant_id) + '/oauth2/auth',
            tokenEndpoint: (localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL) + '/tenants/' + (new_tenant_id) + '/oauth2/token',
            logoutEndpoint: (localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL) + '/tenants/' + (new_tenant_id) + '/oauth2/logout',
        };
        setAuthConfig (authConfig => ({
              ...authConfig,
              ...updatedValue
            }));
  
      }; 


    //changing the parameters for login
    const setNewApp = () => {
        localStorage.setItem('lib-appclientid', appClientId);
        localStorage.setItem('lib-apptenantid', appTenantId);
        localStorage.setItem('lib-appbaseurl', baseUrl);
        localStorage.setItem('lib-appredirecturl', redirectUrl);

        
        //reload app
        window.location.reload(true);
    }
    


    const getGroups = () => { 
        try {
            let grpData = jwtDecode(idToken).grp.map(function (group) { 
                const fullGroupName = JSON.stringify(group);
                return (fullGroupName.substring(1, fullGroupName.indexOf('@')));
            });
            setGroups(grpData);
        } catch (error) {
            //cannot get groups
            console.log('Cannot read the groups from the id token.');
        }
        
    }

    const getRoles = () => { 
      try {
          let roleData = jwtDecode(idToken).role.map(function (role) { 
              const fullRoleName = JSON.stringify(role);
              return (fullRoleName.substring(1, fullRoleName.indexOf('@')));
          });
          setRoles(roleData);
      } catch (error) {
          //cannot get groups
          console.log('Cannot read the groups from the id token.');
      }
      
  }

    
    const handleClickLogout = () => {
        logoutWithIdTokenHint(true, idToken); 
    }

    const handleNewCall = (call) => {

        let curArray = [...callArray];
        curArray.push(call);
        if (curArray.length>limitNr && limitNr>0) {
            curArray.splice(0, (curArray.length - limitNr));
        }
        setCallArray(curArray);
        setNumberOfCalls(numberOfCalls + 1);
        
    }

   
      
    // create method to for logout
    const logoutWithIdTokenHint = (shouldEndSession, idToken) => {
        logOut(stateVar);
        window.location.replace(
            (localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL) + 
            '/tenants/' + (localStorage.getItem('lib-apptenantid') ?? process.env.REACT_APP_TENANT_ID) + 
            '/oauth2/logout?id_token_hint=' + 
            encodeURIComponent(idToken) + 
            '&post_logout_redirect_uri=' + encodeURIComponent(localStorage.getItem('lib-appredirecturl') ?? process.env.REACT_APP_REDIRECT_URI)
        );
    }

    const debugWait = (req, processRes, successMessage, replaceVals) => {
        setTimeout(() => { runRequest(req, processRes, successMessage, replaceVals) }, pause);
    }

    // function to be used across components to log all calls
    /*usage: 
        req - Axios request, 
        processRes - function to process the response, 
        successMessage - message to show in the snackbar when the outcome is success. If you need to add any variables to the success message from the response, add variables in the success message
        replaceVals - array with objects to replace the variables in the response. Each object needs a name property and a node property
    example:

    let req = { 
      method: 'post', 
      data: {name: 'abc', description: 'def'},
      url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/`, 
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`} 
    };
    runRequest(req, (res) => {
            if (res.status===204) {
                //do something
            }
        }, 
        `Successfully created index idxName`, 
        [{name: 'idxName', node: 'name'}]);
    */

    const runRequest = (req, processRes, successMessage, replaceVals) => {
        setBackdrop(true);
        //console.log(localStorage.getItem('lib-appbaseurl'));
        //console.log(req.url);
        let shortUrl = req.url.replace(/^[a-z]{4,5}:\/{2}[^/]+(\/.*)/, '$1')
	    //console.log("\nCall Sent\n"+req.method+"\n"+shortUrl)
        let status = '';
        let statusCode = 0;
        let finalRes;

        // const original_open = XMLHttpRequest.prototype.open;

        // XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        //   console.log('Prototype url: ' + url);
        //   return original_open.call(this, method, url, ...rest);
        // };
        
        
        myAxios(req)
            .then(res => {
                //console.log("SUCCESS"); 
                status = 'SUCCESS';
                statusCode = isNaN(res.status ?? '0') ? 0 : Number(res.status ?? '0');
                processRes(res);
                if (req.responseType!=='blob') {
                    finalRes=res.data;
                }
                //console.log(successMessage);
                if (successMessage) {
                    let outMessage=successMessage;
                    if (replaceVals && replaceVals.length>0) {
                        for (let i=0; i<replaceVals.length;i++) {
                            outMessage = outMessage.replace(RegExp(replaceVals[i].name,'g'), res.data[replaceVals[i].node] ?? '');
                        }
                    }
                    //console.log(outMessage);
                    setSnackBarMessage(`${outMessage}`);
                    setSnackBarSeverity('success');
                    setShowSnackBar(true);
                }
                
                      
            })
            .catch(err => { 
                console.log("ERROR running the call");
			          console.log(err);
                status = 'ERROR';
                statusCode = isNaN(err.response?.status ?? '0') ? 0 : Number(err.response?.status ?? '0');
                if (err.response?.status && err.response?.status===401) {
                    logOut(stateVar);
                    doLogin();
                    //code
                  }
                var errObj = {
                    status:(err.response && err.response.status)?err.response.status:-1,
                    message: (err.response && err.response.data && err.response.data.details)?getMessages(err.response.data):(err.message??'Error, please check the console log.')
                }
                //console.log(getMessages(err.response.data).split('|'));
                finalRes=err.response?.data ?? '';
                processRes(errObj);
                setSnackBarMessage(`${err.response?.data ? getMessages(err.response?.data) : (err.message??'Error, please check the console log.')}|Code: ${err.response?.status ? err.response?.status?.toString() : (err.code??'ERR')}`);
                setSnackBarSeverity('error');
                setShowSnackBar(true);
             })
            .finally(() => {
                let outService = '';
                let newUrl = '';
                outService = req.url.replace(/^[a-z]{4,5}:\/{2}/, '').split('.')[0]==='css' ? 'css' : shortUrl.split('/')[1].split('-')[0];
                if (req.url.replace(/^[a-z]{4,5}:\/{2}/, '').split('/')[0]==='contentservice.devxprod.ot2.opentext.com') outService = 'css';
                if (outService==='api') {
                    //this goes to the backend
                    if (shortUrl.split('/').length>=4) {
                        if (shortUrl.split('/')[2]==='forward') {
                            //this is a forward call
                            outService=shortUrl.split('/')[3].split('?')[0];
                            //build the end url
                            let parSvc = (shortUrl.split('?').length > 1) ? shortUrl.split('?')[1].split('&') : [];
                            
                            for (let p=0; p<parSvc.length; p++) {
                                if (parSvc[p].split('=')[0]==='url') {
                                    newUrl = '/signature/api/v1/' + decodeURIComponent(parSvc[p].split('=')[1]) + newUrl;
                                }
                                if (parSvc[p].split('=')[0]==='params') {
                                    newUrl = newUrl + '?' + decodeURIComponent(parSvc[p].split('=')[1]);
                                }
                            }
                        }
                    }    
                } 
                if (newUrl!=='') {
                    shortUrl=newUrl;
                }
                
                const outCall = {
                    origUrl: req.url,
                    expanded: false,
                    method: req.method,
                    url: shortUrl.split('?')[0],
                    service: outService,
                    data: req.headers["Content-Type"]==='multipart/form-data' ? 'file-content' : (req.data ?? 'none'),
                    status: status,
                    statusCode: statusCode,
                    header: req.headers,
                    params: (shortUrl.split('?').length>1)?shortUrl.split('?')[1]:'' 
                }
                if (finalRes && (saveOutput || status==='ERROR')) {
                    outCall.response=finalRes;
                }
                setCurrentCall(outCall);
                setBackdrop(false);
              })
      }
    
    const getMessages = (object) => {
        //console.log(object);
        if (!object) return '';
        let output = '';
        if (object.constructor===Array) {
            for (let i=0; i<object.length; i++) {
                output += getMessages(object[i]);
            }
        }
        if (object.constructor===Object) {
            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    var val = object[key];
                    
                    if (key==='message' || key==='details' || key==='exception' || key==='defaultDescription') {
                        if (val.constructor===Object) {
                            output += getMessages(val);
                        } else {
                            output += val + '|';} 
                        }
                    else {
                        output += getMessages(val);
                    }
                    
                    
                }
            }
        }
        if (object.constructor===String) {
            if (object.search('ERROR')===0) {
                output += object + '|';
            }
        }
        //console.log(output);
        return output;
    }
      
    
    

    const getCSSURL = () => {
        let curUrl = (localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL);
        return curUrl.split('//')[0] + '//css.' + curUrl.split('//')[1];
    }


    const selectConfidentialFile = (event) => {
    
        //add code for multi selection
        let curSelectedFile = event.target.files[0];
        var reader = new FileReader();
            reader.onload = function() {
              try {
                let values = JSON.parse(reader.result);
                if (values.client_id) setExpClientId(values.client_id);
                if (values.client_secret) setExpClientSecret(values.client_secret);
              } catch (error) {
                console.log('Not a valid JSON');
                console.log(reader.result);
              }
            }
            reader.onerror = function (error) {
              console.log('Error: ', error);
            };
            if (curSelectedFile) reader.readAsText(curSelectedFile);
      }

    const exportCallArray = () => {
        let postOut = {
            info: {
                name: 'OT Shell App Export', 
                schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
            }
        }
        let itemCollection = [];
        let variable_collection = [];

        if (expAuth) {
          itemCollection.push(
            {
              name: "get-access-token",
              event: [{listen: "test",
                  script: {
                    exec: [
                      `pm.collectionVariables.set("${expVariableName}", pm.response.json().access_token);`
                    ],
                    type: "text/javascript"
                  }}],
              request: {
                method: "POST",
                header: [
                  {
                    key: "Content-Type",
                    name: "Content-Type",
                    type: "text",
                    value: "application/json"
                  }
                ],
                body: {
                  mode: "raw",
                  raw: `{\n    "client_id": "{{la_client_id}}",\n    "client_secret": "{{la_client_secret}}",\n    "grant_type": "password",\n    "username": "{{la_username}}",\n    "password": "{{la_password}}"\n}`
                },
                url: {
                  raw: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/tenants/{{la_tenant}}/oauth2/token`,
                  protocol: 'https',
                  host: (localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL).replace(/^[a-z]{4,5}:\/{2}/, '').split('.'),
                  path: [
                    "tenants",
                    "{{la_tenant}}",
                    "oauth2",
                    "token"
                  ]
                }
              }
            }
          )
          
        }

        for (let i=0; i<callArray.length;i++) {
            
            let headers = [];
            for ( var key in callArray[i].header ) {
                if (callArray[i].header.hasOwnProperty(key)) {
                    headers.push({
                        key: key, 
                        value: (key==='Authorization' ? `Bearer ${expVariable ? `{{${expVariableName}}}` : token}` : callArray[i].header[key]), 
                        type: 'text'
                    })
                }
            }
            let query = [];
            if (callArray[i].params) {
                for ( let p=0; p<callArray[i].params.split('&').length; p++ ) {
                    query.push({
                        key: callArray[i].params.split('&')[p].split('=')[0],
                        value: callArray[i].params.split('&')[p].split('=')[1]
                    })
                }
            }
            
            let body = {};
            if (callArray[i].header["Content-Type"]==='multipart/form-data') {
                body.mode = 'formdata';
                body.formdata = [
                    {
                        "key": (callArray[i].service==='css'? "file" :"File"),
                        "contentType": "",
                        "type": "file",
                        "src": ""
                    }
                ];
                body.options = {raw: {language: 'json'}}

            } else {
                if (callArray[i].data==='none') {
                    body.mode = 'none';
                } else {
                    body.mode = 'raw';
                    body.raw = JSON.stringify(callArray[i].data, null, 2).replace(/\\n/g, "\\n")
                                                                .replace(/\\'/g, "\\'")
                                                                .replace(/\\"/g, '\\"')
                                                                .replace(/\\&/g, "\\&")
                                                                .replace(/\\r/g, "\\r")
                                                                .replace(/\\t/g, "\\t")
                                                                .replace(/\\b/g, "\\b")
                                                                .replace(/\\f/g, "\\f");;
                    body.options = {raw: {language: 'json'}}
                }
                
            }

            let curItem = {
                name: `CPS ${callArray[i].service} ${callArray[i].method} - index: ${i}`,
                request: {
                    method: callArray[i].method.toUpperCase(),
                    header: headers,
                    body: body,
                    url: {
                        raw: `${callArray[i].service==='css' ? getCSSURL() : (localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}${callArray[i].url}${callArray[i].params ? `?${callArray[i].params}` : ``}`,
                        protocol: 'https',
                        host: (callArray[i].service==='css' ? getCSSURL() : (localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)).replace(/^[a-z]{4,5}:\/{2}/, '').split('.'),
                        path: callArray[i].url.split('.'),
                        query: query
                    }
                }
            
            };

            itemCollection.push(curItem);
        }

        postOut.item = itemCollection;
        if (expAuth && expVariable) {
            variable_collection.push({key: expVariableName, value: ''});
            variable_collection.push({key: 'la_client_id', value: expClientId});
            variable_collection.push({key: 'la_client_secret', value: expClientSecret});
            variable_collection.push({key: 'la_username', value: idTokenData?.name}); 
            variable_collection.push({key: 'la_password', value: expPassword});
            variable_collection.push({key: 'la_tenant', value: process.env.REACT_APP_TENANT_ID});
            postOut.variable = variable_collection;
        }


        let fContent = new Blob([JSON.stringify(postOut, null, 2)], {type: 'text/plain'});
        // create file link in browser's memory
        const href = URL.createObjectURL(fContent);
        // create "a" HTLM element with href to file & click
        const link = document.createElement('a');
        link.href = href;
        link.setAttribute('download', 'collectionExport.json'); //or any other extension
        document.body.appendChild(link);
        link.click();

        // clean up "a" element & remove ObjectURL
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
        setShowExport(false);
    }


     // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
    useEffect(
        () => {
          console.log(`Token changed`); 
          
          if (token && firstLoad && !urlError) {
              //console.log(idTokenData);
              console.log("Start app - checking service status");
              getGroups();
              getRoles();
              //add code here for the first time loading the app after the token was received



              setFirstLoad(false);
          } else {
            console.log(token ? 'New token received' : 'No token yet');  
          }
        
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [token]
    );

    useEffect(
        () => {

        if (JSON.stringify(currentCall)!=='{}') {
            if (currentCall.response && (currentCall.response instanceof Blob)) {
                let fr = new FileReader();
                fr.onload = function() {
                    try {
                        currentCall.response=(JSON.parse(fr.result));
                    } catch (error) {
                        currentCall.response={errorBlob: fr.result};
                    }
                    
                    handleNewCall(currentCall);
                };
                fr.readAsText(currentCall.response);
            } else {
                handleNewCall(currentCall);
            }
        }
        
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [currentCall]
    );

    

    useEffect(() => {
        localStorage.setItem('lib-debug-panel', debugPanel);
      }, [debugPanel]);

    useEffect(() => {
        localStorage.setItem('lib-save-data', saveOutput);
      }, [saveOutput]);
    
    useEffect(() => {
        localStorage.setItem('lib-show-border', showBorder);
      }, [showBorder]);

    useEffect(() => {
        localStorage.setItem('lib-pause', pause);
      }, [pause]);

    useEffect(() => {
      if (error) console.log(error);
    }, [error]);


    useEffect(() => {
      if (authConfig.extraAuthParameters) {
        //console.log(authConfig.extraAuthParameters);
        login(stateVar);
      }
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [authConfig]);

    // display app
    return (
        <div className="App">
          {(!loginInProgress && token  && !error) && 
            <AppContext.Provider value={appCtx}>
              <Header 
                logoutFunction={handleClickLogout} 
                userName={idTokenData?.name ? idTokenData.name.split("@")[0] : 'undefined'}
                setDebugPanel = {setDebugPanel} 
                debugPanel = {debugPanel}
                showBackdrop = {showBackdrop}
                callCount = {numberOfCalls} 
                groups = {groups} 
                roles = {roles} 
              />
            </AppContext.Provider>}
          
          {(!error && token && !loginInProgress && appCtx.debug) && 
            <div className="page-content">
              {<div><pre>{JSON.stringify(tokenData,null,2)}</pre></div>}
              {<div><pre>{JSON.stringify(idTokenData,null,2)}</pre></div>}
              {<div>{`Token: ${token}`}</div>}
              {<div>{`ID Token: ${idToken}`}</div>}
            </div>}

            {(!error && token && !loginInProgress && !appCtx.debug) && 
            <AppContext.Provider value={appCtx}>
                <AppLibrary
                  debugPanel={debugPanel}
                  runRequest={debugWait}
                  token={token}
                  showBorder={showBorder}
                />
            </AppContext.Provider>
            }

          {(!loginInProgress && token  && !error) && <Drawer
                anchor={'right'} 
                variant='persistent' 
                open={debugPanel}
                onClose={() => {}}
            >
                <Box>
                    <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" p={2}>
                        <TextField
                            margin="dense"
                            id="interval" 
                            key="interval"
                            variant="standard" 
                            type={'number'}
                            sx={{width: 70}} 
                            label="Pause (ms)" 
                            value={pause} 
                            onChange={e => {if (!isNaN(Number(e.target.value))) setPause(e.target.value)}}
                            />
                        <TextField
                            margin="dense"
                            id="lastcalls" 
                            key="lastcalls"
                            variant="standard" 
                            type={'number'}
                            sx={{width: 40}} 
                            label="Limit" 
                            value={limitNr} 
                            onChange={e => {if (!isNaN(Number(e.target.value))) setLimitNr(e.target.value)}}
                            />
                        <FormGroup>
                            <FormControlLabel control={<Switch checked={showBorder} onChange={e => { setShowBorder(e.target.checked) }} name="showBorder" size="small"/>} label="Border" labelPlacement="top" />
                        </FormGroup>
                        <FormGroup>
                            <FormControlLabel control={<Switch checked={saveOutput} onChange={e => { setSaveOutput(e.target.checked) }} name="saveOutput" size="small"/>} label="Data" labelPlacement="top"/>
                        </FormGroup>
                        <IconButton size="small" variant="outlined" color="primary" title="Refresh" onClick={() => { setCallArray([]) }}>
                            <RefreshIcon />
                        </IconButton>
                        <IconButton size="small" variant="outlined" color="primary" title="Export to Postman collection" onClick={() => { setShowExport(true) }}>
                            <SystemUpdateAltIcon />
                        </IconButton>
                    </Stack>
                </Box>
                <Box height="90%" width="25vw" sx={{
                    padding:1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    overflowY: "auto", 
                    overflowX: "hidden", 
                    "&::-webkit-scrollbar": {
                      height: 4,
                      width: 4,
                      borderRadius: 2
                      },
                      "&::-webkit-scrollbar-track": {
                      backgroundColor: "white"
                      },
                      "&::-webkit-scrollbar-thumb": {
                      backgroundColor: "gray",
                      borderRadius: 2
                      }
                    }}>
                    
                    <CallsList callsArray = {callArray} />
                </Box>
                
            </Drawer>}


            <Dialog
              open={(!token && !loginInProgress)} onClose={() => {}}>
              <DialogTitle>Login</DialogTitle>
              <DialogContent>
                
                  <DialogContentText>
                      You are not logged in. Click below to start the login process.
                  </DialogContentText>
                    {appCtx.simple && <TextField
                      margin="dense"
                      id="teid" 
                      key="teid"
                      variant="standard" 
                      type={'text'}
                      fullWidth
                      label="Tenant Id" 
                      value={appTenantId} 
                      onChange={e => { setAppTenantId(e.target.value)}}
                      />}
                    {appCtx.simple && <TextField
                      margin="dense"
                      id="clid" 
                      key="clid"
                      variant="standard" 
                      type={'text'}
                      fullWidth
                      label="Public Client Id" 
                      value={appClientId} 
                      onChange={e => { setAppClientId(e.target.value)}}
                      />}
                    
              </DialogContent>
              <DialogActions>
                  {!appCtx.simple && <Button onClick={() => { doLogin() }} variant="contained" color="primary">
                      Login
                  </Button>}
                  {appCtx.simple && <Button onClick={() => { doLoginWithCustomIds(appClientId, appTenantId) }} variant="contained" color="primary">
                      Login
                  </Button>}
                  
                  {!appCtx.simple && <Button onClick={() => { setAppDetailsOpen(true) }} variant="contained" color="primary">
                      Settings
                  </Button>}
              </DialogActions> 
          </Dialog>
                
            {(!loginInProgress && token && !error) && <Dialog
                open={showExport} onClose={() => {setShowExport(false)}}>
                <DialogTitle>Export to Postman</DialogTitle>
                <DialogContent className="add-document">
                  <Stack direction={'column'} spacing={1}>
                    {expVariable && expAuth && <div className="inline"> 
                        <label htmlFor="files">
                            <Button component="span">Select confidential json file...</Button>
                        </label>
                        <input id="files" type="file" accept="*.json" className="file-input" onChange={selectConfidentialFile} multiple={false} />
                    </div>}
                    <FormGroup>
                        <FormControlLabel control={<Switch checked={expVariable} onChange={e => { setExpVariable(e.target.checked) }} name="expVar" size="small"/>} label="Export auth token as variable" labelPlacement="end" />
                    </FormGroup>
                    {expVariable && <TextField
                      margin="dense"
                      id="varname" 
                      key="varname"
                      variant="standard" 
                      type={'text'}
                      fullWidth
                      label="Variable name" 
                      value={expVariableName} 
                      onChange={e => { setExpVariableName(e.target.value)}}
                      />}
                      <FormGroup>
                          <FormControlLabel control={<Switch checked={expAuth} onChange={e => { setExpAuth(e.target.checked) }} name="expAuth" size="small"/>} label="Export authentication call" labelPlacement="end" />
                      </FormGroup>
                      {expAuth && expVariable && <TextField
                      margin="dense"
                      id="client_id" 
                      key="client_id"
                      variant="standard" 
                      type={'text'}
                      fullWidth
                      label="Client id" 
                      value={expClientId} 
                      onChange={e => { setExpClientId(e.target.value)}}
                      />}
                      {expAuth && expVariable && <TextField
                      margin="dense"
                      id="client_secret" 
                      key="client_secret"
                      variant="standard" 
                      type={'password'}
                      fullWidth
                      label="Client secret" 
                      value={expClientSecret} 
                      onChange={e => { setExpClientSecret(e.target.value)}}
                      />}
                      {expAuth && expVariable && <TextField
                      margin="dense"
                      id="password" 
                      key="password"
                      variant="standard" 
                      type={'password'}
                      fullWidth
                      label="Password" 
                      value={expPassword} 
                      onChange={e => { setExpPassword(e.target.value)}}
                      />}
                  </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { exportCallArray() }} variant="contained" color="primary">
                        Export
                    </Button>
                    <Button onClick={() => { setShowExport(false) }} variant="contained" color="primary">
                        Close
                    </Button>
                </DialogActions> 
            </Dialog>}
                
            <Dialog
                open={appDetailsOpen} onClose={() => {setAppDetailsOpen(false);}}>
                <DialogTitle>Application details</DialogTitle>
                <DialogContent className="add-document">
                    <DialogContentText>
                        Please set the following details:
                    </DialogContentText>
                    
                    
                    <TextField
                        autoFocus
                        margin="dense"
                        id="appTenantId"
                        label="Tenant ID"
                        type="id"
                        fullWidth
                        required
                        variant="standard" 
                        value={appTenantId}
                        onChange={e => {setAppTenantId(e.target.value)}}
                    />
                    <TextField
                        margin="dense"
                        id="appClientId"
                        label="Client ID"
                        type="id"
                        fullWidth
                        required
                        variant="standard" 
                        value={appClientId}
                        onChange={e => {setAppClientId(e.target.value)}}
                    />
                    <TextField
                        margin="dense"
                        id="baseUrl"
                        label="Base URL"
                        type="url"
                        fullWidth
                        required
                        variant="standard" 
                        value={baseUrl}
                        onChange={e => {setBaseUrl(e.target.value)}}
                    />
                    <TextField
                        margin="dense"
                        id="redirecturl"
                        label="Redirect URL"
                        type="url"
                        fullWidth
                        required
                        variant="standard" 
                        value={redirectUrl}
                        onChange={e => {setRedirectUrl(e.target.value)}}
                    />
                    
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { 
                        setAppClientId(process.env.REACT_APP_CLIENT_ID); 
                        setAppTenantId(process.env.REACT_APP_TENANT_ID); 
                        setBaseUrl(process.env.REACT_APP_BASE_URL); 
                        setRedirectUrl(process.env.REACT_APP_REDIRECT_URI);
                        }} variant="contained" color="primary">
                        Reload from .env
                    </Button>
                    <Button disabled={!appClientId || !appTenantId || !baseUrl || !redirectUrl} onClick={() => { setNewApp(); }} variant="contained" color="primary">
                        Save
                    </Button>
                    <Button onClick={() => { setAppDetailsOpen(false); }} variant="contained" color="primary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
            
            <Dialog
                open={(((error!=='') && (error!==null)) || ((urlError!=='') && (urlError!==null)) || loginInProgress)} onClose={() => {}}>
                <DialogTitle>{(!urlError && !error) ? 'Loading application...' : 'Login error'}</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{color: ((urlError || error)?'red':'-moz-initial')}}>
                        {(!urlError && !error) && 'Authenticating...'}
                        {(urlError) ? urlErrorDescription : (error ? error : '')}
                        
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { logOut(stateVar); }} variant="contained" color="primary">
                        Logout
                    </Button>
                    <Button onClick={() => { logOut(stateVar); doLogin(); }} variant="contained" color="primary">
                        Reset
                    </Button>
                </DialogActions>
            </Dialog>

           <Snackbar
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              open={showSnackBar}
              autoHideDuration={5000}
              onClose={handleSnackBarClose}
              action={
                <React.Fragment>
                  <IconButton size="small" aria-label="close" color="inherit" onClick={handleSnackBarClose}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </React.Fragment>
              }
            >
            <Alert onClose={handleSnackBarClose} severity={snackBarSeverity}>
                {snackBarMessage.split('|').map((text, index) => (
                    <Typography display="block" key={'alert'+index}>{text}</Typography>
                ))}
              
            </Alert>
          </Snackbar>
            
        </div>
    );
}

// add error boundary for the token decode
function fallbackRender({ appError, resetErrorBoundary, login, logOut }) {
    // Call resetErrorBoundary() to reset the error boundary and retry the render.
    
  
    return (
      <div role="alert">
        <p style={{ color: "red" }}>Something went wrong:</p>
        <pre style={{ color: "red" }}>{appError?.message ?? appError}</pre>
        <Button onClick={() => { logOut(stateVar); login(stateVar); }} variant="contained" color="primary">
            Reset login
        </Button>
      </div>
    );
  }

// add auth provider around app
function WrappedSecuredApp() { 
  // eslint-disable-next-line no-unused-vars
  const {tokenData, token, login, logOut, idToken, error} = React.useContext(AuthContext);
    console.log('App init - wrapping authService');
    const [authConfig, setAuthConfig] = React.useState({
      clientId: localStorage.getItem('lib-appclientid') ?? ((process.env.REACT_APP_CLIENT_ID==='') ? 'none' : process.env.REACT_APP_CLIENT_ID),
      authorizationEndpoint: (localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL) + '/tenants/' + (localStorage.getItem('lib-apptenantid') ?? process.env.REACT_APP_TENANT_ID) + '/oauth2/auth',
      tokenEndpoint: (localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL) + '/tenants/' + (localStorage.getItem('lib-apptenantid') ?? process.env.REACT_APP_TENANT_ID) + '/oauth2/token',
      logoutEndpoint: (localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL) + '/tenants/' + (localStorage.getItem('lib-apptenantid') ?? process.env.REACT_APP_TENANT_ID) + '/oauth2/logout',
      redirectUri: localStorage.getItem('lib-appredirecturl') ?? process.env.REACT_APP_REDIRECT_URI,
      scope: 'openid',
      onRefreshTokenExpire: (event) => window.confirm('Session expired. Refresh page to continue using the site?') && event.login('library_app_state'),
       // Example to redirect back to original path after login has completed
      preLogin: () => localStorage.setItem('preLoginSearch', window.location.search),
      postLogin: () => {if (localStorage.getItem('preLoginSearch')) window.location.replace(localStorage.getItem('preLoginSearch'))},
      autoLogin: false,
      clearURL: true, 
      storage: 'local'
    });
    //console.log(window.location.search);
    //storage: session or local
    
    return (
        <ErrorBoundary
            fallbackRender={(error, resetErrorBoundary) => fallbackRender(error, resetErrorBoundary, login, logOut)}
            onReset={(details) => {
                // Reset the state of your app so the error doesn't happen again
            }}
            >
          <AuthProvider authConfig={authConfig} >
                <App authConfig={authConfig} setAuthConfig={setAuthConfig}/>
          </AuthProvider>
        </ErrorBoundary>
        
    );
}

export default WrappedSecuredApp;