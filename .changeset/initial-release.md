---
"@evaluator/core": minor
"@evaluator/provider-openai": minor
"@evaluator/provider-anthropic": minor
"@evaluator/reporter": minor
---

Initial release of the generic, model- and domain-agnostic black-box evaluation harness.

- `@evaluator/core`: the `Llm`/`KnowledgeSource`/`Judge` seams, the `Run` event machinery, schema
  sanitizing, the `SubjectProfile` (domain-as-data), and the `coverage`/`validate`/`rollup` probes.
- `@evaluator/provider-openai` and `@evaluator/provider-anthropic`: two implementations of the one
  seam, each the sole importer of its SDK, both mapping to a neutral `FinishReason`.
- `@evaluator/reporter`: a single-consumer JSONL + pretty-console sink over the event stream.
