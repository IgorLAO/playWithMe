import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests',use:{baseURL:'http://localhost:5173',browserName:'chromium',launchOptions:{args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']}},webServer:{command:'bun run dev',url:'http://localhost:5173',reuseExistingServer:true,timeout:30000}});
