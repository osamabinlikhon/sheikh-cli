# API ডকুমেন্টেশন

## Python API রেফারেন্স

### মূল ক্লাস এবং ফাংশন

#### async_discover_urls_from_hub

এই ফাংশনটি হাব পেজ থেকে সমস্ত URL বের করে।

**সিনট্যাক্স:**

```python
async def async_discover_urls_from_hub(
    hub_url: str,
    allow_domains: Optional[Set[str]] = None,
    session: Optional[aiohttp.ClientSession] = None
) -> List[str]:
```

**প্যারামিটার:**

`hub_url` প্যারামিটার হল স্ক্রেপ করার হাব পেজ URL। `allow_domains` প্যারামিটার হল অনুমোদিত ডোমেইনের সেট। `session` প্যারামিটার হল ঐচ্ছিক aiohttp সেশন।

**রিটার্ন:**

URL এর একটি তালিকা।

#### async_cmd_scrape

এই ফাংশনটি অ্যাসিঙ্ক্রোনাস স্ক্রেপিং কমান্ড এক্সিকিউট করে।

**সিনট্যাক্স:**

```python
async def async_cmd_scrape(
    target: str,
    max_urls: int = 100,
    output_file: Optional[str] = None,
    workers: int = DEFAULT_CONCURRENT_WORKERS,
    rate: float = DEFAULT_RATE_LIMIT,
    resume: bool = False,
    check_robots: bool = True,
    mode: str = "domain",
    allow_domains: Optional[List[str]] = None
) -> int:
```

**প্যারামিটার:**

`target` হল স্ক্রেপ করার ডোমেইন বা URL। `max_urls` হল সর্বোচ্চ URL সংখ্যা। `output_file` হল আউটপুট ফাইল পাথ। `workers` হল কনকারেন্ট কর্মী সংখ্যা। `rate` হল প্রতি সেকেন্ডে রিকোয়েস্ট সংখ্যা। `resume` ফ্ল্যাগ দিয়ে রিজিউম ফাংশনালিটি চালু করা যায়। `check_robots` দিয়ে robots.txt চেক চালু বা বন্ধ করা যায়। `mode` দিয়ে ডিসকভারি মোড নির্ধারণ করা যায়। `allow_domains` দিয়ে হাব মোডে ডোমেইন ফিল্টার করা যায়।

**রিটার্ন:**

০ সাফল্যের জন্য, ১ ব্যর্থতার জন্য।

### ডেটা ক্লাস

#### ScrapeStats

এই ক্লাসটি স্ক্রেপিং অপারেশনের পরিসংখ্যান সংরক্ষণ করে।

**অ্যাট্রিবিউট:**

`accepted` হল গৃহীত পেজের সংখ্যা। `duplicates` হল ডুপ্লিকেট পেজের সংখ্যা। `rejected` হল বিভিন্ন কারণে প্রত্যাখ্যান করা পেজের সংখ্যা। `total_words` হল মোট শব্দ সংখ্যা। `total_chars` হল মোট ক্যারেক্টার সংখ্যা। `urls_discovered` হল আবিষ্কৃত URL এর সংখ্যা। `duration` হল স্ক্রেপিং সময়কাল সেকেন্ডে।

#### StoryData

এই ক্লাসটি স্ক্রেপ করা গল্পের ডেটা সংরক্ষণ করে।

**অ্যাট্রিবিউট:**

`url` হল গল্পের URL। `title` হল গল্পের শিরোনাম। `content` হল গল্পের মূল কন্টেন্ট। `word_count` হল শব্দ সংখ্যা। `char_count` হল ক্যারেক্টার সংখ্যা। `content_hash` হল কন্টেন্টের হ্যাশ।

### AsyncRateLimiter ক্লাস

এই ক্লাসটি অ্যাসিঙ্ক্রোনাস রেট লিমিটিং প্রদান করে।

**মেথড:**

`__init__(rate, capacity)` কনস্ট্রাক্টরে রেট এবং ক্যাপাসিটি সেট করা হয়। `acquire()` মেথডে টোকেন অর্জন করা হয়।

## Node.js API রেফারেন্স

### SheikhPowerScraper ক্লাস

শেখ পাওয়ার স্ক্রেপারের মূল ক্লাস।

**কনস্ট্রাক্টর:**

```javascript
constructor(options = {})
```

**অপশন:**

`headless` দিয়ে হেডলেস মোড চালু করা যায়। `userAgent` দিয়ে কাস্টম User-Agent সেট করা যায়। `timeout` দিয়ে রিকোয়েস্ট টাইমআউট সেট করা যায়। `outputDir` দিয়ে আউটপুট ডিরেক্টরি নির্ধারণ করা যায়। `outputFile` দিয়ে আউটপুট ফাইল নাম দেওয়া যায়। `maxPages` দিয়ে সর্বোচ্চ স্ক্রেপ পেজ সংখ্যা নির্ধারণ করা যায়। `verbose` দিয়ে ভার্বোস লগিং চালু করা যায়।

**মেথড:**

`initBrowser()` মেথডে স্টিল্ট সেটিংস সহ ব্রাউজার ইনিশিয়ালাইজ করা হয়। `scrapePage(url)` মেথডে একটি নির্দিষ্ট URL স্ক্রেপ করা হয়। `scrape(urls)` মেথডে এক বা একাধিক URL স্ক্রেপ করা হয়। `extractContent(page, url)` মেথডে পেজ থেকে কন্টেন্ট বের করা হয়। `saveContent(content)` মেথডে কন্টেন্ট আউটপুট ফাইলে সংরক্ষণ করা হয়। `printStats()` মেথডে স্ক্রেপিং পরিসংখ্যান প্রিন্ট করা হয়।

## কনফিগারেশন

### পরিবেশ ভেরিয়েবল

`HF_TOKEN` Hugging Face API টোকেন সেট করতে ব্যবহৃত হয়। এটি `cmd_push` ফাংশনের জন্য প্রয়োজন।

### ডিফল্ট মান

`DEFAULT_CONCURRENT_WORKERS` এর ডিফল্ট মান ১০। `DEFAULT_RATE_LIMIT` এর ডিফল্ট মান ০.৫ সেকেন্ড। `MAX_RETRIES` এর ডিফল্ট মান ৩। `BACKOFF_FACTOR` এর ডিফল্ট মান ১.৫। `DEFAULT_OUTPUT_DIR` এর ডিফল্ট মান `Path("data/raw")`। `RESUME_FILE` এর ডিফল্ট মান `Path("data/.scrape_resume.json")`।
