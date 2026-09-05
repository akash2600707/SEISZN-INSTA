module.exports=[85148,(a,b,c)=>{b.exports=a.x("better-sqlite3-90e2652d1716b047",()=>require("better-sqlite3-90e2652d1716b047"))},54799,(a,b,c)=>{b.exports=a.x("crypto",()=>require("crypto"))},22734,(a,b,c)=>{b.exports=a.x("fs",()=>require("fs"))},93695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},73789,a=>{"use strict";var b=a.i(12948),c=a.i(67436),d=a.i(94331);a.i(70408);let e=(0,b.instrumentModuleGetter)(()=>a.r(68611)),f=(0,b.instrumentModuleGetter)(()=>a.r(81967)),g=(0,b.instrumentModuleGetter)(()=>a.r(43619)),h=(0,b.instrumentModuleGetter)(()=>a.r(13718)),i=(0,b.instrumentModuleGetter)(()=>a.r(18198)),j=(0,b.instrumentModuleGetter)(()=>a.r(62212)),k=["",{children:["product",{children:["[slug]",{children:["__PAGE__",{},{metadata:{},page:[(0,b.instrumentModuleGetter)(()=>a.r(56031)),"[project]/src/app/product/[slug]/page.js"]},[]]},{metadata:{}},[]]},{metadata:{}},[]]},{metadata:{icon:[async()=>{let a=(0,d.interopDefault)(await e());return[{url:`/favicon.ico?${a.src.split("/").splice(-1)[0]}`,sizes:`${a.width}x${a.height}`,type:"image/x-icon"}]}]},layout:[f,"[project]/src/app/layout.js"],"not-found":[g,"[project]/node_modules/next/dist/client/components/builtin/not-found.js"],forbidden:[h,"[project]/node_modules/next/dist/client/components/builtin/forbidden.js"],unauthorized:[i,"[project]/node_modules/next/dist/client/components/builtin/unauthorized.js"],"global-error":[j,"[project]/node_modules/next/dist/client/components/builtin/global-error.js"]},[]],l=a.r.bind(a),m=a.l.bind(a),n=(0,c.createAppPageEntrypoint)({tree:k,page:"/product/[slug]/page",pathname:"/product/[slug]",require:l,loadChunk:m,interopDefault:d.interopDefault}),o=n.__next_app__,p=n.routeModule,q=n.handler;a.s(["__next_app__",0,o,"handler",0,q,"routeModule",0,p],80526),a.i(80526);var r=a.i(22922);a.s(["ClientPageRoot",()=>r.ClientPageRoot,"ClientSegmentRoot",()=>r.ClientSegmentRoot,"Fragment",()=>r.Fragment,"HTTPAccessFallbackBoundary",()=>r.HTTPAccessFallbackBoundary,"InstantValidation",()=>r.InstantValidation,"LayoutRouter",()=>r.LayoutRouter,"LoadingBoundaryProvider",()=>r.LoadingBoundaryProvider,"Postpone",()=>r.Postpone,"RenderFromTemplateContext",()=>r.RenderFromTemplateContext,"RootLayoutBoundary",()=>r.RootLayoutBoundary,"SegmentViewNode",()=>r.SegmentViewNode,"SegmentViewStateNode",()=>r.SegmentViewStateNode,"__next_app__",0,o,"captureOwnerStack",()=>r.captureOwnerStack,"collectPrefetchHints",()=>r.collectPrefetchHints,"collectSegmentData",()=>r.collectSegmentData,"createElement",()=>r.createElement,"createMetadataComponents",()=>r.createMetadataComponents,"createPrerenderParamsForClientSegment",()=>r.createPrerenderParamsForClientSegment,"createPrerenderSearchParamsForClientPage",()=>r.createPrerenderSearchParamsForClientPage,"createServerParamsForServerSegment",()=>r.createServerParamsForServerSegment,"createServerSearchParamsForServerPage",()=>r.createServerSearchParamsForServerPage,"createTemporaryReferenceSet",()=>r.createTemporaryReferenceSet,"decodeAction",()=>r.decodeAction,"decodeFormState",()=>r.decodeFormState,"decodeReply",()=>r.decodeReply,"handler",0,q,"isEmptyHTMLPrelude",()=>r.isEmptyHTMLPrelude,"patchFetch",()=>r.patchFetch,"preconnect",()=>r.preconnect,"preloadFont",()=>r.preloadFont,"preloadStyle",()=>r.preloadStyle,"prerender",()=>r.prerender,"prerenderToNodeStream",()=>r.prerenderToNodeStream,"renderToPipeableStream",()=>r.renderToPipeableStream,"renderToReadableStream",()=>r.renderToReadableStream,"routeModule",0,p,"serverHooks",()=>r.serverHooks,"taintObjectReference",()=>r.taintObjectReference],73789)},10585,a=>{a.v("/_next/static/media/favicon.2vob68tjqpejf.ico"+(globalThis.NEXT_CLIENT_ASSET_SUFFIX||""))},68611,a=>{"use strict";let b={src:a.i(10585).default,width:256,height:256};a.s(["default",0,b])},33263,a=>{"use strict";var b=a.i(85148),c=a.i(14747),d=a.i(22734),e=a.i(54799);let f=c.default.join(process.cwd(),"data","seiszn.db");d.default.existsSync(c.default.dirname(f))||d.default.mkdirSync(c.default.dirname(f),{recursive:!0});let g=new b.default(f);if(g.pragma("journal_mode = WAL"),g.exec(`
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- in paise
  image_url TEXT,
  sizes TEXT DEFAULT '["S","M","L"]', -- JSON array
  stock INTEGER DEFAULT 100,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  items TEXT NOT NULL, -- JSON array of {slug, name, price, size, qty}
  subtotal INTEGER NOT NULL,
  status TEXT DEFAULT 'pending', -- pending -> paid -> shipped -> delivered / failed
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  shiprocket_tracking_id TEXT,
  shiprocket_courier TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);
`),0===g.prepare("SELECT COUNT(*) as c FROM admins").get().c&&g.prepare("INSERT INTO admins (username, password_hash) VALUES (?, ?)").run("admin",e.default.createHash("sha256").update("change-me-123").digest("hex")),0===g.prepare("SELECT COUNT(*) as c FROM products").get().c){let a=g.prepare("INSERT INTO products (slug, name, description, price, image_url) VALUES (@slug, @name, @description, @price, @image_url)");for(let b of[{slug:"aurora-wrap-dress",name:"Aurora Wrap Dress",description:"Flowy wrap dress in soft crepe, perfect for evenings out.",price:249900,image_url:"/products/placeholder1.svg"},{slug:"noor-linen-set",name:"Noor Linen Co-ord Set",description:"Breathable linen co-ord set for effortless daywear.",price:319900,image_url:"/products/placeholder2.svg"},{slug:"velez-satin-slip",name:"Velez Satin Slip Dress",description:"Bias-cut satin slip dress with a fluid, luxe drape.",price:289900,image_url:"/products/placeholder3.svg"}])a.run(b)}a.s(["default",0,g])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__0p6c5nj._.js.map