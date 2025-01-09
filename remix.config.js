const { createRoutesFromFolders } = require("@remix-run/v1-route-convention");
const cssBundle = require("@remix-run/css-bundle");

module.exports = {
  ignoredRouteFiles: ["**/.*"],
  tailwind: true,
  // Remove cssBundle temporarily:
  // plugins: [cssBundle()],
  serverDependenciesToBundle: ["@popperjs/core", "react-overlays", "axios", "mapbox-gl"],
  serverModuleFormat: "cjs",
  assetsBuildDirectory: "public/build",
  publicPath: "/build/",
  future: {
    v2_dev: true,
    v2_errorBoundary: true,
    v2_headers: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true,
    //hello
  },
  routes(defineRoutes) {
    return createRoutesFromFolders(defineRoutes);
  },
};
