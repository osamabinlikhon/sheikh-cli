# Bangla Datasets for LLM Fine-Tuning

<div align="center">

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Language](https://img.shields.io/badge/Language-Bangla-brightgreen.svg)
![Format](https://img.shields.io/badge/Format-JSONL-yellow.svg)
![Tasks](https://img.shields.io/badge/Tasks-4-orange.svg)

**High-quality Bangla language instruction tuning dataset for supervised fine-tuning**

[GitHub](https://github.com/osamabinlikhon/bangla-datasets) •
[Hugging Face](https://huggingface.co/datasets/osamabinlikhon/bangla-datasets) •
[Report Issue](https://github.com/osamabinlikhon/bangla-datasets/issues)

</div>

## Overview

The Bangla Datasets project provides a curated collection of Bangla language
samples designed for fine-tuning large language models. The dataset supports
instruction-following tasks, summarization, rewriting, and comprehension,
enabling researchers to develop Bangla-capable AI systems.

This repository contains:

- The complete dataset in JSONL format
- Source code for dataset construction and validation
- Documentation and usage examples
- Training scripts for common fine-tuning frameworks

## Dataset Summary

| Attribute | Value |
|-----------|-------|
| **Language** | Bangla (bn) |
| **Samples** | 10,000 - 50,000 |
| **Format** | JSONL (Instruction Tuning) |
| **License** | MIT (Code), See license_note (Content) |
| **Author** | Osama Bin Likhon |
| **Tasks** | Summarization, Rewriting, Instruction Following, Comprehension |

## Quick Start

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Load Dataset from Hugging Face

```python
from datasets import load_dataset

dataset = load_dataset("osamabinlikhon/bangla-datasets")
print(dataset["train"][0])
```

### Load Dataset Locally

```python
from datasets import load_dataset

dataset = load_dataset(
    "json",
    data_files={
        "train": "data/train.jsonl",
        "validation": "data/validation.jsonl",
        "test": "data/test.jsonl"
    }
)
print(dataset["train"][0])
```

## Dataset Structure

```
bangla-datasets/
├── data/
│   ├── train.jsonl          # Training samples
│   ├── validation.jsonl     # Validation samples
│   └── test.jsonl           # Test samples
├── revisions/
│   └── {story_id}/          # Source text revisions
│       ├── v1.txt
│       └── v2.txt
├── scripts/
│   ├── build_dataset.py     # Dataset builder
│   ├── add_revision.py      # Revision manager
│   ├── make_diff.py         # Diff generator
│   ├── push_to_hf.py        # HF publisher
│   ├── validate_dataset.py  # Schema validation
│   ├── compute_stats.py     # Statistics generator
│   └── train_model.py       # Training script
├── tests/                   # Unit tests
├── logs/                    # Execution logs
├── reports/                 # Statistics reports
├── dataset_card.md          # Hugging Face dataset card
├── README.md                # This file
├── SECURITY.md              # Security policy
├── SCOPE.md                 # Project scope
├── CONTRIBUTING.md          # Contribution guidelines
└── LICENSE                  # MIT License
```

## Data Format

Each JSONL entry follows this schema:

```json
{
  "id": "bn_story_001_v1",
  "author": "Osama Bin Likhon",
  "language": "bn",
  "instruction": "গল্পটি সংক্ষেপে উপস্থাপন করো।",
  "input": "এটি একটি বাংলা গল্প।",
  "output": "গল্পটির সংক্ষিপ্তসার।",
  "revision": 1,
  "timestamp": "2025-12-26T03:46:21Z",
  "source": "user-collected",
  "license_note": "Original content belongs to respective authors"
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (format: `{story_id}_v{revision}`) |
| `author` | string | Dataset author |
| `language` | string | Language code ("bn" for Bangla) |
| `instruction` | string | Task instruction for the model |
| `input` | string | Source Bangla text |
| `output` | string | Target response |
| `revision` | int | Version number |
| `timestamp` | string | Creation timestamp (ISO 8601) |
| `source` | string | Data provenance |
| `license_note` | string | Attribution and licensing |

## Supported Tasks

The dataset supports multiple instruction tuning tasks:

1. **Summarization**: Condense passages into shorter summaries
2. **Rewriting**: Paraphrase text while preserving meaning
3. **Instruction Following**: General instruction-response pairs
4. **Comprehension**: Answer questions based on context

## Usage Examples

### Training with Transformers

```python
from datasets import load_dataset
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments, Trainer

dataset = load_dataset("osamabinlikhon/bangla-datasets")

model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-2-7b-hf")
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-7b-hf")

# Preprocess and train...
```

### Fine-tuning with LoRA

```bash
python scripts/train_model.py \
    --model meta-llama/Llama-2-7b-hf \
    --dataset osamabinlikhon/bangla-datasets \
    --use-lora \
    --epochs 3
```

### Data Validation

```bash
python scripts/validate_dataset.py
```

### Statistics Generation

```bash
python scripts/compute_stats.py
```

## Citation

If you use this dataset in your research, please cite:

```bibtex
@dataset{osama_bin_likhon_2025_bangla,
  author = {Osama Bin Likhon},
  title = {Bangla Datasets for LLM Fine-Tuning},
  year = {2025},
  publisher = {Hugging Face},
  license = {MIT},
  url = {https://huggingface.co/datasets/osamabinlikhon/bangla-datasets}
}
```

## Limitations

- Content quality depends on source materials
- Not suitable for real-time or safety-critical applications
- Cultural and stylistic bias may exist in source content
- Dataset is static (not continuously updated)

## Contributing

Contributions are welcome! Please read our contributing guidelines
in CONTRIBUTING.md before submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file
for details. The dataset content is provided with appropriate attribution
as noted in each entry's `license_note` field.

## Acknowledgments

- Hugging Face for dataset hosting infrastructure
- Open-source NLP community for tools and inspiration
- Bangla language community for linguistic resources

---

<div align="center">

**Built with ❤️ for the Bangla-speaking AI community**

</div>
