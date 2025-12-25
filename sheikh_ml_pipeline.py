#!/usr/bin/env python3
"""
শেখ ML পাইপলাইন - বাংলা ভাষার মডেল ট্রেনিং স্ক্রিপ্ট
=====================================================
এই স্ক্রিপ্টটি বাংলা ভাষার জন্য একটি ল্যাঙ্গুয়েজ মডেল ট্রেনিং এবং Hugging Face Hub-এ আপলোড করে।

বৈশিষ্ট্যসমূহ:
- টোকেনাইজার ট্রেনিং
- মডেল আর্কিটেকচার তৈরি
- ফাইন-টিউনিং
- Hugging Face Hub-এ আপলোড

লেখক: Likhon Sheikh
লাইসেন্স: MIT
পাইথন: >= 3.9
"""

import os
import sys
import json
import argparse
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any

# লগিং সেটআপ
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("sheikh-ml-pipeline")

# কনফিগারেশন
CONFIG = {
    "model_name": "sheikh-bangla-110m",
    "model_revision": "v1.0",
    "vocab_size": 30000,
    "max_length": 512,
    "hidden_size": 768,
    "num_attention_heads": 12,
    "num_hidden_layers": 12,
    "intermediate_size": 3072,
    "activation_function": "gelu",
    "dropout_rate": 0.1,
    "learning_rate": 5e-5,
    "train_batch_size": 8,
    "eval_batch_size": 8,
    "num_train_epochs": 3,
    "warmup_steps": 500,
    "weight_decay": 0.01,
    "gradient_accumulation_steps": 4,
    "logging_steps": 100,
    "save_steps": 500,
    "eval_steps": 500,
    "optimization": "adamw",
    "seed": 42,
}


def setup_environment(hf_token: str, output_dir: str = "./output") -> Dict[str, Any]:
    """
    পরিবেশ সেটআপ করুন এবং Hugging Face লাইব্রেরি কনফিগার করুন।
    
    Args:
        hf_token: Hugging Face API টোকেন
        output_dir: আউটপুট ডিরেক্টরি পাথ
    
    Returns:
        কনফিগারেশন ডিকশনারি
    """
    logger.info("পরিবেশ সেটআপ শুরু হচ্ছে...")
    
    # পরিবেশ ভেরিয়েবল সেট করুন
    os.environ["HF_TOKEN"] = hf_token
    os.environ["HF_HOME"] = os.path.join(output_dir, ".cache")
    os.environ["TRANSFORMERS_CACHE"] = os.path.join(output_dir, ".cache")
    os.environ["DATASETS_CACHE"] = os.path.join(output_dir, ".cache")
    
    # আউটপুট ডিরেক্টরি তৈরি করুন
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    Path(os.path.join(output_dir, ".cache")).mkdir(parents=True, exist_ok=True)
    Path(os.path.join(output_dir, "logs")).mkdir(parents=True, exist_ok=True)
    Path(os.path.join(output_dir, "models")).mkdir(parents=True, exist_ok=True)
    
    logger.info(f"আউটপুট ডিরেক্টরি: {output_dir}")
    
    # টোকেন যাচাই করুন
    from huggingface_hub import HfApi
    api = HfApi(token=hf_token)
    user_info = api.whoami()
    
    logger.info(f"Hugging Face ব্যবহারকারী: {user_info['name']}")
    logger.info(f"ইমেইল: {user_info.get('email', 'N/A')}")
    
    return {
        "user_info": user_info,
        "output_dir": output_dir,
        "hf_token": hf_token,
    }


def create_hf_repository(
    hf_token: str,
    repo_name: str,
    repo_type: str = "model",
    private: bool = False,
    exist_ok: bool = True
) -> str:
    """
    Hugging Face-এ একটি নতুন রিপোজিটরি তৈরি করুন।
    
    Args:
        hf_token: Hugging Face API টোকেন
        repo_name: রিপোজিটরি নাম (যেমন: "osamabinlikhon/sheikh-bangla-model")
        repo_type: রিপোজিটরি প্রকার ("model", "dataset", বা "space")
        private: প্রাইভেট রিপোজিটরি হবে কিনা
        exist_ok: যদি রিপোজিটরি বিদ্যমান থাকে তাহলে এরর দেখাবে না
    
    Returns:
        রিপোজিটরি URL
    """
    logger.info(f"Hugging Face রিপোজিটরি তৈরি করা হচ্ছে: {repo_name}")
    
    from huggingface_hub import HfApi
    
    api = HfApi(token=hf_token)
    
    # রিপোজিটরি তৈরি বা যাচাই করুন
    try:
        api.create_repo(
            repo_id=repo_name,
            repo_type=repo_type,
            private=private,
            exist_ok=exist_ok
        )
        logger.info(f"রিপোজিটরি তৈরি হয়েছে: https://huggingface.co/{repo_name}")
    except Exception as e:
        logger.warning(f"রিপোজিটরি তৈরিতে সমস্যা: {e}")
        logger.info(f"বিদ্যমান রিপোজিটরি ব্যবহার করা হবে: https://huggingface.co/{repo_name}")
    
    return f"https://huggingface.co/{repo_name}"


def prepare_dataset(data_dir: str, max_samples: int = 1000) -> Any:
    """
    ট্রেনিংয়ের জন্য ডেটাসেট প্রস্তুত করুন।
    
    Args:
        data_dir: ডেটা ডিরেক্টরি পাথ
        max_samples: সর্বোচ্চ স্যাম্পল সংখ্যা
    
    Returns:
        প্রস্তুত ডেটাসেট
    """
    logger.info(f"ডেটাসেট প্রস্তুত করা হচ্ছে: {data_dir}")
    
    from datasets import load_dataset
    import pandas as pd
    import json
    
    data_path = Path(data_dir)
    
    # সমর্থিত ফাইল ফরম্যাট যাচাই
    supported_formats = ["*.csv", "*.json", "*.jsonl", "*.txt"]
    
    files = []
    for pattern in supported_formats:
        files.extend(data_path.glob(pattern))
    
    if not files:
        logger.error("কোনো ডেটা ফাইল পাওয়া যায়নি!")
        logger.info(f"সমর্থিত ফরম্যাট: {supported_formats}")
        return None
    
    logger.info(f"পাওয়া ফাইল: {[f.name for f in files[:5]]}")
    
    # ডেটাসেট লোড করুন
    if data_path.glob("*.csv"):
        # CSV ফাইল লোড করুন
        csv_files = list(data_path.glob("*.csv"))
        dataset = load_dataset("csv", data_files=csv_files, split="train")
    elif data_path.glob("*.jsonl"):
        # JSONL ফাইল লোড করুন
        jsonl_files = list(data_path.glob("*.jsonl"))
        dataset = load_dataset("json", data_files=jsonl_files, split="train")
    elif data_path.glob("*.json"):
        # JSON ফাইল লোড করুন
        json_files = list(data_path.glob("*.json"))
        dataset = load_dataset("json", data_files=json_files, split="train")
    else:
        # টেক্সট ফাইল লোড করুন
        txt_files = list(data_path.glob("*.txt"))
        dataset = load_dataset("text", data_files=txt_files, split="train")
    
    # স্যাম্পল সংখ্যা সীমিত করুন
    if len(dataset) > max_samples:
        logger.info(f"ডেটাসেট সীমিত করা হচ্ছে: {len(dataset)} -> {max_samples}")
        dataset = dataset.select(range(max_samples))
    
    logger.info(f"ডেটাসেট তৈরি হয়েছে: {len(dataset)} স্যাম্পল")
    logger.info(f"ফিচার: {dataset.features}")
    
    return dataset


def train_tokenizer(
    dataset: Any,
    vocab_size: int = 30000,
    output_dir: str = "./output/tokenizer"
) -> Any:
    """
    টোকেনাইজার ট্রেনিং করুন।
    
    Args:
        dataset: ট্রেনিং ডেটাসেট
        vocab_size: ভোকাবুলারি সাইজ
        output_dir: আউটপুট ডিরেক্টরি
    
    Returns:
        ট্রেন করা টোকেনাইজার
    """
    logger.info("টোকেনাইজার ট্রেনিং শুরু হচ্ছে...")
    
    from tokenizers import Tokenizer, models, trainers, pre_tokenizers, processors, decoders
    from tokenizers.normalizers import NFC, NFD, Lowercase
    from tokenizers.pre_tokenizers import Whitespace, Digits, UnicodeScripts
    from tokenizers.trainers import BpeTrainer
    
    # নতুন BPE টোকেনাইজার তৈরি করুন
    tokenizer = Tokenizer(models.BPE())
    
    # নরমালাইজার সেট করুন
    tokenizer.normalizer = NFC()
    
    # প্রি-টোকেনাইজার সেট করুন
    tokenizer.pre_tokenizer = pre_tokenizers.Sequence([
        UnicodeScripts(),
        Whitespace(),
        Digits(individual_digits=True),
    ])

    
    # ট্রেনার কনফিগার করুন
    trainer = BpeTrainer(
        vocab_size=vocab_size,
        min_frequency=2,
        special_tokens=["[PAD]", "[UNK]", "[CLS]", "[SEP]", "[MASK]"],
        show_progress=True,
        continuing_subword_prefix="##",
    )
    
    # টেক্সট ডেটা প্রস্তুত করুন
    def get_texts(batch):
        texts = []
        for item in batch:
            # বিভিন্ন ফিল্ড থেকে টেক্সট বের করুন
            if isinstance(item, str):
                texts.append(item)
            elif isinstance(item, dict):
                text = item.get('text', item.get('content', item.get('story', '')))
                if text:
                    texts.append(text)
        return texts
    
    # সমস্ত টেক্সট সংগ্রহ করুন
    logger.info("ট্রেনিং ডেটা প্রস্তুত করা হচ্ছে...")
    all_texts = []
    
    for i in range(len(dataset)):
        item = dataset[i]
        if isinstance(item, str):
            all_texts.append(item)
        elif isinstance(item, dict):
            text = item.get('text', item.get('content', item.get('story', '')))
            if text:
                all_texts.append(text[:10000])  # প্রতি আইটেমে সর্বোচ্চ 10000 ক্যারেক্টার
    
    if not all_texts:
        logger.error("কোনো টেক্সট ডেটা পাওয়া যায়নি!")
        return None
    
    logger.info(f"মোট টেক্সট সংগ্রহ: {len(all_texts)} আইটেম")
    
    # টোকেনাইজার ট্রেন করুন
    logger.info("টোকেনাইজার ট্রেনিং চলছে (এটি কিছু সময় নিতে পারে)...")
    tokenizer.train_from_iterator(all_texts, trainer=trainer)
    
    # পোস্ট-প্রসেসর সেট করুন
    tokenizer.post_processor = processors.TemplateProcessing(
        single="[CLS] $A [SEP]",
        pair="[CLS] $A [SEP] $B:1 [SEP]:1",
        special_tokens=[
            ("[CLS]", tokenizer.token_to_id("[CLS]")),
            ("[SEP]", tokenizer.token_to_id("[SEP]")),
            ("[PAD]", tokenizer.token_to_id("[PAD]")),
        ],
    )
    
    # ডিকোডার সেট করুন
    tokenizer.decoder = decoders.BPEDecoder(suffix="##")
    
    # টোকেনাইজার সংরক্ষণ করুন
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    tokenizer_path = os.path.join(output_dir, "tokenizer.json")
    tokenizer.save(tokenizer_path)
    logger.info(f"টোকেনাইজার সংরক্ষিত: {tokenizer_path}")
    
    # ভোকাবুলারি তথ্য দেখান
    vocab_info = {
        "vocab_size": tokenizer.get_vocab_size(),
        "model": "BPE",
        "special_tokens": tokenizer.get_special_tokens_map(),
    }
    logger.info(f"ভোকাবুলারি সাইজ: {vocab_info['vocab_size']}")
    logger.info(f"বিশেষ টোকেন: {vocab_info['special_tokens']}")
    
    return tokenizer


def create_model(
    vocab_size: int = 30000,
    hidden_size: int = 768,
    num_attention_heads: int = 12,
    num_hidden_layers: int = 12,
    intermediate_size: int = 3072,
    max_length: int = 512,
    activation_function: str = "gelu",
    dropout_rate: float = 0.1,
    output_dir: str = "./output/model"
) -> Any:
    """
    ট্রান্সফরমার-ভিত্তিক ভাষা মডেল তৈরি করুন।
    
    Args:
        vocab_size: ভোকাবুলারি সাইজ
        hidden_size: হিডেন লেয়ার সাইজ
        num_attention_heads: অ্যাটেনশন হেড সংখ্যা
        num_hidden_layers: হিডেন লেয়ার সংখ্যা
        intermediate_size: ইন্টারমিডিয়েট লেয়ার সাইজ
        max_length: সর্বোচ্চ সিকোয়েন্স দৈর্ঘ্য
        activation_function: অ্যাক্টিভেশন ফাংশন
        dropout_rate: ড্রপআউট রেট
        output_dir: আউটপুট ডিরেক্টরি
    
    Returns:
        তৈরি করা মডেল
    """
    logger.info("মডেল আর্কিটেকচার তৈরি করা হচ্ছে...")
    logger.info(f"প্যারামিটার: vocab_size={vocab_size}, hidden_size={hidden_size}, layers={num_hidden_layers}")
    
    from transformers import (
        AutoConfig,
        AutoModelForCausalLM,
        AutoTokenizer,
        AutoModel,
    )
    
    # কনফিগারেশন তৈরি করুন
    config = AutoConfig.from_pretrained(
        "gpt2",  # বেস কনফিগারেশন
        vocab_size=vocab_size,
        n_positions=max_length,
        n_ctx=max_length,
        n_embd=hidden_size,
        n_head=num_attention_heads,
        n_layer=num_hidden_layers,
        ffn_dim=intermediate_size,
        activation_function=activation_function,
        resid_pdrop=dropout_rate,
        embd_pdrop=dropout_rate,
        attn_pdrop=dropout_rate,
        layer_norm_epsilon=1e-5,
        initializer_range=0.02,
        bos_token_id=2,  # [CLS]
        eos_token_id=3,  # [SEP]
        pad_token_id=0,  # [PAD]
        sep_token_id=3,  # [SEP]
    )
    
    logger.info("মডেল কনফিগারেশন তৈরি হয়েছে")
    
    # মডেল তৈরি করুন
    model = AutoModelForCausalLM.from_config(config)
    
    # মডেল সংরক্ষণ করুন
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    model_path = os.path.join(output_dir, "pytorch_model.bin")
    
    # শুধুমাত্র কনফিগারেশন সংরক্ষণ করুন
    config_path = os.path.join(output_dir, "config.json")
    config.save_pretrained(config_path.replace("/config.json", ""))
    logger.info(f"মডেল কনফিগারেশন সংরক্ষিত: {config_path}")
    
    # মডেল আর্কিটেকচার সারসংক্ষেপ
    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    
    logger.info(f"মোট প্যারামিটার: {total_params:,}")
    logger.info(f"ট্রেনযোগ্য প্যারামিটার: {trainable_params:,}")
    logger.info(f"মডেল আর্কিটেকচার: GPT-2 স্টাইল বাংলা ভাষা মডেল")
    
    return model


def train_model(
    model: Any,
    tokenizer: Any,
    dataset: Any,
    output_dir: str = "./output/model",
    learning_rate: float = 5e-5,
    train_batch_size: int = 8,
    eval_batch_size: int = 8,
    num_train_epochs: int = 3,
    warmup_steps: int = 500,
    weight_decay: float = 0.01,
    gradient_accumulation_steps: int = 4,
    logging_steps: int = 100,
    save_steps: int = 500,
    eval_steps: int = 500,
    max_length: int = 512,
    seed: int = 42
) -> Any:
    """
    মডেল ট্রেনিং করুন।
    
    Args:
        model: ট্রেন করার জন্য মডেল
        tokenizer: টোকেনাইজার
        dataset: ট্রেনিং ডেটাসেট
        output_dir: আউটপুট ডিরেক্টরি
        learning_rate: লার্নিং রেট
        train_batch_size: ট্রেনিং ব্যাচ সাইজ
        eval_batch_size: ইভ্যালুয়েশন ব্যাচ সাইজ
        num_train_epochs: ট্রেনিং এপক সংখ্যা
        warmup_steps: ওয়ার্মআপ স্টেপ
        weight_decay: ওয়েট ডিকে
        gradient_accumulation_steps: গ্রেডিয়েন্ট অ্যাকুমুলেশন স্টেপ
        logging_steps: লগিং স্টেপ
        save_steps: সেভ স্টেপ
        eval_steps: ইভ্যালুয়েশন স্টেপ
        max_length: সর্বোচ্চ সিকোয়েন্স দৈর্ঘ্য
        seed: র‍্যান্ডম সিড
    
    Returns:
        ট্রেন করা মডেল
    """
    logger.info("মডেল ট্রেনিং শুরু হচ্ছে...")
    
    from transformers import (
        AutoTokenizer,
        AutoModelForCausalLM,
        AutoModelForSequenceClassification,
        TrainingArguments,
        Trainer,
        DataCollatorForLanguageModeling,
    )
    import torch
    
    # ডিভাইস সেটআপ
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"ট্রেনিং ডিভাইস: {device}")
    
    if torch.cuda.is_available():
        logger.info(f"GPU: {torch.cuda.get_device_name(0)}")
        logger.info(f"GPU মেমরি: {torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB")
    
    # ডেটা প্রস্তুত করুন
    logger.info("ট্রেনিং ডেটা প্রস্তুত করা হচ্ছে...")
    
    # টোকেনাইজার সংরক্ষণ করুন
    tokenizer.save_pretrained(os.path.join(output_dir, "tokenizer"))
    logger.info("টোকেনাইজার সংরক্ষিত")
    
    # ডেটা কলেটর
    data_collator = DataCollatorForLanguageModeling(
        tokenizer=tokenizer,
        mlm=False,  # Causal LM (GPT স্টাইল)
        pad_to_multiple_of=None,
    )
    
    # ট্রেনিং আর্গুমেন্ট
    training_args = TrainingArguments(
        output_dir=output_dir,
        overwrite_output_dir=True,
        
        # ট্রেনিং প্যারামিটার
        num_train_epochs=num_train_epochs,
        per_device_train_batch_size=train_batch_size,
        per_device_eval_batch_size=eval_batch_size,
        gradient_accumulation_steps=gradient_accumulation_steps,
        learning_rate=learning_rate,
        weight_decay=weight_decay,
        
        # অপ্টিমাইজার সেটিংস
        adam_beta1=0.9,
        adam_beta2=0.999,
        adam_epsilon=1e-8,
        max_grad_norm=1.0,
        
        # ওয়ার্মআপ
        warmup_steps=warmup_steps,
        
        # লগিং এবং সেভ
        logging_steps=logging_steps,
        save_steps=save_steps,
        save_strategy="steps",
        save_total_limit=3,
        
        # ইভ্যালুয়েশন
        evaluation_strategy="steps",
        eval_steps=eval_steps,
        load_best_model_at_end=True,
        metric_for_best_model="eval_loss",
        greater_is_better=False,
        
        # মিশ্র প্রিসিশন
        fp16=torch.cuda.is_available(),
        bf16=False,
        
        # র‍্যান্ডম সিড
        seed=seed,
        
        # রিপোর্টিং
        report_to="none",
        
        # প্রগ্রেস বার
        disable_tqdm=False,
    )
    
    # ট্রেনার তৈরি করুন
    trainer = Trainer(
        model=model,
        args=training_args,
        data_collator=data_collator,
        train_dataset=dataset,
        tokenizer=tokenizer,
    )
    
    # ট্রেনিং শুরু
    logger.info("ট্রেনিং শুরু হচ্ছে (এটি কিছু সময় নিতে পারে)...")
    logger.info(f"ট্রেনিং এপক: {num_train_epochs}")
    logger.info(f"ব্যাচ সাইজ: {train_batch_size} x {gradient_accumulation_steps} = {train_batch_size * gradient_accumulation_steps}")
    
    # ট্রেনিং চালান
    train_result = trainer.train()
    
    # ট্রেনিং ফলাফল
    training_metrics = {
        "train_loss": train_result.training_loss,
        "train_runtime": train_result.metrics.get("train_runtime", 0),
        "train_samples_per_second": train_result.metrics.get("train_samples_per_second", 0),
        "train_steps_per_second": train_result.metrics.get("train_steps_per_second", 0),
    }
    
    logger.info(f"ট্রেনিং সম্পন্ন!")
    logger.info(f"ট্রেনিং লস: {training_metrics['train_loss']:.4f}")
    logger.info(f"ট্রেনিং সময়: {training_metrics['train_runtime']:.2f} সেকেন্ড")
    logger.info(f"স্যাম্পল/সেকেন্ড: {training_metrics['train_samples_per_second']:.2f}")
    
    # সেরা মডেল সংরক্ষণ
    logger.info("সেরা মডেল সংরক্ষণ করা হচ্ছে...")
    trainer.save_model(os.path.join(output_dir, "final_model"))
    
    # ট্রেনিং মেট্রিক্স সংরক্ষণ
    metrics_path = os.path.join(output_dir, "training_metrics.json")
    with open(metrics_path, 'w', encoding='utf-8') as f:
        json.dump(training_metrics, f, indent=2)
    
    logger.info(f"ট্রেনিং মেট্রিক্স সংরক্ষিত: {metrics_path}")
    
    return trainer, training_metrics


def upload_to_hub(
    model_dir: str,
    repo_name: str,
    hf_token: str,
    commit_message: str = "Initial model upload"
) -> str:
    """
    মডেল Hugging Face Hub-এ আপলোড করুন।
    
    Args:
        model_dir: মডেল ডিরেক্টরি পাথ
        repo_name: রিপোজিটরি নাম
        hf_token: Hugging Face API টোকেন
        commit_message: কমিট মেসেজ
    
    Returns:
        রিপোজিটরি URL
    """
    logger.info(f"মডেল আপলোড করা হচ্ছে: {repo_name}")
    
    from huggingface_hub import HfApi, ModelHubClient, create_repo
    from transformers import AutoModel, AutoTokenizer
    
    api = HfApi(token=hf_token)
    
    # রিপোজিটরি তৈরি করুন (যদি না থাকে)
    try:
        create_repo(repo_name, repo_type="model", exist_ok=True)
        logger.info(f"রিপোজিটরি তৈরি/যাচাই: https://huggingface.co/{repo_name}")
    except Exception as e:
        logger.error(f"রিপোজিটরি তৈরিতে ত্রুটি: {e}")
    
    # মডেল এবং টোকেনাইজার লোড করুন
    logger.info("মডেল এবং টোকেনাইজার লোড করা হচ্ছে...")
    
    model = AutoModel.from_pretrained(model_dir)
    tokenizer = AutoTokenizer.from_pretrained(model_dir)
    
    # কার্ড তথ্য তৈরি করুন
    model_card = f"""
---
language: bn
license: mit
tags:
- bangla
- language-model
- causal-lm
widget:
- text: "বাংলা ভাষা হলো"
---

# Sheikh Bangla Language Model

## মডেল বিবরণ

এই মডেলটি বাংলা ভাষার জন্য তৈরি একটি ক্যাজুয়াল ল্যাঙ্গুয়েজ মডেল (CLM)।

## ব্যবহার

```python
from transformers import AutoModel, AutoTokenizer

model = AutoModel.from_pretrained("{repo_name}")
tokenizer = AutoTokenizer.from_pretrained("{repo_name}")

inputs = tokenizer("বাংলা ভাষা হলো", return_tensors="pt")
outputs = model(**inputs)
```

## ট্রেনিং বিবরণ

- **টোকেনাইজার**: BPE
- **আর্কিটেকচার**: GPT-2 স্টাইল
- **ট্রেনিং ডেটা**: বাংলা ওয়েবসাইট থেকে সংগ্রহিত

## লেখক

Likhon Sheikh
"""
    
    # README.md সংরক্ষণ করুন
    readme_path = os.path.join(model_dir, "README.md")
    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write(model_card)
    
    logger.info("মডেল কার্ড তৈরি হয়েছে")
    
    # Hub-এ আপলোড করুন
    logger.info("Hugging Face Hub-এ আপলোড করা হচ্ছে...")
    
    api.upload_folder(
        folder_path=model_dir,
        repo_id=repo_name,
        repo_type="model",
        commit_message=commit_message,
    )
    
    repo_url = f"https://huggingface.co/{repo_name}"
    logger.info(f"আপলোড সম্পন্ন! মডেল URL: {repo_url}")
    
    return repo_url


def run_pipeline(
    hf_token: str,
    repo_name: str,
    data_dir: str,
    output_dir: str = "./output",
    max_samples: int = 1000,
    vocab_size: int = 30000,
    model_config: Optional[Dict] = None,
    train_config: Optional[Dict] = None,
    upload_to_hub_flag: bool = True
) -> Dict[str, Any]:
    """
    সম্পূর্ণ ML পাইপলাইন চালান।
    
    Args:
        hf_token: Hugging Face API টোকেন
        repo_name: রিপোজিটরি নাম
        data_dir: ডেটা ডিরেক্টরি পাথ
        output_dir: আউটপুট ডিরেক্টরি পাথ
        max_samples: সর্বোচ্চ ডেটা স্যাম্পল সংখ্যা
        vocab_size: ভোকাবুলারি সাইজ
        model_config: মডেল কনফিগারেশন
        train_config: ট্রেনিং কনফিগারেশন
        upload_to_hub_flag: Hub-এ আপলোড করবে কিনা
    
    Returns:
        পাইপলাইন ফলাফল ডিকশনারি
    """
    pipeline_results = {
        "status": "started",
        "start_time": datetime.now().isoformat(),
        "steps": {},
    }
    
    try:
        # ধাপ ১: পরিবেশ সেটআপ
        logger.info("=" * 60)
        logger.info("ধাপ ১: পরিবেশ সেটআপ")
        logger.info("=" * 60)
        
        env_result = setup_environment(hf_token, output_dir)
        pipeline_results["steps"]["environment"] = {
            "status": "success",
            "user": env_result["user_info"]["name"],
            "output_dir": env_result["output_dir"],
        }
        
        # ধাপ ২: Hugging Face রিপোজিটরি তৈরি
        logger.info("=" * 60)
        logger.info("ধাপ ২: Hugging Face রিপোজিটরি তৈরি")
        logger.info("=" * 60)
        
        repo_url = create_hf_repository(hf_token, repo_name)
        pipeline_results["steps"]["repository"] = {
            "status": "success",
            "repo_name": repo_name,
            "repo_url": repo_url,
        }
        
        # ধাপ ৩: ডেটাসেট প্রস্তুত করা
        logger.info("=" * 60)
        logger.info("ধাপ ৩: ডেটাসেট প্রস্তুত করা")
        logger.info("=" * 60)
        
        dataset = prepare_dataset(data_dir, max_samples)
        if dataset is None:
            raise ValueError("ডেটাসেট প্রস্তুত করতে ব্যর্থ")
        
        pipeline_results["steps"]["dataset"] = {
            "status": "success",
            "num_samples": len(dataset),
            "features": str(dataset.features),
        }
        
        # ধাপ ৪: টোকেনাইজার ট্রেনিং
        logger.info("=" * 60)
        logger.info("ধাপ ৪: টোকেনাইজার ট্রেনিং")
        logger.info("=" * 60)
        
        tokenizer = train_tokenizer(
            dataset,
            vocab_size=vocab_size,
            output_dir=os.path.join(output_dir, "tokenizer")
        )
        
        pipeline_results["steps"]["tokenizer"] = {
            "status": "success",
            "vocab_size": tokenizer.get_vocab_size(),
        }
        
        # ধাপ ৫: মডেল তৈরি
        logger.info("=" * 60)
        logger.info("ধাপ ৫: মডেল তৈরি")
        logger.info("=" * 60)
        
        if model_config:
            CONFIG.update(model_config)
        
        model = create_model(
            vocab_size=vocab_size,
            hidden_size=CONFIG["hidden_size"],
            num_attention_heads=CONFIG["num_attention_heads"],
            num_hidden_layers=CONFIG["num_hidden_layers"],
            intermediate_size=CONFIG["intermediate_size"],
            max_length=CONFIG["max_length"],
            activation_function=CONFIG["activation_function"],
            dropout_rate=CONFIG["dropout_rate"],
            output_dir=os.path.join(output_dir, "model")
        )
        
        total_params = sum(p.numel() for p in model.parameters())
        pipeline_results["steps"]["model"] = {
            "status": "success",
            "total_parameters": total_params,
            "config": {
                "vocab_size": vocab_size,
                "hidden_size": CONFIG["hidden_size"],
                "num_layers": CONFIG["num_hidden_layers"],
                "num_heads": CONFIG["num_attention_heads"],
            },
        }
        
        # ধাপ ৬: মডেল ট্রেনিং
        logger.info("=" * 60)
        logger.info("ধাপ ৬: মডেল ট্রেনিং")
        logger.info("=" * 60)
        
        if train_config:
            CONFIG.update(train_config)
        
        trainer, training_metrics = train_model(
            model=model,
            tokenizer=tokenizer,
            dataset=dataset,
            output_dir=os.path.join(output_dir, "model"),
            learning_rate=CONFIG["learning_rate"],
            train_batch_size=CONFIG["train_batch_size"],
            eval_batch_size=CONFIG["eval_batch_size"],
            num_train_epochs=CONFIG["num_train_epochs"],
            warmup_steps=CONFIG["warmup_steps"],
            weight_decay=CONFIG["weight_decay"],
            gradient_accumulation_steps=CONFIG["gradient_accumulation_steps"],
            logging_steps=CONFIG["logging_steps"],
            save_steps=CONFIG["save_steps"],
            eval_steps=CONFIG["eval_steps"],
            max_length=CONFIG["max_length"],
            seed=CONFIG["seed"],
        )
        
        pipeline_results["steps"]["training"] = {
            "status": "success",
            "metrics": training_metrics,
        }
        
        # ধাপ ৭: Hub-এ আপলোড
        if upload_to_hub_flag:
            logger.info("=" * 60)
            logger.info("ধাপ ৭: Hugging Face Hub-এ আপলোড")
            logger.info("=" * 60)
            
            final_model_dir = os.path.join(output_dir, "model", "final_model")
            hub_url = upload_to_hub(
                model_dir=final_model_dir,
                repo_name=repo_name,
                hf_token=hf_token,
                commit_message="Initial model upload from Sheikh ML Pipeline"
            )
            
            pipeline_results["steps"]["upload"] = {
                "status": "success",
                "hub_url": hub_url,
            }
        
        # সম্পূর্ণ ফলাফল
        pipeline_results["status"] = "success"
        pipeline_results["end_time"] = datetime.now().isoformat()
        
        # সময়কাল গণনা
        from datetime import datetime as dt
        start = dt.fromisoformat(pipeline_results["start_time"])
        end = dt.fromisoformat(pipeline_results["end_time"])
        pipeline_results["duration_seconds"] = (end - start).total_seconds()
        
        logger.info("=" * 60)
        logger.info("পাইপলাইন সম্পন্ন!")
        logger.info(f"মোট সময়: {pipeline_results['duration_seconds']:.2f} সেকেন্ড")
        logger.info("=" * 60)
        
    except Exception as e:
        pipeline_results["status"] = "failed"
        pipeline_results["error"] = str(e)
        pipeline_results["end_time"] = datetime.now().isoformat()
        logger.error(f"পাইপলাইন ব্যর্থ: {e}")
    
    # ফলাফল সংরক্ষণ
    results_path = os.path.join(output_dir, "pipeline_results.json")
    Path(results_path).parent.mkdir(parents=True, exist_ok=True)
    with open(results_path, 'w', encoding='utf-8') as f:
        json.dump(pipeline_results, f, indent=2, ensure_ascii=False)
    
    logger.info(f"পাইপলাইন ফলাফল সংরক্ষিত: {results_path}")
    
    return pipeline_results


def main():
    """মূল ফাংশন"""
    parser = argparse.ArgumentParser(
        description="শেখ ML পাইপলাইন - বাংলা ভাষার মডেল ট্রেনিং এবং Hugging Face Hub-এ আপলোড",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument("--hf-token", "-t", required=True, help="Hugging Face API টোকেন")
    parser.add_argument("--repo-name", "-r", required=True, help="Hugging Face রিপোজিটরি নাম (যেমন: osamabinlikhon/sheikh-bangla-model)")
    parser.add_argument("--data-dir", "-d", required=True, help="ডেটা ডিরেক্টরি পাথ")
    parser.add_argument("--output-dir", "-o", default="./output", help="আউটপুট ডিরেক্টরি (ডিফল্ট: ./output)")
    parser.add_argument("--max-samples", "-m", type=int, default=1000, help="সর্বোচ্চ ডেটা স্যাম্পল সংখ্যা (ডিফল্ট: 1000)")
    parser.add_argument("--vocab-size", "-v", type=int, default=30000, help="ভোকাবুলারি সাইজ (ডিফল্ট: 30000)")
    parser.add_argument("--no-upload", action="store_true", help="Hugging Face Hub-এ আপলোড করবে না")
    parser.add_argument("--hidden-size", type=int, default=768, help="মডেল হিডেন সাইজ (ডিফল্ট: 768)")
    parser.add_argument("--num-layers", type=int, default=12, help="মডেল লেয়ার সংখ্যা (ডিফল্ট: 12)")
    parser.add_argument("--num-heads", type=int, default=12, help="অ্যাটেনশন হেড সংখ্যা (ডিফল্ট: 12)")
    parser.add_argument("--epochs", type=int, default=3, help="ট্রেনিং এপক সংখ্যা (ডিফল্ট: 3)")
    parser.add_argument("--batch-size", type=int, default=8, help="ব্যাচ সাইজ (ডিফল্ট: 8)")
    parser.add_argument("--learning-rate", type=float, default=5e-5, help="লার্নিং রেট (ডিফল্ট: 5e-5)")
    
    args = parser.parse_args()
    
    # মডেল কনফিগারেশন
    model_config = {
        "hidden_size": args.hidden_size,
        "num_attention_heads": args.num_heads,
        "num_hidden_layers": args.num_layers,
    }
    
    # ট্রেনিং কনফিগারেশন
    train_config = {
        "num_train_epochs": args.epochs,
        "train_batch_size": args.batch_size,
        "learning_rate": args.learning_rate,
    }
    
    # পাইপলাইন চালান
    results = run_pipeline(
        hf_token=args.hf_token,
        repo_name=args.repo_name,
        data_dir=args.data_dir,
        output_dir=args.output_dir,
        max_samples=args.max_samples,
        vocab_size=args.vocab_size,
        model_config=model_config,
        train_config=train_config,
        upload_to_hub_flag=not args.no_upload,
    )
    
    # ফলাফল প্রিন্ট করুন
    if results["status"] == "success":
        print("\n" + "=" * 60)
        print("✅ পাইপলাইন সম্পন্ন!")
        print("=" * 60)
        print(f"মডেল URL: {results['steps'].get('upload', {}).get('hub_url', 'N/A')}")
        print(f"মোট সময়: {results.get('duration_seconds', 0):.2f} সেকেন্ড")
        print("=" * 60)
    else:
        print("\n" + "=" * 60)
        print("❌ পাইপলাইন ব্যর্থ!")
        print(f"ত্রুটি: {results.get('error', 'Unknown error')}")
        print("=" * 60)
        sys.exit(1)


if __name__ == "__main__":
    main()
