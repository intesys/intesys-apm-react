# Intesys apm react

This is an helper library to add apm to react applications.

APM is part of [elastic suite](https://www.elastic.co/guide/en/apm/agent/rum-js/5.x/index.html).
It is used to log application events and errors to elastic.

## Install

`npm i `

```javascript
// typically in your project main file
import { bootstrapApm } from "intesys-apm-react";

const serverUrl = "http://your.server.url:8000";
const serviceName = require("../package.json").name;
const serviceVersion = require("../package.json").version;
const environment = process.env.NODE_ENV;

bootstrapApm(serverUrl, serviceName, serviceVersion, environment);
```

## How to use

### Register errors

```javascript
// where you need to catch an error
import { apm } from "intesys-apm-react";

apm.captureError(new Error("<error-message>"));
```

### Measure component lifetime

```javascript
// register a transaction for the component lifecycle
import { useApmTransaction } from "intesys-apm-react";

const MyComponent = () => {
  useApmTransaction("transaction-name");

  return <>...</>;
};
```

### Track events in a component

Manually close a transaction:

```javascript
// manually close a transaction
import { useApmTransaction } from "intesys-apm-react";

const MyComponent = () => {
  const [_, sendTransaction] = useApmTransaction("transaction-name");

  useEffect(() => {
    sendTransaction();
  }, [dependencies]);

  return <>...</>;
};
```

Use spans inside a transaction

```javascript
// use spans
import { useApmTransaction } from "intesys-apm-react";

const MyComponent = () => {
  const [registerSpan, _] = useApmTransaction("transaction-name");

  useEffect(() => {
    const span = registerSpan("span-name");
    // do what you want
    span.end(); // optional: close span
  }, [dependencies]);

  return <>...</>;
};
```
