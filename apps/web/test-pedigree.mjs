import { chromium } from 'playwright';

const TREE_URL = 'http://localhost:3000/trees/8a4f5b7a-9897-48e9-bb4d-c2b31cdc79d0';
const OUT = 'C:/Users/ghimi/AppData/Local/Temp';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.setDefaultTimeout(15000);

const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push('PAGEERROR: ' + err.message));

console.log('1. Navigate to tree page...');
await page.goto(TREE_URL, { waitUntil: 'networkidle' });
await page.screenshot({ path: `${OUT}/tree-01-initial.png` });

console.log('2. Wait for ReactFlow canvas...');
try {
  await page.waitForSelector('.react-flow', { timeout: 10000 });
  console.log('   ✓ ReactFlow canvas found');
} catch {
  console.log('   ✗ ReactFlow canvas NOT found');
}
await page.screenshot({ path: `${OUT}/tree-02-rf-loaded.png` });

const nodeCount = await page.$$eval('.react-flow__node', n => n.length).catch(() => 0);
const edgeCount = await page.$$eval('.react-flow__edge', e => e.length).catch(() => 0);
console.log(`3. Nodes: ${nodeCount}, Edges: ${edgeCount}`);

const heading = await page.$eval('h2', el => el.textContent?.trim()).catch(() => 'n/a');
console.log(`4. Heading: "${heading}"`);

// Check minimap
const hasMinimap = await page.$('.react-flow__minimap').then(el => !!el).catch(() => false);
console.log(`5. MiniMap visible: ${hasMinimap}`);

// Click a node
if (nodeCount > 0) {
  console.log('6. Clicking first node...');
  const firstNode = await page.$('.react-flow__node');
  await firstNode.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/tree-03-node-clicked.png` });

  // Look for popup
  const popup = await page.$('[style*="position: fixed"][style*="z-index: 1000"]');
  if (popup) {
    const popupText = await popup.textContent();
    console.log(`   Popup appeared: "${popupText?.substring(0, 120).replace(/\s+/g,' ').trim()}"`);
  } else {
    console.log('   No popup found (may need to check CSS selector)');
    // Try any overlay
    const anyFixed = await page.$$eval('[style*="position: fixed"]', els =>
      els.map(el => el.textContent?.substring(0, 60)?.trim()).filter(Boolean)
    );
    console.log(`   Fixed elements on page: ${JSON.stringify(anyFixed.slice(0,3))}`);
  }
}

// Full page
await page.screenshot({ path: `${OUT}/tree-04-fullpage.png`, fullPage: true });

console.log('\nConsole errors:', errors.length ? errors.slice(0,5).join('\n') : 'none');
await browser.close();
console.log('Screenshots saved to', OUT);
