(this["webpackJsonpot2-shell-app"]=this["webpackJsonpot2-shell-app"]||[]).push([[0],{229:function(e,t,n){},230:function(e,t,n){},236:function(e,t){},239:function(e,t){},250:function(e,t){},252:function(e,t){},277:function(e,t){},279:function(e,t){},280:function(e,t){},285:function(e,t){},287:function(e,t){},293:function(e,t){},295:function(e,t){},314:function(e,t){},326:function(e,t){},329:function(e,t){},357:function(e,t,n){"use strict";n.r(t);var o=n(0),c=n(202),a=n.n(c),s=(n(229),n(89)),r=n(48),i=n(90),l=n(15),u=(n(230),n(91)),d=n(92),h=n.n(d),p=n(412),j=n(415),b=n(416),O=n(413),g=n(404),v=n(408),f=n(364),x=n(418),m=n(402),k=n(419),A=n(420),S=n(421),w=n(417),y=n(422),C=n(407),T=n(423),R=n(406),_=n(213),E=n.n(_),z=n(210),L=n.n(z),N=n(208),P=n.n(N),I=n(411),U=n(2),B=new u.b({clientId:"6J0j0Ra00OXuTi3kwDuhZLo93oceOARk",authorizeEndpoint:"https://na-1-dev.api.opentext.com/tenants/c3578443-837b-4170-8657-a4caa6b56a0c/oauth2/auth",tokenEndpoint:"https://na-1-dev.api.opentext.com/tenants/c3578443-837b-4170-8657-a4caa6b56a0c/oauth2/token",logoutEndpoint:"https://na-1-dev.api.opentext.com/tenants/c3578443-837b-4170-8657-a4caa6b56a0c/oauth2/logout",redirectUri:"https://localhost:5050",scopes:["openid"]});function J(){var e=Object(u.c)().authService,t=Object(o.useState)(null),n=Object(l.a)(t,2),c=n[0],a=n[1],d=Object(o.useState)({}),_=Object(l.a)(d,2),z=_[0],N=_[1],B=Object(o.useState)(!1),J=Object(l.a)(B,2),q=J[0],D=J[1],F=Object(o.useState)(""),H=Object(l.a)(F,2),M=H[0],W=H[1],X=Object(o.useState)("success"),Y=Object(l.a)(X,2),Z=Y[0],$=Y[1],G=Object(o.useState)(!1),K=Object(l.a)(G,2),Q=K[0],V=K[1],ee=function(){D(!1),W("")},te=function(){var t=Object(i.a)(Object(r.a)().mark((function t(){return Object(r.a)().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.abrupt("return",e.authorize());case 1:case"end":return t.stop()}}),t)})));return function(){return t.apply(this,arguments)}}(),ne=function(){var t=Object(i.a)(Object(r.a)().mark((function t(n){return Object(r.a)().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.abrupt("return",e.logout(n));case 1:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}(),oe=void 0,ce=0;h.a.interceptors.response.use((function(e){return e}),function(){var t=Object(i.a)(Object(r.a)().mark((function t(n){var o,c,a;return Object(r.a)().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(c=null===n||void 0===n?void 0:n.config,401!==(null===n||void 0===n||null===(o=n.response)||void 0===o?void 0:o.status)||null!==c&&void 0!==c&&c.sent){t.next=10;break}return c.sent=!0,1===++ce&&(oe=e.fetchToken(e.getAuthTokens().refresh_token,!0)),t.next=7,oe.then((function(e){e.access_token&&(c.headers=Object(s.a)(Object(s.a)({},c.headers),{},{Authorization:"Bearer ".concat(e.access_token)}))}));case 7:return ce--,console.log("Rerun request with status ".concat(null===n||void 0===n||null===(a=n.response)||void 0===a?void 0:a.status)),t.abrupt("return",h()(c));case 10:return t.abrupt("return",Promise.reject(n));case 11:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}());var ae=function(e){var t=e.split(" "),n="";return n+=t[0].charAt(0),t.length>1?n+=t[t.length-1].charAt(0):n+=t[0].charAt(1),n};function se(e){var t,n=0;for(t=0;t<e.length;t+=1)n=e.charCodeAt(t)+((n<<5)-n);var o="#";for(t=0;t<3;t+=1){o+="00".concat((n>>8*t&255).toString(16)).slice(-2)}return o}var re,ie=function(e,t){ne(e),window.location.replace("https://na-1-dev.api.opentext.com/tenants/c3578443-837b-4170-8657-a4caa6b56a0c/oauth2/logout?id_token_hint="+encodeURIComponent(t)+"&post_logout_redirect_uri="+encodeURIComponent("https://localhost:5050"))},le=function(){!function(e,t,n,o){V(!0);var c=e.url.replace(/^[a-z]{4,5}:\/{2}[^/]+(\/.*)/,"$1");console.log("\nCall Sent\n"+e.method+"\n"+c),h()(e).then((function(e){if(console.log("SUCCESS"),t(e),n){var c=n;if(o&&o.length>0)for(var a=0;a<o.length;a++){var s;c=c.replace(RegExp(o[a].name,"g"),null!==(s=e.data[o[a].node])&&void 0!==s?s:"")}W("".concat(c)),$("success"),D(!0)}})).catch((function(e){var n,o,c,a,s,r,i,l,u,d,h,p;console.log("ERROR running the call"),console.log(e),null!==(n=e.response)&&void 0!==n&&n.status&&401===(null===(o=e.response)||void 0===o?void 0:o.status)&&(ne(!0),te());var j={status:e.response&&e.response.status?e.response.status:-1,message:e.response&&e.response.data&&e.response.data.details?e.response.data.details:null!==(c=e.message)&&void 0!==c?c:"Error, please check the console log."};t(j),W("".concat(null!==(a=e.response)&&void 0!==a&&null!==(s=a.data)&&void 0!==s&&s.details?null===(r=e.response)||void 0===r||null===(i=r.data)||void 0===i?void 0:i.details:null!==(l=e.message)&&void 0!==l?l:"Error, please check the console log.","|Code: ").concat(null!==(u=e.response)&&void 0!==u&&u.status?null===(d=e.response)||void 0===d||null===(h=d.status)||void 0===h?void 0:h.toString():null!==(p=e.code)&&void 0!==p?p:"ERR")),$("error"),D(!0)})).finally((function(){V(!1)}))}({method:"get",url:"".concat("https://na-1-dev.api.opentext.com","/cms/service"),headers:{Authorization:"Bearer ".concat(e.getAuthTokens().access_token),Accept:"*/*"}},(function(e){var t;N(null!==(t=e.data)&&void 0!==t?t:{})}),"Successfully ran the /cms/service request.",[])};return Object(o.useEffect)((function(){console.log("Start app - checking token status"),e.getAuthTokens().access_token&&(console.log("Start app - checking service status"),le())}),[]),Object(U.jsxs)("div",{className:"App",children:[!e.isPending()&&e.isAuthenticated()&&Object(U.jsxs)("header",{className:"page-header",children:[Object(U.jsx)("div",{className:"logo"}),Object(U.jsxs)("div",{className:"header-title",children:[Object(U.jsx)("img",{src:"./images/Opentext_LibraryApplication.svg",alt:"Opentext Shell Application"})," ",Object(U.jsx)("img",{src:"./images/powered_by.svg",alt:"Powered by OpenText Developer Cloud",style:{paddingLeft:"8px",paddingTop:"8px"}})]}),Q&&Object(U.jsxs)(p.a,{direction:"row",sx:{display:"flex",height:"100%",p:0,alignItems:"center",justifyContent:"flex-start"},children:[Object(U.jsx)(P.a,{}),Object(U.jsx)(j.a,{sx:{width:"30%"},children:Object(U.jsx)(b.a,{color:"success"})}),Object(U.jsx)(L.a,{})]}),Object(U.jsxs)("div",{className:"header-menu",children:[Object(U.jsx)(O.a,{"aria-controls":"simple-menu","aria-haspopup":"true",onClick:function(e){a(e.currentTarget)},children:Object(U.jsx)(I.a,Object(s.a)({},(re=e.getUser().name.split("@")[0],{sx:{bgcolor:se(re)},children:ae(re)})))}),Object(U.jsx)(g.a,{anchorOrigin:{vertical:"bottom",horizontal:"center"},anchorEl:c,keepMounted:!0,open:Boolean(c),onClose:function(){a(null)},children:Object(U.jsxs)(v.a,{onClick:function(){ie(!0,e.getAuthTokens().id_token),a(null)},children:["Logout ",e.getUser().name.split("@")[0]]})})]})]}),!e.isPending()&&e.isAuthenticated()&&Object(U.jsx)("div",{className:"page-content",children:Object(U.jsxs)(j.a,{children:[Object(U.jsx)(f.a,{display:"block",variant:"h4",children:"Welcome to the OT2 Shell Application. This can be a starting point for any OT2 - Powered web application."}),Object(U.jsx)(f.a,{display:"block",variant:"h6",children:"Below is the REST call result."}),Object(U.jsx)("div",{children:Object(U.jsx)("pre",{children:JSON.stringify(z,null,2)})})]})}),Object(U.jsxs)(x.a,{open:!e.isPending()&&!e.isAuthenticated(),onClose:function(){},children:[Object(U.jsx)(m.a,{children:"Login"}),Object(U.jsx)(k.a,{children:Object(U.jsx)(A.a,{children:"You are not logged in. Click below to start the login process."})}),Object(U.jsx)(S.a,{children:Object(U.jsx)(O.a,{onClick:function(){te()},variant:"contained",color:"primary",children:"Login"})})]}),Object(U.jsxs)(x.a,{open:e.isPending(),onClose:function(){},children:[Object(U.jsx)(m.a,{children:"Loading application..."}),Object(U.jsx)(k.a,{children:Object(U.jsx)(A.a,{children:"Authenticating..."})}),Object(U.jsx)(S.a,{children:Object(U.jsx)(O.a,{onClick:function(){ne(!0),te()},variant:"contained",color:"primary",children:"Reset"})})]}),Object(U.jsx)(w.a,{style:{zIndex:9999},open:!1,children:Object(U.jsx)(y.a,{color:"inherit"})}),Object(U.jsx)(C.a,{anchorOrigin:{vertical:"bottom",horizontal:"center"},open:q,autoHideDuration:5e3,onClose:ee,action:Object(U.jsx)(o.Fragment,{children:Object(U.jsx)(T.a,{size:"small","aria-label":"close",color:"inherit",onClick:ee,children:Object(U.jsx)(E.a,{fontSize:"small"})})}),children:Object(U.jsx)(R.a,{onClose:ee,severity:Z,children:M.split("|").map((function(e,t){return Object(U.jsx)(f.a,{display:"block",children:e},"alert"+t)}))})})]})}var q=function(){return console.log("App init - wrapping authService"),B.getAuthTokens().error&&console.log("Auth service error: "+B.getAuthTokens().error),!B.getAuthTokens().error||"unauthorized"!==B.getAuthTokens().error&&"invalid_request"!==B.getAuthTokens().error||B.authorize(),Object(U.jsx)(u.a,{authService:B,children:Object(U.jsx)(J,{})})};a.a.createRoot(document.getElementById("root")).render(Object(U.jsx)(q,{}))}},[[357,1,2]]]);
//# sourceMappingURL=main.92397136.chunk.js.map