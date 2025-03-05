---
id: privacy
title: Privacy
description: Understand how BashBuddy handles your data
slug: /privacy
sidebar_position: 99
---

# How to we handle your data?

Other solutions similar to BashBuddy always relay on cloud processing, without knowing where your data is going or how it's being used.

BashBuddy is different. We believe that your data should always stay on your own system.

## What data is collected?

### BashBuddy CLI

If you just use the BashBuddy CLI, we don't collect any data from you. _(maybe in the future we'll optionally collect usage data to improve the product, but that will be opt-in)_

### BashBuddy Cloud

If you use BashBuddy Cloud, we only collect the minimum data to identify you as a user, and a ID for every interaction you do (no logs, no tracking, no information).

The only exception is that we store your current chat/session for 10 minutes maximum in [Upstash's KV](https://upstash.com/) so you can prompt BashBuddy to modify the generated command. (like a chat).

We handle payments and subscriptions via [Stripe](https://stripe.com/).

Our AI inference is handled by [groq](https://groq.com/).

## Open Source

All code is open source and available on [GitHub](https://github.com/wosherco/bashbuddy).

## Contact

If you have any questions or concerns, please contact us at [contact@bashbuddy.run](mailto:contact@bashbuddy.run).
