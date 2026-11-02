import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests',use:{ignoreHTTPSErrors:true,baseURL:'https://localhost:5173',browserName:'chromium',launchOptions:{args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']}},webServer:{ignoreHTTPSErrors:true,command:'bun run dev',url:'https://localhost:5173',reuseExistingServer:true,timeout:30000}});
