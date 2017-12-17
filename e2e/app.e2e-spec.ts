import { browser, by, element } from 'protractor';
import { SitePage } from './app.po';

describe('site App', function() {
  let page: SitePage;

  beforeEach(() => {
    SitePage.setWindowWidth(1050);   // Make the window wide enough to show the SideNav side-by-side.
    page = new SitePage();
  });

  it('should show features text after clicking "Features"', () => {
    page.navigateTo('');
    page.getTopMenuLink('features').click();
    expect(page.getDocViewerText()).toMatch(/Progressive web apps/i);
  });

  it('should set appropriate window titles', () => {
    page.navigateTo('');
    expect(browser.getTitle()).toBe('Angular');

    page.getTopMenuLink('features').click();
    expect(browser.getTitle()).toBe('Angular - FEATURES & BENEFITS');

    page.homeLink.click();
    expect(browser.getTitle()).toBe('Angular');
  });

  it('should show the tutorial index page at `/tutorial` after jitterbugging through features', () => {
    // check that we can navigate directly to the tutorial page
    page.navigateTo('tutorial');
    expect(page.getDocViewerText()).toMatch(/Tutorial: Tour of Heroes/i);

    // navigate to a different page
    page.getTopMenuLink('features').click();
    expect(page.getDocViewerText()).toMatch(/Progressive web apps/i);

    // Show the menu
    page.docsMenuLink.click();

    // Tutorial folder should still be expanded because this test runs in wide mode
    // Navigate to the tutorial introduction via a link in the sidenav
    page.getNavItem(/introduction/i).click();
    expect(page.getDocViewerText()).toMatch(/Tutorial: Tour of Heroes/i);
  });

  it('should render `{@example}` dgeni tags as `<code-example>` elements with HTML escaped content', () => {
    page.navigateTo('guide/component-styles');
    const codeExample = element.all(by.css('code-example')).first();
    expect(page.getInnerHtml(codeExample)).toContain('&lt;h1&gt;Tour of Heroes&lt;/h1&gt;');
  });

  describe('scrolling to the top', () => {
    it('should scroll to the top when navigating to another page', () => {
      page.navigateTo('guide/security');

      page.scrollToBottom();
      expect(page.getScrollTop()).toBeGreaterThan(0);

      page.getNavItem(/api/i).click();
      expect(page.locationPath()).toBe('/api');
      expect(page.getScrollTop()).toBe(0);
    });

    it('should scroll to the top when navigating to the same page', () => {
      page.navigateTo('guide/security');

      page.scrollToBottom();
      expect(page.getScrollTop()).toBeGreaterThan(0);

      page.getNavItem(/security/i).click();
      expect(page.locationPath()).toBe('/guide/security');
      expect(page.getScrollTop()).toBe(0);
    });
  });

  describe('tutorial docs', () => {
    it('should not render a paragraph element inside the h1 element', () => {
      page.navigateTo('tutorial/toh-pt1');
      expect(element(by.css('h1 p')).isPresent()).toBeFalsy();
    });
  });

  describe('google analytics', () => {

    it('should call ga with initial URL', done => {
      let path: string;
      page.navigateTo('api');
      page.locationPath()
        .then(p => path = p)
        .then(() => page.ga())
        .then(calls => {
          // The last call (length-1) will be the `send` command
          // The second to last call (length-2) will be the command to `set` the page url
          expect(calls[calls.length - 2]).toEqual(['set', 'page', path]);
          done();
        });
    });

    it('should call ga with new URL on navigation', done => {
      let path: string;
      page.navigateTo('');
      page.getTopMenuLink('features').click();
      page.locationPath()
        .then(p => path = p)
        .then(() => page.ga())
        .then(calls => {
          // The last call (length-1) will be the `send` command
          // The second to last call (length-2) will be the command to `set` the page url
          expect(calls[calls.length - 2]).toEqual(['set', 'page', path]);
          done();
        });
    });
  });

  describe('search', () => {
    it('should find pages when searching by a partial word in the title', () => {
      page.navigateTo('');

      page.enterSearch('ngCont');
      expect(page.getSearchResults()).toContain('NgControl');

      page.enterSearch('accessor');
      expect(page.getSearchResults()).toContain('ControlValueAccessor');
    });
  });

  describe('404 page', () => {
    it('should search the index for words found in the url', () => {
      page.navigateTo('http/router');
      const results = page.getSearchResults();

      expect(results).toContain('Http');
      expect(results).toContain('Router');
    });
  });
});
