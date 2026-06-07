/** @type {import('next').NextConfig} */
const nextConfig = {
  // React Three Fiber / drei don't play well with React StrictMode's dev-only
  // double-render: drei's <ScrollControls>/<Scroll html> calls
  // ReactDOM.createRoot() inside a useMemo with no unmount, so the second
  // StrictMode render re-roots the same container and logs
  // "createRoot() on a container that has already been passed to createRoot()".
  // It's a dev-only warning (prod renders once), but StrictMode adds little for
  // this 3D-heavy single-page site, so we turn it off to keep the console clean.
  reactStrictMode: false,
};

export default nextConfig;
