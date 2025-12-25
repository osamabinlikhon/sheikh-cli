# উদাহরণ সমূহ

## বেসিক স্ক্রেপিং উদাহরণ

### উদাহরণ ১: সাধারণ ডোমেইন স্ক্রেপিং

নিচের কমান্ডটি একটি বাংলা ওয়েবসাইট থেকে ১০০টি পেজ স্ক্রেপ করবে:

```bash
sheikh scrape allbanglachoti.com 100
```

এই কমান্ডটি ডিফল্ট সেটিংস ব্যবহার করে স্ক্রেপিং শুরু করবে। প্রতি সেকেন্ডে ২টি রিকোয়েস্ট পাঠানো হবে এবং আউটপুট `data/raw/allbanglachoti_com.csv` ফাইলে সংরক্ষিত হবে।

### উদাহরণ ২: দ্রুত স্ক্রেপিং

উচ্চ গতিতে স্ক্রেপিং করতে কর্মী সংখ্যা বাড়ান:

```bash
sheikh scrape allbanglachoti.com 1000 --workers 20 --rate 0.2
```

এই কমান্ডটি ২০টি কর্মী ব্যবহার করবে এবং প্রতি ০.২ সেকেন্ডে একটি রিকোয়েস্ট পাঠাবে।

### উদাহরণ ৩: গুগল সাইট থেকে স্ক্রেপিং

গুগল সাইট থেকে স্ক্রেপিং করতে হাব মোড ব্যবহার করুন:

```bash
sheikh scrape https://sites.google.com/view/allbanglachoti/bangla-choti 500 --mode hub
```

এই কমান্ডটি গুগল সাইট পেজ থেকে সমস্ত লিংক বের করবে এবং স্ক্রেপ করবে।

## উন্নত স্ক্রেপিং উদাহরণ

### উদাহরণ ৪: নির্দিষ্ট ডোমেইন ফিল্টারিং

হাব মোডে শুধুমাত্র নির্দিষ্ট ডোমেইন স্ক্রেপ করতে:

```bash
sheikh scrape https://sites.google.com/view/allbanglachoti/bangla-choti 1000 \
    --mode hub \
    --allow-domains allbanglachoti.com,bangla402.rssing.com
```

### উদাহরণ ৫: রিজিউম ফাংশনালিটি

মাঝখানে স্ক্রেপিং বন্ধ হলে চালিয়ে যেতে:

```bash
sheikh scrape allbanglachoti.com 5000 --resume
```

এই কমান্ডটি আগের সেশন থেকে সম্পন্ন URL গুলো স্কিপ করবে এবং বাকি URL গুলো স্ক্রেপ করবে।

### উদাহরণ ৬: কাস্টম আউটপুট পাথ

আউটপুট কাস্টম পাথে সংরক্ষণ করতে:

```bash
sheikh scrape allbanglachoti.com 100 \
    --output /home/user/my_data/bangla_stories.csv
```

## ডেটা প্রসেসিং উদাহরণ

### উদাহরণ ৭: ডেটা যাচাই

সংগ্রহ করা ডেটার সিনট্যাস যাচাই করুন:

```bash
sheikh syntax data/raw/allbanglachoti_com.csv
```

### উদাহরণ ৮: ডেটা পরিসংখ্যান

ডেটার গুণমান বিশ্লেষণ করুন:

```bash
sheikh stats data/raw/allbanglachoti_com.csv
```

### উদাহরণ ৯: ট্রেন/ভ্যালিডেশন স্প্লিট

ডেটাসেট ML ট্রেনিংয়ের জন্য প্রস্তুত করুন:

```bash
sheikh split data/raw/allbanglachoti_com.csv 0.9
```

এই কমান্ডটি ৯০% ডেটা ট্রেন সেটে এবং ১০% ভ্যালিডেশন সেটে ভাগ করবে।

### উদাহরণ ১০: Hugging Face এ আপলোড

ডেটা Hugging Face Hub এ আপলোড করুন:

```bash
export HF_TOKEN=your_token_here
sheikh push data/train.jsonl --repo-id osamabinlikhon/bangla-stories
```

## শেখ পাওয়ার স্ক্রেপার উদাহরণ

### উদাহরণ ১১: Node.js স্ক্রেপার চালানো

```bash
node sheikh_power_scraper.cjs scrape "https://bangla402.rssing.com/chan-63758807/article33.html" \
    --max-pages 10 \
    --headless true
```

### উদাহরণ ১২: পাইথন স্ক্রেপার চালানো

```bash
python sheikh_power_scraper.py \
    --url "https://bangla424.rssing.com/chan-64151446/article60.html" \
    --max-pages 5 \
    --headless
```

এই উদাহরণগুলো শেখ CLI টুলের বিভিন্ন ব্যবহার ক্ষেত্র দেখায়। প্রতিটি উদাহরণ নির্দিষ্ট পরিস্থিতিতে টুলটি কীভাবে ব্যবহার করতে হবে তা প্রদর্শন করে।
