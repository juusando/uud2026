import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Suspense } from 'react';
import routes from './data/routes';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Router>
    <Suspense fallback={<div className="loading" >...Loading...</div>}>
      <Routes>
        {routes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Routes>
    </Suspense>
  </Router>
);


