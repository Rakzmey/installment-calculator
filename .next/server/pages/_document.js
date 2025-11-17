"use strict";(()=>{var a={};a.id=220,a.ids=[220],a.modules={361:a=>{a.exports=require("next/dist/compiled/next-server/pages.runtime.prod.js")},1379:(a,b,c)=>{c.r(b),c.d(b,{default:()=>h});var d=c(8732),e=c(2341),f=c.n(e);class g extends f(){render(){return(0,d.jsxs)(e.Html,{lang:"en",children:[(0,d.jsx)(e.Head,{children:(0,d.jsx)("style",{children:`
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
            `}}),(0,d.jsx)(e.Main,{}),(0,d.jsx)(e.NextScript,{})]})]})}}let h=g},2015:a=>{a.exports=require("react")},3873:a=>{a.exports=require("path")},8732:a=>{a.exports=require("react/jsx-runtime")}};var b=require("../webpack-runtime.js");b.C(a);var c=b.X(0,[341],()=>b(b.s=1379));module.exports=c})();