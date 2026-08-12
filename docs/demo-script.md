# 60-Second Demo Script — Incident Memory OS

Here is the exact step-by-step presentation script to pitch **Incident Memory OS** to the hackathon judges:

---

## 00:00 - Introduction & The Problem
> "Security operations teams fight a losing battle against repeating attacks, constantly relearning the same lessons because institutional knowledge is scattered across old tickets and postmortems. We built **Incident Memory OS** to solve this: an AI incident responder that learns from experience using Hindsight persistent memory."

---

## 00:10 - Incident 1 (No Memory)
> "Let's reset our environment and look at our first active incident: **INC-1042**, an SSH brute force credential attack on server `prod-api-03`.
>
> We trigger our AI Investigation. Since the Hindsight memory bank is empty, the agent recommends standard configurations: block the attacker's IP, disable SSH password access, and enforce keys. 
> 
> We approve the response, resolve the incident, and click **Save Experience to Memory**. This stores this successful outcome in Hindsight."

---

## 00:25 - Incident 2 (Memory Recall)
> "A short time later, **INC-1097** arrives: a credential spraying attack targeting database port 3306 on `prod-db-02`. The attacker is rotating source proxy IP addresses.
> 
> When we run our investigation, Hindsight recalls our previous incident **INC-1042**. The agent synthesizes this: it notes that IP blocking failed because the attacker rotates IPs, and recommends bypassing simple IP bans to enforce key-based bastion access immediately. 
>
> Instead of generic advice, the AI is reasoning from our organization's memory."

---

## 00:40 - Incident 3 (Coordinated Intrusion Pattern)
> "Now, a critical threat arrives: **INC-1138**, a credential attack on `production-api` followed by sudo privilege escalation.
> 
> We investigate. The agent recalls *multiple* historical incidents. It connects the dots: credential sprays + rotating proxy IPs + sudo modification.
> 
> The agent flags an emerging coordinated intrusion pattern, warning that this is not an isolated incident, and recommends immediate network host isolation and Tier-3 escalation."

---

## 00:55 - Outro
> "By saving outcomes to Hindsight, our SOC agent grows smarter. This is the difference between an AI that answers, and an AI that learns. Your SOC shouldn't have to learn the same lesson twice. Thank you."
