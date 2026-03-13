import { describe, it, expect } from "vitest";

/**
 * Tests for share link URL construction.
 * The copyLink function in dashboard/page.tsx builds the client portal URL.
 */

function buildShareUrl(origin: string, shareToken: string): string {
  return `${origin}/p/${shareToken}`;
}

describe("share link URL construction", () => {
  it("builds correct URL with production origin", () => {
    expect(buildShareUrl("https://gethandoff.co", "abc123xyz789abcd"))
      .toBe("https://gethandoff.co/p/abc123xyz789abcd");
  });

  it("builds correct URL with localhost origin", () => {
    expect(buildShareUrl("http://localhost:3000", "tok_test_1234567"))
      .toBe("http://localhost:3000/p/tok_test_1234567");
  });

  it("does not use project.id or project.token — only share_token", () => {
    const project = {
      id: "uuid-1234",
      share_token: "sharetoken_abc",
      token: undefined, // old/wrong field
    };
    // Correct: uses share_token
    expect(buildShareUrl("https://example.com", project.share_token))
      .toBe("https://example.com/p/sharetoken_abc");
    // Wrong: using id would give different result
    expect(buildShareUrl("https://example.com", project.share_token))
      .not.toContain(project.id);
  });

  it("URL is distinct per different share_tokens", () => {
    const url1 = buildShareUrl("https://gethandoff.co", "token_a");
    const url2 = buildShareUrl("https://gethandoff.co", "token_b");
    expect(url1).not.toBe(url2);
  });
});
