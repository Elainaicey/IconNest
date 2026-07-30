export function sanitizeSvg(input: string) {
  const documentNode = new DOMParser().parseFromString(input, "image/svg+xml");
  if (
    documentNode.querySelector("parsererror") ||
    documentNode.documentElement.tagName.toLowerCase() !== "svg"
  ) {
    throw new Error("这不是有效的 SVG 文件");
  }

  documentNode
    .querySelectorAll("script, foreignObject, iframe, object, embed")
    .forEach((node) => node.remove());

  documentNode.querySelectorAll("*").forEach((node) => {
    [...node.attributes].forEach((attribute) => {
      const key = attribute.name.toLowerCase();
      const value = attribute.value.toLowerCase().trim();
      if (
        key.startsWith("on") ||
        ((key === "href" || key === "xlink:href") &&
          (value.startsWith("javascript:") || value.startsWith("data:text/html")))
      ) {
        node.removeAttribute(attribute.name);
      }
    });
  });

  return new XMLSerializer().serializeToString(documentNode.documentElement);
}

export function svgDataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function jsxAttributeName(name: string) {
  const normalized = name.toLowerCase();
  if (normalized.startsWith("aria-") || normalized.startsWith("data-")) {
    return name;
  }
  if (normalized === "class") return "className";
  if (normalized === "for") return "htmlFor";

  return name.replace(/[:.-]+([a-zA-Z0-9])/g, (_, character: string) =>
    character.toUpperCase(),
  );
}

function convertSvgAttributesToJsx(svg: string) {
  return svg.replace(
    /(\s)([a-zA-Z_:][a-zA-Z0-9:._-]*)(\s*=)/g,
    (_, leading: string, name: string, assignment: string) =>
      `${leading}${jsxAttributeName(name)}${assignment}`,
  );
}

function componentNameFor(iconName: string) {
  const name =
    iconName
      .trim()
      .split(/[^a-zA-Z0-9]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("") || "IconNest";
  return `${/^[a-zA-Z_$]/.test(name) ? name : `Icon${name}`}Icon`;
}

export function createReactIconSnippet(svg: string, iconName: string) {
  const jsxSvg = convertSvgAttributesToJsx(svg.trim());
  const openingTag = jsxSvg.match(/^<svg\b([^>]*)>/i);
  if (!openingTag || !/<\/svg>\s*$/i.test(jsxSvg)) {
    throw new Error("无法从该文件生成 React 组件");
  }

  const attributes = openingTag[1].replace(
    /\saria-hidden\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
    "",
  );
  const componentName = componentNameFor(iconName);
  const componentSvg = jsxSvg
    .replace(
      openingTag[0],
      `<svg${attributes} aria-hidden="true" {...props}>`,
    )
    .replace(/>\s*</g, ">\n<")
    .split("\n")
    .map((line) => `      ${line}`)
    .join("\n");

  return `export function ${componentName}(props) {\n  return (\n${componentSvg}\n  );\n}`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
