// routes.ts
import { type RouteConfig, layout, index } from "@react-router/dev/routes";
import { Layout } from "./root";

export default [
  layout(Layout, [
    index("routes/index.tsx"), 
    route("crash", "routes/crash.tsx"),
  ]),
] satisfies RouteConfig;
