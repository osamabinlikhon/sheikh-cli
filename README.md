<div align="center">

# 🤖 শেখ (Sheikh) - বাংলা AI CLI টুলকিট

### বাংলা ভাষার জন্য পেশাদার ডেটা সংগ্রহ এবং মডেল ট্রেনিং সমাধান

---

![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge&logo=mit)
![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js)
![Bangla](https://img.shields.io/badge/Language-Bangla-00A4EF?style=for-the-badge&logo=google-translate)

---

**শেখ** একটি প্রোডাকশন-গ্রেড কমান্ড-লাইন ইন্টারফেস (CLI) টুলকিট যা বাংলা ভাষার জন্য ডেটা সংগ্রহ, প্রসেসিং এবং মেশিন লার্নিং মডেল ট্রেনিংয়ের জন্য ডিজাইন করা হয়েছে। এই টুলটি বাংলা ওয়েবসাইট থেকে ডেটা সংগ্রহ করতে, সেই ডেটা প্রসেস করতে এবং AI মডেল ট্রেনিংয়ের জন্য প্রস্তুত করতে সক্ষম।

[GitHub](https://github.com/osamabinlikhon/sheikh-cli) •
[Hugging Face](https://huggingface.co/osamabinlikhon) •
[রিপোর্ট সমস্যা](https://github.com/osamabinlikhon/sheikh-cli/issues)

</div>

---

## 📋 সূচিপত্র

- [পরিচিতি](#পরিচিতি)
- [মূল বৈশিষ্ট্যসমূহ](#মূল-বৈশিষ্ট্যসমূহ)
- [ইনস্টলেশন](#ইনস্টলেশন)
- [দ্রুত শুরু](#দ্রুত-শুরু)
- [ব্যবহার নির্দেশিকা](#ব্যবহার-নির্দেশিকা)
- [কমান্ড রেফারেন্স](#কমান্ড-রেফারেন্স)
- [প্রজেক্ট স্ট্রাকচার](#প্রজেক্ট-স্ট্রাকচার)
- [ML পাইপলাইন](#ml-পাইপলাইন)
- [ডকুমেন্টেশন](#ডকুমেন্টেশন)
- [অবদান রাখুন](#অবদান-রাখুন)
- [লাইসেন্স](#লাইসেন্স)

---

## পরিচিতি

বাংলা ভাষা বিশ্বের পঞ্চম সর্বাধিক কথ্য ভাষা, কিন্তু এই ভাষার জন্য মেশিন লার্নিং টুলিং এবং ডেটাসেট এখনও সীমিত। **শেখ (Sheikh)** প্রজেক্টের উদ্দেশ্য হলো বাংলা ভাষার জন্য একটি সম্পূর্ণ এন্ড-টু-এন্ড ML সলিউশন প্রদান করা যা গবেষক, ডেটা সায়েন্টিস্ট এবং AI ইঞ্জিনিয়ারদের কাজ সহজ করবে।

এই প্রজেক্টটি তিনটি প্রধান উদ্দেশ্য পূরণ করে। প্রথমত, এটি বাংলা ওয়েবসাইট থেকে উচ্চ-মানের টেক্সট ডেটা সংগ্রহ করতে সক্ষম, যার মধ্যে স্টোরি, নিউজ আর্টিকেল এবং অন্যান্য বাংলা কন্টেন্ট অন্তর্ভুক্ত। দ্বিতীয়ত, এই টুল সংগ্রহিত ডেটা প্রসেস এবং ক্লিন করতে পারে, যার মধ্যে ডুপ্লিকেট রিমুভাল, ভ্যালিডেশন এবং স্প্লিটিং অন্তর্ভুক্ত। তৃতীয়ত, এটি বাংলা ভাষার জন্য কাস্টম টোকেনাইজার এবং ল্যাঙ্গুয়েজ মডেল তৈরি এবং ট্রেন করতে পারে।

---

## মূল বৈশিষ্ট্যসমূহ

শেখ CLI টুলটিতে অসংখ্য শক্তিশালী ফিচার রয়েছে যা একে বাংলা NLP কাজের জন্য একটি আদর্শ পছন্দ করে তোলে।

### 🔍 উন্নত স্ক্রেপিং ক্ষমতা

টুলটি উচ্চ-পারফরম্যান্স অ্যাসিঙ্ক্রোনাস স্ক্রেপিং (aiohttp) ব্যবহার করে যা একই সাথে অনেকগুলি পেজ থেকে ডেটা সংগ্রহ করতে সক্ষম। এছাড়াও, Playwright-ভিত্তিক শেখ পাওয়ার স্ক্রেপার JavaScript-রেন্ডারড পেজ এবং ব্লকিং-প্রতিরোধী স্ক্রেপিং সমর্থন করে। হাব মোডে গুগল সাইট এবং ইনডেক্স পেজ থেকে লিংক বের করা যায় এবং রোবোটস.txt কমপ্লায়েন্স চেক করা হয়।

### ⚡ উচ্চ-পারফরম্যান্স প্রসেসিং

মাল্টি-থ্রেডেড এবং মাল্টি-প্রসেস সাপোর্ট রয়েছে যা দ্রুত ডেটা প্রসেসিং নিশ্চিত করে। কন্টেন্ট ভ্যালিডেশন এবং ফিল্টারিং ফিচার দিয়ে শুধুমাত্র মানসম্মত ডেটা রাখা হয়। বাংলা টেক্সট নরমালাইজেশন এবং ক্লিনিং স্বয়ংক্রিয়ভাবে হয় এবং ডুপ্লিকেট ডিটেকশন এবং রিমুভাল সুবিধা রয়েছে।

### 🤖 ML পাইপলাইন ইন্টিগ্রেশন

BPE (Byte Pair Encoding) টোকেনাইজার প্রশিক্ষণ দেওয়া যায় যা বাংলা ভাষার জন্য অপ্টিমাইজড। GPT-2 স্টাইল ক্যাজুয়াল ল্যাঙ্গুয়েজ মডেল তৈরি এবং ফাইন-টিউন করা যায়। সরাসরি Hugging Face Hub-এ মডেল আপলোড করার সুবিধা রয়েছে এবং কাস্টম কনফিগারেশনের মাধ্যমে বিভিন্ন আকারের মডেল তৈরি করা যায়।

### 📊 ডেটা ম্যানেজমেন্ট

CSV এবং JSONL ফরম্যাটে ডেটা সংরক্ষণ এবং লোড করা যায়। ট্রেন/ভ্যালিডেশন/টেস্ট স্প্লিট তৈরি করা সম্ভব এবং ডেটা কোয়ালিটি স্ট্যাটিসটিক্স এবং অ্যানালাইসিস করা যায়।

### 🎨 ব্যবহারকারী-বান্ধব ইন্টারফেস

টার্মিনালে রঙিন প্রগ্রেস বার এবং লগিং সুবিধা প্রদান করে এবং বাংলা ডকুমেন্টেশন এবং কমেন্ট সহজে বোধগম্যতা নিশ্চিত করে।

---

## ইনস্টলেশন

শেখ CLI টুলটি ইনস্টল করতে নিচের ধাপগুলো অনুসরণ করুন।

### পূর্বশর্ত

নিশ্চিত হন যে আপনার সিস্টেমে পাইথন ৩.৯ বা তার উপরের সংস্করণ ইনস্টল করা আছে:

```bash
python --version
```

Node.js ভার্সন ১৮ বা তার উপরে প্রয়োজন (শেখ পাওয়ার স্ক্রেপারের জন্য):

```bash
node --version
```

### পদ্ধতি ১: পাইথন ভার্সন (সুপারিশকৃত)

```bash
# রিপোজিটরি ক্লোন করুন
git clone https://github.com/osamabinlikhon/sheikh-cli.git
cd sheikh-cli

# ভার্চুয়াল এনভায়রনমেন্ট তৈরি করুন (সুপারিশকৃত)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# বা Windows: venv\Scripts\activate

# নির্ভরতা ইনস্টল করুন
pip install -r requirements.txt

# শেখ CLI চালান
python sheikh --help
```

### পদ্ধতি ২: Node.js ভার্সন

```bash
# রিপোজিটরি ক্লোন করুন
git clone https://github.com/osamabinlikhon/sheikh-cli.git
cd sheikh-cli

# npm প্যাকেজ ইনস্টল করুন
npm install

# শেখ পাওয়ার স্ক্রেপার চালান
node sheikh_power_scraper.cjs --help
```

### ML পাইপলাইন ইনস্টলেশন (ঐচ্ছিক)

ML ট্রেনিং ফিচার ব্যবহার করতে:

```bash
pip install -r requirements_ml.txt
```

---

## দ্রুত শুরু

### ধাপ ১: ডেটা সংগ্রহ

বাংলা ওয়েবসাইট থেকে ডেটা সংগ্রহ শুরু করুন:

```bash
# সাধারণ স্ক্রেপিং
sheikh scrape allbanglachoti.com 1000

# গুগল সাইট থেকে স্ক্রেপিং (হাব মোড)
sheikh scrape https://sites.google.com/view/allbanglachoti/bangla-choti 500 --mode hub

# শেখ পাওয়ার স্ক্রেপার (ব্লকিং-প্রতিরোধী)
python sheikh_power_scraper.py --url "https://bangla402.rssing.com/chan-63758807/article33.html" --max-pages 100
```

### ধাপ ২: ডেটা প্রসেসিং

সংগ্রহিত ডেটা যাচাই এবং প্রসেস করুন:

```bash
# ডেটা সিনট্যাক্স যাচাই
sheikh syntax data/train.jsonl

# ডেটা পরিসংখ্যান দেখুন
sheikh stats data/train.jsonl

# ট্রেন/ভ্যালিডেশন স্প্লিট তৈরি করুন
sheikh split data/train.jsonl 0.8
```

### ধাপ ৩: ML পাইপলাইন চালান

বাংলা মডেল তৈরি এবং ট্রেন করুন:

```bash
python sheikh_ml_pipeline.py \
    --hf-token YOUR_HF_TOKEN \
    --repo-name osamabinlikhon/sheikh-bangla-model \
    --data-dir ./data \
    --output-dir ./output \
    --max-samples 1000 \
    --vocab-size 30000 \
    --epochs 3
```

---

## ব্যবহার নির্দেশিকা

### স্ক্রেপিং কমান্ড

শেখ CLI টুলের মূল স্ক্রেপিং কমান্ড সিনট্যাক্স নিম্নরূপ:

```bash
sheikh scrape <target> [max_urls] [options]
```

**উদাহরণ:**

```bash
# নির্দিষ্ট ডোমেইন স্ক্রেপ করুন
sheikh scrape example.com 500

# নির্দিষ্ট আউটপুট ফাইল সহ
sheikh scrape example.com 1000 --output my_data.csv

# একাধিক কর্মী সহ দ্রুত স্ক্রেপিং
sheikh scrape example.com 2000 --workers 20 --rate 0.2

# রিজিউম সাপোর্ট সহ
sheikh scrape example.com 5000 --resume
```

### হাব মোড স্ক্রেপিং

গুগল সাইট বা ইনডেক্স পেজ থেকে স্ক্রেপ করতে হাব মোড ব্যবহার করুন:

```bash
# হাব মোড সক্রিয় করুন
sheikh scrape https://sites.google.com/view/allbanglachoti/bangla-choti 1000 --mode hub

# নির্দিষ্ট ডোমেইন ফিল্টার সহ
sheikh scrape https://sites.google.com/view/... 500 --mode hub --allow-domains allbanglachoti.com
```

### ডেটা কমান্ড

ডেটা প্রসেসিং এবং বিশ্লেষণের জন্য:

```bash
# ডেটা যাচাই
sheikh syntax data/train.jsonl

# পরিসংখ্যান দেখুন
sheikh stats data/train.jsonl

# স্প্লিট তৈরি
sheikh split data/train.jsonl 0.9

# Hugging Face এ আপলোড
sheikh push data/train.jsonl --repo-id osamabinlikhon/my-dataset
```

---

## কমান্ড রেফারেন্স

### স্ক্রেপ কমান্ড

| অপশন | বর্ণনা | ডিফল্ট মান |
|------|--------|-----------|
| `<target>` | স্ক্রেপ করার ডোমেইন বা URL | প্রয়োজনীয় |
| `[max_urls]` | সর্বোচ্চ URL সংখ্যা | ১০০ |
| `-o, --output` | আউটপুট ফাইল পাথ | স্বয়ংক্রিয় |
| `-w, --workers` | কনকারেন্ট কর্মী সংখ্যা | ১০ |
| `-r, --rate` | রিকোয়েস্ট রেট (সেকেন্ড) | ০.৫ |
| `--resume` | আগের সেশন থেকে চালিয়ে যান | False |
| `--no-robots` | robots.txt চেক বাইপাস করুন | False |
| `-m, --mode` | ডিসকভারি মোড (domain/hub) | domain |
| `-d, --allow-domains` | অনুমোদিত ডোমেইন তালিকা | None |

### সিনট্যাক্স কমান্ড

```bash
sheikh syntax <file>
```

### স্ট্যাটস কমান্ড

```bash
sheikh stats <file>
```

### স্প্লিট কমান্ড

```bash
sheikh split <file> [ratio] [--no-stratify]
```

### পুশ কমান্ড

```bash
sheikh push <file> [--repo-id ID] [--private]
```

---

## প্রজেক্ট স্ট্রাকচার

শেখ CLI প্রজেক্টের সম্পূর্ণ ফোল্ডার এবং ফাইল স্ট্রাকচার নিম্নরূপ:

```
sheikh-cli/
├── 📄 sheikh                 # মূল Python CLI স্ক্রিপ্ট
├── 📄 sheikh_power_scraper.py  # Python Playwright স্ক্রেপার
├── 📄 sheikh_power_scraper.cjs # Node.js Playwright স্ক্রিপ্ট
├── 📄 sheikh_ml_pipeline.py    # ML ট্রেনিং পাইপলাইন
├── 📄 sheikh_ml_config.yaml    # ML কনফিগারেশন
├── 📄 requirements.txt         # পাইথন নির্ভরতা
├── 📄 requirements_ml.txt      # ML নির্ভরতা
├── 📄 package.json             # Node.js প্যাকেজ
├── 📄 ML_README.md             # ML ডকুমেন্টেশন
├── 📄 book.toml                # mdBook কনফিগারেশন
│
├── 📁 data/                    # ডেটা ফোল্ডার
│   ├── raw/                    # কাঁচা স্ক্রেপড ডেটা
│   ├── train.jsonl             # ট্রেনিং ডেটা
│   ├── validation.jsonl        # ভ্যালিডেশন ডেটা
│   └── test.jsonl              # টেস্ট ডেটা
│
├── 📁 src/                     # mdBook সোর্স
│   ├── README.md               # প্রধান ডকুমেন্টেশন
│   ├── installation.md         # ইনস্টলেশন গাইড
│   ├── usage.md                # ব্যবহার নির্দেশিকা
│   ├── commands.md             # কমান্ড রেফারেন্স
│   ├── examples.md             # উদাহরণ
│   └── api.md                  # API ডকুমেন্টেশন
│
├── 📁 logs/                    # লগ ফাইল
├── 📁 reports/                 # রিপোর্ট এবং পরিসংখ্যান
├── 📁 notebooks/               # Jupyter নোটবুক
├── 📁 tests/                   # টেস্ট ফাইল
├── 📁 docs/                    # অতিরিক্ত ডকুমেন্টেশন
│
├── 📄 README.md                # এই ফাইল
├── 📄 CONTRIBUTING.md          # অবদান নির্দেশিকা
├── 📄 SECURITY.md              # সিকিউরিটি পলিসি
├── 📄 SCOPE.md                 # প্রজেক্ট স্কোপ
├── 📄 CHANGELOG.md             # পরিবর্তন লগ
└── 📄 LICENSE                  # MIT লাইসেন্স
```

---

## ML পাইপলাইন

শেখ ML পাইপলাইন একটি সম্পূর্ণ বাংলা ভাষার মডেল ট্রেনিং সমাধান প্রদান করে।

### পাইপলাইন ধাপসমূহ

**ধাপ ১:** পরিবেশ সেটআপ - HF টোকেন কনফিগারেশন এবং ক্যাশ সেটআপ

**ধাপ ২:** রিপোজিটরি তৈরি - Hugging Face-এ নতুন রিপোজিটরি তৈরি বা যাচাই

**ধাপ ৩:** ডেটাসেট প্রস্তুতি - CSV/JSONL/টেক্সট ফরম্যাটে ডেটা লোড

**ধাপ ৪:** টোকেনাইজার ট্রেনিং - BPE অ্যালগরিদম দিয়ে বাংলা টোকেনাইজার

**ধাপ ৫:** মডেল তৈরি - GPT-2 স্টাইল আর্কিটেকচার

**ধাপ ৬:** ফাইন-টিউনিং - প্রদত্ত ডেটাসেটে মডেল ট্রেনিং

**ধাপ ৭:** Hub আপলোড - Hugging Face Hub-এ মডেল পাবলিশ

### কনফিগারেশন অপশন

| প্যারামিটার | বর্ণনা | ডিফল্ট মান |
|------------|--------|-----------|
| `--vocab-size` | ভোকাবুলারি সাইজ | ৩০০০০ |
| `--hidden-size` | হিডেন লেয়ার সাইজ | ৭৬৮ |
| `--num-layers` | ট্রান্সফরমার লেয়ার | ১২ |
| `--num-heads` | অ্যাটেনশন হেড | ১২ |
| `--epochs` | ট্রেনিং এপক | ৩ |
| `--batch-size` | ব্যাচ সাইজ | ৮ |
| `--learning-rate` | লার্নিং রেট | ৫e-5 |

---

## ডকুমেন্টেশন

সম্পূর্ণ ডকুমেন্টেশন নিচের উৎসে পাওয়া যাবে:

- **README.md**: এই ফাইলে প্রধান ডকুমেন্টেশন আছে
- **ML_README.md**: ML পাইপলাইনের বিস্তারিত ডকুমেন্টেশন
- **src/**: mdBook ফরম্যাটে স্ট্রাকচার্ড ডকুমেন্টেশন
- **docs/**: অতিরিক্ত গাইড এবং রেফারেন্স

### অনলাইন ডকুমেন্টেশন

mdBook-ভিত্তিক অনলাইন ডকুমেন্টেশন GitHub Pages-এ হোস্ট করা হয়েছে:

```
https://osamabinlikhon.github.io/sheikh-cli/
```

---

## অবদান রাখুন

অবদান রাখতে চাইলে CONTRIBUTING.md ফাইলটি পড়ুন এবং নিচের ধাপগুলো অনুসরণ করুন:

1. রিপোজিটরি ফোর্ক করুন
2. একটি নতুন ব্রাঞ্চ তৈরি করুন (`git checkout -b feature/AmazingFeature`)
3. পরিবর্তন কমিট করুন (`git commit -m 'Add some AmazingFeature'`)
4. ব্রাঞ্চে পুশ করুন (`git push origin feature/AmazingFeature`)
5. একটি Pull Request খুলুন

সমস্যা রিপোর্ট করতে, নতুন ফিচার সাজেস্ট করতে বা প্রশ্ন করতে, GitHub Issues ব্যবহার করুন।

---

## লাইসেন্স

এই প্রজেক্ট MIT লাইসেন্সের অধীনে লাইসেন্সকৃত - বিস্তারিত জানার জন্য LICENSE ফাইল দেখুন।

```
MIT License

Copyright (c) 2025 Likhon Sheikh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
...
```

---

## যোগাযোগ

- **লেখক:** Likhon Sheikh
- **GitHub:** [@osamabinlikhon](https://github.com/osamabinlikhon)
- **Hugging Face:** [@osamabinlikhon](https://huggingface.co/osamabinlikhon)
- **ইমেইল:** osamabinlikhon@gmail.com

---

<div align="center">

### ❤️ বাংলা-বলতে AI সম্প্রদায়ের জন্য নির্মিত

**শেখ (Sheikh)** - বাংলা AI-এর পথে একটি পদক্ষেপ

</div>
