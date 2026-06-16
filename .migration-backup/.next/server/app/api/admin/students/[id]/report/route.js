(()=>{var a={};a.id=1529,a.ids=[1529],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},19121:a=>{"use strict";a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},19185:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>D,patchFetch:()=>C,routeModule:()=>y,serverHooks:()=>B,workAsyncStorage:()=>z,workUnitAsyncStorage:()=>A});var d={};c.r(d),c.d(d,{GET:()=>x});var e=c(95736),f=c(9117),g=c(4044),h=c(39326),i=c(32324),j=c(261),k=c(54290),l=c(85328),m=c(38928),n=c(46595),o=c(3421),p=c(17679),q=c(41681),r=c(63446),s=c(86439),t=c(51356),u=c(10641),v=c(70373),w=c(66147);async function x(a,{params:b}){try{(0,w.RB)(a,["teacher"])}catch(a){return u.NextResponse.json({error:"Unauthorized"},{status:403})}let{id:c}=await b,d=await v.z.student.findUnique({where:{id:c},include:{testResults:{include:{subjectMarks:!0},orderBy:{createdAt:"desc"}},ranks:{orderBy:{date:"desc"},take:10},attendance:!0,syllabus:{include:{chapter:!0}},notifications:{orderBy:{createdAt:"desc"},take:10}}});if(!d)return u.NextResponse.json({error:"Student not found"},{status:404});let e=function(a){let b=a.testResults.length?Math.round(a.testResults.reduce((a,b)=>a+b.percentage,0)/a.testResults.length):0,c=a.ranks[0]?.rank||"N/A",d=a.attendance.filter(a=>a.attended).length,e=a.attendance.length?Math.round(d/a.attendance.length*100):0,f=a.syllabus.filter(a=>"ONGOING"===a.status),g=a.syllabus.filter(a=>"COMPLETED"===a.status);return`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Student Report - ${a.fullName}</title>
  <style>
    body {
      font-family: "Inter", -apple-system, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
      color: #333;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    header {
      border-bottom: 3px solid #d4a574;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 {
      margin: 0 0 10px 0;
      color: #060616;
      font-size: 32px;
    }
    .student-id {
      color: #999;
      font-size: 14px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #060616;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #f0f0f0;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 20px;
    }
    .metric {
      padding: 15px;
      background: #f9f9f9;
      border-radius: 6px;
      text-align: center;
      border-left: 4px solid #d4a574;
    }
    .metric-value {
      font-size: 28px;
      font-weight: 700;
      color: #d4a574;
      margin: 10px 0;
    }
    .metric-label {
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th {
      background: #060616;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #f0f0f0;
    }
    tr:last-child td {
      border-bottom: none;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-green {
      background: #e8f5e9;
      color: #2e7d32;
    }
    .badge-blue {
      background: #e3f2fd;
      color: #1565c0;
    }
    .badge-gold {
      background: #fff3e0;
      color: #e65100;
    }
    .badge-gray {
      background: #f5f5f5;
      color: #616161;
    }
    .empty-state {
      text-align: center;
      padding: 20px;
      color: #999;
      font-style: italic;
    }
    footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #f0f0f0;
      font-size: 12px;
      color: #999;
      text-align: center;
    }
    .page-break {
      page-break-after: always;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${a.fullName}</h1>
      <p class="student-id">Student ID: ${a.id}</p>
      <p style="margin: 5px 0; color: #666;">
        Batch: ${a.batchType} | Stream: ${a.stream} | Class: ${a.classLevel}th
      </p>
    </header>

    <div class="section">
      <div class="section-title">Performance Overview</div>
      <div class="metrics">
        <div class="metric">
          <div class="metric-label">Current Rank</div>
          <div class="metric-value">#${c}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Average Score</div>
          <div class="metric-value">${b}%</div>
        </div>
        <div class="metric">
          <div class="metric-label">Attendance</div>
          <div class="metric-value">${e}%</div>
        </div>
        <div class="metric">
          <div class="metric-label">Tests Taken</div>
          <div class="metric-value">${a.testResults.length}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Test History</div>
      ${a.testResults.length?`
        <table>
          <thead>
            <tr>
              <th>Test</th>
              <th>Score</th>
              <th>Rank</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${a.testResults.slice(0,10).map(b=>`
              <tr>
                <td>Test ${a.testResults.indexOf(b)+1}</td>
                <td><strong>${b.percentage}%</strong></td>
                <td>${b.rank?`#${b.rank}`:"N/A"}</td>
                <td>${new Date(b.createdAt).toLocaleDateString()}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `:'<div class="empty-state">No test history yet</div>'}
    </div>

    <div class="section">
      <div class="section-title">Syllabus Progress</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div>
          <p style="font-weight: 600; margin-bottom: 10px;">Completed (${g.length})</p>
          ${g.length?`
            <ul style="list-style: none; padding: 0;">
              ${g.slice(0,8).map(a=>`
                <li style="padding: 5px 0; display: flex; align-items: center;">
                  <span style="color: #4caf50; margin-right: 8px;">✓</span>
                  ${a.chapter.chapterName}
                </li>
              `).join("")}
            </ul>
          `:'<p style="color: #999; font-style: italic;">None yet</p>'}
        </div>
        <div>
          <p style="font-weight: 600; margin-bottom: 10px;">Ongoing (${f.length})</p>
          ${f.length?`
            <ul style="list-style: none; padding: 0;">
              ${f.slice(0,8).map(a=>`
                <li style="padding: 5px 0; display: flex; align-items: center;">
                  <span style="color: #2196f3; margin-right: 8px;">→</span>
                  ${a.chapter.chapterName}
                </li>
              `).join("")}
            </ul>
          `:'<p style="color: #999; font-style: italic;">None yet</p>'}
        </div>
      </div>
    </div>

    <footer>
      <p>Report generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
      <p>Roman Academy \xa9 2026. Confidential.</p>
    </footer>
  </div>
</body>
</html>
  `}(d);return new u.NextResponse(e,{headers:{"Content-Type":"text/html","Content-Disposition":`attachment; filename="report-${d.fullName}-${Date.now()}.html"`}})}let y=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/admin/students/[id]/report/route",pathname:"/api/admin/students/[id]/report",filename:"route",bundlePath:"app/api/admin/students/[id]/report/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"C:\\Users\\kavit\\Downloads\\RA DASHBOARD\\app\\api\\admin\\students\\[id]\\report\\route.ts",nextConfigOutput:"",userland:d}),{workAsyncStorage:z,workUnitAsyncStorage:A,serverHooks:B}=y;function C(){return(0,g.patchFetch)({workAsyncStorage:z,workUnitAsyncStorage:A})}async function D(a,b,c){var d;let e="/api/admin/students/[id]/report/route";"/index"===e&&(e="/");let g=await y.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:x,prerenderManifest:z,routerServerContext:A,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,resolvedPathname:D}=g,E=(0,j.normalizeAppPath)(e),F=!!(z.dynamicRoutes[E]||z.routes[D]);if(F&&!x){let a=!!z.routes[D],b=z.dynamicRoutes[E];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let G=null;!F||y.isDev||x||(G="/index"===(G=D)?"/":G);let H=!0===y.isDev||!F,I=F&&!H,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:z,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:H,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>y.onRequestError(a,b,d,A)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>y.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&B&&C&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!F)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await y.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})},A),b}},l=await y.handleResponse({req:a,nextConfig:w,cacheKey:G,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:z,isRoutePPREnabled:!1,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,responseGenerator:k,waitUntil:c.waitUntil});if(!F)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",B?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),x&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&F||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(b instanceof s.NoFallbackError||await y.onRequestError(a,b,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})}),F)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},66147:(a,b,c)=>{"use strict";function d(a){let b=(a.headers.get?.("cookie")??"").match(/\bra_role=([^;]+)/),c=b?.[1];return"teacher"===c||"student"===c||"admin"===c?c:null}function e(a){let b=(a.headers.get?.("cookie")??"").match(/\bra_user_id=([^;]+)/);return b?.[1]??null}function f(a,b){let c=d(a);if(!c||!b.includes(c)){let a=Error("Unauthorized");throw a.status=403,a}return c}c.d(b,{AH:()=>d,RB:()=>f,Wd:()=>e})},70373:(a,b,c)=>{"use strict";c.d(b,{z:()=>e});var d=c(96330);let e=globalThis.prisma||new d.PrismaClient},78335:()=>{},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},96330:a=>{"use strict";a.exports=require("@prisma/client")},96487:()=>{}};var b=require("../../../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[1331,1692],()=>b(b.s=19185));module.exports=c})();