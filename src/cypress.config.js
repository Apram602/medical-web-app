const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000", // Replace with your app’s URL
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}", // Default test file pattern
    supportFile: "cypress/support/e2e.js",
  },
});