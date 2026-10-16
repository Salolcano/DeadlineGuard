# DeadlineGuard

SLA escrow on GenLayer. A customer locks GEN against a plain-English SLA and a public status page. Validators read the page, vote with LLM consensus, and the contract releases the escrow to the provider (SLA kept) or refunds the customer (SLA breached). Unclear or unreachable evidence moves nothing.

- Network: GenLayer Studio, chain 61999, RPC https://studio.genlayer.com/api, explorer https://explorer-studio.genlayer.com
- Deployed contract: *(paste address here after `genlayer deploy`)*

## Layout
```
contracts/deadline_guard.py   Intelligent Contract
tests/direct/                 executable contract tests
deploy/deployScript.ts        genlayer deploy script
frontend/                     Next.js app (Transaction Kit shows the fee quote for every write)
```

## Contract
| Method | Type | Notes |
| --- | --- | --- |
| `create_agreement(provider, title, sla_rule, evidence_url, deadline)` | write, payable | `msg.value` is locked as escrow |
| `check_sla(agreement_id)` | write | customer or provider only; fetches evidence, validators agree on one verdict |
| `get_agreement(id)` / `get_agreements()` / `get_agreement_count()` | view | JSON |
| `get_earned_of(address)` | view | total released to a provider |

## Claim-integrity rules
1. **Fail-safe verdict.** Only the exact strings `"met"` / `"breached"` plus a quote that exists in the fetched page can move money. Strings like `"false"`, booleans, missing fields, malformed JSON, render failure and `"unclear"` all revert with no state change.
2. **Untrusted input isolation.** SLA text and page content go into the prompt as one JSON-escaped object between fixed rules.
3. **Consensus-bound explanation.** `strict_eq` compares one enum value; `verdict_reason` is written by the contract, never by the model.
4. **One-shot finalization.** State is final before the transfer is emitted; a settled agreement cannot be checked again.

Tests (`tests/direct/test_deadline_guard.py`) cover false-string and malformed output, render failure, release, refund, one-shot finalization, access rules and adversarial evidence.

## Run
```
pip install -r requirements.txt && pytest tests/direct -v
npm ci && cp frontend/.env.example frontend/.env
# deploy contracts/deadline_guard.py to Studio (genlayer deploy, or paste it in studio.genlayer.com), then:
#   put the address in frontend/.env as NEXT_PUBLIC_CONTRACT_ADDRESS
npm run dev
```
Known limitation: the customer chooses the evidence page, so this demonstrates consensus adjudication, not a production SLA product. The review date is a display label; the contract does not enforce a deadline.
