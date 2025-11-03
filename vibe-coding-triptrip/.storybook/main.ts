const config = {
  "stories": [
    "../src/stories/**/*.mdx",
    "../src/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../src/commons/components/button/index.stories.@(js|jsx|mjs|ts|tsx)",
    "../src/commons/components/input/index.stories.@(js|jsx|mjs|ts|tsx)",
    "../src/commons/components/pagination/index.stories.@(js|jsx|mjs|ts|tsx)",
    "../src/commons/components/searchbar/index.stories.@(js|jsx|mjs|ts|tsx)",
    "../src/commons/components/selectbox/index.stories.@(js|jsx|mjs|ts|tsx)",
    
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
    "@storybook/addon-a11y"
  ],
  "framework": {
    "name": "@storybook/nextjs-vite",
    "options": {}
  }
};
export default config;