import React from 'react';

// Define the pages and UI components
const pages = {
  Atoms: 'atoms',
  Lab: 'lab',
};  

const uiComponents = {

};

// Create a default route for the Atoms page from pages folder
const AtomsComponent = React.lazy(() => import(`../pages/atoms.jsx`));
// Create a default route for the Lab page from pages folder
const LabComponent = React.lazy(() => import(`../pages/lab.jsx`));

// Create email verification component (use verify.jsx)
const VerifyEmailComponent = React.lazy(() => import(`../verify.jsx`));

// Create routes with dynamic imports for both 'pages' and 'ui' directories
const pageRoutes = Object.keys(pages).map(page => {
  const Component = React.lazy(() => import(`../pages/${pages[page]}.jsx`));
  return {
    path: `/${page.toLowerCase()}`,
    element: <Component />,
  };
});

const uiRoutes = Object.keys(uiComponents).map(component => {
  const Component = React.lazy(() => import(`../ui/atom/${uiComponents[component]}.jsx`));
  return {
    path: `/ui/atom/${component.toLowerCase()}`,
    element: <Component />,
  };
});

// Add the default route for Atoms (home page)
const defaultRoute = {
  path: '/',
  element: <LabComponent />,
};

// Add additional routes for design system navigation
const designSystemRoute = {
  path: '/design-system',
  element: <AtomsComponent />,
};

// Add email verification route (expects token as query param)
const verifyEmailRoute = {
  path: '/verify',
  element: <VerifyEmailComponent />,
};

const verifyRoute = {
  path: '/verify/:token',
  element: <VerifyEmailComponent />,
};

// Export both the default route and the dynamically generated routes from 'pages' and 'ui'
// Note: verifyRoute must come before verifyEmailRoute to match /verify/:token first
export default [defaultRoute, designSystemRoute, verifyRoute, verifyEmailRoute, ...pageRoutes, ...uiRoutes];
