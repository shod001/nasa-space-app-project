"""Screenshot diagram HTML files to PNG at 2x device scale (print quality)."""
import asyncio
from playwright.async_api import async_playwright

JOBS = [
    ("/home/z/my-project/pdf-report/code-pdf/diagram_arch.html",
     "/home/z/my-project/pdf-report/code-pdf/diagram_arch.png"),
    ("/home/z/my-project/pdf-report/code-pdf/diagram_loop.html",
     "/home/z/my-project/pdf-report/code-pdf/diagram_loop.png"),
]

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for src, out in JOBS:
            page = await browser.new_page(viewport={"width": 800, "height": 900},
                                          device_scale_factor=2)
            await page.goto("file://" + src)
            await page.wait_for_timeout(300)
            el = await page.query_selector(".canvas")
            await el.screenshot(path=out)
            print("saved:", out)
            await page.close()
        await browser.close()

asyncio.run(main())
