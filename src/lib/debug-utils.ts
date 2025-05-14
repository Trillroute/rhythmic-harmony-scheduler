
/**
 * Debug utility functions to help diagnose rendering issues
 */

/**
 * Logs the current component render with a timestamp
 * @param componentName Name of the component being rendered
 * @param props Optional props to log
 */
export const logRender = (componentName: string, props?: Record<string, any>) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Rendering ${componentName}`, props || '');
};

/**
 * Creates a render boundary error to help locate where rendering is failing
 * @param message Custom error message
 */
export const throwRenderError = (message: string) => {
  console.error(`RENDER BOUNDARY ERROR: ${message}`);
  throw new Error(`Render boundary error: ${message}`);
};

/**
 * Adds a global diagnostic listener to detect React rendering issues
 */
export const installGlobalDiagnostics = () => {
  // Track component mount/unmount cycles
  let mountedComponents: Record<string, number> = {};

  // Create a global method to track component mounts
  (window as any).__trackComponentMount = (name: string) => {
    mountedComponents[name] = (mountedComponents[name] || 0) + 1;
    console.log(`Component mounted: ${name} (${mountedComponents[name]} instances)`);
  };

  // Create a global method to track component unmounts
  (window as any).__trackComponentUnmount = (name: string) => {
    mountedComponents[name] = Math.max(0, (mountedComponents[name] || 1) - 1);
    console.log(`Component unmounted: ${name} (${mountedComponents[name]} instances remain)`);
  };

  // Log all mounted components
  (window as any).__logMountedComponents = () => {
    console.table(mountedComponents);
    return mountedComponents;
  };

  console.log('Global diagnostics installed. Use window.__logMountedComponents() to see active components');
};
