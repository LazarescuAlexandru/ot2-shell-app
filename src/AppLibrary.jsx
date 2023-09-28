import './style/App.scss';
// import react libraries including those providing capabilities related to state management
import * as React from 'react';

//import { useState } from "react";
//FOR LOADING STUFF AT INIT
import { useEffect, useContext, useState } from 'react';


//FOR sharing data across components
import { AppContext } from './Context';

// MUI components
import {
    Box,
    Stack,
    IconButton,
    Typography,
  } from '@mui/material';


import RefreshIcon from '@mui/icons-material/Refresh';

export default function AppLibrary(props) { 

    const {
      debugPanel, 
      showBorder,
      runRequest, 
      token
    } = props;
    
    // eslint-disable-next-line 
    const appCtx = useContext(AppContext);
    //to show the call response for the example call
    const [callResp, setCallResp] = useState({});

    //to know which component needs to be highlighted
    const [activeId, setActiveId] = useState('');

    const addActiveId = (item) => {
      let array = activeId.split(',');
      if (!array.find((obj) => {return obj===item})) {
        array.push(item);
        setActiveId(array.join(','));
      }
    }

    const removeActiveId = (item) => {
      let tmpActId = activeId;
      let array = [];
      for (let i=0; i<tmpActId.split(',').length; i++) {
        if (tmpActId.split(',')[i]!==item) {
          array.push(tmpActId.split(',')[i]);
        }
      }
      setActiveId(array.join(','));
    }
    

    const checkService = () => {
      addActiveId('serviceRun');
      let req = { 
          method: 'get', 
          url: `${(localStorage.getItem('lib-appbaseurl') ?? process.env.REACT_APP_BASE_URL)}/cms/service`, 
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' } 
      };
      runRequest(req, (res) => {
        setCallResp(res.data ?? {});
        removeActiveId('serviceRun');
      }, 
      `Successfully ran the /cms/service request.`,
      []);

    }
    
    


     // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
    useEffect(
        () => {
          checkService();
        
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    // display app
    return (
        <React.Fragment>
         
          {(token) && 
              <div className="page-content">
              <Box sx={{ width: debugPanel?'75vw':'100%' }}>
                <Typography display="block" variant='h4'>Welcome to the OT2 Shell Application. This can be a starting point for any OT2 - Powered web application.</Typography>
                <Stack direction={'row'} spacing={1}> 
                  <Box>
                    <Typography display="block" variant='h6'>Below is the REST call result.</Typography>
                  </Box>
                  <Box sx={{
                    borderStyle: (activeId.split(',').find((obj) => {return obj==='serviceRun'}) && showBorder)?'solid':'none', 
                    borderColor: 'red',
                    borderWidth: 'thin'
                  }}>
                    <IconButton size="small" variant="outlined" color="primary" title="Rerun call" onClick={() => { checkService() }}>
                      <RefreshIcon />
                    </IconButton>
                  </Box>
                </Stack>
                
                <div><pre>{JSON.stringify(callResp, null, 2)}</pre></div>
              </Box>
          
            </div>}
          
        </React.Fragment>
    );
}
