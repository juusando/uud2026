import React from 'react';

// Define the pages and UI components
const pages = {
  Atoms: 'atoms',
  Home: 'home',
  Login: 'login',
  Signup: 'signup',
  Setting: 'setting',
  Tools: 'tools',
  Resos: 'resos',
  Ideaz: 'ideaz',
  Apps: 'apps',
  Talx: 'talx',
};

const uiComponents = {

};

// Create a default route for the Atoms page from pages folder
const AtomsComponent = React.lazy(() => import(`../pages/atoms.jsx`));
// Create a default route for the Home page from pages folder
const HomeComponent = React.lazy(() => import(`../pages/home.jsx`));

// Create email verification component (use verify.jsx)
const VerifyEmailComponent = React.lazy(() => import(`../verify.jsx`));
// Public user profile by username
const PublicUserComponent = React.lazy(() => import(`../pages/user.jsx`));

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

// Add the default route for Home
const defaultRoute = {
  path: '/',
  element: <HomeComponent />,
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
export default [defaultRoute, designSystemRoute, verifyRoute, verifyEmailRoute, ...pageRoutes, ...uiRoutes, { path: '/:username', element: <PublicUserComponent /> }];
