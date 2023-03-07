import './style/App.scss';
// import react libraries including those providing capabilities related to state management
import * as React from 'react';

import { useState } from "react";
//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';

// import react libraries providing capabilities related to authentication using PKCE mechanism
import { AuthProvider, AuthService, useAuth } from 'react-oauth2-pkce';

//FOR SENDING REST CALLS
import axios  from 'axios';



// MUI components
import { Button,
    Box,
    Backdrop,
    Stack,
    CircularProgress,
    LinearProgress,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Snackbar,
    Alert,
    Typography,
    Menu, MenuItem
  } from '@mui/material';
import CloseIcon from "@mui/icons-material/Close";
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import ScreenshotMonitorIcon from '@mui/icons-material/ScreenshotMonitor';
import Avatar from '@mui/material/Avatar';


// create authentication service connected to CPS (note use of env variables)
const authService = new AuthService({
    clientId:          process.env.REACT_APP_CLIENT_ID, 
    authorizeEndpoint:  process.env.REACT_APP_BASE_URL + '/tenants/' + process.env.REACT_APP_TENANT_ID + '/oauth2/auth',
    tokenEndpoint:      process.env.REACT_APP_BASE_URL + '/tenants/' + process.env.REACT_APP_TENANT_ID + '/oauth2/token',
    logoutEndpoint:     process.env.REACT_APP_BASE_URL + '/tenants/' + process.env.REACT_APP_TENANT_ID + '/oauth2/logout',
    redirectUri:        process.env.REACT_APP_REDIRECT_URI,
    scopes: ['openid']
});

// create a react app
function App() { 
    // init auth service
    const { authService } = useAuth();
    // add state variables

    //for the user menu
    const [anchorEl, setAnchorEl] = useState(null);

    //to show the call response
    const [callResp, setCallResp] = useState({});

    //snackBar to show status
    const [showSnackBar, setShowSnackBar] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState("");
    const [snackBarSeverity, setSnackBarSeverity] = useState("success");

    //to show when the service is called
    const [showBackdrop, setBackdrop] = useState(false);


    const handleSnackBarClose = () => {
        setShowSnackBar(false);
        setSnackBarMessage("");
      }
    
    // create login and logout methods
    const login = async () => authService.authorize(); 
    const logout = async (shouldEndSession) => authService.logout(shouldEndSession); 

    // Promise that resolves when the acces_token is refreshed.
    let tokenRefreshPromise = undefined;

    // Count the number of pending requests that are waiting for a token refresh
    let tokenRefreshWaitCount = 0;

    // refresh the token if 401 
    axios.interceptors.response.use(
        (response) => response,
        async (error) => {
            const config = error?.config;
    
            if (error?.response?.status === 401 && !config?.sent) {
                config.sent = true;
                tokenRefreshWaitCount++;
    
                    if (tokenRefreshWaitCount === 1) {
                        // Only create a new tokenRefreshPromise for the first 401 after the previous refresh.
                        tokenRefreshPromise = authService.fetchToken(authService.getAuthTokens().refresh_token, true);
                    }
                    // Wait for the refreshed token before retrying.
                    await tokenRefreshPromise.then((authTokens) => {
                        if (authTokens.access_token) {
                            config.headers = {
                                ...config.headers,
                                Authorization: `Bearer ${authTokens.access_token}`,
                            };
                        }
                    });
                
                tokenRefreshWaitCount--;
    
        
                
                console.log(`Rerun request with status ${error?.response?.status}`)
                return axios(config);
                }
            
            return Promise.reject(error);
        }
    );


    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    
    const handleClickLogout = () => {
        logoutWithIdTokenHint(true, authService.getAuthTokens().id_token);
        setAnchorEl(null);
    }

    //creating a nice looking user menu with the user name
    
    const getLoggedInUserIcon = (name) => {
        const words = name.split(" ");
        let userIcon = "";
        userIcon += words[0].charAt(0);
        if (words.length > 1) userIcon += words[words.length - 1].charAt(0);
        else userIcon += words[0].charAt(1);
        return userIcon;
      };
    
    function stringToColor(string) {
        let hash = 0;
        let i;
      
        /* eslint-disable no-bitwise */
        for (i = 0; i < string.length; i += 1) {
          hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }
      
        let color = '#';
      
        for (i = 0; i < 3; i += 1) {
          const value = (hash >> (i * 8)) & 0xff;
          color += `00${value.toString(16)}`.slice(-2);
        }
        /* eslint-enable no-bitwise */
      
        return color;
      }
      
      function stringAvatar(name) {
        return {
          sx: {
            bgcolor: stringToColor(name),
          },
          children: getLoggedInUserIcon(name),
        };
      }  

    // create method to for logout
    const logoutWithIdTokenHint = (shouldEndSession, idToken) => {
        logout(shouldEndSession);
        window.location.replace(
            process.env.REACT_APP_BASE_URL + 
            '/tenants/' + process.env.REACT_APP_TENANT_ID + 
            '/oauth2/logout?id_token_hint=' + 
            encodeURIComponent(idToken) + 
            '&post_logout_redirect_uri=' + encodeURIComponent(process.env.REACT_APP_REDIRECT_URI)
        );
    }

    //the following function can be used across components to have one single place to log all calls
    /*usage: 
        req - Axios request, 
        processRes - function to process the response, 
        successMessage - message to show in the snackbar when the outcome is success. If you need to add any variables to the success message from the response, add variables in the success message
        replaceVals - array with objects to replace the variables in the response. Each object needs a name property and a node property
    example:

    let req = { 
      method: 'post', 
      data: {name: 'abc', description: 'def'},
      url: `${process.env.REACT_APP_BASE_URL}/cms/`, 
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`} 
    };
    runRequest(req, (res) => {
            if (res.status==204) {
                //do something
            }
        }, 
        `Successfully created index idxName`, 
        [{name: 'idxName', node: 'name'}]);
    */

    const runRequest = (req, processRes, successMessage, replaceVals) => {
        setBackdrop(true);
        let shortUrl = req.url.replace(/^[a-z]{4,5}:\/{2}[^/]+(\/.*)/, '$1');
	    console.log("\nCall Sent\n"+req.method+"\n"+shortUrl);
        
        axios(req)
            .then(res => {
                console.log("SUCCESS"); 
                processRes(res);
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
                if (err.response?.status && err.response?.status===401) {
                    // the token is invalid, we need to reauthenticate
                    logout(true);
                    login();
                  }
                var errObj = {
                    status:(err.response && err.response.status)?err.response.status:-1,
                    message: (err.response && err.response.data && err.response.data.details)?err.response.data.details:(err.message??'Error, please check the console log.')
                }
                processRes(errObj);
                setSnackBarMessage(`${err.response?.data?.details ? err.response?.data?.details : (err.message??'Error, please check the console log.')}|Code: ${err.response?.status ? err.response?.status?.toString() : (err.code??'ERR')}`);
                setSnackBarSeverity('error');
                setShowSnackBar(true);
             })
            .finally(() => {
                //you can add code to log the call
                setBackdrop(false);
              })
      }
    

    const checkService = () => {
        let req = { 
            method: 'get', 
            url: `${process.env.REACT_APP_BASE_URL}/cms/service`, 
            headers: { 'Authorization': `Bearer ${authService.getAuthTokens().access_token}`, 'Accept': '*/*' } 
        };
        runRequest(req, (res) => {
                setCallResp(res.data ?? {});
            }, 
            `Successfully ran the /cms/service request.`, 
            []);
 
    }


     // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
    useEffect(
        () => {
            console.log("Start app - checking token status");  
        if (authService.getAuthTokens().access_token) {
            //console.log(authService.getUser());
            console.log("Start app - checking service status");
            checkService()
        }
        // eslint-disable-next-line 
        },[]
    );



    // display app
    return (
        <div className="App">
            {(!authService.isPending() && authService.isAuthenticated()) && 
            <header className="page-header">
                <div className="logo">
                
                </div>
                <div  className="header-title">
                    <img
                    src="./images/Opentext_LibraryApplication.svg"
                    alt="Opentext Shell Application"
                    />{" "}
                    <img
                    src="./images/powered_by.svg"
                    alt="Powered by OpenText Developer Cloud"
                    style={{ "paddingLeft": "8px", "paddingTop": "8px" }}
                    />
                </div>
                {showBackdrop && <Stack direction="row" sx={{display: 'flex',
                    height: '100%',
                    p: 0,
                    alignItems: 'center',
                    justifyContent: 'flex-start',}}>
                        <ScreenshotMonitorIcon />
                        <Box sx={{
                        width: '30%'
                        }}>
                            <LinearProgress color="success"/>
                        </Box>
                        <CloudSyncIcon />
                </Stack>}
                
                
                
                <div className="header-menu">
                <Button
                    aria-controls="simple-menu"
                    aria-haspopup="true"
                    onClick={handleClick}
                >
                    <Avatar {...stringAvatar(authService.getUser().name.split("@")[0])} />
                </Button>
                <Menu
                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                >
                    <MenuItem onClick={handleClickLogout}>Logout {authService.getUser().name.split("@")[0]}</MenuItem>
                    {/*authService.getUser().name.split("@")[0]*/}
                    {/*authService.getUser().preferred_username*/}
                </Menu>
                </div>
            </header>}
            
            {(!authService.isPending() && authService.isAuthenticated()) && 
            <div className="page-content">
                      <Box >
                        <Typography display="block" variant='h4'>Welcome to the OT2 Shell Application. This can be a starting point for any OT2 - Powered web application.</Typography>
                        <Typography display="block" variant='h6'>Below is the REST call result.</Typography>
                        <div><pre>{JSON.stringify(callResp, null, 2)}</pre></div>
                      </Box>
                    
                  </div>}
                  
                  <Dialog
                    open={(!authService.isPending() && !authService.isAuthenticated())} onClose={() => {}}>
                    <DialogTitle>Login</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            You are not logged in. Click below to start the login process.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => { login(); }} variant="contained" color="primary">
                            Login
                        </Button>
                    </DialogActions> 
                </Dialog>
                
                <Dialog
                    open={authService.isPending()} onClose={() => {}}>
                    <DialogTitle>Loading application...</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Authenticating...
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => { logout(true); login(); }} variant="contained" color="primary">
                            Reset
                        </Button>
                    </DialogActions>
                </Dialog>
            
                <Backdrop style={{ zIndex: 9999 }} open={false}>
                    <CircularProgress color="inherit" />
                </Backdrop>

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

// add auth provider around app
function WrappedSecuredApp() { 
     console.log('App init - wrapping authService');
    if (authService.getAuthTokens().error) {
        console.log('Auth service error: ' + authService.getAuthTokens().error);
    }
     
    if (authService.getAuthTokens().error && (authService.getAuthTokens().error==='unauthorized' || authService.getAuthTokens().error==='invalid_request')) {
        authService.authorize();
    }
    return (
        <AuthProvider authService={authService} >
            <App />
        </AuthProvider>
    );
}

export default WrappedSecuredApp;