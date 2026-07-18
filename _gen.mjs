import puppeteer from "puppeteer";
import fs from "fs";
const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
const client = await page.createCDPSession();
await client.send("Page.setDownloadBehavior", { behavior: "allow", downloadPath: "/tmp/dl2" });
await page.goto("http://localhost:4173/", { waitUntil: "networkidle0" });
await new Promise(r => setTimeout(r, 2500));
// also render highlight slide #3 PNG closeup via export stage
await page.click("#downloadPptxBtn");
let f=false;
for(let i=0;i<40;i++){await new Promise(r=>setTimeout(r,500));const fs2=fs.readdirSync("/tmp/dl2").filter(x=>x.endsWith(".pptx"));if(fs2.length&&!fs.existsSync("/tmp/dl2/"+fs2[0]+".crdownload")){f=fs2[0];break;}}
console.log("pptx:", f);
await browser.close();
