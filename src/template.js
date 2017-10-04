module.exports = (svgOutput, componentName) =>
  `/*! Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license. */
/* tslint:disable:max-line-length */
// This file was auto-generated -- do not edit

import * as React from 'react';

const ${componentName} = function ${componentName}(props: any) {
  return (
${svgOutput.split('\n').map(line => `    ${line}`).join('\n').trimRight()}
  );
};

export default ${componentName};
`;
