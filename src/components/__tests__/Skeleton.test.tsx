/**
 * @jest-environment jsdom
 */

import React from "react";
import { render } from "@testing-library/react";
import { Skeleton, SkeletonCard, SkeletonRadioPlayer } from "../ui/Skeleton";

describe("Skeleton", () => {
  it("renders with default class", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass("animate-pulse");
    expect(el).toHaveClass("rounded-lg");
  });

  it("accepts custom className", () => {
    const { container } = render(<Skeleton className="h-4 w-32" />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass("h-4");
    expect(el).toHaveClass("w-32");
  });
});

describe("SkeletonCard", () => {
  it("renders skeleton card", () => {
    const { container } = render(<SkeletonCard />);
    expect(container.firstChild).toHaveClass("rounded-2xl");
  });
});

describe("SkeletonRadioPlayer", () => {
  it("renders without crashing", () => {
    const { container } = render(<SkeletonRadioPlayer />);
    expect(container.firstChild).toBeTruthy();
  });
});
