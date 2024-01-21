import type { CollectionEntry } from "astro:content";
import { t } from "i18next";

export default (post: CollectionEntry<"blog">) => {
  let title = post.data.title;
  const isChineseTitle = title.match(/[\u4e00-\u9fa5]/);
  if (isChineseTitle) {
    // todo chinese image don't work well
    title = post.data.permalink.replaceAll("-", " ");
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }
  return (
    <div
      style={{
        background: "#fefbfb",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-1px",
          right: "-1px",
          border: "4px solid #000",
          background: "#ecebeb",
          opacity: "0.9",
          borderRadius: "4px",
          display: "flex",
          justifyContent: "center",
          margin: "2.5rem",
          width: "88%",
          height: "80%",
        }}
      />

      <div
        style={{
          border: "4px solid #000",
          background: "#fefbfb",
          borderRadius: "4px",
          display: "flex",
          justifyContent: "center",
          margin: "2rem",
          width: "88%",
          height: "80%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            margin: "20px",
            width: "90%",
            height: "90%",
          }}
        >
          <p
            style={{
              fontSize: 72,
              fontWeight: "bold",
              maxHeight: "84%",
              overflow: "hidden",
            }}
          >
            {title}
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              marginBottom: "8px",
              fontSize: 28,
            }}
          >
            <span>
              by{" "}
              <span
                style={{
                  color: "transparent",
                }}
              >
                "
              </span>
              <span style={{ overflow: "hidden", fontWeight: "bold" }}>
                {post.data.author}
              </span>
            </span>

            <span style={{ overflow: "hidden", fontWeight: "bold" }}>
              {t("websiteTitle")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
