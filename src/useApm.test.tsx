import { render } from "@testing-library/react";
import React, { useEffect } from "react";
import { apm, bootstrapApm, useApmTransaction } from "./useApm";

const transactionEndSpy = jest.fn();

jest.mock("@elastic/apm-rum", () => ({
  __esModule: true,
  init: jest.fn(() => ({
    startTransaction: jest.fn(() => ({
      end: transactionEndSpy,
    })),
  })),
}));

describe("useApm", () => {
  const ComponentWithApm: React.FC = () => {
    const [_, __] = useApmTransaction("test transaction");
    return <>SUT component</>;
  };

  it("throws if apm is not bootstrapped", () => {
    expect(() => render(<ComponentWithApm />)).toThrow(
      /Apm must be initialized/
    );
  });

  describe("bootstrapApm", () => {
    beforeAll(() => {
      bootstrapApm("test", "test", "test", "test");
    });

    it("works if apm is initialized", () => {
      bootstrapApm("test", "test", "test", "test");
      const { getByText } = render(<ComponentWithApm />);
      expect(getByText("SUT component")).toBeTruthy();
    });

    it("after bootstrap, apm is initialized", () => {
      bootstrapApm("test", "test", "test", "test");
      expect(apm).toBeDefined();
    });

    it("apm is a singleton", () => {
      const spy = jest.spyOn(require("@elastic/apm-rum"), "init");
      bootstrapApm("test", "test", "test", "test");
      bootstrapApm("test", "test", "test", "test");
      expect(spy).toBeCalledTimes(1);
    });
  });

  describe("transaction", () => {
    const ComponentWithApmAndEffect: React.FC = () => {
      const [registerSpan, sendTransaction] = useApmTransaction(
        "test transaction"
      );

      useEffect(() => {
        sendTransaction();
      }, []);
      return <>SUT component</>;
    };

    beforeAll(() => {
      bootstrapApm("test", "test", "test", "test");
    });

    beforeEach(() => {
      transactionEndSpy.mockClear();
    });

    it("transaction is sent after unmount", () => {
      const { unmount } = render(<ComponentWithApm />);
      unmount();
      expect(transactionEndSpy).toBeCalled();
    });

    it("transaction is NOT sent if component is already mounted", () => {
      render(<ComponentWithApm />);
      expect(transactionEndSpy).not.toBeCalled();
    });

    it("transaction is sent if component does it explicitly", () => {
      render(<ComponentWithApmAndEffect />);
      expect(transactionEndSpy).toBeCalled();
    });
  });
});
