"use strict";(()=>{var a={};a.id=731,a.ids=[220,731],a.modules={361:a=>{a.exports=require("next/dist/compiled/next-server/pages.runtime.prod.js")},1379:(a,b,c)=>{c.r(b),c.d(b,{default:()=>h});var d=c(8732),e=c(2341),f=c.n(e);class g extends f(){render(){return(0,d.jsxs)(e.Html,{lang:"en",children:[(0,d.jsx)(e.Head,{children:(0,d.jsx)("style",{children:`
            /* Critical styles to prevent flash of unstyled content */
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
                Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            }
            
            /* Prevent flash during theme switching */
            * {
              transition: background-color 0.2s ease, color 0.2s ease;
            }
            
            /* Ensure dark mode compatibility */
            .dark {
              color-scheme: dark;
            }
          `})}),(0,d.jsxs)("body",{children:[(0,d.jsx)("script",{dangerouslySetInnerHTML:{__html:`
              (function() {
                const theme = localStorage.getItem('theme') || 'light';
                document.documentElement.setAttribute('data-theme', theme);
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `}}),(0,d.jsx)(e.Main,{}),(0,d.jsx)(e.NextScript,{})]})]})}}let h=g},2015:a=>{a.exports=require("react")},3873:a=>{a.exports=require("path")},6060:a=>{a.exports=require("next/dist/shared/lib/no-fallback-error.external.js")},8624:(a,b,c)=>{Object.defineProperty(b,"__esModule",{value:!0}),Object.defineProperty(b,"default",{enumerable:!0,get:function(){return k}});let d=c(7020),e=c(8732),f=d._(c(2015)),g=d._(c(2968)),h={400:"Bad Request",404:"This page could not be found",405:"Method Not Allowed",500:"Internal Server Error"};function i(a){let b,{req:d,res:e,err:f}=a,g=e&&e.statusCode?e.statusCode:f?f.statusCode:404;if(d){let{getRequestMeta:a}=c(5124),e=a(d,"initURL");e&&(b=new URL(e).hostname)}return{statusCode:g,hostname:b}}let j={error:{fontFamily:'system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',height:"100vh",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"},desc:{lineHeight:"48px"},h1:{display:"inline-block",margin:"0 20px 0 0",paddingRight:23,fontSize:24,fontWeight:500,verticalAlign:"top"},h2:{fontSize:14,fontWeight:400,lineHeight:"28px"},wrap:{display:"inline-block"}};class k extends f.default.Component{render(){let{statusCode:a,withDarkMode:b=!0}=this.props,c=this.props.title||h[a]||"An unexpected error has occurred";return(0,e.jsxs)("div",{style:j.error,children:[(0,e.jsx)(g.default,{children:(0,e.jsx)("title",{children:a?a+": "+c:"Application error: a client-side exception has occurred"})}),(0,e.jsxs)("div",{style:j.desc,children:[(0,e.jsx)("style",{dangerouslySetInnerHTML:{__html:"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}"+(b?"@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}":"")}}),a?(0,e.jsx)("h1",{className:"next-error-h1",style:j.h1,children:a}):null,(0,e.jsx)("div",{style:j.wrap,children:(0,e.jsxs)("h2",{style:j.h2,children:[this.props.title||a?c:(0,e.jsxs)(e.Fragment,{children:["Application error: a client-side exception has occurred"," ",!!this.props.hostname&&(0,e.jsxs)(e.Fragment,{children:["while loading ",this.props.hostname]})," ","(see the browser console for more information)"]}),"."]})})]})]})}}k.displayName="ErrorPage",k.getInitialProps=i,k.origGetInitialProps=i,("function"==typeof b.default||"object"==typeof b.default&&null!==b.default)&&void 0===b.default.__esModule&&(Object.defineProperty(b.default,"__esModule",{value:!0}),Object.assign(b.default,b),a.exports=b.default)},8732:a=>{a.exports=require("react/jsx-runtime")},9503:(a,b,c)=>{c.r(b),c.d(b,{config:()=>o,default:()=>k,getServerSideProps:()=>n,getStaticPaths:()=>m,getStaticProps:()=>l,handler:()=>w,reportWebVitals:()=>p,routeModule:()=>v,unstable_getServerProps:()=>t,unstable_getServerSideProps:()=>u,unstable_getStaticParams:()=>s,unstable_getStaticPaths:()=>r,unstable_getStaticProps:()=>q});var d=c(3885),e=c(237),f=c(1413),g=c(1379),h=c(4385),i=c(8624),j=c(2289);let k=(0,f.M)(i,"default"),l=(0,f.M)(i,"getStaticProps"),m=(0,f.M)(i,"getStaticPaths"),n=(0,f.M)(i,"getServerSideProps"),o=(0,f.M)(i,"config"),p=(0,f.M)(i,"reportWebVitals"),q=(0,f.M)(i,"unstable_getStaticProps"),r=(0,f.M)(i,"unstable_getStaticPaths"),s=(0,f.M)(i,"unstable_getStaticParams"),t=(0,f.M)(i,"unstable_getServerProps"),u=(0,f.M)(i,"unstable_getServerSideProps"),v=new d.PagesRouteModule({definition:{kind:e.RouteKind.PAGES,page:"/_error",pathname:"/_error",bundlePath:"",filename:""},distDir:".next",relativeProjectDir:"",components:{App:h.default,Document:g.default},userland:i}),w=(0,j.U)({srcPage:"/_error",config:o,userland:i,routeModule:v,getStaticPaths:m,getStaticProps:l,getServerSideProps:n})}};var b=require("../webpack-runtime.js");b.C(a);var c=b.X(0,[341,617,385],()=>b(b.s=9503));module.exports=c})();