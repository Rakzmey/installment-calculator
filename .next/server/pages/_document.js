"use strict";(()=>{var e={};e.id=660,e.ids=[660],e.modules={7645:(e,t,r)=>{r.r(t),r.d(t,{default:()=>o});var s=r(997),n=r(6859),a=r.n(n);class i extends a(){render(){return(0,s.jsxs)(n.Html,{lang:"en",children:[s.jsx(n.Head,{children:s.jsx("style",{children:`
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
          `})}),(0,s.jsxs)("body",{children:[s.jsx("script",{dangerouslySetInnerHTML:{__html:`
              (function() {
                const theme = localStorage.getItem('theme') || 'light';
                document.documentElement.setAttribute('data-theme', theme);
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `}}),s.jsx(n.Main,{}),s.jsx(n.NextScript,{})]})]})}}let o=i},2785:e=>{e.exports=require("next/dist/compiled/next-server/pages.runtime.prod.js")},6689:e=>{e.exports=require("react")},997:e=>{e.exports=require("react/jsx-runtime")},5315:e=>{e.exports=require("path")}};var t=require("../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[859],()=>r(7645));module.exports=s})();