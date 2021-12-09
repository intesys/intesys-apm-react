import { ApmBase, init, Span } from "@elastic/apm-rum";
import { useCallback, useEffect, useMemo } from "react";

export let apm: ApmBase;

const apmExistsOrThrow = () => {
  if (typeof apm === "undefined") {
    throw new Error(
      "Apm must be initialized before using transactions, please call `bootstrapApm` before using apm functions"
    );
  }
};

export const bootstrapApm = (
  serverUrl: string,
  serviceName: string,
  serviceVersion: string,
  environment: string,
  active = true
): ApmBase => {
  if (typeof apm === "undefined") {
    apm = init({
      // Set required service name (allowed characters: a-z, A-Z, 0-9, -, _, and space)
      serviceName,
      // Set custom APM Server URL (default: http://localhost:8200)
      serverUrl,
      // Set service version (required for sourcemap feature)
      serviceVersion,
      environment,
      active,
      instrument: true,
    });
  }

  return apm;
};

export const useApmTransaction = (
  name: string
): [(name: string) => void, () => void] => {
  const transaction = useMemo(() => {
    apmExistsOrThrow();

    return apm.startTransaction(name);
  }, [name]);

  const spanRegistry: Span[] = [];

  const registerSpan = useCallback(
    (name: string) => {
      if (typeof transaction === "undefined") {
        console.warn("Transaction is not initialized, cannot start span");
        return;
      }

      const span = transaction.startSpan(name);
      span && spanRegistry.push(span);
      return span;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transaction]
  );

  const sendTransaction = useCallback(() => {
    if (typeof transaction === "undefined") {
      console.warn("Transaction doesn't exist, cannot send it");
      return;
    }

    spanRegistry.forEach((span) => span.end());

    transaction?.end();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transaction]);

  useEffect(() => {
    return sendTransaction;
  }, [sendTransaction]);

  return [registerSpan, sendTransaction];
};
