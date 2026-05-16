<template>
  <div class="markdown-help-menu">
    <div class="help-heading">Supports the following Markdown formatting:</div>
    <ul class="help-list">
      <li>**<strong>Bold</strong>**</li>
      <li>*<em>Italic</em>* or _<em>Italic</em>_</li>
      <li>
        ***<strong><em>Bold Italic</em></strong
        >***
      </li>
      <li>~~<s>Strikethrough</s>~~</li>
      <li>[<span class="link-text">link text</span>](URL)</li>
      <li>`<span class="inline-code">Code</span>`</li>
      <li># Heading 1, ## Heading 2, ### Heading 3</li>
      <li>- List item 1<br />- List item 2</li>
      <li>1. List item 1<br />2. List item 2</li>
      <li>&gt; Blockquote</li>
      <li>```<br />code block<br />```</li>
      <li>- [ ] <span class="inline-code">Checklist</span></li>
      <li>
        | <span class="inline-code">Column 1</span> | <span class="inline-code">Column 2</span> |
      </li>
    </ul>
    <div class="help-footer">
      Use a backslash to prevent a character from being parsed as Markdown (eg. \_\_ ).
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.markdown-help-menu {
  min-width: 280px;
  padding: var(--pad-lg) var(--pad-3xl);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  z-index: 1000;
  max-height: 500px;
  overflow-y: auto;
  user-select: none;
}

.help-heading {
  font-size: var(--font-size-sm);
  color: var(--text-dim);
  margin-bottom: var(--pad-lg);
  font-weight: 500;
}

.help-list {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--pad-lg) 0;
  font-size: var(--font-size-sm);
}

.help-list li {
  color: var(--text);
  padding: var(--pad-xs) 0;
  line-height: 1.6;
  font-family: var(--font-family);
}

.help-list .inline-code {
  font-family: var(--font-mono);
  background: color-mix(in srgb, var(--text-danger) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--text-danger) 25%, transparent);
  padding: 1px 5px;
  border-radius: 4px;
  color: var(--text-danger);
  font-size: 11px;
}

.help-list .link-text {
  color: var(--link-color);
}

.help-footer {
  font-size: var(--font-size-sm);
  color: var(--text-dim);
  padding-top: var(--pad-lg);
  border-top: 1px solid var(--border);
  line-height: 1.5;
}
</style>
