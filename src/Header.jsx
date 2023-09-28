import * as React from 'react';
 
//FOR LOADING STUFF AT INIT
import { useEffect, useContext } from 'react';


//FOR sharing data across components
import { AppContext } from './Context';


// MUI components
import { 
  Avatar, 
  Button, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  Menu, 
  MenuItem,
  ListItemIcon, 
  Box, 
  LinearProgress,
  Badge, 
} from "@mui/material";
import Stack from '@mui/material/Stack';

import Logout from '@mui/icons-material/Logout';
import GroupIcon from '@mui/icons-material/Group';

import CloudSyncIcon from '@mui/icons-material/CloudSync';
import ScreenshotMonitorIcon from '@mui/icons-material/ScreenshotMonitor';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function Header(props) {
  const { userName, logoutFunction, setDebugPanel, debugPanel, showBackdrop, callCount, groups, roles  } = props;

  const appCtx = useContext(AppContext);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [showGroups, setShowGroups] = React.useState(false);
  const [showRoles, setShowRoles] = React.useState(false);


  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleClickLogout = () => {
    logoutFunction();
    setAnchorEl(null);
    
  }

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


  const getSvg = () => {
    return './images/Opentext_LibraryApplication.svg';
  }




  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        //console.log("useEffect() - occurs ONCE, AFTER the initial render (unless react.strict mode)");
        
    },[]
    );

  return (
    <React.Fragment>
        <header className="app-page-header">
            <div className="logo">
                <Button variant="icon" onClick={() => setDebugPanel(!debugPanel)}>
                {callCount ? 
                    <Badge badgeContent={callCount} color="primary" max={9999}>
                      <MoreVertIcon/>
                    </Badge>
                  : 
                  <MoreVertIcon/>
                  }
                </Button>
                
            </div>
            
              <div className="app-header-title">
                <img
                  src={getSvg()}
                  alt={`OpenText shell application`}
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

            <div className={debugPanel ? "app-header-menu-debug" : "app-header-menu"}>
              <Button
                aria-controls="simple-menu"
                aria-haspopup="true"
                onClick={handleClick}
              >
                <Avatar {...stringAvatar(userName)} />
                
              </Button>
              <Menu
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    mt: 1.5,
                    '& .MuiAvatar-root': {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 27,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                }}
              >
                
                <MenuItem onClick={handleClickLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  Logout {userName}
                </MenuItem>
                {!appCtx.simple && <Divider/>}
                {!appCtx.simple && <MenuItem onClick={() => {setShowGroups(true); setAnchorEl(null);}}>
                  <ListItemIcon>
                    <GroupIcon fontSize="small" />
                  </ListItemIcon>
                  {`Groups`}
                </MenuItem>}
                {!appCtx.simple && <MenuItem onClick={() => {setShowRoles(true); setAnchorEl(null);}}>
                  <ListItemIcon>
                    <GroupIcon fontSize="small" />
                  </ListItemIcon>
                  {`Roles`}
                </MenuItem>}
              </Menu>
            </div>
          </header>
          <Dialog
              open={showGroups} onClose={() => {setShowGroups(false)}}>
              <DialogTitle>Groups</DialogTitle>
              <DialogContent>
                  <DialogContentText>
                    {groups.join(',')}
                  </DialogContentText>
              </DialogContent>
              <DialogActions>
                  
                  <Button onClick={() => { setShowGroups(false) }} variant="contained" color="primary">
                      Close
                  </Button>
              </DialogActions>
          </Dialog>
          <Dialog
              open={showRoles} onClose={() => {setShowRoles(false)}}>
              <DialogTitle>Roles</DialogTitle>
              <DialogContent>
                  <DialogContentText>
                    {roles.join(',')}
                  </DialogContentText>
              </DialogContent>
              <DialogActions>
                  
                  <Button onClick={() => { setShowRoles(false) }} variant="contained" color="primary">
                      Close
                  </Button>
              </DialogActions>
          </Dialog>
          
    </React.Fragment>
          
        
  );
}
