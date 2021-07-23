/**
 * This test has been isolated because it requires a fresh instance of apm
 */

import { bootstrapApm } from "./useApm";

describe("useApm.disabled", () => {
  it.only("can be disabled", () => {
    const apmInstance = bootstrapApm(
      "http://localhost:8200",
      "test",
      "test",
      "test",
      false
    );
    expect(apmInstance.isActive()).toBeFalsy();
  });
});
