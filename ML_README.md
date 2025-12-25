# শেখ ML পাইপলাইন

## বাংলা ভাষার মডেল ট্রেনিং এবং Hugging Face Hub-এ আপলোড

---

## পরিচিতি

**শেখ ML পাইপলাইন** হলো একটি সম্পূর্ণ মেশিন লার্নিং পাইপলাইন যা বাংলা ভাষার জন্য ল্যাঙ্গুয়েজ মডেল তৈরি, ট্রেন এবং Hugging Face Hub-এ আপলোড করতে ব্যবহৃত হয়। এই টুলটি বাংলা NLP গবেষক এবং ডেটা সায়েন্টিস্টদের জন্য ডিজাইন করা হয়েছে যারা দ্রুত এবং কার্যকরভাবে বাংলা ভাষার মডেল তৈরি করতে চান।

এই পাইপলাইনটি বেশ কিছু গুরুত্বপূর্ণ কাজ স্বয়ংক্রিয়ভাবে সম্পাদন করে। প্রথমত, এটি পরিবেশ কনফিগারেশন করে এবং Hugging Face API-এর সাথে সংযোগ স্থাপন করে। দ্বিতীয়ত, এটি Hugging Face-এ একটি নতুন রিপোজিটরি তৈরি করে বা বিদ্যমান রিপোজিটরি ব্যবহার করে। তৃতীয়ত, এটি বাংলা টেক্সট ডেটা থেকে একটি কাস্টম BPE টোকেনাইজার প্রশিক্ষণ দেয়। চতুর্থত, এটি GPT-2 স্টাইল আর্কিটেকচারে একটি ল্যাঙ্গুয়েজ মডেল তৈরি করে। পঞ্চমত, এটি মডেলটিকে প্রদত্ত ডেটাসেটে ফাইন-টিউন করে। অবশেষে, এটি প্রশিক্ষিত মডেল Hugging Face Hub-এ আপলোড করে।

---

## বৈশিষ্ট্যসমূহ

শেখ ML পাইপলাইনে অনেকগুলি শক্তিশালী বৈশিষ্ট্য রয়েছে যা এটিকে বাংলা মডেল ট্রেনিংয়ের জন্য একটি আদর্শ পছন্দ করে তোলে।

**স্বয়ংক্রিয় পাইপলাইন:** এই টুলটি সম্পূর্ণ ML পাইপলাইনকে একটি কমান্ডে চালাতে পারে, যা প্রতিটি ধাপকে স্বয়ংক্রিয়ভাবে সম্পাদন করে এবং সময় বাঁচায়।

**কাস্টম টোকেনাইজার:** BPE (Byte Pair Encoding) অ্যালগরিদম ব্যবহার করে বাংলা ভাষার জন্য একটি কাস্টম টোকেনাইজার তৈরি করা হয় যা বাংলা অক্ষর এবং শব্দগুলোকে কার্যকরভাবে টোকেনাইজ করে।

**কনফিগারেবল আর্কিটেকচার:** মডেলের আর্কিটেকচার প্যারামিটার যেমন hidden_size, num_layers, num_heads ইত্যাদি সহজেই কনফিগার করা যায় YAML ফাইলের মাধ্যমে।

**Hugging Face ইন্টিগ্রেশন:** সরাসরি Hugging Face Hub-এ মডেল আপলোড করার সুবিধা রয়েছে, যা মডেল শেয়ারিং এবং কোলাবোরেশন সহজ করে।

**প্রগ্রেস ট্র্যাকিং:** ট্রেনিংয়ের সময় বিস্তারিত লগ এবং মেট্রিক্স সংরক্ষণ করা হয় যা পরবর্তীতে বিশ্লেষণের জন্য উপयोगी।

**রিপ্রোডিউসিবিলিটি:** সিড সেটিংস এবং কনফিগারেশন ফাইলের মাধ্যমে একই ফলাফল পুনরুত্পাদন করা সম্ভব।

---

## ইনস্টলেশন

শেখ ML পাইপলাইন ইনস্টল করতে নিচের ধাপগুলো অনুসরণ করুন।

### পূর্বশর্ত

প্রথমে নিশ্চিত হন যে আপনার সিস্টেমে পাইথন ৩.৯ বা তার উপরের সংস্কারণ ইনস্টল করা আছে। পাইথন ইনস্টলেশন যাচাই করতে টার্মিনালে নিচের কমান্ড চালান:

```bash
python --version
```

যদি Python সংস্করণ ৩.৯ এর নিচে হয়, তাহলে Python আপডেট করুন।

### ভার্চুয়াল এনভায়রনমেন্ট তৈরি (সুপারিশকৃত)

প্রজেক্টের নির্ভরতা সিস্টেমের অন্যান্য প্যাকেজ থেকে আলাদা রাখতে একটি ভার্চুয়াল এনভায়রনমেন্ট তৈরি করা সুপারিশকৃত:

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac এর জন্য
# Windows এর জন্য: venv\Scripts\activate
```

### প্যাকেজ ইনস্টলেশন

এখন প্রয়োজনীয় প্যাকেজগুলো ইনস্টল করুন:

```bash
pip install -r requirements_ml.txt
```

যদি আপনার GPU থাকে এবং CUDA সাপোর্টেড PyTorch ব্যবহার করতে চান, তাহলে PyTorch ইনস্টল করার সময় নিচের কমান্ড ব্যবহার করুন:

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

---

## ব্যবহার নির্দেশিকা

শেখ ML পাইপলাইন ব্যবহার করা খুবই সহজ। নিচে বিস্তারিত নির্দেশনা দেওয়া হলো।

### মূল কমান্ড

সবচেয়ে সহজ উপায় হলো সরাসরি পাইপলাইন স্ক্রিপ্ট চালানো:

```bash
python sheikh_ml_pipeline.py \
    --hf-token YOUR_HF_TOKEN \
    --repo-name osamabinlikhon/sheikh-bangla-model \
    --data-dir ./data \
    --output-dir ./output
```

এই কমান্ডটি সম্পূর্ণ পাইপলাইন চালাবে এবং বাংলা মডেল তৈরি করে Hugging Face Hub-এ আপলোড করবে।

### অতিরিক্ত অপশন

আরও কাস্টমাইজেশনের জন্য নিচের অপশনগুলো ব্যবহার করুন:

```bash
python sheikh_ml_pipeline.py \
    --hf-token YOUR_HF_TOKEN \
    --repo-name osamabinlikhon/sheikh-bangla-model \
    --data-dir ./data \
    --output-dir ./output \
    --max-samples 5000 \
    --vocab-size 50000 \
    --hidden-size 1024 \
    --num-layers 24 \
    --num-heads 16 \
    --epochs 5 \
    --batch-size 16 \
    --learning-rate 3e-5
```

### কনফিগারেশন ফাইল ব্যবহার

YAML কনফিগারেশন ফাইল ব্যবহার করতে:

```bash
python sheikh_ml_pipeline.py \
    --hf-token YOUR_HF_TOKEN \
    --repo-name osamabinlikhon/sheikh-bangla-model \
    --data-dir ./data \
    --config sheikh_ml_config.yaml
```

---

## কমান্ড লাইন আর্গুমেন্টস

নিচে সমস্ত কমান্ড লাইন আর্গুমেন্টের বিবরণ দেওয়া হলো।

### প্রয়োজনীয় আর্গুমেন্ট

`-hf-token` বা `--hf-token` আর্গুমেন্টটি Hugging Face API টোকেন নিতে ব্যবহৃত হয়। এটি অবশ্যই প্রদান করতে হবে। টোকেন পেতে Hugging Face ওয়েবসাইটে গিয়ে Settings > Access Tokens থেকে নতুন টোকেন তৈরি করুন।

`-repo-name` বা `--repo-name` আর্গুমেন্টটি Hugging Face রিপোজিটরি নাম নিতে ব্যবহৃত হয়। এটি "username/repository-name" ফরম্যাটে হতে হবে।

`-data-dir` বা `--data-dir` আর্গুমেন্টটি ডেটা ফাইল সম্বলিত ডিরেক্টরি পাথ নিতে ব্যবহৃত হয়।

### ঐচ্ছিক আর্গুমেন্ট

`-output-dir` বা `--output-dir` আর্গুমেন্টটি আউটপুট ডিরেক্টরি নির্ধারণ করে, ডিফল্ট মান "./output"।

`-max-samples` বা `--max-samples` আর্গুমেন্টটি সর্বোচ্চ ট্রেনিং স্যাম্পল সংখ্যা নির্ধারণ করে, ডিফল্ট মান ১০০০।

`-vocab-size` বা `--vocab-size` আর্গুমেন্টটি টোকেনাইজার ভোকাবুলারি সাইজ নির্ধারণ করে, ডিফল্ট মান ৩০০০০।

`-hidden-size` আর্গুমেন্টটি মডেলের hidden layer সাইজ নির্ধারণ করে, ডিফল্ট মান ৭৬৮।

`-num-layers` আর্গুমেন্টটি মডেলের transformer layer সংখ্যা নির্ধারণ করে, ডিফল্ট মান ১২।

`-num-heads` আর্গুমেন্টটি প্রতিটি layer-এ attention head সংখ্যা নির্ধারণ করে, ডিফল্ট মান ১২।

`-epochs` বা `--epochs` আর্গুমেন্টটি ট্রেনিং epoch সংখ্যা নির্ধারণ করে, ডিফল্ট মান ৩।

`-batch-size` বা `--batch-size` আর্গুমেন্টটি training batch size নির্ধারণ করে, ডিফল্ট মান ৮।

`-learning-rate` বা `--learning-rate` আর্গুমেন্টটি optimizer learning rate নির্ধারণ করে, ডিফল্ট মান ৫e-5।

`-no-upload` আর্গুমেন্টটি ব্যবহার করলে মডেলটি Hugging Face Hub-এ আপলোড হবে না।

---

## ডেটা ফরম্যাট

শেখ ML পাইপলাইন বিভিন্ন ডেটা ফরম্যাট সমর্থন করে।

### সমর্থিত ফরম্যাট

CSV ফাইল সবচেয়ে সাধারণ ফরম্যাট যেখানে "content" বা "text" নামক কলামে টেক্সট থাকে। JSONL (JSON Lines) ফাইল প্রতিটি লাইনে একটি JSON অবজেক্ট থাকে যেখানে "text" ফিল্ডে টেক্সট থাকে। প্লেইন টেক্সট ফাইলে প্রতিটি লাইন একটি স্যাম্পল হিসেবে বিবেচিত হয়।

### উদাহরণ ডেটা স্ট্রাকচার

CSV ফরম্যাটের উদাহরণ:

```csv
id,url,title,content,word_count
1,https://example.com/story1,গল্পের শিরোনাম,এখানে গল্পের মূল টেক্সট থাকবে...,150
2,https://example.com/story2,আরেকটি গল্প,এখানে আরেকটি গল্পের টেক্সট থাকবে...,200
```

JSONL ফরম্যাটের উদাহরণ:

```jsonl
{"id": "1", "url": "https://example.com/story1", "text": "এখানে গল্পের মূল টেক্সট থাকবে..."}
{"id": "2", "url": "https://example.com/story2", "text": "এখানে আরেকটি গল্পের টেক্সট থাকবে..."}
```

---

## আউটপুট স্ট্রাকচার

ট্রেনিং সম্পন্ন হলে নিচের ফোল্ডার এবং ফাইলগুলো তৈরি হবে।

```
output/
├── tokenizer/
│   └── tokenizer.json     # ট্রেন করা টোকেনাইজার
├── model/
│   ├── config.json        # মডেল কনফিগারেশন
│   ├── pytorch_model.bin  # মডেল ওজন
│   ├── tokenizer/         # টোকেনাইজার ফাইল
│   ├── final_model/       # সম্পূর্ণ মডেল
│   └── training_metrics.json  # ট্রেনিং মেট্রিক্স
├── logs/
│   └── training.log       # ট্রেনিং লগ
├── pipeline_results.json  # পাইপলাইন সম্পূর্ণ ফলাফল
└── .cache/                # Hugging Face ক্যাশে
```

---

## API রেফারেন্স

শেখ ML পাইপলাইন প্রোগ্রামেটিক্যালি ব্যবহার করার জন্য নিচের ফাংশনগুলো ব্যবহার করা যায়।

### setup_environment()

এই ফাংশনটি পরিবেশ সেটআপ করে এবং Hugging Face কনফিগার করে।

```python
from sheikh_ml_pipeline import setup_environment

result = setup_environment(
    hf_token="your_token",
    output_dir="./output"
)
# রিটার্ন: {"user_info": {...}, "output_dir": "...", "hf_token": "..."}
```

### create_hf_repository()

এই ফাংশনটি Hugging Face-এ একটি নতুন রিপোজিটরি তৈরি করে।

```python
from sheikh_ml_pipeline import create_hf_repository

repo_url = create_hf_repository(
    hf_token="your_token",
    repo_name="username/repo-name",
    repo_type="model",
    private=False
)
```

### train_tokenizer()

এই ফাংশনটি BPE টোকেনাইজার প্রশিক্ষণ দেয়।

```python
from sheikh_ml_pipeline import train_tokenizer

tokenizer = train_tokenizer(
    dataset=your_dataset,
    vocab_size=30000,
    output_dir="./output/tokenizer"
)
```

### create_model()

এই ফাংশনটি ট্রান্সফরমার মডেল তৈরি করে।

```python
from sheikh_ml_pipeline import create_model

model = create_model(
    vocab_size=30000,
    hidden_size=768,
    num_attention_heads=12,
    num_hidden_layers=12,
    output_dir="./output/model"
)
```

### train_model()

এই ফাংশনটি মডেল প্রশিক্ষণ দেয়।

```python
from sheikh_ml_pipeline import train_model

trainer, metrics = train_model(
    model=model,
    tokenizer=tokenizer,
    dataset=train_dataset,
    output_dir="./output/model",
    learning_rate=5e-5,
    num_train_epochs=3
)
```

### upload_to_hub()

এই ফাংশনটি মডেল Hugging Face Hub-এ আপলোড করে।

```python
from sheikh_ml_pipeline import upload_to_hub

hub_url = upload_to_hub(
    model_dir="./output/model/final_model",
    repo_name="username/repo-name",
    hf_token="your_token"
)
```

### run_pipeline()

এই ফাংশনটি সম্পূর্ণ পাইপলাইন একবারে চালায়।

```python
from sheikh_ml_pipeline import run_pipeline

results = run_pipeline(
    hf_token="your_token",
    repo_name="username/repo-name",
    data_dir="./data",
    output_dir="./output",
    max_samples=1000,
    vocab_size=30000,
    upload_to_hub_flag=True
)
```

---

## সমস্যা সমাধান

কিছু সাধারণ সমস্যা এবং তাদের সমাধান নিচে দেওয়া হলো।

### CUDA মেমরি সমস্যা

যদি CUDA মেমরি ত্রুটি দেখা দেয়, তাহলে batch size কমান বা fp16 মোড বন্ধ করুন:

```bash
python sheikh_ml_pipeline.py ... --batch-size 4
```

### টোকেনাইজার ট্রেনিং ব্যর্থতা

যদি টোকেনাইজার ট্রেনিং ব্যর্থ হয়, তাহলে ডেটা ফাইল যাচাই করুন এবং নিশ্চিত হন যে সঠিক ফরম্যাটে ডেটা আছে।

### Hugging Face আপলোড ব্যর্থতা

যদি আপলোড ব্যর্থ হয়, তাহলে টোকেন সঠিক কিনা যাচাই করুন এবং রিপোজিটরি নাম সঠিক ফরম্যাটে আছে কিনা দেখুন।

---

## লাইসেন্স এবং লেখক

এই প্রজেক্ট MIT লাইসেন্সের অধীনে প্রকাশিত। সকল অধিকার সংরক্ষিত, লেখক Likhon Sheikh।

---

## যোগাযোগ

কোনো প্রশ্ন বা সমস্যা থাকলে GitHub রিপোজিটরিতে ইস্যু তৈরি করুন।

GitHub: https://github.com/osamabinlikhon/sheikh-cli
