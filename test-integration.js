const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting automated tests for SmartHiring...');
  let hasErrors = false;

  // Launch browser with fake webcam and mic to bypass permission prompts and provide fake media stream
  const browser = await puppeteer.launch({
    headless: false, // Set to false to see what's happening if needed, but true normally. Using false for verification demo.
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--allow-file-access-from-files',
      // Mute audio to avoid noise during test
      '--mute-audio',
    ],
  });

  const page = await browser.newPage();

  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error(`[Browser Error] ${msg.text()}`);
      hasErrors = true;
    }
  });

  page.on('pageerror', error => {
    console.error(`[Page Error] ${error.message}`);
    hasErrors = true;
  });

  try {
    console.log('Navigating to frontend...');
    // We assume the frontend is running on localhost:3000
    // Try to load the login page or a mock interview route
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    console.log('Frontend loaded successfully!');

    // In a real scenario we would need to log in and get an interview token.
    // For this basic test to verify no syntax/runtime errors on load, we check if the page rendered.
    const bodyText = await page.evaluate(() => document.body.innerText);
    
    if (bodyText.length > 0) {
      console.log('React app rendered content.');
    } else {
      console.error('React app rendered an empty body! Possible fatal error.');
      hasErrors = true;
    }

    // Attempt to navigate to a fake interview ID to trigger the Interview component
    // We expect it to show "Loading Interface..." or "Invalid Interview Link", but NOT crash.
    console.log('Navigating to an interview route to check for rendering errors...');
    await page.goto('http://localhost:3000/interview/fake-id?token=fake-token', { waitUntil: 'networkidle2' });
    
    // Wait for a bit
    await new Promise(r => setTimeout(r, 2000));
    
    const interviewBodyText = await page.evaluate(() => document.body.innerText);
    console.log(`Interview page text snippet: ${interviewBodyText.substring(0, 50)}...`);

    if (hasErrors) {
      console.error('❌ Automated test failed due to browser console errors or page crashes.');
      process.exit(1);
    } else {
      console.log('✅ Automated test passed! Frontend runs without syntax/runtime errors.');
    }

  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
