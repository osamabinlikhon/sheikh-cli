#!/usr/bin/env python3
"""
শেখ পাওয়ারফুল স্ক্রেপার (Sheikh PowerScraper)
==============================================
Playwright-ভিত্তিক শক্তিশালী স্ক্রেপিং মডিউল।

এই মডিউলটি ব্লকিং এড়াতে নিম্নলিখিত ফিচার প্রদান করে:
• Headless ব্রাউজিং
• Stealth মোড (বট ডিটেকশন এড়ানো)
• র‍্যান্ডম ইউজার-এজেন্ট রোটেশন
• প্রক্সি সাপোর্ট
• মাউস/স্ক্রল সিমুলেশন
• কুকি/সেশন ম্যানেজমেন্ট

লেখক: Likhon Sheikh
লাইসেন্স: MIT
পাইথন: >= 3.9
"""

import asyncio
import random
import time
import json
import logging
from pathlib import Path
from typing import Optional, List, Dict, Any
from dataclasses import dataclass
from datetime import datetime

# Playwright imports
try:
    from playwright.async_api import async_playwright, Browser, Page, BrowserContext
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    logging.warning("Playwright not installed. Run: pip install playwright && playwright install chromium")

logger = logging.getLogger(__name__)


# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------
@dataclass
class ScrapingConfig:
    """স্ক্রেপিং কনফিগারেশন ক্লাস"""
    headless: bool = True
    stealth_mode: bool = True
    random_user_agent: bool = True
    user_agent: str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    viewport_width: int = 1920
    viewport_height: int = 1080
    proxy_server: Optional[str] = None
    delay_between_requests: float = 2.0
    max_retries: int = 3
    timeout: int = 60000
    enable_mouse_simulation: bool = True
    enable_scroll_simulation: bool = True
    cookies_file: Optional[str] = None


# র‍্যান্ডম ইউজার-এজেন্ট তালিকা
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
]


# --------------------------------------------------
# POWERFUL SCRAPER CLASS
# --------------------------------------------------
class SheikhPowerScraper:
    """
    শেখ পাওারফুল স্ক্রেপার - Playwright-ভিত্তিক স্ক্রেপিং টুল
    """
    
    def __init__(self, config: Optional[ScrapingConfig] = None):
        """
        ইনিশিয়ালাইজ
        
        Args:
            config: ScrapingConfig অবজেক্ট (অপশনাল)
        """
        self.config = config or ScrapingConfig()
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.page: Optional[Page] = None
        self.playwright = None
        self.session_cookies: Dict[str, Any] = {}
        
    async def start(self):
        """ব্রাউজার সেশন শুরু করুন"""
        if not PLAYWRIGHT_AVAILABLE:
            raise ImportError("Playwright is not installed. Run: pip install playwright && playwright install chromium")
        
        self.playwright = await async_playwright().start()
        
        # ব্রাউজার লঞ্চ অপশন
        browser_args = [
            "--disable-blink-features=AutomationControlled",
            "--no-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--window-size=1920,1080",
        ]
        
        if self.config.proxy_server:
            # প্রক্সি সাপোর্ট
            self.browser = await self.playwright.chromium.launch(
                headless=self.config.headless,
                args=browser_args
            )
            self.context = await self.browser.new_context(
                proxy={"server": self.config.proxy_server}
            )
        else:
            self.context = await self.browser.new_context(
                viewport={"width": self.config.viewport_width, "height": self.config.viewport_height}
            )
        
        # স্টিলথ মোড: navigator.webdriver প্রপার্টি লুকানো
        await self.context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5]
            });
        """)
        
        self.page = await self.context.new_page()
        
        # কুকি লোড করুন (যদি থাকে)
        if self.config.cookies_file and Path(self.config.cookies_file).exists():
            await self.load_cookies()
        
        logger.info("🎉 ব্রাউজার সেশন শুরু হয়েছে")
        
    async def close(self):
        """ব্রাউজার সেশন বন্ধ করুন"""
        if self.browser:
            # কুকি সেভ করুন
            if self.config.cookies_file:
                await self.save_cookies()
            
            await self.browser.close()
            await self.playwright.stop()
            self.browser = None
            self.playwright = None
            logger.info("🔒 ব্রাউজার সেশন বন্ধ হয়েছে")
    
    async def random_delay(self):
        """র‍্যান্ডম ডেলে অপেক্ষা করুন"""
        delay = self.config.delay_between_requests + random.uniform(0, 2)
        await asyncio.sleep(delay)
    
    async def simulate_human_behavior(self):
        """মানুষের মতো আচরণ সিমুলেট করুন"""
        try:
            # র‍্যান্ডম মাউস মুভমেন্ট
            if self.config.enable_mouse_simulation:
                x = random.randint(100, self.config.viewport_width - 100)
                y = random.randint(100, self.config.viewport_height - 100)
                await self.page.mouse.move(x, y)
                await self.page.mouse.click(x, y)
            
            # র‍্যান্ডম স্ক্রল
            if self.config.enable_scroll_simulation:
                await self.page.evaluate(f"window.scrollBy(0, {random.randint(200, 500)})")
                await asyncio.sleep(random.uniform(0.5, 1.5))
                
        except Exception as e:
            logger.debug(f"মানুষের মতো আচরণ সিমুলেশন ব্যর্থ: {e}")
    
    async def get_page_content(self, url: str) -> Optional[str]:
        """
        ওয়েবপেজের কন্টেন্ট স্ক্রেপ করুন
        
        Args:
            url: টার্গেট ইউআরএল
            
        Returns:
            পেজ কন্টেন্ট (HTML স্ট্রিং) অথবা None
        """
        if not self.page:
            raise RuntimeError("ব্রাউজার সেশন শুরু হয়নি। start() কল করুন।")
        
        # র‍্যান্ডম ইউজার-এজেন্ট (প্রতিটি রিকোয়েস্টে)
        if self.config.random_user_agent:
            new_agent = random.choice(USER_AGENTS)
            await self.page.set_user_agent(new_agent)
        
        retries = 0
        while retries < self.config.max_retries:
            try:
                logger.info(f"📥 লোড হচ্ছে: {url}")
                
                # পেজ লোড
                await self.page.goto(
                    url,
                    wait_until="networkidle",
                    timeout=self.config.timeout
                )
                
                # মানুষের মতো আচরণ
                await self.simulate_human_behavior()
                
                # কন্টেন্ট নিন
                content = await self.page.content()
                logger.info(f"✅ পেজ লোড সফল: {len(content)} বাইট")
                
                return content
                
            except Exception as e:
                retries += 1
                logger.warning(f"❌ চেষ্টা {retries}/{self.config.max_retries} ব্যর্থ: {e}")
                
                if retries < self.config.max_retries:
                    wait_time = self.config.delay_between_requests * retries
                    logger.info(f"⏳ {wait_time} সেকেন্ড অপেক্ষা...")
                    await asyncio.sleep(wait_time)
        
        logger.error(f"❌ সর্বোচ্চ চেষ্টার পরেও ব্যর্থ: {url}")
        return None
    
    async def discover_links(self, url: str) -> List[str]:
        """
        পেজ থেকে সমস্ত লিংক বের করুন
        
        Args:
            url: হাব পেজ ইউআরএল
            
        Returns:
            লিংকের তালিকা
        """
        content = await self.get_page_content(url)
        if not content:
            return []
        
        # BeautifulSoup দিয়ে পার্স করুন (import করা হয়নি তাই এখানে থেকে)
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(content, "lxml")
        
        links = []
        for a in soup.find_all("a", href=True):
            href = a["href"].strip()
            if href and not href.startswith("#") and not href.startswith("javascript:"):
                if href.startswith("http"):
                    links.append(href)
                else:
                    from urllib.parse import urljoin
                    links.append(urljoin(url, href))
        
        # ডুপ্লিকেট রিমুভ
        links = list(set(links))
        logger.info(f"🔗 {len(links)}টি লিংক বের করা হয়েছে")
        
        return links
    
    async def save_cookies(self):
        """কুকি সেভ করুন"""
        try:
            cookies = await self.context.cookies()
            with open(self.config.cookies_file, 'w') as f:
                json.dump(cookies, f, indent=2)
            logger.info(f"💾 কুকি সেভ হয়েছে: {self.config.cookies_file}")
        except Exception as e:
            logger.warning(f"কুকি সেভ ব্যর্থ: {e}")
    
    async def load_cookies(self):
        """কুকি লোড করুন"""
        try:
            with open(self.config.cookies_file, 'r') as f:
                cookies = json.load(f)
            await self.context.add_cookies(cookies)
            logger.info(f"📂 কুকি লোড হয়েছে: {self.config.cookies_file}")
        except Exception as e:
            logger.warning(f"কুকি লোড ব্যর্থ: {e}")
    
    async def __aenter__(self):
        """Async context manager entry"""
        await self.start()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        await self.close()


# --------------------------------------------------
# CONVENIENCE FUNCTIONS
# --------------------------------------------------
async def scrape_with_playwright(
    url: str,
    headless: bool = True,
    stealth: bool = True,
    proxy: Optional[str] = None,
    delay: float = 2.0
) -> Optional[str]:
    """
    সহজে Playwright দিয়ে স্ক্রেপ করুন
    
    Args:
        url: টার্গেট ইউআরএল
        headless: হেডলেস মোড (ডিফল্ট: True)
        stealth: স্টিলথ মোড (ডিফল্ট: True)
        proxy: প্রক্সি সার্ভার (অপশনাল)
        delay: রিকোয়েস্ট之间的延迟 (秒)
    
    Returns:
        পেজ কন্টেন্ট বা None
    """
    config = ScrapingConfig(
        headless=headless,
        stealth_mode=stealth,
        proxy_server=proxy,
        delay_between_requests=delay
    )
    
    async with SheikhPowerScraper(config) as scraper:
        return await scraper.get_page_content(url)


async def discover_links_playwright(
    hub_url: str,
    headless: bool = True,
    stealth: bool = True
) -> List[str]:
    """
    হাব পেজ থেকে লিংক বের করুন
    
    Args:
        hub_url: হাব পেজ ইউআরএল
        headless: হেডলেস মোড
        stealth: স্টিলথ মোড
    
    Returns:
        লিংকের তালিকা
    """
    config = ScrapingConfig(headless=headless, stealth_mode=stealth)
    
    async with SheikhPowerScraper(config) as scraper:
        return await scraper.discover_links(hub_url)


# --------------------------------------------------
# MAIN (TEST)
# --------------------------------------------------
async def main():
    """পরীক্ষা চালান"""
    print("=" * 60)
    print("🎯 শেখ পাওারফুল স্ক্রেপার পরীক্ষা")
    print("=" * 60)
    
    # টেস্ট URL
    test_url = "https://example.com"
    
    try:
        async with SheikhPowerScraper() as scraper:
            content = await scraper.get_page_content(test_url)
            
            if content:
                print(f"\n✅ স্ক্রেপিং সফল!")
                print(f"📊 কন্টেন্ট দৈর্ঘ্য: {len(content)} বাইট")
                print(f"📝 প্রথম 200 বাইট:")
                print(content[:200])
            else:
                print("\n❌ স্ক্রেপিং ব্যর্থ")
                
    except Exception as e:
        print(f"\n❌ ত্রুটি: {e}")


if __name__ == "__main__":
    asyncio.run(main())
