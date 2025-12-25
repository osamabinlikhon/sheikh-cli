#!/usr/bin/env python3
"""
শেখ পাওয়ার স্ক্রেপার - টেস্ট স্ক্রিপ্ট
=========================================
rssing.com ওয়েবসাইট টেস্টিংয়ের জন্য
"""

from playwright.sync_api import sync_playwright
import json
import time
import os

# কনফিগারেশন
CONFIG = {
    'headless': True,
    'timeout': 60000,
    'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'viewport': {'width': 1920, 'height': 1080},
}

def scrape_with_playwright(url):
    """Playwright ব্যবহার করে URL স্ক্রেপ করুন"""
    print(f"\n{'='*60}")
    print(f"স্ক্রেপিং শুরু: {url}")
    print(f"{'='*60}")
    
    results = {
        'url': url,
        'title': None,
        'content': None,
        'success': False,
        'error': None,
        'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
    }
    
    try:
        with sync_playwright() as p:
            # ব্রাউজার লঞ্চ করুন
            browser = p.chromium.launch(
                headless=CONFIG['headless'],
                args=['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            )
            
            # নতুন কনটেক্সট তৈরি করুন
            context = browser.new_context(
                viewport=CONFIG['viewport'],
                user_agent=CONFIG['user_agent'],
            )
            
            page = context.new_page()
            
            # কনসোল মেসেজ লগ করুন
            def handle_console(msg):
                if msg.type == 'error':
                    print(f"কনসোল ত্রুটি: {msg.text}")
            
            page.on('console', handle_console)
            
            # রেসপন্স হ্যান্ডলার
            def handle_response(response):
                status = response.status
                if status >= 400:
                    print(f"HTTP ত্রুটি: {status} - {response.url}")
            
            page.on('response', handle_response)
            
            # URL লোড করুন
            print(f"URL লোড হচ্ছে...")
            response = page.goto(url, wait_until='domcontentloaded', timeout=CONFIG['timeout'])
            
            if response and response.status == 200:
                print(f"স্ট্যাটাস: {response.status} - সফল")
                
                # পেজ লোড হওয়ার জন্য অপেক্ষা করুন
                time.sleep(2)
                
                # শিরোনাম বের করুন
                title = page.title()
                results['title'] = title
                print(f"শিরোনাম: {title}")
                
                # মূল কন্টেন্ট বের করুন
                content = page.evaluate('''() => {
                    const result = {
                        text: '',
                        metadata: {}
                    };
                    
                    // অপ্রয়োজনীয় এলিমেন্ট সরান
                    const unwanted = ['script', 'style', 'nav', 'header', 'footer', 'iframe', 'aside'];
                    unwanted.forEach(sel => {
                        document.querySelectorAll(sel).forEach(el => el.remove());
                    });
                    
                    // মূল কন্টেন্ট বের করুন
                    const mainContent = document.querySelector('main, article, .content, #content, .post, .article, td[valign="top"]');
                    if (mainContent) {
                        result.text = mainContent.innerText || mainContent.textContent;
                    } else {
                        const body = document.body;
                        if (body) {
                            result.text = body.innerText || body.textContent;
                        }
                    }
                    
                    // টেক্সট পরিষ্কার করুন
                    result.text = result.text.replace(/\\s+/g, ' ').replace(/\\n+/g, '\\n').trim();
                    
                    return result;
                }''')
                
                results['content'] = content['text'][:1000] if content['text'] else None
                results['success'] = True
                
                # কন্টেন্টের দৈর্ঘ্য দেখান
                if results['content']:
                    print(f"কন্টেন্ট দৈর্ঘ্য: {len(results['content'])} ক্যারেক্টার")
                    print(f"কন্টেন্ট প্রিভিউ: {results['content'][:200]}...")
                else:
                    print("কন্টেন্ট পাওয়া যায়নি")
                
            else:
                results['error'] = f"HTTP স্ট্যাটাস: {response.status if response else 'No response'}"
                print(f"ত্রুটি: {results['error']}")
            
            browser.close()
            
    except Exception as e:
        results['error'] = str(e)
        print(f"ত্রুটি: {e}")
    
    return results

def main():
    """মূল ফাংশন"""
    print("\n" + "="*60)
    print("শেখ পাওয়ার স্ক্রেপার - rssing.com টেস্ট")
    print("="*60)
    
    # টেস্ট URL তালিকা
    test_urls = [
        "https://bangla402.rssing.com/chan-63758807/article33.html#_",
        "https://bangla424.rssing.com/chan-64151446/article60.html",
        "https://allbanglachoti.rssing.com/chan-76548011/index-latest.php#_",
    ]
    
    all_results = []
    
    for url in test_urls:
        result = scrape_with_playwright(url)
        all_results.append(result)
        
        # স্ক্রেপিংয়ের মাঝে বিরতি
        print(f"\n৩ সেকেন্ড বিরতি...")
        time.sleep(3)
    
    # ফলাফল সংরক্ষণ
    output_file = f"test_results_{time.strftime('%Y%m%d_%H%M%S')}.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)
    
    print(f"\n{'='*60}")
    print("সম্পূর্ণ ফলাফল সংরক্ষিত: {output_file}")
    print(f"{'='*60}")
    
    # সংক্ষেপিত সারসংক্ষেপ
    success_count = sum(1 for r in all_results if r['success'])
    print(f"\nসারসংক্ষেপ:")
    print(f"মোট URL: {len(all_results)}")
    print(f"সফল: {success_count}")
    print(f"ব্যর্থ: {len(all_results) - success_count}")

if __name__ == "__main__":
    main()
