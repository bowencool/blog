// import * as tocbot from 'tocbot';

import tocbot from "tocbot";

tocbot.init({
  // Where to render the table of contents.
  tocSelector: "#floating-toc",
  // Where to grab the headings to build the table of contents.
  contentSelector: "#article",
  // Which headings to grab inside of the contentSelector element.
  headingSelector: "h1, h2, h3",
  // For headings inside relative or absolute positioned containers within content.
  hasInnerContainers: true,
});
