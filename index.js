const puppeteer = require('puppeteer');
const URL = require('url');


(async () => {
  const query = {
    sid: '716901010067',
    cid: '1767',
    ct: '2017-9-4',
    term: '2017_3'
  };
  
  const href = {
    protocol: 'http',
    hostname: '218.1.73.12',
    pathname: 'PingJia/Default.aspx',
    query
  };
  
  try {
    const browser = await puppeteer.launch({executablePath: '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary'});
    const page = await browser.newPage();

    if (page.select === undefined) {
      page.select = async function(selector, value) {
          await page.evaluate((selector, value) => {
              let element = document.querySelector(selector);
              element.querySelector('option[value="' + value + '"]').selected = true;
  
              let event = new Event('change', { bubbles: true });
              event.simulated = true;
  
              element.dispatchEvent(event);
          }, selector, value);
      };
   }

   page.on('dialog', async dialog => {
    console.log(dialog.message());
    await dialog.dismiss();
  });

    await page.goto(URL.format(href));

    let courses = await page.evaluate(() => [].map.call(document.querySelectorAll('select[name="ddlcourse"] > option'), ele => ele.value))
    // const exclude = ["1767", "2323"];
    // courses = courses.filter(v => !exclude.includes(v));
    console.log(`ready start ${courses}`);
    while (courses.length) {
      const course = courses.shift();
      await page.select('select[name="ddlcourse"]', course);
      await page.waitFor(3000);
      console.log(`select course ${course}`);
      const terms = await page.evaluate(() => [].map.call(document.querySelectorAll('select[name="ddlcoursetime"] > option'), ele => ele.value))
      while (terms.length) {
        const term = terms.shift();
        await page.select('select[name="ddlcoursetime"]', term);
        await page.waitFor(3000);
        console.log(`select term ${course} ${term}`);
        await page.evaluate(() => {
          const inputs = document.querySelectorAll('#Panel1 tbody>tr')[2].querySelectorAll('tr[style="background-color:#F7F7DE;height:14px;"]>td:last-child tr>td:last-child input, tr[style="background-color:White;height:14px;"]>td:last-child tr>td:last-child input');
          const input2 = document.querySelector('#rblcomment td:first-child input');
          [].forEach.call(inputs, ele => {
            ele.disabled = false;
            ele.checked = true;
          });
          input2.disabled = false;
          input2.checked = true;
          document.querySelector('#btsubmit').disabled = false;
          document.querySelector('#btsubmit').click();
        });
        console.log('commit form');
        console.log(`save image ${course}-${term}.png`);        
        // await page.screenshot({path: `./images/${course}-${term}.png`, fullPage: true});
        await page.waitFor(3000);
      }
      await page.waitFor(3000);
    }

    browser.close();
  } catch (error) {
    console.log('error!');
    console.log(error);
  }
})();
