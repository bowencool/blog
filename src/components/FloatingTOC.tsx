import { useEffect } from "react";
import tocbot from "tocbot";

export default function FloatingTOC(props: { collapseDepth?: number }) {
  useEffect(() => {
    tocbot.init({
      // Where to render the table of contents.
      tocSelector: "#floating-toc",
      // Where to grab the headings to build the table of contents.
      contentSelector: "#article",
      // Which headings to grab inside of the contentSelector element.
      headingSelector: "h1, h2, h3",
      // For headings inside relative or absolute positioned containers within content.
      hasInnerContainers: true,
      collapseDepth: props.collapseDepth ?? 2,
    });
    return tocbot.destroy;
  }, []);
  return null;
  // return <div id="floating-toc"></div>;
}
